import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const CONFIG = {
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
  DATABASE_PATH: process.env.DATABASE_PATH || path.resolve(process.cwd(), 'learning_ingestion.db'),
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
