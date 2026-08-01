import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import { runIngestionPipeline } from '../../pipeline';

export function registerIngestCommand(program: Command): void {
  program
    .command('ingest <filePath>')
    .description('Ingest a PDF or transcript file and run full extraction pipeline')
    .action(async (filePath: string) => {
      try {
        const resolvedPath = path.resolve(filePath);
        if (!fs.existsSync(resolvedPath)) {
          console.error(`Error: File not found at path "${filePath}"`);
          process.exit(1);
        }

        console.log(`Starting ingestion pipeline for file: ${path.basename(filePath)}...`);
        const startTime = Date.now();

        const result = await runIngestionPipeline(resolvedPath);

        const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log('\n--- Ingestion Pipeline Completed Successfully ---');
        console.log(`Document ID:         ${result.document.id}`);
        console.log(`Filename:            ${result.document.filename}`);
        console.log(`Source Type:         ${result.document.sourceType}`);
        console.log(`Concepts Found:      ${result.extraction.concepts.length}`);
        console.log(`Relationships Found: ${result.extraction.relationships.length}`);
        console.log(`Flashcards Generated:${result.flashcards.length}`);
        console.log(`Graph Nodes:         ${result.graph.nodes.length}`);
        console.log(`Graph Edges:         ${result.graph.edges.length}`);
        console.log(`Processing Time:     ${durationSec}s`);
        console.log('Database Persistence: Saved to MongoDB database.');

        if (result.summary) {
          console.log('\n--- Document Summary ---');
          console.log(result.summary);
        }
      } catch (error: any) {
        console.error(`\nIngestion Error: ${error.message || String(error)}`);
        process.exit(1);
      }
    });
}
