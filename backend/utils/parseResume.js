const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const AppError = require("./AppError");
const { verifyMagicBytes } = require("../middleware/uploadSecurity");

/**
 * Clean & sanitize extracted plain text.
 * Strips control chars, null bytes, HTML tags, and truncates to safe length.
 */
function sanitizeResumeText(text) {
  if (!text) return "";

  const cleaned = text
    .replace(/\0/g, "") // remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ") // remove invalid control chars
    .replace(/<\s*(script|iframe|object|embed|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "") // strip dangerous HTML
    .replace(/<\s*[^>]+>/g, " ") // strip XML/HTML tags
    .replace(/\r\n/g, "\n")
    .replace(/ {3,}/g, " ")
    .trim();

  // Enforce max plain text character limit (50,000 characters)
  return cleaned.slice(0, 50000);
}

/**
 * Extracts plain text from an uploaded resume file (.pdf, .docx, or .txt)
 * Verifies magic number headers before attempting parsing.
 * @param {string} filePath - path to the temp uploaded file
 * @param {string} mimetype - the file's mimetype
 * @param {string} originalName - original filename
 * @returns {Promise<string>} extracted & sanitized text
 */
async function extractTextFromResume(filePath, mimetype, originalName = "") {
  const buffer = fs.readFileSync(filePath);

  // Validate magic bytes header signature
  const isValidHeader = verifyMagicBytes(buffer, originalName);
  if (!isValidHeader) {
    throw new AppError(
      "Security Verification Failed: Uploaded file contents do not match an authentic PDF, DOCX, or TXT file signature.",
      400
    );
  }

  const ext = path.extname(originalName || "").toLowerCase();

  // Determine type
  const isPDF = ext === ".pdf" || buffer.slice(0, 4).toString("ascii") === "%PDF";
  const isDOCX = ext === ".docx" || (buffer[0] === 0x50 && buffer[1] === 0x4b);

  let rawText = "";

  if (isPDF) {
    try {
      const data = await pdfParse(buffer);
      rawText = data.text || "";
    } catch (pdfErr) {
      console.error("pdf-parse error:", pdfErr.message);
      const raw = buffer.toString("latin1");
      rawText = raw.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/ {3,}/g, " ").trim();
    }
  } else if (isDOCX) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value || "";
    } catch (docxErr) {
      throw new AppError("Failed to parse Word document (.docx). File may be corrupted.", 422);
    }
  } else {
    // Plain text file
    rawText = buffer.toString("utf-8");
  }

  const sanitized = sanitizeResumeText(rawText);

  if (!sanitized || sanitized.trim().length < 20) {
    throw new AppError(
      "The uploaded document contains no readable text. Please upload a valid document with selectable text.",
      422
    );
  }

  return sanitized;
}

module.exports = { extractTextFromResume, sanitizeResumeText };
