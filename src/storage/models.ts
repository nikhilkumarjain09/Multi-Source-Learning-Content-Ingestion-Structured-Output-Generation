import { Schema, model, models } from 'mongoose';

// 1. User Schema
const userSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isEmailVerified: { type: Boolean, default: false },
    lastLogin: { type: Date, default: null },
    accountStatus: { type: String, enum: ['active', 'locked'], default: 'active' },
  },
  { timestamps: true }
);

export const UserModel = models.User || model('User', userSchema);

// 2. Refresh Token Schema
const refreshTokenSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true },
    isRevoked: { type: Boolean, default: false },
    deviceInfo: { type: String, default: 'Web Browser' },
  },
  { timestamps: true }
);

export const RefreshTokenModel = models.RefreshToken || model('RefreshToken', refreshTokenSchema);

// 3. Email Verification Token Schema
const emailVerificationTokenSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const EmailVerificationTokenModel =
  models.EmailVerificationToken || model('EmailVerificationToken', emailVerificationTokenSchema);

// 4. Password Reset Token Schema
const passwordResetTokenSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PasswordResetTokenModel =
  models.PasswordResetToken || model('PasswordResetToken', passwordResetTokenSchema);

// 5. Document Schema
const documentSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true },
    filename: { type: String, required: true, index: true },
    sourceType: { type: String, required: true },
    rawText: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    ingestedAt: { type: String, required: true, index: true },
  },
  { timestamps: true }
);
documentSchema.index({ filename: 'text', rawText: 'text' });

export const DocumentModel = models.Document || model('Document', documentSchema);

// 6. Concept Schema
const conceptSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true },
    documentId: { type: String, required: true, index: true },
    name: { type: String, required: true, index: true },
    canonicalName: { type: String, required: true, index: true },
    description: { type: String, required: true },
    documentIds: [{ type: String, index: true }],
  },
  { timestamps: true }
);
conceptSchema.index({ name: 'text', description: 'text' });

export const ConceptModel = models.Concept || model('Concept', conceptSchema);

// 7. Relationship Schema
const relationshipSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true },
    fromConceptId: { type: String, required: true, index: true },
    toConceptId: { type: String, required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ['prerequisite', 'related-to', 'part-of'],
    },
  },
  { timestamps: true }
);

export const RelationshipModel = models.Relationship || model('Relationship', relationshipSchema);

// 8. Flashcard Schema
const flashcardSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true },
    conceptId: { type: String, required: true, index: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { timestamps: true }
);
flashcardSchema.index({ question: 'text', answer: 'text' });

export const FlashcardModel = models.Flashcard || model('Flashcard', flashcardSchema);

// 9. Summary Schema
const summarySchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true },
    documentId: { type: String, required: true, index: true },
    summaryText: { type: String, required: true },
  },
  { timestamps: true }
);
summarySchema.index({ summaryText: 'text' });

export const SummaryModel = models.Summary || model('Summary', summarySchema);

// 10. Concept Embedding Schema
const conceptEmbeddingSchema = new Schema(
  {
    conceptId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true },
    embedding: [{ type: Number, required: true }],
  },
  { timestamps: true }
);

export const ConceptEmbeddingModel =
  models.ConceptEmbedding || model('ConceptEmbedding', conceptEmbeddingSchema);
