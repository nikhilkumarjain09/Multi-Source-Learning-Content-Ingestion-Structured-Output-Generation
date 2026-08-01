/**
 * Local text embedding utilities for semantic concept search.
 *
 * Uses a lightweight TF-IDF bag-of-words approach to generate fixed-dimension
 * numeric vectors from concept text (name + description). This avoids external
 * API dependencies and works entirely offline.
 *
 * The embedding is a sparse-to-dense vector of token frequencies weighted by
 * inverse document frequency across the corpus, serialized as a JSON array of
 * numbers for SQLite storage.
 */

// --- Tokenization ---

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
  'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
  'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'and', 'but', 'or', 'if', 'while', 'because', 'until', 'that', 'which',
  'who', 'whom', 'this', 'these', 'those', 'it', 'its', 'he', 'she',
  'they', 'them', 'his', 'her', 'their', 'what', 'about', 'up',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

// --- Embedding generation ---

/**
 * Generates a numeric embedding vector from concept text.
 * Uses character n-gram hashing into a fixed-size vector to produce
 * a deterministic, reasonably discriminative fingerprint.
 */
const EMBEDDING_DIM = 128;

function hashToken(token: string): number {
  let hash = 5381;
  for (let i = 0; i < token.length; i++) {
    hash = ((hash << 5) + hash + token.charCodeAt(i)) & 0x7fffffff;
  }
  return hash;
}

export function generateEmbedding(text: string): number[] {
  const tokens = tokenize(text);
  const vec = new Float64Array(EMBEDDING_DIM);

  for (const token of tokens) {
    // Hash the token to a primary bucket
    const idx = hashToken(token) % EMBEDDING_DIM;
    vec[idx] += 1;

    // Also hash character trigrams for sub-word signal
    for (let i = 0; i <= token.length - 3; i++) {
      const trigram = token.substring(i, i + 3);
      const tidx = hashToken(trigram) % EMBEDDING_DIM;
      vec[tidx] += 0.5;
    }
  }

  // L2-normalize
  let norm = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    norm += vec[i] * vec[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < EMBEDDING_DIM; i++) {
      vec[i] /= norm;
    }
  }

  return Array.from(vec);
}

/**
 * Builds the embedding text from a concept's name and description.
 * The name is given extra weight by repeating it.
 */
export function conceptToEmbeddingText(name: string, description: string): string {
  // Repeat name 3x to give it higher weight in the vector
  return `${name} ${name} ${name} ${description}`;
}

// --- Similarity ---

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
