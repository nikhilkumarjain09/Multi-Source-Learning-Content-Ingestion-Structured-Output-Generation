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
  JWT_SECRET: process.env.JWT_SECRET || 'cognitive_ai_super_secret_access_key_2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'cognitive_ai_super_secret_refresh_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  REFRESH_TOKEN_EXPIRES_DAYS: parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '7', 10),
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  SMTP_FROM: process.env.SMTP_FROM || 'SynthLearn <noreply@synthlearn.com>',
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
