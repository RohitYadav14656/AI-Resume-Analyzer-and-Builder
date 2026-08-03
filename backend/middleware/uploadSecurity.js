const multer = require("multer");
const path = require("path");
const fs = require("fs");
const AppError = require("../utils/AppError");

// Max file size: 5 MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed MIME types & Extensions
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const ALLOWED_EXTENSIONS = new Set([".pdf", ".docx", ".txt"]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : ".tmp";
    cb(null, `resume-${uniqueSuffix}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(
      new AppError(
        "Invalid file extension. Only .pdf, .docx, and .txt files are allowed.",
        400
      ),
      false
    );
  }

  if (file.mimetype && !ALLOWED_MIME_TYPES.has(file.mimetype)) {
    // Some browsers send application/octet-stream or general text types; extension fallback handled in magic byte check
    if (file.mimetype !== "application/octet-stream" && file.mimetype !== "binary/octet-stream") {
      return cb(
        new AppError(
          "Invalid file type. Only PDF, DOCX, and TXT documents are allowed.",
          400
        ),
        false
      );
    }
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

/**
 * Validates actual header magic bytes of an uploaded file buffer.
 * Defends against file extension spoofing & malicious binary uploads.
 * @param {Buffer} buffer - initial bytes of the uploaded file
 * @param {string} originalName - original filename
 * @returns {boolean} true if magic bytes match expected signatures
 */
function verifyMagicBytes(buffer, originalName = "") {
  if (!buffer || buffer.length < 4) return false;

  const ext = path.extname(originalName).toLowerCase();

  // PDF Magic Bytes: %PDF (0x25 0x50 0x44 0x46)
  const isPdfHeader =
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46;

  // DOCX / Zip Magic Bytes: PK\x03\x04 (0x50 0x4B 0x03 0x04)
  const isZipHeader =
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04;

  // Executable Magic Bytes check (reject EXEs, ELFs, DLLs):
  // Windows EXE: MZ (0x4D 0x5A)
  // Linux ELF: \x7fELF (0x7F 0x45 0x4C 0x46)
  // Java class / Mach-O: 0xCA 0xFE 0xBA 0xBE
  const isExeHeader =
    (buffer[0] === 0x4d && buffer[1] === 0x5a) ||
    (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) ||
    (buffer[0] === 0xca && buffer[1] === 0xfe && buffer[2] === 0xba && buffer[3] === 0xbe);

  if (isExeHeader) {
    return false;
  }

  if (ext === ".pdf") {
    return isPdfHeader;
  }

  if (ext === ".docx") {
    return isZipHeader;
  }

  if (ext === ".txt") {
    // Plain text should NOT be binary zip/pdf or contain null bytes
    if (isPdfHeader || isZipHeader) return false;
    for (let i = 0; i < Math.min(buffer.length, 512); i++) {
      if (buffer[i] === 0) return false; // Null byte indicates binary
    }
    return true;
  }

  // Fallback check
  return isPdfHeader || isZipHeader;
}

module.exports = {
  upload,
  verifyMagicBytes,
  MAX_FILE_SIZE,
};
