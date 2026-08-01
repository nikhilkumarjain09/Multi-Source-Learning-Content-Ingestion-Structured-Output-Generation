import React, { useState } from 'react';
import { Route, CheckCircle2, ArrowRight, Clock, Award, Layers } from 'lucide-react';
import { LearningPathPanel, LearningPathData } from './LearningPathPanel';

interface LearningPathsViewProps {
  learningPath?: LearningPathData | null;
  topicName?: string | null;
}

export const LearningPathsView: React.FC<LearningPathsViewProps> = ({
  learningPath,
  topicName,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (stepNum: number) => {
    setCompletedSteps((prev) => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  const totalSteps = learningPath?.totalSteps || 0;
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Learning Paths & Sequence Roadmaps
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Ordered topic progression based on prerequisite knowledge requirements.
          </p>
        </div>

        {totalSteps > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Roadmap Progress</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--success)' }}>
                {completedCount} / {totalSteps} Steps ({progressPercent}%)
              </div>
            </div>
            <Award size={28} color="var(--accent)" />
          </div>
        )}
      </div>

      {/* Recommended Learning Path Panel */}
      {learningPath && learningPath.steps.length > 0 ? (
        <LearningPathPanel learningPath={learningPath} />
      ) : (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-md)',
          padding: '3rem 1.5rem',
          textAlign: 'center',
        }}>
          <Route size={36} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
          <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            No Learning Path Available for Current Selection
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Upload learning material or select a topic to build a custom step-by-step learning roadmap.
          </p>
        </div>
      )}
    </div>
  );
};
