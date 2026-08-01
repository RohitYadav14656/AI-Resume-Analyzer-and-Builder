const nodemailer = require("nodemailer");

/**
 * Creates a Nodemailer transporter from environment variables.
 * Supports any SMTP provider (Gmail, Mailtrap, SendGrid, etc.)
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: parseInt(process.env.EMAIL_PORT || "587", 10) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// ── Shared HTML shell ─────────────────────────────────────────────────────────
function emailShell({ headerGradient, headerIcon, headerTitle, headerSubtitle, body }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style="margin:0;padding:0;background:#0d0d0f;font-family:'Segoe UI',Roboto,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0f;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#18181b;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
              <tr>
                <td style="background:${headerGradient};padding:32px 40px;text-align:center;">
                  <div style="width:48px;height:48px;background:rgba(255,255,255,0.15);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:12px;">${headerIcon}</div>
                  <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">${headerTitle}</h1>
                  <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">${headerSubtitle}</p>
                </td>
              </tr>
              <tr><td style="padding:36px 40px;">${body}</td></tr>
              <tr>
                <td style="padding:16px 40px 28px;border-top:1px solid rgba(255,255,255,0.06);">
                  <p style="margin:0;color:#52525b;font-size:12px;text-align:center;">
                    © ${new Date().getFullYear()} ResumeAI. This is an automated message — please do not reply.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>`;
}

// ── Password Reset Email ───────────────────────────────────────────────────────
/**
 * Sends a password reset email to the user.
 * @param {string} toEmail
 * @param {string} resetUrl - The full reset URL with token
 */
async function sendPasswordResetEmail(toEmail, resetUrl) {
  const transporter = createTransporter();

  const body = `
    <p style="margin:0 0 16px;color:#e4e4e7;font-size:15px;line-height:1.6;">Hi there,</p>
    <p style="margin:0 0 24px;color:#a1a1aa;font-size:14px;line-height:1.7;">
      We received a request to reset the password for your ResumeAI account.
      Click the button below to choose a new password. This link is valid for <strong style="color:#e4e4e7;">1 hour</strong>.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:8px 0 28px;">
        <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:10px;">
          Reset My Password →
        </a>
      </td></tr>
    </table>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 6px;color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Security Notice</p>
      <p style="margin:0;color:#a1a1aa;font-size:13px;line-height:1.6;">
        If you didn't request a password reset, you can safely ignore this email. Your password will not change.
      </p>
    </div>
    <p style="margin:0;color:#52525b;font-size:12px;line-height:1.6;">
      Button not working? Copy and paste this link:<br/>
      <a href="${resetUrl}" style="color:#818cf8;word-break:break-all;font-size:12px;">${resetUrl}</a>
    </p>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Resume AI" <noreply@resumeai.com>`,
    to: toEmail,
    subject: "Reset Your ResumeAI Password",
    html: emailShell({
      headerGradient: "linear-gradient(135deg,#7c3aed,#4f46e5)",
      headerIcon: "🔐",
      headerTitle: "Password Reset",
      headerSubtitle: "ResumeAI · Secure Account Recovery",
      body,
    }),
  });
}

// ── Email Verification Email ───────────────────────────────────────────────────
/**
 * Sends an email verification link to a newly registered user.
 * @param {string} toEmail
 * @param {string} verifyUrl - The full verification URL with token
 */
async function sendVerificationEmail(toEmail, verifyUrl) {
  const transporter = createTransporter();

  const body = `
    <p style="margin:0 0 16px;color:#e4e4e7;font-size:15px;line-height:1.6;">Welcome to ResumeAI! 🎉</p>
    <p style="margin:0 0 24px;color:#a1a1aa;font-size:14px;line-height:1.7;">
      Thanks for signing up. Please verify your email address to activate your account and start building ATS-optimized resumes.
      This link is valid for <strong style="color:#e4e4e7;">24 hours</strong>.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:8px 0 28px;">
        <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#d97706,#b45309);color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:10px;">
          Verify My Email →
        </a>
      </td></tr>
    </table>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 6px;color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Why verify?</p>
      <p style="margin:0;color:#a1a1aa;font-size:13px;line-height:1.6;">
        Email verification helps us keep your account secure and ensures you can recover it if needed.
      </p>
    </div>
    <p style="margin:0;color:#52525b;font-size:12px;line-height:1.6;">
      Button not working? Copy and paste this link:<br/>
      <a href="${verifyUrl}" style="color:#f59e0b;word-break:break-all;font-size:12px;">${verifyUrl}</a>
    </p>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Resume AI" <noreply@resumeai.com>`,
    to: toEmail,
    subject: "Verify your ResumeAI email address",
    html: emailShell({
      headerGradient: "linear-gradient(135deg,#d97706,#b45309)",
      headerIcon: "✉️",
      headerTitle: "Confirm Your Email",
      headerSubtitle: "ResumeAI · One quick step to get started",
      body,
    }),
  });
}

module.exports = { sendPasswordResetEmail, sendVerificationEmail };
