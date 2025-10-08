const nodemailer = require("nodemailer");
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "gmail", // 👈 you can replace this with "Outlook", "Yahoo", or custom SMTP
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS, // app password (not your Gmail password)
  },
});

const sendOtpEmail = async (to, otp) => {
  try {
    const mailOptions = {
      from: `"MessMate" <${process.env.EMAIL_USER}>`,
      to,
      subject: "MessMate OTP Verification",
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #fffaf5; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Logo -->
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="cid:messmateLogo" alt="MessMate Logo" width="70" style="margin-bottom: 10px;" />
            <h2 style="margin: 0; color: #FF4500;">MessMate</h2>
          </div>

          <!-- Title -->
          <h3 style="color: #333; text-align: center; margin-bottom: 10px;">Verify Your Identity</h3>
          <p style="text-align: center; color: #555; margin-bottom: 25px;">
            Use the OTP code below to continue with your verification.
          </p>

          <!-- OTP Box -->
          <div style="text-align: center; margin-bottom: 20px;">
            <p style="font-size: 22px; font-weight: bold; background: linear-gradient(90deg, #FF7E5F, #FF4500); color: white; display: inline-block; padding: 12px 25px; border-radius: 8px; letter-spacing: 3px;">
              ${otp}
            </p>
          </div>

          <!-- Info -->
          <p style="color: #555; text-align: center; font-size: 14px;">
            This code is valid for <b>5 minutes</b> and can only be used once.<br>
            Please don’t share this code with anyone.
          </p>

          <!-- Footer -->
          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: gray;">
            <p>If you did not request this, you can safely ignore this email.</p>
            <p>© ${new Date().getFullYear()} MessMate - Hostel Mess Management System</p>
          </div>
        </div>
      </div>
      `,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "logo.png"), // ✅ points to utils/logo.png
          cid: "messmateLogo", // ✅ must match src="cid:messmateLogo"
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};

module.exports = sendOtpEmail;
