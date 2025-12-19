import nodemailer from "nodemailer";
import config from "../config/config.js";

let transporter; // ✅ singleton

const createTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,           // ✅ stable port
      secure: false,       // ✅ must be false for 587
      pool: true,          // ✅ reuse connection (FAST)
      maxConnections: 5,
      maxMessages: 100,
      auth: {
        user: config.email,      // your gmail
        pass: config.password,   // app password
      },
      connectionTimeout: 20_000,
      greetingTimeout: 20_000,
      socketTimeout: 20_000,
    });
  }

  return transporter;
};

const sendEmail = async (to, subject, html) => {
  try {
    const mailer = createTransporter();

    await mailer.sendMail({
      from: `"Bunndel Support" <${config.email}>`,
      to,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    return false;
  }
};

export default sendEmail;
