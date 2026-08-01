import React, { useState, useRef } from 'react';
import { Upload, Loader2, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadControlProps {
  onIngestSuccess: (data: any) => void;
}

export const UploadControl: React.FC<UploadControlProps> = ({ onIngestSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setSuccessMsg(`Ingested ${selectedFile.name} successfully!`);
      onIngestSuccess(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '1.25rem',
      marginBottom: '1.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.txt,.md,.transcript"
          style={{ display: 'none' }}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          style={{
            backgroundColor: 'var(--bg-base)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FileText size={16} color="var(--accent)" />
          {selectedFile ? selectedFile.name : 'Select PDF or Transcript File'}
        </button>

        <button
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          style={{
            backgroundColor: !selectedFile || loading ? 'var(--border-color)' : 'var(--accent)',
            color: '#ffffff',
            padding: '0.5rem 1.25rem',
            borderRadius: '6px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="spinner" />
              Ingesting & Extracting Concepts...
            </>
          ) : (
            <>
              <Upload size={16} />
              Run Ingestion Pipeline
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div style={{
          marginTop: '0.75rem',
          color: 'var(--error)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '13px',
        }}>
          <AlertCircle size={14} />
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{
          marginTop: '0.75rem',
          color: 'var(--success)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '13px',
        }}>
          <CheckCircle size={14} />
          {successMsg}
        </div>
      )}
    </div>
  );
};
