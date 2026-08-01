import { Command } from 'commander';
import { getAllConceptNames } from '../../storage/conceptRepository';

export function registerListTopicsCommand(program: Command): void {
  program
    .command('list-topics')
    .description('List all distinct stored topics and concepts')
    .action(async () => {
      try {
        const topics = getAllConceptNames();

        if (topics.length === 0) {
          console.log('No topics currently stored in database.');
          return;
        }

        topics.forEach(topic => {
          console.log(topic);
        });
      } catch (error: any) {
        console.error(`Error listing topics: ${error.message || String(error)}`);
        process.exit(1);
      }
    });
}
