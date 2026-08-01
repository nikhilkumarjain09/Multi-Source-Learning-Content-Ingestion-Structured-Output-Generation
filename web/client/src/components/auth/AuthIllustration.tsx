import React from 'react';
import { Network, Sparkles, Brain, Layers, ShieldCheck, CheckCircle2, Zap, ArrowRight } from 'lucide-react';
import { BRANDING } from '../../config/branding';

export const AuthIllustration: React.FC = () => {
  return (
    <div style={{
      width: '100%',
      height: '560px',
      minHeight: '560px',
      maxHeight: '560px',
      backgroundColor: '#F0F4FF',
      background: 'linear-gradient(135deg, #EFF4FF 0%, #F5F3FF 50%, #EEF2FF 100%)',
      borderRadius: 'var(--border-radius-lg)',
      padding: '2.5rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(37, 99, 235, 0.12)',
      boxShadow: 'inset 0 0 40px rgba(37, 99, 235, 0.04)',
    }}>
      {/* Abstract Background Decorative Waves */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        right: '-100px',
        width: '380px',
        height: '380px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(168, 85, 247, 0) 70%)',
        filter: 'blur(30px)',
        pointerEvents: 'none',
      }} />

      {/* Top Banner Tag */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: '#FFFFFF',
          padding: '0.4rem 0.85rem',
          borderRadius: '20px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(37, 99, 235, 0.15)',
        }}>
          <Sparkles size={15} color="var(--accent)" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
            SynthLearn AI Ingestion Engine
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
          <ShieldCheck size={14} color="var(--success)" /> 256-Bit SSL Encrypted
        </div>
      </div>

      {/* Main Interactive Concept Topology Illustration */}
      <div style={{
        position: 'relative',
        margin: '2rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
      }}>
        {/* SVG Graph Canvas */}
        <div style={{
          width: '100%',
          maxWidth: '420px',
          height: '240px',
          position: 'relative',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '1.25rem',
          boxShadow: '0 12px 30px rgba(37, 99, 235, 0.08)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Network size={18} color="var(--accent)" />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Live Concept Topology
              </span>
            </div>
            <span className="badge badge-green" style={{ fontSize: '10px' }}>
              <CheckCircle2 size={10} /> Reconciled
            </span>
          </div>

          {/* SVG Animated Node Links */}
          <svg style={{ width: '100%', height: '140px', overflow: 'visible' }}>
            {/* Edges */}
            <line x1="60" y1="40" x2="180" y2="70" stroke="#2563EB" strokeWidth="2" strokeDasharray="4 2" />
            <line x1="180" y1="70" x2="320" y2="40" stroke="#A855F7" strokeWidth="2" />
            <line x1="180" y1="70" x2="200" y2="120" stroke="#2563EB" strokeWidth="2" />

            {/* Nodes */}
            <g transform="translate(60, 40)">
              <circle r="20" fill="#2563EB" opacity="0.15" />
              <circle r="12" fill="#2563EB" />
              <text x="0" y="24" fontSize="10" fontWeight="600" textAnchor="middle" fill="#1E293B">Calculus</text>
            </g>

            <g transform="translate(180, 70)">
              <circle r="24" fill="#A855F7" opacity="0.15" />
              <circle r="14" fill="#A855F7" />
              <text x="0" y="28" fontSize="10" fontWeight="700" textAnchor="middle" fill="#1E293B">Gradient Descent</text>
            </g>

            <g transform="translate(320, 40)">
              <circle r="20" fill="#2563EB" opacity="0.15" />
              <circle r="12" fill="#2563EB" />
              <text x="0" y="24" fontSize="10" fontWeight="600" textAnchor="middle" fill="#1E293B">Linear Algebra</text>
            </g>

            <g transform="translate(200, 120)">
              <circle r="22" fill="#16A34A" opacity="0.15" />
              <circle r="13" fill="#16A34A" />
              <text x="0" y="26" fontSize="10" fontWeight="700" textAnchor="middle" fill="#1E293B">Neural Networks</text>
            </g>
          </svg>
        </div>

        {/* Floating Card Badges Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '-15px',
          left: '10px',
          backgroundColor: '#FFFFFF',
          padding: '0.5rem 0.85rem',
          borderRadius: '10px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeIn 0.3s ease-out',
        }}>
          <Zap size={14} color="var(--warning)" />
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Auto Topological Sort Enabled
          </span>
        </div>

        <div style={{
          position: 'absolute',
          top: '-15px',
          right: '10px',
          backgroundColor: '#FFFFFF',
          padding: '0.5rem 0.85rem',
          borderRadius: '10px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <Layers size={14} color="var(--purple-accent)" />
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Deduplicated Cross-Doc Concepts
          </span>
        </div>
      </div>

      {/* Subtitle & Social Proof Features */}
      <div style={{ zIndex: 2 }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem', lineHeight: 1.3 }}>
          Transform Educational Content into Structured AI Intelligence
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
          Ingest PDFs, lecture transcripts, and video captions to automatically generate concept graphs, interactive flashcard study decks, and topological roadmaps.
        </p>

        {/* Feature Badges Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <CheckCircle2 size={14} color="var(--accent)" /> Multi-format Ingestion
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <CheckCircle2 size={14} color="var(--accent)" /> Zod Schema Retry Repair
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <CheckCircle2 size={14} color="var(--accent)" /> Cosine Vector Search
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <CheckCircle2 size={14} color="var(--accent)" /> JWT Session Security
          </div>
        </div>
      </div>
    </div>
  );
};
