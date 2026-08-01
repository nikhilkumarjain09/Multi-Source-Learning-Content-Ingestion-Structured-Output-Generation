import { Command } from 'commander';

export function registerIngestCommand(program: Command): void {
  program
    .command('ingest <filePath>')
    .description('Ingest a PDF or transcript file and run full extraction pipeline')
    .action(async (filePath: string) => {
      console.log(`Ingest command stub called for file: ${filePath}`);
    });
}
