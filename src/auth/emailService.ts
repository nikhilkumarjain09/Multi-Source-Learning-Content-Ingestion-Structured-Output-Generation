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

export async function sendVerificationEmail(email: string, otpCode: string): Promise<void> {
  const verifyUrl = `http://localhost:${CONFIG.PORT}/api/auth/verify-email?token=${encodeURIComponent(otpCode)}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E8EAF2; border-radius: 12px; background-color: #FFFFFF;">
      <h2 style="color: #2563EB; margin-bottom: 8px;">Welcome to ${BRANDING.APP_NAME}</h2>
      <p style="color: #475569; font-size: 14px;">Thank you for creating an account. Below is your 6-digit email verification OTP code:</p>
      
      <div style="background-color: #F8FAFC; border: 2px dashed #2563EB; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #2563EB;">${otpCode}</span>
        <div style="font-size: 12px; color: #64748B; margin-top: 6px;">Your 6-Digit Email Verification OTP Code</div>
      </div>

      <p style="margin: 20px 0; text-align: center;">
        <a href="${verifyUrl}" style="background-color: #2563EB; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Or Click Here to Verify Instantly</a>
      </p>

      <p style="font-size: 12px; color: #94A3B8; margin-top: 30px; border-top: 1px solid #F1F5F9; padding-top: 16px;">
        Note: If you don't see this email in your main inbox, please check your <strong>Spam / Junk folder</strong> and mark as "Not Spam".
      </p>
    </div>
  `;

  const mailTransporter = getTransporter();
  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: CONFIG.SMTP_FROM,
        to: email,
        subject: `Your ${BRANDING.APP_NAME} Verification OTP Code: ${otpCode}`,
        html,
      });
    } catch (err) {
      console.warn(`SMTP email send failed for ${email}. OTP Code: ${otpCode}, Verify URL: ${verifyUrl}`);
    }
  } else {
    console.log(`[Development Mode] Verification OTP Code for ${email}: ${otpCode} (Verify URL: ${verifyUrl})`);
  }
}

export async function sendPasswordResetEmail(email: string, otpCode: string): Promise<void> {
  const resetUrl = `http://localhost:${CONFIG.PORT}/?token=${encodeURIComponent(otpCode)}#/reset-password`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E8EAF2; border-radius: 12px; background-color: #FFFFFF;">
      <h2 style="color: #2563EB; margin-bottom: 8px;">Reset Your ${BRANDING.APP_NAME} Password</h2>
      <p style="color: #475569; font-size: 14px;">We received a request to reset your password. Use the 6-digit OTP code below or click the direct reset link:</p>
      
      <div style="background-color: #F8FAFC; border: 2px dashed #2563EB; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #2563EB;">${otpCode}</span>
        <div style="font-size: 12px; color: #64748B; margin-top: 6px;">Your 6-Digit Password Reset OTP Code</div>
      </div>

      <p style="margin: 20px 0; text-align: center;">
        <a href="${resetUrl}" style="background-color: #2563EB; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Click Here to Reset Password</a>
      </p>

      <p style="font-size: 12px; color: #94A3B8; margin-top: 30px; border-top: 1px solid #F1F5F9; padding-top: 16px;">
        Note: If you don't see this email in your main inbox, please check your <strong>Spam / Junk folder</strong> and mark as "Not Spam".
      </p>
    </div>
  `;

  const mailTransporter = getTransporter();
  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: CONFIG.SMTP_FROM,
        to: email,
        subject: `Your ${BRANDING.APP_NAME} Password Reset OTP Code: ${otpCode}`,
        html,
      });
    } catch (err) {
      console.warn(`SMTP reset password send failed for ${email}. OTP Code: ${otpCode}, Reset URL: ${resetUrl}`);
    }
  } else {
    console.log(`[Development Mode] Password Reset OTP Code for ${email}: ${otpCode} (Reset URL: ${resetUrl})`);
  }
}
