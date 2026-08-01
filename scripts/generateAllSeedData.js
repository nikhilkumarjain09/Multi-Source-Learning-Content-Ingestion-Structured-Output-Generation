const fs = require('fs');
const path = require('path');

// Helper to create a valid single-page standard PDF file
function createPdfFile(filePath, title, bodyText) {
  const contentStream = `BT /F1 14 Tf 50 720 Td (${title}) Tj /F1 10 Tf 0 -30 Td (${bodyText.replace(/\(/g, '\\(').replace(/\)/g, '\\)')}) Tj ET`;
  const streamLength = Buffer.byteLength(contentStream);

  const header = '%PDF-1.4\n';
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n';
  const obj4 = `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj\n`;
  const obj5 = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';

  const pos1 = Buffer.byteLength(header);
  const pos2 = pos1 + Buffer.byteLength(obj1);
  const pos3 = pos2 + Buffer.byteLength(obj2);
  const pos4 = pos3 + Buffer.byteLength(obj3);
  const pos5 = pos4 + Buffer.byteLength(obj4);
  const xrefPos = pos5 + Buffer.byteLength(obj5);

  const pad = num => String(num).padStart(10, '0');

  const xref = `xref\n0 6\n0000000000 65535 f \n${pad(pos1)} 00000 n \n${pad(pos2)} 00000 n \n${pad(pos3)} 00000 n \n${pad(pos4)} 00000 n \n${pad(pos5)} 00000 n \n`;
  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

  const fullPdf = header + obj1 + obj2 + obj3 + obj4 + obj5 + xref + trailer;

  fs.writeFileSync(filePath, fullPdf, 'latin1');
}

// Helper to write VTT subtitle file
function createVttFile(filePath, cues) {
  let content = 'WEBVTT\n\n';
  cues.forEach((cue, index) => {
    content += `${index + 1}\n${cue.time}\n${cue.text}\n\n`;
  });
  fs.writeFileSync(filePath, content, 'utf-8');
}

// Helper to create a dummy media file (valid tiny media header/payload)
function createDummyMediaFile(filePath) {
  // Simple binary payload with text header
  const header = Buffer.from('RIFF....WAVEfmt ....data....Sample Educational Media File Header');
  fs.writeFileSync(filePath, header);
}

function generateAllSeedData() {
  const baseDir = path.resolve(__dirname, '..', 'seed-data');

  const pdfsDir = path.join(baseDir, 'pdfs');
  const docsDir = path.join(baseDir, 'docs');
  const transcriptsDir = path.join(baseDir, 'transcripts');
  const videosDir = path.join(baseDir, 'videos');
  const audiosDir = path.join(baseDir, 'audios');

  [pdfsDir, docsDir, transcriptsDir, videosDir, audiosDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  console.log('Generating seed files across PDFs, Docs, Videos, and Audios...');

  // ==========================================
  // 1. PDFs (4 files)
  // ==========================================
  createPdfFile(
    path.join(pdfsDir, 'neural_networks.pdf'),
    'Neural Networks and Deep Learning Overview',
    'Deep Learning is a subset of machine learning based on artificial neural networks. Convolutional Neural Networks are widely used for image recognition, while Recurrent Neural Networks excel at sequence modeling.'
  );

  createPdfFile(
    path.join(pdfsDir, 'database_management_systems.pdf'),
    'Database Management Systems & Relational Model',
    'Relational Databases organize data into tables with predefined schemas. SQL is used to query structured data. Database Normalization eliminates redundancy, while ACID properties ensure reliable transaction processing.'
  );

  createPdfFile(
    path.join(pdfsDir, 'operating_systems_concepts.pdf'),
    'Operating System Architecture & Memory Management',
    'Operating Systems manage computer hardware and software resources. Core concepts include Process Scheduling, Virtual Memory, Multithreading, Inter-Process Communication, and Deadlock prevention algorithms.'
  );

  createPdfFile(
    path.join(pdfsDir, 'computer_networks_fundamentals.pdf'),
    'Computer Networking Fundamentals & Protocols',
    'Computer Networks enable communication between interconnected devices. The OSI Model defines 7 layers of network communication. Key protocols include TCP, IP, HTTP, DNS, and TLS for secure data transmission.'
  );

  // ==========================================
  // 2. Docs / Text Transcripts (4 files)
  // ==========================================
  fs.writeFileSync(
    path.join(transcriptsDir, 'machine_learning_intro.txt'),
    `# Machine Learning Fundamentals
Machine Learning is a branch of artificial intelligence focused on building applications that learn from data and improve accuracy over time without being explicitly programmed.

Supervised Learning algorithms train on labeled datasets. Common algorithms include Linear Regression, Logistic Regression, Decision Trees, and Support Vector Machines.

Unsupervised Learning finds hidden patterns in unlabeled data. Clustering algorithms such as K-Means and Hierarchical Clustering group similar data points together.

Model Evaluation metrics include Precision, Recall, F1-Score, and ROC-AUC Curves. Overfitting occurs when a model learns noise instead of signal, which can be mitigated using Regularization techniques.`,
    'utf-8'
  );

  fs.writeFileSync(
    path.join(docsDir, 'data_structures_algorithms.md'),
    `# Data Structures and Algorithms Guide

Data Structures provide organized formats for managing, storing, and retrieving data efficiently.

## Core Data Structures
- **Arrays**: Fixed-size contiguous memory allocation with O(1) index access.
- **Linked Lists**: Node-based sequences with pointer references.
- **Binary Search Trees**: Hierarchical tree structures supporting O(log N) search operations.
- **Graph Data Structures**: Collections of vertices and edges representing complex networks.

## Algorithmic Complexity
Algorithm efficiency is measured using Big-O notation. Sorting algorithms such as Quicksort and Mergesort achieve O(N log N) time complexity.`,
    'utf-8'
  );

  fs.writeFileSync(
    path.join(docsDir, 'web_development_architecture.txt'),
    `Web Application Architecture and Microservices

Modern Web Development separates frontend user interfaces from backend application services.

REST APIs expose HTTP endpoints using standard verbs (GET, POST, PUT, DELETE) and JSON payloads. Microservice Architecture decouples single monolithic applications into independent, scalable microservices communicating via asynchronous event buses.

Frontend Frameworks such as React and Vue manage dynamic component rendering using Virtual DOM trees. Client-side state management coordinates application state across component hierarchies.`,
    'utf-8'
  );

  fs.writeFileSync(
    path.join(docsDir, 'cloud_computing_devops.md'),
    `# Cloud Computing & DevOps Practices

Cloud Computing delivers on-demand computing resources over the internet with pay-as-you-go pricing.

## Containerization and Orchestration
- **Docker**: Packages applications into isolated, portable container images.
- **Kubernetes**: Automates container deployment, scaling, load balancing, and self-healing.

## CI/CD Pipelines
Continuous Integration and Continuous Deployment (CI/CD) pipelines automate building, testing, and deploying code changes to cloud environments, reducing deployment risk and lead time.`,
    'utf-8'
  );

  // ==========================================
  // 3. Videos (4 files + VTT transcripts)
  // ==========================================
  const video1Media = path.join(videosDir, 'computer_vision_lecture.mp4');
  const video1Vtt = path.join(videosDir, 'computer_vision_lecture.vtt');
  createDummyMediaFile(video1Media);
  createVttFile(video1Vtt, [
    { time: '00:00:01.000 --> 00:00:05.000', text: 'Welcome to the Computer Vision and Image Processing Lecture.' },
    { time: '00:00:05.500 --> 00:00:10.000', text: 'Today we explore Convolutional Layers, Feature Maps, and Spatial Pooling.' },
    { time: '00:00:10.500 --> 00:00:16.000', text: 'Object Detection algorithms like YOLO and Faster R-CNN locate bounding boxes around objects in real-time video streams.' },
  ]);

  const video2Media = path.join(videosDir, 'natural_language_processing.mp4');
  const video2Vtt = path.join(videosDir, 'natural_language_processing.vtt');
  createDummyMediaFile(video2Media);
  createVttFile(video2Vtt, [
    { time: '00:00:01.000 --> 00:00:05.000', text: 'Welcome to Natural Language Processing and Large Language Models.' },
    { time: '00:00:05.500 --> 00:00:10.000', text: 'Transformer Architectures rely on Self-Attention Mechanisms to process sequence context in parallel.' },
    { time: '00:00:10.500 --> 00:00:16.000', text: 'Word Embeddings convert discrete text tokens into continuous high-dimensional vector spaces.' },
  ]);

  const video3Media = path.join(videosDir, 'reinforcement_learning_tutorial.webm');
  const video3Vtt = path.join(videosDir, 'reinforcement_learning_tutorial.vtt');
  createDummyMediaFile(video3Media);
  createVttFile(video3Vtt, [
    { time: '00:00:01.000 --> 00:00:05.000', text: 'In this Reinforcement Learning tutorial, we examine Agent-Environment interactions.' },
    { time: '00:00:05.500 --> 00:00:10.000', text: 'Markov Decision Processes define states, actions, transition probabilities, and reward functions.' },
    { time: '00:00:10.500 --> 00:00:16.000', text: 'Q-Learning and Policy Gradient algorithms optimize long-term expected cumulative rewards.' },
  ]);

  const video4Media = path.join(videosDir, 'cybersecurity_fundamentals.avi');
  const video4Vtt = path.join(videosDir, 'cybersecurity_fundamentals.vtt');
  createDummyMediaFile(video4Media);
  createVttFile(video4Vtt, [
    { time: '00:00:01.000 --> 00:00:05.000', text: 'Cybersecurity Fundamentals covers network protection and information security.' },
    { time: '00:00:05.500 --> 00:00:10.000', text: 'Symmetric and Asymmetric Encryption safeguard data confidentiality and integrity.' },
    { time: '00:00:10.500 --> 00:00:16.000', text: 'Public Key Infrastructure and Digital Certificates verify identity across untrusted networks.' },
  ]);

  // ==========================================
  // 4. Audios (4 files + VTT transcripts)
  // ==========================================
  const audio1Media = path.join(audiosDir, 'system_design_podcast.mp3');
  const audio1Vtt = path.join(audiosDir, 'system_design_podcast.vtt');
  createDummyMediaFile(audio1Media);
  createVttFile(audio1Vtt, [
    { time: '00:00:01.000 --> 00:00:05.000', text: 'System Design Podcast episode on Scalable Distributed Systems.' },
    { time: '00:00:05.500 --> 00:00:10.000', text: 'Load Balancers distribute incoming traffic across web server clusters to prevent bottlenecks.' },
    { time: '00:00:10.500 --> 00:00:16.000', text: 'Database Sharding and In-Memory Caching with Redis improve throughput and reduce query latency.' },
  ]);

  const audio2Media = path.join(audiosDir, 'python_programming_audio.wav');
  const audio2Vtt = path.join(audiosDir, 'python_programming_audio.vtt');
  createDummyMediaFile(audio2Media);
  createVttFile(audio2Vtt, [
    { time: '00:00:01.000 --> 00:00:05.000', text: 'Python Programming Guide covering core syntax and object-oriented principles.' },
    { time: '00:00:05.500 --> 00:00:10.000', text: 'Python Functions support positional arguments, keyword arguments, and lambda expressions.' },
    { time: '00:00:10.500 --> 00:00:16.000', text: 'Decorators and Generators provide powerful abstractions for metaprogramming and memory-efficient iteration.' },
  ]);

  const audio3Media = path.join(audiosDir, 'distributed_systems_talk.m4a');
  const audio3Vtt = path.join(audiosDir, 'distributed_systems_talk.vtt');
  createDummyMediaFile(audio3Media);
  createVttFile(audio3Vtt, [
    { time: '00:00:01.000 --> 00:00:05.000', text: 'Distributed Systems Talk on Consensus Algorithms and Fault Tolerance.' },
    { time: '00:00:05.500 --> 00:00:10.000', text: 'The CAP Theorem demonstrates tradeoffs between Consistency, Availability, and Partition Tolerance.' },
    { time: '00:00:10.500 --> 00:00:16.000', text: 'Raft and Paxos Consensus protocols ensure cluster nodes agree on state transitions despite network failures.' },
  ]);

  const audio4Media = path.join(audiosDir, 'software_engineering_ethics.mp3');
  const audio4Vtt = path.join(audiosDir, 'software_engineering_ethics.vtt');
  createDummyMediaFile(audio4Media);
  createVttFile(audio4Vtt, [
    { time: '00:00:01.000 --> 00:00:05.000', text: 'Software Engineering Best Practices and Architecture Ethics.' },
    { time: '00:00:05.500 --> 00:00:10.000', text: 'Managing Technical Debt requires continuous refactoring, automated testing, and code reviews.' },
    { time: '00:00:10.500 --> 00:00:16.000', text: 'Agile Methodologies promote iterative development sprints and adaptive planning.' },
  ]);

  console.log('Seed files generated successfully:');
  console.log(' - 4 PDFs in seed-data/pdfs/');
  console.log(' - 4 Docs/Transcripts in seed-data/docs/ & seed-data/transcripts/');
  console.log(' - 4 Videos (.mp4, .webm, .avi) + VTT sidecars in seed-data/videos/');
  console.log(' - 4 Audios (.mp3, .wav, .m4a) + VTT sidecars in seed-data/audios/');
}

generateAllSeedData();
