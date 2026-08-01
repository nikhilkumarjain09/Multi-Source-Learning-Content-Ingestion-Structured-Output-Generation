import { generateLearningPathFromGraph } from '../src/outputs/learningPath';

function runLearningPathTests() {
  console.log('Running Learning Path Generation Tests...');

  const concepts = [
    { name: 'Neural Networks', description: 'Deep learning models.' },
    { name: 'Linear Algebra', description: 'Vectors and matrices.' },
    { name: 'Calculus', description: 'Derivatives and gradients.' },
    { name: 'Gradient Descent', description: 'Optimization algorithm.' },
  ];

  const relationships = [
    { from: 'Linear Algebra', to: 'Neural Networks', type: 'prerequisite' },
    { from: 'Calculus', to: 'Gradient Descent', type: 'prerequisite' },
    { from: 'Gradient Descent', to: 'Neural Networks', type: 'prerequisite' },
  ];

  const result = generateLearningPathFromGraph(concepts, relationships, 'Deep Learning');

  if (result.totalSteps !== 4) {
    throw new Error(`Test Failed: Expected 4 total steps, got ${result.totalSteps}`);
  }

  // Linear Algebra and Calculus have 0 prerequisites so they should be first
  const step1 = result.steps[0].conceptName;
  const step2 = result.steps[1].conceptName;
  if (step1 !== 'Calculus' && step1 !== 'Linear Algebra') {
    throw new Error(`Test Failed: Step 1 should be a foundational prerequisite, got ${step1}`);
  }

  // Neural Networks depends on Linear Algebra and Gradient Descent, so it must come AFTER them
  const nnIndex = result.steps.findIndex(s => s.conceptName === 'Neural Networks');
  const gdIndex = result.steps.findIndex(s => s.conceptName === 'Gradient Descent');
  const laIndex = result.steps.findIndex(s => s.conceptName === 'Linear Algebra');

  if (nnIndex <= gdIndex || nnIndex <= laIndex) {
    throw new Error('Test Failed: Neural Networks must be ordered AFTER its prerequisites');
  }

  console.log('Topological order verified:');
  result.steps.forEach(s => {
    const reqs = s.prerequisites.length > 0 ? ` (Requires: ${s.prerequisites.join(', ')})` : '';
    console.log(`  Step ${s.step}: ${s.conceptName}${reqs}`);
  });

  console.log('\nAll Learning Path Generation Tests PASSED Successfully!');
}

runLearningPathTests();
