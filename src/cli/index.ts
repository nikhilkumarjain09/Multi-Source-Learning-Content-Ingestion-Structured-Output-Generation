import { Command } from 'commander';
import { registerIngestCommand } from './commands/ingest';
import { registerListTopicsCommand } from './commands/listTopics';
import { registerExportCommand } from './commands/export';

const program = new Command();

program
  .name('learning-ingest')
  .description('Multi-Source Learning Content Ingestion & Structured Output Generation CLI')
  .version('1.0.0');

registerIngestCommand(program);
registerListTopicsCommand(program);
registerExportCommand(program);

program.parse(process.argv);
