import nodemailer from 'nodemailer';
import { CONFIG } from '../shared/config';
import { BRANDING } from '../shared/branding';

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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E8EAF2; border-radius: 12px; background-color: #FFFFFF;">
      <h2 style="color: #2563EB; margin-bottom: 8px;">Welcome to ${BRANDING.APP_NAME}</h2>
      <p style="color: #475569; font-size: 14px;">Thank you for creating an account. Please verify your email address to activate your ${BRANDING.APP_NAME} learning workspace.</p>
      <p style="margin: 28px 0;">
        <a href="${verifyUrl}" style="background-color: #2563EB; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
      </p>
      <p style="font-size: 12px; color: #64748B;">Or copy and paste this link into your browser: <br><a href="${verifyUrl}" style="color: #2563EB;">${verifyUrl}</a></p>
      <p style="font-size: 12px; color: #94A3B8; margin-top: 30px; border-top: 1px solid #F1F5F9; padding-top: 16px;">This link will expire in 24 hours.</p>
    </div>
  `;

  const mailTransporter = getTransporter();
  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: CONFIG.SMTP_FROM,
        to: email,
        subject: `Verify your ${BRANDING.APP_NAME} Account Email`,
        html,
      });
    } catch (err) {
      console.warn(`SMTP email send failed for ${email}. Email verification URL: ${verifyUrl}`);
    }
  } else {
    console.log(`[Development Mode] Verification email link for ${email}: ${verifyUrl}`);
  }
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `http://localhost:${CONFIG.PORT}/?token=${encodeURIComponent(token)}#/reset-password`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E8EAF2; border-radius: 12px; background-color: #FFFFFF;">
      <h2 style="color: #2563EB; margin-bottom: 8px;">Reset Your ${BRANDING.APP_NAME} Password</h2>
      <p style="color: #475569; font-size: 14px;">We received a request to reset your password. Click the button below to choose a new password.</p>
      <p style="margin: 28px 0;">
        <a href="${resetUrl}" style="background-color: #2563EB; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
      </p>
      <p style="font-size: 12px; color: #64748B;">Or copy and paste this link into your browser: <br><a href="${resetUrl}" style="color: #2563EB;">${resetUrl}</a></p>
      <p style="font-size: 12px; color: #94A3B8; margin-top: 30px; border-top: 1px solid #F1F5F9; padding-top: 16px;">This password reset link will expire in 1 hour.</p>
    </div>
  `;

  const mailTransporter = getTransporter();
  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: CONFIG.SMTP_FROM,
        to: email,
        subject: `Reset your ${BRANDING.APP_NAME} Account Password`,
        html,
      });
    } catch (err) {
      console.warn(`SMTP reset password send failed for ${email}. Reset URL: ${resetUrl}`);
    }
  } else {
    console.log(`[Development Mode] Password reset email link for ${email}: ${resetUrl}`);
  }
}
