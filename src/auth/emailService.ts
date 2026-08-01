import nodemailer from 'nodemailer';
import { CONFIG } from '../shared/config';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    if (CONFIG.SMTP_USER && CONFIG.SMTP_PASSWORD) {
      transporter = nodemailer.createTransport({
        host: CONFIG.SMTP_HOST,
        port: CONFIG.SMTP_PORT,
        secure: CONFIG.SMTP_PORT === 465,
        auth: {
          user: CONFIG.SMTP_USER,
          pass: CONFIG.SMTP_PASSWORD,
        },
      });
    }
  }
  return transporter;
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `http://localhost:${CONFIG.PORT}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E8EAF2; border-radius: 8px;">
      <h2 style="color: #2563EB;">Welcome to CognitiveAI Enterprise</h2>
      <p>Thank you for creating an account. Please verify your email address to complete your registration.</p>
      <p style="margin: 25px 0;">
        <a href="${verifyUrl}" style="background-color: #2563EB; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
      </p>
      <p style="font-size: 12px; color: #64748B;">Or copy and paste this link into your browser: <br>${verifyUrl}</p>
      <p style="font-size: 12px; color: #94A3B8; margin-top: 30px;">This link will expire in 24 hours.</p>
    </div>
  `;

  const mailTransporter = getTransporter();
  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: CONFIG.SMTP_FROM,
        to: email,
        subject: 'Verify your CognitiveAI Account Email',
        html,
      });
    } catch (err) {
      console.warn(`SMTP email send failed for ${email}. Email verification URL: ${verifyUrl}`);
    }
  } else {
    console.log(`[Development Mode] Verification email generated for ${email}: ${verifyUrl}`);
  }
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `http://localhost:${CONFIG.PORT}/api/auth/reset-password?token=${encodeURIComponent(token)}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E8EAF2; border-radius: 8px;">
      <h2 style="color: #2563EB;">Reset Your CognitiveAI Password</h2>
      <p>We received a request to reset your password. Click the button below to choose a new password.</p>
      <p style="margin: 25px 0;">
        <a href="${resetUrl}" style="background-color: #2563EB; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
      </p>
      <p style="font-size: 12px; color: #64748B;">Or copy and paste this link into your browser: <br>${resetUrl}</p>
      <p style="font-size: 12px; color: #94A3B8; margin-top: 30px;">This password reset link will expire in 1 hour.</p>
    </div>
  `;

  const mailTransporter = getTransporter();
  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: CONFIG.SMTP_FROM,
        to: email,
        subject: 'Reset your CognitiveAI Account Password',
        html,
      });
    } catch (err) {
      console.warn(`SMTP reset password send failed for ${email}. Reset URL: ${resetUrl}`);
    }
  } else {
    console.log(`[Development Mode] Password reset email generated for ${email}: ${resetUrl}`);
  }
}
