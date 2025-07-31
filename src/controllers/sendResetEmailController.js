import nodemailer from 'nodemailer';
import createHttpError from 'http-errors';
import { User } from '../models/User.js';
import { generateResetToken } from '../services/auth.js';

export const sendResetEmailController = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw createHttpError(400, 'Email is required');
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw createHttpError(404, 'User not found!');
    }

    const token = generateResetToken(email);

    const resetLink = `${process.env.APP_DOMAIN}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset your password',
      html: `<p>Click the link below to reset your password (valid for 5 minutes):</p><a href="${resetLink}">${resetLink}</a>`,
    };

    const info = await transporter.sendMail(mailOptions);

    if (!info.accepted.length) {
      throw createHttpError(
        500,
        'Failed to send the email, please try again later.',
      );
    }

    res.status(200).json({
      status: 200,
      message: 'Reset password email has been successfully sent.',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
