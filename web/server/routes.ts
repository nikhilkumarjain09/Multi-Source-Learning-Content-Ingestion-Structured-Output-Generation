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
}

/**
 * POST /api/ingest
 * Accepts multipart file upload, runs ingestion pipeline end-to-end, persists to SQLite DB.
 */
app.post('/api/ingest', upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(422).json({ error: 'No file uploaded. Please attach a PDF or transcript file.' });
    return;
  }

  const tempFilePath = req.file.path;
  const originalName = req.file.originalname;
  const extension = path.extname(originalName).toLowerCase();
  const targetFilePath = path.join(uploadDir, `${req.file.filename}${extension}`);

  try {
    // Rename temp file to include original extension for parser selection
    await fs.promises.rename(tempFilePath, targetFilePath);

    const result = await runIngestionPipeline(targetFilePath);

    // Clean up temporary uploaded file
    try {
      await fs.promises.unlink(targetFilePath);
    } catch {}

    const learningPath = generateLearningPathFromGraph(
      result.extraction.concepts,
      result.extraction.relationships
    );

    res.status(200).json({
      documentId: result.document.id,
      concepts: result.extraction.concepts,
      relationships: result.extraction.relationships,
      summary: result.summary,
      flashcards: result.flashcards,
      graph: result.graph,
      learningPath,
    });
  } catch (error: any) {
    // Clean up temp file on error
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

if (require.main === module) {
  app.listen(CONFIG.PORT, () => {
    console.log(`Express API server listening on http://localhost:${CONFIG.PORT}`);
  });
}

export default app;
