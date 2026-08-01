import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const CONFIG = {
  LLM_PROVIDER: (process.env.LLM_PROVIDER || 'groq') as 'groq' | 'nvidia',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROQ_MODEL: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY || '',
  NVIDIA_MODEL: process.env.NVIDIA_MODEL || 'meta/llama-3.3-70b-instruct',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/learning_ingestion',
  PORT: parseInt(process.env.PORT || '3000', 10),
  CHUNK: {
    MAX_TOKENS: 3000,
    MAX_CHARACTERS: 12000,
    OVERLAP_CHARACTERS: 500,
  },
  RETRY: {
    MAX_LLM_RETRY_COUNT: 1,
  },
} as const;

export type Config = typeof CONFIG;
