import nodemailer from 'nodemailer';
import createHttpError from 'http-errors';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: Number(process.env.SMTP_PORT) === 465, // true для 465, інакше false
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendResetPasswordEmail = async (toEmail, resetLink) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: toEmail,
    subject: 'Password Reset Request',
    html: `<p>Click the link below to reset your password. This link is valid for 5 minutes.</p>
           <a href="${resetLink}">${resetLink}</a>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};
