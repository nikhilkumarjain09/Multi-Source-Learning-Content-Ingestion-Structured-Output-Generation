const fs = require('fs');
const path = require('path');

function createValidStandardPdf() {
  const contentStream = 'BT /F1 12 Tf 50 700 Td (Neural Networks and Deep Learning Overview) Tj 0 -20 Td (Deep Learning is a subset of machine learning based on artificial neural networks.) Tj ET';
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

  const targetPath = path.join(__dirname, '..', 'seed-data', 'pdfs', 'neural_networks.pdf');
  fs.writeFileSync(targetPath, fullPdf, 'latin1');
  console.log('Created valid standard PDF at:', targetPath);
}

createValidStandardPdf();
