import { Command } from 'commander';
import { generateLearningPathByTopic } from '../../outputs/learningPath';
import { getAllConceptNames } from '../../storage/conceptRepository';

export function registerLearningPathCommand(program: Command): void {
  program
    .command('learning-path <topic>')
    .description('Generate an ordered learning path through concept prerequisite dependencies for a topic')
    .option('-f, --format <format>', 'Output format (text|json)', 'text')
    .action(async (topic: string, options: { format: string }) => {
      try {
        const format = (options.format || 'text').toLowerCase();
        if (format !== 'text' && format !== 'json') {
          console.error(`Error: Unsupported format "${options.format}". Format must be "text" or "json".`);
          process.exit(1);
        }

        const learningPath = generateLearningPathByTopic(topic);
        if (!learningPath || learningPath.steps.length === 0) {
          console.error(`Error: Topic not found or no concept data available for topic "${topic}".`);
          const availableTopics = getAllConceptNames();
          if (availableTopics.length > 0) {
            console.error('\nAvailable stored topics:');
            availableTopics.forEach(t => console.error(`  - ${t}`));
          }
          process.exit(1);
        }

        if (format === 'json') {
          console.log(JSON.stringify(learningPath, null, 2));
        } else {
          console.log(`\n==================================================`);
          console.log(` RECOMMENDED LEARNING PATH FOR TOPIC: "${topic}"`);
          console.log(` Total Steps: ${learningPath.totalSteps}`);
          console.log(`==================================================\n`);

          for (const step of learningPath.steps) {
            console.log(`Step ${step.step}: ${step.conceptName}`);
            if (step.prerequisites.length > 0) {
              console.log(`  Prerequisites: ${step.prerequisites.join(', ')}`);
            }
            if (step.description) {
              console.log(`  Description:   ${step.description}`);
            }
            console.log('');
          }
        }
      } catch (error: any) {
        console.error(`Error generating learning path: ${error.message || String(error)}`);
        process.exit(1);
      }
    });
}
