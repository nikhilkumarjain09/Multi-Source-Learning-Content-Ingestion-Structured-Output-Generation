import { Command } from 'commander';

export function registerListTopicsCommand(program: Command): void {
  program
    .command('list-topics')
    .description('List all distinct extracted topics and concepts')
    .action(async () => {
      console.log('List topics command stub called');
    });
}
