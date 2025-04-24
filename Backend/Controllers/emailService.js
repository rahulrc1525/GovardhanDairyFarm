import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // For development only, remove in production if you have valid certs
  }
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error verifying email transporter:', error);
  } else {
    console.log('Email server is ready to take our messages');
  }
});

export const sendEmail = async (to, subject, text, html) => {
  if (!to) {
    console.error('No recipient specified for email');
    return;
  }

  const mailOptions = {
    from: `"Govardhan Dairy Farm" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: text || (html ? html.replace(/<[^>]*>/g, '') : ''),
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', to, 'Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email to:', to, 'Error:', error);
    throw error; // Rethrow to allow calling function to handle
  }
};