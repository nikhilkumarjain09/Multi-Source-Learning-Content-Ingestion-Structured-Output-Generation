import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { CONFIG } from '../../src/shared/config';
import { runIngestionPipeline } from '../../src/pipeline';
import { getAllConceptNames } from '../../src/storage/conceptRepository';
import { getArtifactsByTopic } from '../../src/retrieval/getArtifactsByTopic';
import { generateLearningPathFromGraph } from '../../src/outputs/learningPath';
import { connectDB } from '../../src/storage/db';
import {
  UserModel,
  DocumentModel,
  ConceptModel,
  RelationshipModel,
  FlashcardModel,
  SummaryModel,
  ConceptEmbeddingModel,
} from '../../src/storage/models';
import {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  generateAccessToken,
  createAndStoreRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  createEmailVerificationToken,
  verifyEmailToken,
  createPasswordResetToken,
  resetPasswordWithToken,
} from '../../src/auth/authService';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../src/auth/emailService';
import { authenticateToken, AuthenticatedRequest } from '../../src/auth/authMiddleware';

const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });
const app = express();

app.use(cors());
app.use(express.json());



// ==========================================
// AUTHENTICATION & USER MANAGEMENT ENDPOINTS
// ==========================================

/**
 * POST /api/auth/signup
 * Registers a new user account, hashes password, generates verification token, sends email.
 */
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body || {};

    if (!fullName || !email || !password || !confirmPassword) {
      res.status(422).json({ error: 'All fields (fullName, email, password, confirmPassword) are required.' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(422).json({ error: 'Password and confirm password do not match.' });
      return;
    }

    const passCheck = validatePasswordStrength(password);
    if (!passCheck.isValid) {
      res.status(422).json({ error: passCheck.reason });
      return;
    }

    await connectDB();
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const userId = uuidv4();

    const newUser = await UserModel.create({
      id: userId,
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'user',
      isEmailVerified: false,
      accountStatus: 'active',
    });

    const verifyToken = await createEmailVerificationToken(userId);
    await sendVerificationEmail(normalizedEmail, verifyToken);

    res.status(201).json({
      message: 'Account registered successfully. Please check your email to verify your account.',
      userId: newUser.id,
      email: newUser.email,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to register account.' });
  }
});

/**
 * POST /api/auth/login
 * Validates credentials, checks account status & verification, generates access + refresh tokens.
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      res.status(422).json({ error: 'Email and password are required.' });
      return;
    }

    await connectDB();
    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      res.status(401).json({ error: 'Invalid email address or password.' });
      return;
    }

    if (user.accountStatus === 'locked') {
      res.status(403).json({ error: 'Your account has been locked. Please contact support.' });
      return;
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email address or password.' });
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = await createAndStoreRefreshToken(user.id, req.headers['user-agent'] || 'Web Browser');

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to log in.' });
  }
});

/**
 * POST /api/auth/refresh
 * Rotates refresh token and returns new access token.
 */
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
      res.status(422).json({ error: 'Refresh token is required.' });
      return;
    }

    const result = await rotateRefreshToken(refreshToken);
    if (!result) {
      res.status(401).json({ error: 'Invalid, expired, or revoked refresh token. Please log in again.' });
      return;
    }

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to refresh token.' });
  }
});

/**
 * POST /api/auth/logout
 * Revokes active refresh token.
 */
app.post('/api/auth/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to log out.' });
  }
});

/**
 * POST /api/auth/logout-all
 * Revokes all refresh tokens for authenticated user.
 */
app.post('/api/auth/logout-all', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const count = await revokeAllUserRefreshTokens(userId);
    res.status(200).json({ success: true, message: `Revoked ${count} sessions across all devices.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to log out from all devices.' });
  }
});

/**
 * GET /api/auth/verify-email
 * Verifies email token and marks account as verified.
 */
app.get('/api/auth/verify-email', async (req, res) => {
  try {
    const token = String(req.query.token || '');
    if (!token) {
      res.status(422).json({ error: 'Verification token is required.' });
      return;
    }

    const isVerified = await verifyEmailToken(token);
    if (!isVerified) {
      res.status(400).json({ error: 'Invalid or expired email verification token.' });
      return;
    }

    res.status(200).json({ success: true, message: 'Email address verified successfully. You can now log in.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to verify email.' });
  }
});

/**
 * POST /api/auth/resend-verification
 */
app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      res.status(422).json({ error: 'Email address is required.' });
      return;
    }

    await connectDB();
    const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (user && !user.isEmailVerified) {
      const verifyToken = await createEmailVerificationToken(user.id);
      await sendVerificationEmail(user.email, verifyToken);
    }

    res.status(200).json({ message: 'If an unverified account exists, a verification email has been sent.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to resend verification email.' });
  }
});

/**
 * POST /api/auth/forgot-password
 */
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      res.status(422).json({ error: 'Email address is required.' });
      return;
    }

    await connectDB();
    const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (user) {
      const resetToken = await createPasswordResetToken(user.id);
      await sendPasswordResetEmail(user.email, resetToken);
    }

    res.status(200).json({ message: 'If an account exists for this email, a password reset link has been sent.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to initiate password reset.' });
  }
});

/**
 * POST /api/auth/reset-password
 */
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body || {};
    if (!token || !newPassword || !confirmPassword) {
      res.status(422).json({ error: 'Token, newPassword, and confirmPassword are required.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(422).json({ error: 'Passwords do not match.' });
      return;
    }

    const check = validatePasswordStrength(newPassword);
    if (!check.isValid) {
      res.status(422).json({ error: check.reason });
      return;
    }

    const success = await resetPasswordWithToken(token, newPassword);
    if (!success) {
      res.status(400).json({ error: 'Invalid or expired password reset token.' });
      return;
    }

    res.status(200).json({ success: true, message: 'Password reset successfully. Please log in with your new password.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to reset password.' });
  }
});

/**
 * GET /api/auth/me
 */
app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    await connectDB();
    const user = await UserModel.findOne({ id: req.user!.userId });
    if (!user) {
      res.status(404).json({ error: 'User account not found.' });
      return;
    }

    res.status(200).json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch user profile.' });
  }
});

/**
 * PUT /api/auth/profile
 */
app.put('/api/auth/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { fullName } = req.body || {};
    if (!fullName || !fullName.trim()) {
      res.status(422).json({ error: 'Full name cannot be empty.' });
      return;
    }

    await connectDB();
    const user = await UserModel.findOneAndUpdate(
      { id: req.user!.userId },
      { fullName: fullName.trim() },
      { new: true }
    );

    res.status(200).json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update profile.' });
  }
});

/**
 * PUT /api/auth/change-password
 */
app.put('/api/auth/change-password', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};
    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(422).json({ error: 'All password fields are required.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(422).json({ error: 'New password and confirm password do not match.' });
      return;
    }

    const passCheck = validatePasswordStrength(newPassword);
    if (!passCheck.isValid) {
      res.status(422).json({ error: passCheck.reason });
      return;
    }

    await connectDB();
    const user = await UserModel.findOne({ id: req.user!.userId });
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Incorrect current password.' });
      return;
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to change password.' });
  }
});

// ==========================================
// WORKSPACE INGESTION & ARTIFACT ENDPOINTS
// ==========================================

/**
 * POST /api/ingest
 */
app.post('/api/ingest', upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(422).json({ error: 'No file uploaded. Please attach a PDF, transcript, or video/audio file.' });
    return;
  }

  const tempFilePath = req.file.path;
  const originalName = req.file.originalname;
  const extension = path.extname(originalName).toLowerCase();
  const targetFilePath = path.join(uploadDir, `${req.file.filename}${extension}`);

  try {
    await fs.promises.rename(tempFilePath, targetFilePath);
    const result = await runIngestionPipeline(targetFilePath);

    try {
      await fs.promises.unlink(targetFilePath);
    } catch {}

    const learningPath = generateLearningPathFromGraph(
      result.extraction.concepts,
      result.extraction.relationships
    );

    res.status(200).json({
      documentId: result.document.id,
      filename: result.document.filename,
      sourceType: result.document.sourceType,
      concepts: result.extraction.concepts,
      relationships: result.extraction.relationships,
      summary: result.summary,
      flashcards: result.flashcards,
      graph: result.graph,
      learningPath,
    });
  } catch (error: any) {
    try {
      if (fs.existsSync(targetFilePath)) await fs.promises.unlink(targetFilePath);
      if (fs.existsSync(tempFilePath)) await fs.promises.unlink(tempFilePath);
    } catch {}

    res.status(422).json({
      error: error.message || 'Failed to process document ingestion.',
    });
  }
});

/**
 * GET /api/topics
 */
app.get('/api/topics', async (req, res) => {
  try {
    const topics = await getAllConceptNames();
    res.status(200).json({ topics });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch topics.' });
  }
});

/**
 * GET /api/topics/:topic
 */
app.get('/api/topics/:topic', async (req, res) => {
  try {
    const topicName = req.params.topic;
    const artifacts = await getArtifactsByTopic(topicName);

    if (!artifacts) {
      res.status(404).json({ error: `Topic not found: "${topicName}"` });
      return;
    }

    const concepts = artifacts.concepts.map(c => ({ name: c.name, description: c.description }));
    const relationships = artifacts.graph.edges.map(e => ({ from: e.from, to: e.to, type: e.type }));
    const learningPath = generateLearningPathFromGraph(concepts, relationships, topicName);

    res.status(200).json({
      topic: artifacts.topic,
      concepts: artifacts.concepts,
      flashcards: artifacts.flashcards,
      summary: artifacts.summary,
      graph: artifacts.graph,
      learningPath,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve topic artifacts.' });
  }
});

/**
 * GET /api/documents
 */
app.get('/api/documents', async (req, res) => {
  try {
    await connectDB();
    const docs = await DocumentModel.find().sort({ createdAt: -1 }).lean();

    const enriched = await Promise.all(
      docs.map(async (doc: any) => {
        const conceptCount = await ConceptModel.countDocuments({
          $or: [{ documentId: doc.id }, { documentIds: doc.id }],
        });
        const summaryDoc = await SummaryModel.findOne({ documentId: doc.id }).lean();
        return {
          id: doc.id,
          filename: doc.filename,
          sourceType: doc.sourceType,
          wordCount: (doc.rawText || '').split(/\s+/).filter(Boolean).length,
          ingestedAt: doc.ingestedAt || doc.createdAt,
          metadata: doc.metadata || {},
          conceptCount,
          summary: summaryDoc ? (summaryDoc as any).summaryText : '',
        };
      })
    );

    res.status(200).json({ documents: enriched });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch documents.' });
  }
});

/**
 * DELETE /api/documents/:id
 */
app.delete('/api/documents/:id', async (req, res) => {
  try {
    await connectDB();
    const docId = req.params.id;
    await DocumentModel.deleteOne({ id: docId });
    await SummaryModel.deleteOne({ documentId: docId });
    await ConceptModel.updateMany({}, { $pull: { documentIds: docId } });
    res.status(200).json({ success: true, message: `Document ${docId} deleted successfully.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete document.' });
  }
});

/**
 * GET /api/concepts
 */
app.get('/api/concepts', async (req, res) => {
  try {
    await connectDB();
    const concepts = await ConceptModel.find().sort({ name: 1 }).lean();
    const relationships = await RelationshipModel.find().lean();
    const flashcards = await FlashcardModel.find().lean();

    const relMap = new Map<string, number>();
    relationships.forEach((r: any) => {
      relMap.set(r.fromConceptId, (relMap.get(r.fromConceptId) || 0) + 1);
      relMap.set(r.toConceptId, (relMap.get(r.toConceptId) || 0) + 1);
    });

    const flashcardMap = new Map<string, number>();
    flashcards.forEach((f: any) => {
      flashcardMap.set(f.conceptId, (flashcardMap.get(f.conceptId) || 0) + 1);
    });

    const enriched = concepts.map((c: any) => ({
      id: c.id,
      name: c.name,
      canonicalName: c.canonicalName,
      description: c.description,
      documentId: c.documentId,
      documentCount: (c.documentIds || [c.documentId]).length,
      relationshipCount: relMap.get(c.id) || 0,
      flashcardCount: flashcardMap.get(c.id) || 0,
    }));

    res.status(200).json({ concepts: enriched });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch concepts.' });
  }
});

/**
 * GET /api/flashcards
 */
app.get('/api/flashcards', async (req, res) => {
  try {
    await connectDB();
    const flashcards = await FlashcardModel.find().sort({ createdAt: -1 }).lean();
    const concepts = await ConceptModel.find().lean();
    const conceptMap = new Map<string, string>();
    concepts.forEach((c: any) => conceptMap.set(c.id, c.name));

    const enriched = flashcards.map((f: any) => ({
      id: f.id,
      conceptId: f.conceptId,
      conceptName: conceptMap.get(f.conceptId) || 'General Topic',
      question: f.question,
      answer: f.answer,
    }));

    res.status(200).json({ flashcards: enriched });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch flashcards.' });
  }
});

/**
 * GET /api/analytics
 */
app.get('/api/analytics', async (req, res) => {
  try {
    await connectDB();
    const [totalDocs, totalConcepts, totalRelationships, totalFlashcards, totalSummaries, totalEmbeddings] =
      await Promise.all([
        DocumentModel.countDocuments(),
        ConceptModel.countDocuments(),
        RelationshipModel.countDocuments(),
        FlashcardModel.countDocuments(),
        SummaryModel.countDocuments(),
        ConceptEmbeddingModel.countDocuments(),
      ]);

    const docs = await DocumentModel.find().lean();
    const sourceTypeCounts: Record<string, number> = {};
    let totalWords = 0;

    docs.forEach((d: any) => {
      const type = d.sourceType || 'other';
      sourceTypeCounts[type] = (sourceTypeCounts[type] || 0) + 1;
      totalWords += (d.rawText || '').split(/\s+/).filter(Boolean).length;
    });

    const relationships = await RelationshipModel.find().lean();
    const relTypeCounts: Record<string, number> = {};
    relationships.forEach((r: any) => {
      const type = r.type || 'related-to';
      relTypeCounts[type] = (relTypeCounts[type] || 0) + 1;
    });

    res.status(200).json({
      metrics: {
        totalDocuments: totalDocs,
        totalConcepts,
        totalRelationships,
        totalFlashcards,
        totalSummaries,
        totalEmbeddings,
        averageWordsPerDocument: totalDocs > 0 ? Math.round(totalWords / totalDocs) : 0,
      },
      sourceTypeDistribution: sourceTypeCounts,
      relationshipTypeDistribution: relTypeCounts,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch analytics.' });
  }
});

/**
 * GET /api/insights
 */
app.get('/api/insights', async (req, res) => {
  try {
    await connectDB();
    const concepts = await ConceptModel.find().lean();
    const relationships = await RelationshipModel.find().lean();
    const docs = await DocumentModel.find().lean();

    const conceptNameMap = new Map<string, string>();
    concepts.forEach((c: any) => conceptNameMap.set(c.id, c.name));

    const inDegree = new Map<string, number>();
    const outDegree = new Map<string, number>();
    concepts.forEach((c: any) => {
      inDegree.set(c.id, 0);
      outDegree.set(c.id, 0);
    });

    relationships.forEach((r: any) => {
      outDegree.set(r.fromConceptId, (outDegree.get(r.fromConceptId) || 0) + 1);
      inDegree.set(r.toConceptId, (inDegree.get(r.toConceptId) || 0) + 1);
    });

    const sortedByConnections = [...concepts]
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        totalDegree: (inDegree.get(c.id) || 0) + (outDegree.get(c.id) || 0),
        prerequisitesCount: inDegree.get(c.id) || 0,
      }))
      .sort((a, b) => b.totalDegree - a.totalDegree)
      .slice(0, 5);

    const foundationalConcepts = [...concepts]
      .filter((c: any) => (inDegree.get(c.id) || 0) === 0)
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description,
      }))
      .slice(0, 5);

    const gaps = relationships
      .filter((r: any) => r.type === 'prerequisite')
      .slice(0, 4)
      .map((r: any) => ({
        prerequisiteName: conceptNameMap.get(r.fromConceptId) || 'Foundational Topic',
        targetName: conceptNameMap.get(r.toConceptId) || 'Advanced Topic',
        recommendation: `Study "${conceptNameMap.get(r.fromConceptId) || 'prerequisite'}" before advancing to "${conceptNameMap.get(r.toConceptId) || 'target'}"`,
      }));

    res.status(200).json({
      hubConcepts: sortedByConnections,
      foundationalConcepts,
      knowledgeGaps: gaps,
      totalDocumentsAnalyzed: docs.length,
      graphDensityScore: concepts.length > 0 ? (relationships.length / concepts.length).toFixed(2) : '0.00',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch AI insights.' });
  }
});

/**
 * GET /api/search
 */
app.get('/api/search', async (req, res) => {
  try {
    const query = String(req.query.q || '').trim();
    if (!query) {
      res.status(200).json({ documents: [], concepts: [], topics: [], flashcards: [] });
      return;
    }

    await connectDB();
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const [matchingDocs, matchingConcepts, matchingFlashcards, allTopics] = await Promise.all([
      DocumentModel.find({ $or: [{ filename: regex }, { rawText: regex }] }).limit(5).lean(),
      ConceptModel.find({ $or: [{ name: regex }, { description: regex }] }).limit(5).lean(),
      FlashcardModel.find({ $or: [{ question: regex }, { answer: regex }] }).limit(5).lean(),
      getAllConceptNames(),
    ]);

    const matchingTopics = allTopics.filter(t => t.toLowerCase().includes(query.toLowerCase())).slice(0, 5);

    res.status(200).json({
      documents: matchingDocs.map((d: any) => ({ id: d.id, filename: d.filename, sourceType: d.sourceType })),
      concepts: matchingConcepts.map((c: any) => ({ id: c.id, name: c.name, description: c.description })),
      topics: matchingTopics,
      flashcards: matchingFlashcards.map((f: any) => ({ id: f.id, question: f.question, answer: f.answer })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to execute global search.' });
  }
});

// API 404 Fallback: Ensure /api requests return structured JSON instead of HTML
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `API endpoint non-existent or unsupported method: ${req.method} ${req.path}` });
});

// Serve static frontend bundle if available (Must be placed AFTER all /api routes)
const distClientDir = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(distClientDir)) {
  app.use(express.static(distClientDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distClientDir, 'index.html'));
  });
}

if (require.main === module) {
  connectDB().then(() => {
    app.listen(CONFIG.PORT, () => {
      console.log(`Express API server listening on http://localhost:${CONFIG.PORT}`);
    });
  }).catch(err => {
    console.error('Failed to connect to database at startup:', err);
    process.exit(1);
  });
}

export default app;
