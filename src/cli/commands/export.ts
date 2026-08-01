import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import { getArtifactsByTopic } from '../../retrieval/getArtifactsByTopic';
import { exportFlashcardsJSON, exportFlashcardsCSV } from '../../outputs/flashcardExport';
import { getAllConceptNames } from '../../storage/conceptRepository';

export function registerExportCommand(program: Command): void {
  program
    .command('export <topic>')
    .description('Export flashcards for a specific topic in json or csv format')
    .option('-f, --format <format>', 'Export format (json|csv)', 'json')
    .action(async (topic: string, options: { format: string }) => {
      try {
        const format = options.format.toLowerCase();
        if (format !== 'json' && format !== 'csv') {
          console.error(`Error: Unsupported format "${options.format}". Format must be "json" or "csv".`);
          process.exit(1);
        }

        const artifacts = await getArtifactsByTopic(topic);
        if (!artifacts || artifacts.flashcards.length === 0) {
          console.error(`Error: Topic not found or no flashcards available for topic "${topic}".`);
          
          const availableTopics = await getAllConceptNames();
          if (availableTopics.length > 0) {
            console.error('\nAvailable stored topics:');
            availableTopics.forEach(t => console.error(`  - ${t}`));
          }
          process.exit(1);
        }

        const sanitizedTopic = topic.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
        const filename = `${sanitizedTopic}-flashcards.${format}`;
        const outputPath = path.resolve(process.cwd(), filename);

        let content: string;
        if (format === 'csv') {
          content = exportFlashcardsCSV(artifacts.flashcards);
        } else {
          content = exportFlashcardsJSON(artifacts.flashcards);
        }

        await fs.promises.writeFile(outputPath, content, 'utf-8');

        console.log(`Successfully exported ${artifacts.flashcards.length} flashcards for topic "${topic}" to:`);
        console.log(`  ${filename}`);
      } catch (error: any) {
        console.error(`Error exporting topic flashcards: ${error.message || String(error)}`);
        process.exit(1);
      }
    });
}
