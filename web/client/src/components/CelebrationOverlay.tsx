import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, Rocket, ArrowRight, BookOpen, Brain, Zap } from 'lucide-react';

interface CelebrationOverlayProps {
  userName: string;
  onDismiss: () => void;
}

// Confetti particle config
const COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B',
  '#10B981', '#3B82F6', '#F97316', '#14B8A6',
];

interface Particle {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  shape: 'circle' | 'rect' | 'triangle';
  drift: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 10,
    delay: Math.random() * 2.5,
    duration: 2.5 + Math.random() * 2,
    shape: (['circle', 'rect', 'triangle'] as const)[Math.floor(Math.random() * 3)],
    drift: (Math.random() - 0.5) * 120,
  }));
}

const PARTICLES = generateParticles(90);

const FEATURES = [
  { icon: <Brain size={16} />, label: 'AI Knowledge Extraction' },
  { icon: <BookOpen size={16} />, label: 'Smart Flashcards' },
  { icon: <Zap size={16} />, label: 'Auto Learning Paths' },
];

const CONFETTI_CSS = `
  @keyframes confettiFall {
    0%   { transform: translateY(-20px) rotate(0deg) translateX(0px); opacity: 1; }
    80%  { opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg) translateX(var(--drift)); opacity: 0; }
  }
  @keyframes celebCardIn {
    0%   { opacity: 0; transform: scale(0.78) translateY(40px); }
    60%  { transform: scale(1.03) translateY(-6px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes celebPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.45); }
    50%       { box-shadow: 0 0 0 18px rgba(99,102,241,0); }
  }
  @keyframes floatBadge {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-6px); }
  }
  @keyframes celebOverlayIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes sparkRotate {
    from { transform: rotate(0deg) scale(1); }
    50%  { transform: rotate(180deg) scale(1.2); }
    to   { transform: rotate(360deg) scale(1); }
  }
`;

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ userName, onDismiss }) => {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const firstName = userName.split(' ')[0];

  // Auto-dismiss after 9 seconds
  useEffect(() => {
    timerRef.current = setTimeout(() => handleDismiss(), 9000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleDismiss = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 400);
  };

  if (!visible) return null;

  return (
    <>
      <style>{CONFETTI_CSS}</style>

      {/* Full-screen overlay */}
      <div
        onClick={handleDismiss}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(10, 10, 20, 0.82)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          animation: exiting
            ? 'celebOverlayIn 0.35s ease reverse both'
            : 'celebOverlayIn 0.4s ease both',
        }}
      >
        {/* Confetti particles */}
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'fixed',
              top: -20,
              left: `${p.x}%`,
              width: p.shape === 'rect' ? p.size * 0.6 : p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'triangle' ? '0' : '2px',
              clipPath: p.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
              opacity: 0,
              '--drift': `${p.drift}px`,
              animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
              pointerEvents: 'none',
            } as React.CSSProperties}
          />
        ))}

        {/* Welcome card */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'linear-gradient(135deg, #0F0F1A 0%, #1A1A2E 50%, #16213E 100%)',
            border: '1px solid rgba(99,102,241,0.4)',
            borderRadius: 24,
            padding: '2.5rem 2.75rem',
            maxWidth: 480,
            width: '90vw',
            textAlign: 'center',
            position: 'relative',
            animation: exiting
              ? 'celebCardIn 0.35s ease reverse both'
              : 'celebCardIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(99,102,241,0.15)',
          }}
        >
          {/* Glowing icon */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              marginBottom: '1.25rem',
              animation: 'celebPulse 2s ease-in-out infinite, sparkRotate 8s linear infinite',
              boxShadow: '0 0 32px rgba(99,102,241,0.5)',
            }}
          >
            <Rocket size={32} color="#fff" />
          </div>

          {/* Confetti emoji burst */}
          <div style={{ fontSize: 28, marginBottom: '0.5rem', letterSpacing: 4 }}>
            🎉 🚀 ✨
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: 26,
            fontWeight: 800,
            color: '#FFFFFF',
            margin: '0 0 0.5rem',
            lineHeight: 1.2,
            background: 'linear-gradient(135deg, #FFFFFF 0%, #A5B4FC 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Welcome, {firstName}! 🎊
          </h1>

          <p style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '1.75rem',
            lineHeight: 1.6,
          }}>
            Your AI-powered learning workspace is ready.<br />
            Let's turn knowledge into mastery.
          </p>

          {/* Feature badges */}
          <div style={{
            display: 'flex',
            gap: '0.6rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '2rem',
          }}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'rgba(99,102,241,0.15)',
                  border: '1px solid rgba(99,102,241,0.35)',
                  borderRadius: 100,
                  padding: '0.35rem 0.85rem',
                  fontSize: 12,
                  color: '#A5B4FC',
                  fontWeight: 500,
                  animation: `floatBadge ${2.2 + i * 0.4}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              >
                {f.icon}
                {f.label}
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleDismiss}
            style={{
              width: '100%',
              padding: '0.85rem 1.5rem',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 32px rgba(99,102,241,0.55)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(99,102,241,0.4)';
            }}
          >
            <Sparkles size={16} />
            Start Your Learning Journey
            <ArrowRight size={16} />
          </button>

          {/* Auto-dismiss hint */}
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: '0.85rem' }}>
            Dismisses automatically in a few seconds · Click anywhere to close
          </p>
        </div>
      </div>
    </>
  );
};
