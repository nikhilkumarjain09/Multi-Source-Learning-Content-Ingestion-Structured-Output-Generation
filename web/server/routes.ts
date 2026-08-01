import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { CONFIG } from '../../src/shared/config';
import { runIngestionPipeline } from '../../src/pipeline';
import { getAllConceptNames } from '../../src/storage/conceptRepository';
import { getArtifactsByTopic } from '../../src/retrieval/getArtifactsByTopic';
import { generateLearningPathFromGraph } from '../../src/outputs/learningPath';
import { connectDB } from '../../src/storage/db';
import {
  DocumentModel,
  ConceptModel,
  RelationshipModel,
  FlashcardModel,
  SummaryModel,
  ConceptEmbeddingModel,
} from '../../src/storage/models';

const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });
const app = express();

app.use(cors());
app.use(express.json());

// Serve static frontend bundle if available
const distClientDir = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(distClientDir)) {
  app.use(express.static(distClientDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distClientDir, 'index.html'));
  });
}

/**
 * POST /api/ingest
 * Accepts multipart file upload, runs ingestion pipeline end-to-end, persists to database.
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
 * Returns list of distinct stored topics/concepts.
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
 * Retrieves flashcards, summary, scoped graph data, and ordered learning path for a specific topic.
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
 * Returns list of all ingested documents with metadata and concept counts.
 */
app.get('/api/documents', async (req, res) => {
  try {
    await connectDB();
    const docs = await DocumentModel.find().sort({ createdAt: -1 }).lean();
    
    // Enrich with concept counts
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
 * Deletes a document and cleans up associated summaries.
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
 * Returns all extracted concepts with document associations and relationship degree counts.
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
 * Returns all stored flashcards with attached concept details.
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
 * Returns aggregate platform metrics, breakdown distributions, and performance statistics.
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
 * Returns AI-generated knowledge gap analysis, hub concepts, and learning recommendations.
 */
app.get('/api/insights', async (req, res) => {
  try {
    await connectDB();
    const concepts = await ConceptModel.find().lean();
    const relationships = await RelationshipModel.find().lean();
    const docs = await DocumentModel.find().lean();

    const conceptNameMap = new Map<string, string>();
    concepts.forEach((c: any) => conceptNameMap.set(c.id, c.name));

    // Degree centrality map
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

    // Top connected concepts (Hub nodes)
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

    // Foundational concepts (0 prerequisites, high out-degree)
    const foundationalConcepts = [...concepts]
      .filter((c: any) => (inDegree.get(c.id) || 0) === 0)
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description,
      }))
      .slice(0, 5);

    // Knowledge gaps / missing prerequisite alerts
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
 * Intelligent global search across documents, concepts, topics, and flashcards.
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
