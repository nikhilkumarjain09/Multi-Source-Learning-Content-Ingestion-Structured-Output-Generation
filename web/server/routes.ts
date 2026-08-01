import express from 'express';
import cors from 'cors';
import { CONFIG } from '../../src/shared/config';

const app = express();
app.use(cors());
app.use(express.json());

// API endpoints stub per API.md
app.post('/api/ingest', (req, res) => {
  res.status(501).json({ message: 'Ingest endpoint placeholder' });
});

app.get('/api/topics', (req, res) => {
  res.json({ topics: [] });
});

app.get('/api/topics/:topic', (req, res) => {
  res.status(404).json({ error: 'Topic not found' });
});

if (require.main === module) {
  app.listen(CONFIG.PORT, () => {
    console.log(`Server listening on port ${CONFIG.PORT}`);
  });
}

export default app;
