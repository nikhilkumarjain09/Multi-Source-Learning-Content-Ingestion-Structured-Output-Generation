import assert from 'assert';
import { connectDB, disconnectDB } from '../src/storage/db';
import {
  UserModel,
  RefreshTokenModel,
  EmailVerificationTokenModel,
  PasswordResetTokenModel,
} from '../src/storage/models';
import {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  generateAccessToken,
  verifyAccessToken,
  createAndStoreRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  createEmailVerificationToken,
  verifyEmailToken,
  createPasswordResetToken,
  resetPasswordWithToken,
} from '../src/auth/authService';

async function runAuthTests() {
  console.log('Running Authentication & Authorization Unit Tests...');

  try {
    await connectDB();

    // Clean up Auth collections before testing
    await Promise.all([
      UserModel.deleteMany({}),
      RefreshTokenModel.deleteMany({}),
      EmailVerificationTokenModel.deleteMany({}),
      PasswordResetTokenModel.deleteMany({}),
    ]);

    // 1. Password Strength Validation Test
    console.log('\n--- 1. Password Strength Validation ---');
    const weakPass = validatePasswordStrength('weak');
    assert.strictEqual(weakPass.isValid, false, 'Weak password should fail validation');

    const strongPass = validatePasswordStrength('SecurePass123!');
    assert.strictEqual(strongPass.isValid, true, 'Strong password should pass validation');
    console.log('Password strength validation PASSED.');

    // 2. Password Hashing & Verification Test
    console.log('\n--- 2. Bcrypt Hashing & Comparison ---');
    const plain = 'SecretPassword123';
    const hashed = await hashPassword(plain);
    assert.notStrictEqual(plain, hashed, 'Hashed password should not equal plain password');

    const isMatch = await comparePassword(plain, hashed);
    assert.strictEqual(isMatch, true, 'Bcrypt compare should match plain password');

    const isWrongMatch = await comparePassword('WrongPass123', hashed);
    assert.strictEqual(isWrongMatch, false, 'Bcrypt compare should fail wrong password');
    console.log('Bcrypt hashing and comparison PASSED.');

    // 3. User Registration & Email Verification Token Test
    console.log('\n--- 3. User Registration & Email Verification ---');
    const user = await UserModel.create({
      id: 'test-user-1',
      fullName: 'Alice Test',
      email: 'alice@example.com',
      passwordHash: hashed,
      role: 'user',
      isEmailVerified: false,
    });
    assert.strictEqual(user.email, 'alice@example.com');

    const verifyToken = await createEmailVerificationToken(user.id);
    assert.ok(verifyToken, 'Verification token generated');

    const isVerified = await verifyEmailToken(verifyToken);
    assert.strictEqual(isVerified, true, 'Token verification should succeed');

    const updatedUser = await UserModel.findOne({ id: user.id });
    assert.strictEqual(updatedUser.isEmailVerified, true, 'User email verified status updated');
    console.log('User registration & email verification PASSED.');

    // 4. JWT Generation & Verification Test
    console.log('\n--- 4. JWT Access Token Signing & Verification ---');
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    assert.ok(accessToken, 'Access token generated');

    const decoded = verifyAccessToken(accessToken);
    assert.ok(decoded, 'JWT verified');
    assert.strictEqual(decoded.userId, user.id);
    assert.strictEqual(decoded.email, 'alice@example.com');
    console.log('JWT access token signing & verification PASSED.');

    // 5. Refresh Token Rotation Test
    console.log('\n--- 5. Refresh Token Rotation & Revocation ---');
    const refToken1 = await createAndStoreRefreshToken(user.id, 'Test Laptop');
    assert.ok(refToken1, 'Refresh token created');

    const rotationResult = await rotateRefreshToken(refToken1);
    assert.ok(rotationResult, 'Refresh token rotated');
    assert.ok(rotationResult.accessToken, 'New access token issued');
    assert.notStrictEqual(rotationResult.refreshToken, refToken1, 'New refresh token issued');

    // Attempting to reuse old refresh token should fail
    const reusedAttempt = await rotateRefreshToken(refToken1);
    assert.strictEqual(reusedAttempt, null, 'Reusing revoked refresh token should fail');
    console.log('Refresh token rotation & revocation PASSED.');

    // 6. Password Reset Flow Test
    console.log('\n--- 6. Password Reset Flow ---');
    const resetToken = await createPasswordResetToken(user.id);
    assert.ok(resetToken, 'Password reset token generated');

    const resetSuccess = await resetPasswordWithToken(resetToken, 'NewSecurePass123');
    assert.strictEqual(resetSuccess, true, 'Password reset should succeed');

    const recheckUser = await UserModel.findOne({ id: user.id });
    const isNewPassValid = await comparePassword('NewSecurePass123', recheckUser.passwordHash);
    assert.strictEqual(isNewPassValid, true, 'New password matches database hash');
    console.log('Password reset flow PASSED.');

    // 7. Logout All Sessions Test
    console.log('\n--- 7. Logout All Sessions ---');
    await createAndStoreRefreshToken(user.id, 'Device 1');
    await createAndStoreRefreshToken(user.id, 'Device 2');

    const revokedCount = await revokeAllUserRefreshTokens(user.id);
    assert.ok(revokedCount >= 2, 'Revoked all active user refresh tokens');
    console.log('Logout all sessions PASSED.');

    console.log('\n=========================================');
    console.log('All Authentication & Authorization Tests PASSED Successfully!');
    console.log('=========================================\n');
  } finally {
    await disconnectDB();
  }
}

runAuthTests().catch((err) => {
  console.error('Auth test failed:', err);
  process.exit(1);
});
