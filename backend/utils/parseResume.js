const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

/**
 * Extracts plain text from an uploaded resume file (.pdf or .docx)
 * Handles mimetype mismatches by also checking file extension as fallback.
 * @param {string} filePath - path to the temp uploaded file
 * @param {string} mimetype - the file's mimetype
 * @param {string} originalName - original filename (used for extension fallback)
 * @returns {Promise<string>} extracted text
 */
async function extractTextFromResume(filePath, mimetype, originalName = "") {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(originalName || "").toLowerCase();

  // Determine if PDF
  const isPDF =
    mimetype === "application/pdf" ||
    ext === ".pdf" ||
    // Check magic bytes: PDFs start with %PDF
    buffer.slice(0, 4).toString("ascii") === "%PDF";

  // Determine if DOCX
  const isDOCX =
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === ".docx";

  if (isPDF) {
    try {
      const data = await pdfParse(buffer);
      const text = data.text || "";
      return text;
    } catch (pdfErr) {
      console.error("pdf-parse error:", pdfErr.message);
      // Try to return any raw text content as last resort
      const raw = buffer.toString("latin1");
      // Extract printable ASCII sequences
      const printable = raw.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/ {3,}/g, " ").trim();
      return printable;
    }
  }

  if (isDOCX) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // Fallback: treat as plain text
  return buffer.toString("utf-8");
}

module.exports = { extractTextFromResume };
