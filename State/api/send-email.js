const nodemailer = require("nodemailer");

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  // CORS headers for local dev
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { filename, fileBase64 } = req.body;

    if (!filename || !fileBase64) {
      return res.status(400).json({
        success: false,
        error: "Missing filename or file data",
      });
    }

    // Create reusable transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Build the email
    const mailOptions = {
      from: `"StateSearch" <${process.env.GMAIL_USER}>`,
      to: "ananykhare04@gmail.com, rajenpatwari1234@gmail.com",
      subject: `📊 New File Upload — ${filename}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #0a0a0b; color: #f4f4f5; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #a855f7); line-height: 48px; font-size: 20px;">⚡</div>
          </div>
          <h2 style="text-align: center; font-size: 22px; font-weight: 800; margin: 0 0 8px 0; color: #fff;">New File Uploaded</h2>
          <p style="text-align: center; color: #a1a1aa; font-size: 14px; margin: 0 0 28px 0;">A user just uploaded an Excel file on StateSearch.</p>
          <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 12px 0; font-size: 12px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">File Details</p>
            <p style="margin: 0 0 8px 0; font-size: 15px;"><strong style="color: #818cf8;">Filename:</strong> <span style="color: #fff;">${filename}</span></p>
            <p style="margin: 0; font-size: 15px;"><strong style="color: #818cf8;">Uploaded at:</strong> <span style="color: #fff;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</span></p>
          </div>
          <p style="text-align: center; color: #71717a; font-size: 12px; margin: 0;">The file is attached below 👇</p>
        </div>
      `,
      attachments: [
        {
          filename: filename,
          content: fileBase64,
          encoding: "base64",
        },
      ],
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Email send error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to send email. Check server logs.",
    });
  }
};
