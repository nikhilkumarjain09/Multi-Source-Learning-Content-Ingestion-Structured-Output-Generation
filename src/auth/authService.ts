import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { CONFIG } from '../shared/config';
import {
  UserModel,
  RefreshTokenModel,
  EmailVerificationTokenModel,
  PasswordResetTokenModel,
} from '../storage/models';
import { connectDB } from '../storage/db';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

// Password Hashing & Validation
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Password Strength Checker
export function validatePasswordStrength(password: string): { isValid: boolean; reason?: string } {
  if (password.length < 8) {
    return { isValid: false, reason: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, reason: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, reason: 'Password must contain at least one lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, reason: 'Password must contain at least one number.' };
  }
  return { isValid: true };
}

// JWT Token Operations
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, CONFIG.JWT_SECRET, {
    expiresIn: CONFIG.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function generateRefreshTokenPayload(payload: TokenPayload): string {
  return jwt.sign(payload, CONFIG.JWT_REFRESH_SECRET, {
    expiresIn: `${CONFIG.REFRESH_TOKEN_EXPIRES_DAYS}d`,
  });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, CONFIG.JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, CONFIG.JWT_REFRESH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// Persistent Refresh Token Rotation
export async function createAndStoreRefreshToken(userId: string, deviceInfo = 'Web Browser'): Promise<string> {
  await connectDB();
  const token = uuidv4() + '-' + uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + CONFIG.REFRESH_TOKEN_EXPIRES_DAYS);

  await RefreshTokenModel.create({
    id: uuidv4(),
    userId,
    token,
    expiresAt,
    isRevoked: false,
    deviceInfo,
  });

  return token;
}

export async function rotateRefreshToken(oldToken: string): Promise<{ accessToken: string; refreshToken: string; user: any } | null> {
  await connectDB();
  const foundToken = await RefreshTokenModel.findOne({ token: oldToken, isRevoked: false });

  if (!foundToken || foundToken.expiresAt < new Date()) {
    if (foundToken) {
      foundToken.isRevoked = true;
      await foundToken.save();
    }
    return null;
  }

  // Revoke old token
  foundToken.isRevoked = true;
  await foundToken.save();

  // Find User
  const user = await UserModel.findOne({ id: foundToken.userId });
  if (!user || user.accountStatus === 'locked') return null;

  const payload: TokenPayload = { userId: user.id, email: user.email, role: user.role };
  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = await createAndStoreRefreshToken(user.id, foundToken.deviceInfo);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
  };
}

export async function revokeRefreshToken(token: string): Promise<boolean> {
  await connectDB();
  const res = await RefreshTokenModel.updateOne({ token }, { isRevoked: true });
  return res.modifiedCount > 0;
}

export async function revokeAllUserRefreshTokens(userId: string): Promise<number> {
  await connectDB();
  const res = await RefreshTokenModel.updateMany({ userId }, { isRevoked: true });
  return res.modifiedCount;
}

// Verification & Reset Tokens
export async function createEmailVerificationToken(userId: string): Promise<string> {
  await connectDB();
  await EmailVerificationTokenModel.deleteMany({ userId });
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  await EmailVerificationTokenModel.create({
    userId,
    token,
    expiresAt,
  });

  return token;
}

export async function verifyEmailToken(token: string): Promise<boolean> {
  await connectDB();
  const found = await EmailVerificationTokenModel.findOne({ token });
  if (!found || found.expiresAt < new Date()) {
    return false;
  }

  await UserModel.updateOne({ id: found.userId }, { isEmailVerified: true });
  await EmailVerificationTokenModel.deleteOne({ token });
  return true;
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  await connectDB();
  await PasswordResetTokenModel.deleteMany({ userId });
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1h

  await PasswordResetTokenModel.create({
    userId,
    token,
    expiresAt,
    isUsed: false,
  });

  return token;
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
  await connectDB();
  const found = await PasswordResetTokenModel.findOne({ token, isUsed: false });
  if (!found || found.expiresAt < new Date()) {
    return false;
  }

  const passwordHash = await hashPassword(newPassword);
  await UserModel.updateOne({ id: found.userId }, { passwordHash });
  found.isUsed = true;
  await found.save();

  // Revoke refresh tokens on password change
  await revokeAllUserRefreshTokens(found.userId);
  return true;
}
