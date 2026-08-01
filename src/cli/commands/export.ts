import { Command } from 'commander';

export function registerExportCommand(program: Command): void {
  program
    .command('export <topic>')
    .description('Export flashcards for a specific topic in json or csv format')
    .option('-f, --format <format>', 'Export format (json|csv)', 'json')
    .action(async (topic: string, options: { format: string }) => {
      console.log(`Export command stub called for topic: ${topic}, format: ${options.format}`);
    });
}
