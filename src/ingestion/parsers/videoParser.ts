import fs from 'fs';
import path from 'path';
import { Parser, ParsedDocument } from '../types';
import { CONFIG } from '../../shared/config';

/**
 * Clean VTT/SRT subtitle lines into plain text transcript.
 */
function cleanSubtitleText(raw: string): string {
  return raw
    .split(/\r?\n/)
    .filter(line => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      if (trimmed.startsWith('WEBVTT')) return false;
      if (/^\d+$/.test(trimmed)) return false; // sequence number
      if (/^\d{2}:\d{2}/.test(trimmed)) return false; // timestamp line
      if (/^NOTE/i.test(trimmed)) return false;
      return true;
    })
    .join(' ')
    .replace(/<[^>]+>/g, '') // remove inline VTT tags like <v Speaker>
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Transcribes audio/video media file via Groq Whisper API (whisper-large-v3-turbo).
 */
async function transcribeMediaWithGroqWhisper(filePath: string): Promise<string> {
  const apiKey = CONFIG.GROQ_API_KEY || process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is missing in environment. Please set GROQ_API_KEY in your .env file to enable Groq Whisper Speech-to-Text.');
  }

  const fileBuffer = await fs.promises.readFile(filePath);
  const blob = new Blob([fileBuffer]);
  const formData = new FormData();
  formData.append('file', blob, path.basename(filePath));
  formData.append('model', 'whisper-large-v3-turbo');
  formData.append('response_format', 'json');

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq Whisper Speech-to-Text API request failed (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as { text?: string };
  if (!data || typeof data.text !== 'string' || data.text.trim().length === 0) {
    throw new Error('Groq Whisper Speech-to-Text API returned empty transcription response.');
  }

  return data.text.trim();
}

export const videoParser: Parser = {
  supports(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ['.mp4', '.mp3', '.wav', '.m4a', '.webm', '.avi', '.mov', '.vtt', '.srt'].includes(ext);
  },

  async parse(filePath: string): Promise<ParsedDocument> {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File not found: "${filePath}"`);
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const stat = await fs.promises.stat(resolvedPath);

    // If it's directly a subtitle/caption track (.vtt / .srt)
    if (ext === '.vtt' || ext === '.srt') {
      const content = await fs.promises.readFile(resolvedPath, 'utf-8');
      const rawText = cleanSubtitleText(content);
      return {
        rawText,
        metadata: {
          filePath: resolvedPath,
          fileSize: stat.size,
          format: ext.substring(1),
          sourceType: 'video_transcript',
        },
      };
    }

    // For video/audio media files (.mp4, .mp3, etc.), check for adjacent transcript/subtitle sidecar files first
    const sidecarExtensions = ['.vtt', '.srt', '.txt', '.transcript'];
    const dirName = path.dirname(resolvedPath);
    const baseName = path.basename(resolvedPath, ext);

    for (const sidecarExt of sidecarExtensions) {
      const sidecarCandidates = [
        path.join(dirName, `${baseName}${sidecarExt}`),
        path.join(dirName, `${baseName}${ext}${sidecarExt}`),
      ];

      for (const candidate of sidecarCandidates) {
        if (fs.existsSync(candidate)) {
          const content = await fs.promises.readFile(candidate, 'utf-8');
          const rawText = sidecarExt === '.vtt' || sidecarExt === '.srt' ? cleanSubtitleText(content) : content.trim();
          return {
            rawText,
            metadata: {
              filePath: resolvedPath,
              fileSize: stat.size,
              sidecarFile: candidate,
              format: ext.substring(1),
              sourceType: 'video_audio_sidecar',
            },
          };
        }
      }
    }

    // Solution A: Automatic Speech-to-Text (STT) via Groq Whisper API when no sidecar file exists
    try {
      const transcribedText = await transcribeMediaWithGroqWhisper(resolvedPath);
      return {
        rawText: transcribedText,
        metadata: {
          filePath: resolvedPath,
          fileSize: stat.size,
          format: ext.substring(1),
          sttProvider: 'groq-whisper-large-v3-turbo',
          sourceType: 'video_audio_stt',
        },
      };
    } catch (sttError: any) {
      // Fallback: Check for readable text streams inside container or report clear error
      try {
        const buffer = await fs.promises.readFile(resolvedPath);
        const text = buffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
        if (text.length > 50) {
          return {
            rawText: text,
            metadata: {
              filePath: resolvedPath,
              fileSize: stat.size,
              format: ext.substring(1),
              fallbackExtracted: true,
            },
          };
        }
      } catch {
        // ignore
      }

      throw new Error(
        `Failed to ingest video/audio file "${filePath}": ${sttError.message || 'No transcript found'}. Please provide an accompanying transcript file or ensure GROQ_API_KEY is configured for automatic Groq Whisper STT.`
      );
    }
  },
};
