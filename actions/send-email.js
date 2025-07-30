"use server";

import transporter from "@/lib/nodemailer";
import { render } from '@react-email/render';

export async function sendEmail({ to, subject, react }) {
  try {
    // Render the React email component to HTML
    const html = render(react);

    // Send email using nodemailer
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error: error.message };
  }
}
