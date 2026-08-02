const express = require("express");
const multer = require("multer");
const fs = require("fs");
const Groq = require("groq-sdk");
const { extractTextFromResume } = require("../utils/parseResume");
const AppError = require("../utils/AppError");
const auth = require("../middleware/auth");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * POST /api/analyze
 * form-data: resume (file), jobDescription (text, optional)
 */
router.post("/", auth, upload.single("resume"), async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("No resume file uploaded. Please attach a PDF or DOCX file.", 400));
  }

  const jobDescription = req.body.jobDescription || "";

  try {
    const resumeText = await extractTextFromResume(
      req.file.path,
      req.file.mimetype,
      req.file.originalname
    );

    // clean up temp file
    fs.unlink(req.file.path, () => {});

    if (!resumeText || resumeText.trim().length < 30) {
      return next(
        new AppError("Could not read your resume. Please make sure it contains selectable text.", 422)
      );
    }

    const prompt = buildPrompt(resumeText, jobDescription);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an expert technical resume reviewer and ATS (Applicant Tracking System) analyst. Always respond with valid JSON only, no markdown, no code fences, no extra commentary.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
    });

    const raw = completion.choices[0].message.content.trim();
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let analysis;
    try {
      analysis = JSON.parse(cleaned);
    } catch (e) {
      // If model didn't return clean JSON, send raw text as fallback
      analysis = { rawResponse: cleaned };
    }

    res.json({ success: true, analysis });

    // Parse key information and save to DB in the background
    parseAndSaveResume(resumeText, req.user?.userId).catch((err) => {
      console.error("parseAndSaveResume background processing failed:", err);
    });
  } catch (err) {
    // Clean up temp file on error too
    if (req.file) fs.unlink(req.file.path, () => {});
    next(err); // forward to global error handler
  }
});

function buildPrompt(resumeText, jobDescription) {
  return `
Analyze the following resume text. ${
    jobDescription
      ? "Compare it against the provided job description."
      : "No job description was provided, so evaluate it generally for quality and ATS-friendliness."
  }

RESUME TEXT:
"""
${resumeText.slice(0, 6000)}
"""

${
  jobDescription
    ? `JOB DESCRIPTION:
"""
${jobDescription.slice(0, 3000)}
"""`
    : ""
}

Respond ONLY with a JSON object in exactly this shape:
{
  "overallScore": <number 0-100>,
  "atsScore": <number 0-100>,
  "strengths": [<string>, ...],
  "weaknesses": [<string>, ...],
  "missingKeywords": [<string>, ...],
  "suggestions": [<string>, ...],
  "summary": "<2-3 sentence overall verdict>"
}
`;
}

/**
 * POST /api/analyze/tailor
 * JSON body: { resume, jobDescription }
 */
router.post("/tailor", async (req, res, next) => {
  const { resume, jobDescription } = req.body;

  if (!resume) {
    return next(new AppError("No resume data provided.", 400));
  }
  if (!jobDescription || jobDescription.trim().length === 0) {
    return next(new AppError("Please provide a job description to tailor your resume.", 400));
  }

  try {
    const prompt = buildTailorPrompt(resume, jobDescription);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an expert ATS optimization engine that tailors resumes to job descriptions. Always respond with valid JSON only, matching the exact schema of the input resume, with no markdown, no code fences, and no extra commentary.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    const raw = completion.choices[0].message.content.trim();
    let tailoredResume;
    try {
      tailoredResume = extractJSON(raw);
    } catch (e) {
      return next(new AppError("Failed to parse the AI tailored resume response. Details: " + e.message, 502));
    }

    res.json({ success: true, tailoredResume });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/analyze/suggest
 * Body: { field, currentText, role, skills }
 */
router.post("/suggest", auth, async (req, res, next) => {
  const { field, currentText, role, skills } = req.body;
  if (!field) {
    return next(new AppError("Field parameter is required.", 400));
  }

  try {
    let prompt = "";
    if (field === "summary") {
      prompt = `Generate 3 professional summaries for a resume based on the following input:
Target Role/Job Title: ${role || "Software Engineer"}
Key Skills: ${skills || ""}
Current text/draft (if any): ${currentText || ""}

Provide 3 distinct options, tailored to highlight achievements and keywords.
Return the options as a JSON array of strings:
[
  "Option 1...",
  "Option 2...",
  "Option 3..."
]
Return ONLY the JSON array. Do not include markdown code block formatting (no \`\`\`json or \`\`\`), and do not include any introductory or concluding text.`;
    } else if (field === "experience") {
      prompt = `Improve or generate professional bullet point descriptions for a work experience entry on a resume:
Job Title/Role: ${role || "Software Engineer"}
Current description/draft (if any): ${currentText || ""}

Generate 3 distinct, high-impact options (where each option is a set of 3-4 professional bullet points using strong action verbs and metrics where possible, separated by newlines).
Return the options as a JSON array of strings:
[
  "Option 1...",
  "Option 2...",
  "Option 3..."
]
Return ONLY the JSON array. Do not include markdown code block formatting (no \`\`\`json or \`\`\`), and do not include any introductory or concluding text.`;
    } else if (field === "project") {
      prompt = `Improve or generate professional bullet point descriptions for a project entry on a resume:
Project Name: ${role || "Project"}
Technologies Used: ${skills || ""}
Current description/draft (if any): ${currentText || ""}

Generate 3 distinct, high-impact options (where each option is a set of 2-3 professional bullet points highlighting implementation and results, separated by newlines).
Return the options as a JSON array of strings:
[
  "Option 1...",
  "Option 2...",
  "Option 3..."
]
Return ONLY the JSON array. Do not include markdown code block formatting (no \`\`\`json or \`\`\`), and do not include any introductory or concluding text.`;
    } else if (field === "skills") {
      prompt = `Generate 3 distinct recommendations of professional technical skills/technologies for a resume based on the following:
Target Role/Job Title: ${role || "Software Engineer"}
Current skills draft (if any): ${currentText || ""}

Provide 3 distinct options, each being a comma-separated list of 8-12 relevant, high-demand skills, technologies, tools, or frameworks.
Return the options as a JSON array of strings:
[
  "Skill1, Skill2, Skill3...",
  "Skill1, Skill2, Skill3...",
  "Skill1, Skill2, Skill3..."
]
Return ONLY the JSON array. Do not include markdown code block formatting (no \`\`\`json or \`\`\`), and do not include any introductory or concluding text.`;
    } else if (field === "extra") {
      prompt = `Generate 3 distinct recommendations of professional awards, certifications, languages, or additional achievements for a resume based on the following:
Target Role/Job Title: ${role || "Software Engineer"}
Key Skills: ${skills || ""}
Current text draft (if any): ${currentText || ""}

Provide 3 distinct options, each being a list of 2-3 relevant professional certifications, awards, or details (separated by newlines or commas).
Return the options as a JSON array of strings:
[
  "Option 1...",
  "Option 2...",
  "Option 3..."
]
Return ONLY the JSON array. Do not include markdown code block formatting (no \`\`\`json or \`\`\`), and do not include any introductory or concluding text.`;
    } else {
      return next(new AppError("Invalid field name. Must be 'summary', 'experience', 'project', 'skills', or 'extra'.", 400));
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an expert resume assistant. Respond only with a JSON array of strings.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const raw = completion.choices[0].message.content.trim();
    let suggestions;
    try {
      suggestions = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch (e) {
      const start = raw.indexOf("[");
      const end = raw.lastIndexOf("]");
      if (start !== -1 && end !== -1) {
        suggestions = JSON.parse(raw.substring(start, end + 1));
      } else {
        throw new Error("Failed to parse AI suggestions response: " + e.message);
      }
    }

    res.json({ success: true, suggestions });
  } catch (err) {
    next(err);
  }
});


/**
 * POST /api/analyze/fix-grammar
 * Body: { text }
 */
router.post("/fix-grammar", auth, async (req, res, next) => {
  const { text } = req.body;
  if (!text || text.trim().length === 0) {
    return next(new AppError("Text parameter is required.", 400));
  }

  try {
    const prompt = `Analyze the following text for any spelling, grammatical, punctuation, or style errors. If there are errors, return the corrected version of the text and a list of specific corrections made. If there are no errors, return the original text and an empty corrections list.

TEXT TO ANALYZE:
"""
${text}
"""

Return the response ONLY as a JSON object in exactly this format:
{
  "correctedText": "<fully corrected text with all errors fixed>",
  "hasErrors": <boolean indicating if there were any errors>,
  "corrections": [
    {
      "original": "<part of the text that had the error>",
      "corrected": "<corrected version of that part>",
      "explanation": "<short explanation of the error and correction>"
    }
  ]
}
Ensure the output contains ONLY the JSON. No markdown backticks (no \`\`\`json or \`\`\`), no comments, no intro/outro.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an expert resume grammar checker. Respond only with valid JSON matching the requested schema.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });

    const raw = completion.choices[0].message.content.trim();
    let result;
    try {
      result = extractJSON(raw);
    } catch (e) {
      throw new Error("Failed to parse AI grammar check response: " + e.message);
    }

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});


/**
 * POST /api/analyze/tailor-file
 * form-data: resume (file), jobDescription (text)
 */
router.post("/tailor-file", upload.single("resume"), async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("No resume file uploaded. Please attach a PDF or DOCX file.", 400));
  }

  const jobDescription = req.body.jobDescription || "";
  if (!jobDescription || jobDescription.trim().length === 0) {
    fs.unlink(req.file.path, () => {});
    return next(new AppError("Please provide a job description to tailor your resume.", 400));
  }

  try {
    const resumeText = await extractTextFromResume(
      req.file.path,
      req.file.mimetype,
      req.file.originalname
    );

    // clean up temp file
    fs.unlink(req.file.path, () => {});

    if (!resumeText || resumeText.trim().length < 30) {
      return next(
        new AppError("Could not read your resume. Please make sure it contains selectable text.", 422)
      );
    }

    const prompt = buildTailorFilePrompt(resumeText, jobDescription);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an expert ATS optimization engine. Always respond with valid JSON only, representing the fully parsed and tailored resume content matching the specified JSON schema.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    const raw = completion.choices[0].message.content.trim();
    let tailoredResume;
    try {
      tailoredResume = extractJSON(raw);
    } catch (e) {
      return next(new AppError("Failed to parse the AI tailored resume response. Details: " + e.message, 502));
    }

    res.json({ success: true, tailoredResume });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(err);
  }
});

function buildTailorFilePrompt(resumeText, jobDescription) {
  return `
Analyze the following raw resume text and rewrite/tailor it to align with the provided target job description. Output the result in the specified JSON schema format.

RAW RESUME TEXT:
"""
${resumeText.slice(0, 6000)}
"""

TARGET JOB DESCRIPTION:
"""
${jobDescription.slice(0, 3000)}
"""

CRITICAL INSTRUCTIONS FOR SINGLE 1-PAGE A4 FIT & PROJECT LINKS:
1. Parse ALL contact info, education, work experience, projects, skills, and additional info from the original resume.
2. For EVERY project entry, ensure a valid, clean project link or GitHub repository URL is included in the "link" field (e.g. "https://github.com/user/project-name" or "https://project-demo.com").
3. Enrich the summary, skills, experience bullet points, project descriptions, and additional info (extra) with target job keywords, technical tools, and metrics.
4. Keep bullet point lengths balanced: generate 2 to 3 concise, high-impact bullet points per role/project so that the ENTIRE tailored resume (including contact, summary, skills, experience, education, projects with links, and extra info) fits strictly on a SINGLE 1-PAGE A4 sheet without spilling over onto page 2.
5. Keep all factual candidate details (names, companies, dates, degrees, schools) accurate.
6. Format the final output as a valid JSON object in EXACTLY the following format:

{
  "userName": "<full name>",
  "email": "<email address>",
  "phone": "<phone number or empty string>",
  "linkedin": "<linkedin url or empty string>",
  "github": "<github url or empty string>",
  "summary": "<2-3 sentence rich, keyword-optimized professional summary>",
  "skills": "<comma-separated string of technical skills, frameworks, and tools>",
  "experience": [
    {
      "company": "<company name>",
      "role": "<job title>",
      "duration": "<e.g. Jan 2023 - Dec 2024>",
      "description": "<2-3 concise high-impact action bullet points, each on a new line>"
    }
  ],
  "education": [
    {
      "school": "<school/university name>",
      "degree": "<degree/field of study>",
      "year": "<graduation year, e.g. 2024>"
    }
  ],
  "projects": [
    {
      "name": "<project name>",
      "description": "<2-3 concise high-impact project bullet points, each on a new line>",
      "techStack": "<comma-separated tech stack used>",
      "link": "<clean project GitHub or live demo URL, e.g. https://github.com/...>"
    }
  ],
  "extra": "<key certifications, awards, languages, or relevant technical achievements>"
}

Ensure the output contains ONLY the JSON. No markdown backticks, no comments, no intro/outro.
`;
}

function buildTailorPrompt(resume, jobDescription) {
  const resumeJsonStr = JSON.stringify(resume, null, 2);

  return `
Analyze the provided user resume JSON and tailor it for the target job description. Output the result in the exact same JSON format.

USER RESUME JSON:
"""
${resumeJsonStr}
"""

TARGET JOB DESCRIPTION:
"""
   - "projects": In each project entry, update the "description" field and "techStack" field. Refine the project descriptions and highlight technologies that align with the job description.
4. Respond ONLY with the final tailored JSON object. DO NOT wrap it in markdown code block formatting (no \`\`\`json or \`\`\`), and do not include any introductory or concluding text.
`;
}

function sanitizeControlChars(jsonStr) {
  // Walk character-by-character to find string literals and
  // replace any literal control characters inside them with proper JSON escapes.
  let inString = false;
  let escaped = false;
  let result = "";

  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];
    const code = jsonStr.charCodeAt(i);

    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      result += char;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }

    // Inside a JSON string, control chars must be escaped
    if (inString && code < 0x20) {
      switch (char) {
        case "\n": result += "\\n"; break;
        case "\r": result += "\\r"; break;
        case "\t": result += "\\t"; break;
        default:   result += "\\u" + code.toString(16).padStart(4, "0");
      }
      continue;
    }

    result += char;
  }

  return result;
}

function extractJSON(str) {
  // Strip markdown code fences if present
  let cleaned = str.replace(/```json|```/g, "").trim();

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch (_) {}

  // Extract the JSON object block between the outermost { }
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in the AI response");
  }

  const jsonBlock = cleaned.substring(start, end + 1);

  // Sanitize unescaped control characters before parsing
  const sanitized = sanitizeControlChars(jsonBlock);

  try {
    return JSON.parse(sanitized);
  } catch (e) {
    throw new Error("Extracted block is not valid JSON even after sanitization: " + e.message);
  }
}

async function parseAndSaveResume(resumeText, userId) {
  try {
    const prompt = `
Extract the key resume information from the raw text below and format it into a JSON object matching the Resume schema.

RAW RESUME TEXT:
"""
${resumeText.slice(0, 6000)}
"""

Format the output as a valid JSON object in EXACTLY this format:
{
  "userName": "<full name, default to 'Anonymous' if not found>",
  "email": "<email address>",
  "phone": "<phone number or empty string>",
  "linkedin": "<linkedin url or empty string>",
  "github": "<github url or empty string>",
  "summary": "<professional summary>",
  "skills": ["<skill 1>", "<skill 2>", ...],
  "experience": [
    {
      "company": "<company name>",
      "role": "<job title>",
      "duration": "<e.g. Jan 2023 - Dec 2024>",
      "description": "<bullet points, each on a new line>"
    }
  ],
  "education": [
    {
      "school": "<school/university name>",
      "degree": "<degree/field of study>",
      "year": "<graduation year, e.g. 2024>"
    }
  ],
  "projects": [
    {
      "name": "<project name>",
      "description": "<project description>",
      "techStack": "<comma-separated list of tech used in the project, e.g. 'React, Express'>",
      "link": "<project link or empty string>"
    }
  ],
  "extra": "<other certifications, languages, awards, or empty string>"
}

Ensure the output contains ONLY the JSON. No markdown backticks, no comments, no intro/outro.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an expert resume parser. Respond only with valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
    });

    const raw = completion.choices[0].message.content.trim();
    const parsedData = extractJSON(raw);

    // Save to DB
    const Resume = require("../models/Resume");
    const resume = new Resume({
      ...parsedData,
      userId: userId || undefined,
    });
    await resume.save();
    console.log("Automatically parsed and saved analyzed resume to DB:", resume._id);
  } catch (err) {
    console.error("Failed to parse and save analyzed resume:", err.message);
  }
}

// ─── POST /api/analyze/suggest-job-description ─────────────────────────────
router.post("/suggest-job-description", auth, async (req, res, next) => {
  try {
    const { role } = req.body;
    const targetRole = role || "Full Stack Software Engineer";

    const prompt = `
Generate a target Job Target & Career Objective description written strictly from the USER'S / CANDIDATE'S Point of View (POV) for a target position as "${targetRole}".

Use first-person / candidate perspective (User's POV):
Target Position: ${targetRole}

Career Goal & Objective:
"As a dedicated ${targetRole}, I am seeking to leverage my technical expertise in modern application design, database architecture, and full-stack development to build scalable, secure, and user-centric software solutions."

Key Competencies & Target Responsibilities:
• Architecting, developing, and deploying robust web applications and RESTful/GraphQL APIs.
• Writing clean, maintainable, and high-performance code with comprehensive unit and integration testing.
• Collaborating with engineering teams, product managers, and UI/UX designers to ship features.
• Optimizing backend queries, front-end render times, and CI/CD deployment pipelines for maximum speed.

Target Technical Stack & Tools I Excel In:
React, Node.js, TypeScript, Express, MongoDB/PostgreSQL, Docker, AWS/GCP, REST APIs, Git.

Format as clean plain text written from the candidate's point of view.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an executive career advisor writing target job objectives strictly from the candidate's point of view.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
    });

    const jobDescription = completion.choices[0].message.content.trim();
    res.json({ success: true, jobDescription });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/analyze/check-grammar ────────────────────────────────────────
router.post("/check-grammar", auth, async (req, res, next) => {
  try {
    const { text, resumeData } = req.body;

    if (!text && !resumeData) {
      return next(new AppError("Please provide text or resumeData to check grammar.", 400));
    }

    const payloadStr = text ? text : JSON.stringify(resumeData, null, 2);

    const prompt = `
You are an expert copyeditor, grammarian, and executive resume coach.
Analyze the following resume content for spelling errors, grammatical mistakes, passive voice, weak action verbs, and punctuation issues.

INPUT CONTENT:
"""
${payloadStr.slice(0, 5000)}
"""

INSTRUCTIONS:
1. Fix all spelling, syntax, and grammatical errors.
2. Upgrade weak verbs to strong executive action verbs (e.g. Spearheaded, Engineered, Orchestrated, Optimized, Accelerated).
3. If input is raw text, output plain corrected text. If input is resumeData JSON, return a valid JSON object with key "correctedData" matching the schema, and key "improvements" containing a list of specific grammar fixes made.

Format output as valid JSON in this structure:
{
  "correctedText": "<corrected plain text if input was text>",
  "improvements": ["<bullet point list of grammar/spelling fixes applied>"],
  "correctedData": <corrected object if input was resumeData, else null>
}
Ensure the output contains ONLY the JSON. No markdown backticks.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an expert grammar proofreader. Respond only with valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });

    const raw = completion.choices[0].message.content.trim();
    let result;
    try {
      result = extractJSON(raw);
    } catch (e) {
      result = { correctedText: raw.replace(/```json|```/g, "").trim(), improvements: ["Applied grammar and tone polish."] };
    }

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;


