import { Schema, model, models } from 'mongoose';

// 1. Document Schema
const documentSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
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

// 2. Concept Schema
const conceptSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
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

// 3. Relationship Schema
const relationshipSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
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

// 4. Flashcard Schema
const flashcardSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    conceptId: { type: String, required: true, index: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { timestamps: true }
);
flashcardSchema.index({ question: 'text', answer: 'text' });

export const FlashcardModel = models.Flashcard || model('Flashcard', flashcardSchema);

// 5. Summary Schema
const summarySchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    documentId: { type: String, required: true, index: true },
    summaryText: { type: String, required: true },
  },
  { timestamps: true }
);
summarySchema.index({ summaryText: 'text' });

export const SummaryModel = models.Summary || model('Summary', summarySchema);

// 6. Concept Embedding Schema
const conceptEmbeddingSchema = new Schema(
  {
    conceptId: { type: String, required: true, unique: true, index: true },
    embedding: [{ type: Number, required: true }],
  },
  { timestamps: true }
);

export const ConceptEmbeddingModel =
  models.ConceptEmbedding || model('ConceptEmbedding', conceptEmbeddingSchema);
