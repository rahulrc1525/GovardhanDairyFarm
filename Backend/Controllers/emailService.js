// emailService.js (enhanced)
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, text, html) => {
  if (!to || !subject) {
    console.error('Missing required email parameters');
    return;
  }

  const mailOptions = {
    from: `Govardhan Dairy Farm <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: text || '',
    html: html || text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};