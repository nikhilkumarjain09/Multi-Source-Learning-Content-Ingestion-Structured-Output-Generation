import app from '../web/server/routes';
import http from 'http';

async function runWebApiTests() {
  console.log('Running Web API Endpoint Tests...');

  const server = http.createServer(app);
  await new Promise<void>(resolve => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://localhost:${address.port}`;

  try {
    // 1. Test GET /api/topics
    console.log('\n--- 1. Testing GET /api/topics ---');
    const topicsRes = await fetch(`${baseUrl}/api/topics`);
    if (topicsRes.status !== 200) {
      throw new Error(`GET /api/topics failed with status ${topicsRes.status}`);
    }
    const topicsData = await topicsRes.json() as { topics: string[] };
    if (!Array.isArray(topicsData.topics)) {
      throw new Error('GET /api/topics response format invalid');
    }
    console.log(`GET /api/topics returned ${topicsData.topics.length} stored topics.`);

    // 2. Test GET /api/topics/:topic (Existing Topic)
    if (topicsData.topics.length > 0) {
      const topicName = topicsData.topics[0];
      console.log(`\n--- 2. Testing GET /api/topics/${encodeURIComponent(topicName)} ---`);
      const topicRes = await fetch(`${baseUrl}/api/topics/${encodeURIComponent(topicName)}`);
      if (topicRes.status !== 200) {
        throw new Error(`GET /api/topics/${topicName} failed with status ${topicRes.status}`);
      }
      const topicData = await topicRes.json() as any;
      if (topicData.topic !== topicName || !Array.isArray(topicData.flashcards)) {
        throw new Error(`GET /api/topics/${topicName} response structure invalid`);
      }
      console.log(`GET /api/topics/${topicName} returned valid topic artifacts.`);
    }

    // 3. Test GET /api/topics/NonExistentTopic (404 Error)
    console.log('\n--- 3. Testing GET /api/topics/NonExistentTopic (404 Check) ---');
    const missingRes = await fetch(`${baseUrl}/api/topics/NonExistentTopicXYZ`);
    if (missingRes.status !== 404) {
      throw new Error(`Expected 404 for missing topic, got ${missingRes.status}`);
    }
    console.log('404 error response verified for missing topic.');

    // 4. Test POST /api/ingest without file (422 Error)
    console.log('\n--- 4. Testing POST /api/ingest Without File (422 Check) ---');
    const ingestRes = await fetch(`${baseUrl}/api/ingest`, { method: 'POST' });
    if (ingestRes.status !== 422) {
      throw new Error(`Expected 422 for missing file upload, got ${ingestRes.status}`);
    }
    const ingestErr = await ingestRes.json() as { error: string };
    if (!ingestErr.error) {
      throw new Error('422 error missing error message payload');
    }
    console.log('422 error response verified for missing file upload.');

    console.log('\nAll Web API Endpoint Tests PASSED Successfully!');
  } finally {
    server.close();
    const { disconnectDB } = await import('../src/storage/db');
    await disconnectDB();
  }
}

runWebApiTests().catch(err => {
  console.error('Web API Test Failure:', err);
  process.exit(1);
});
