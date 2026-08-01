import React from 'react';
import { Route, CheckCircle, ArrowRight } from 'lucide-react';

export interface LearningPathStep {
  step: number;
  conceptName: string;
  description: string;
  prerequisites: string[];
}

export interface LearningPathData {
  topic?: string;
  totalSteps: number;
  steps: LearningPathStep[];
}

interface LearningPathPanelProps {
  learningPath?: LearningPathData | null;
}

export const LearningPathPanel: React.FC<LearningPathPanelProps> = ({ learningPath }) => {
  if (!learningPath || !learningPath.steps || learningPath.steps.length === 0) {
    return null;
  }

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '1.25rem',
      marginBottom: '1.5rem',
    }}>
      <h3 style={{
        fontSize: '15px',
        fontWeight: 500,
        color: 'var(--text-primary)',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <Route size={16} color="var(--accent)" />
        Recommended Learning Path ({learningPath.totalSteps} steps)
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {learningPath.steps.map((step) => (
          <div
            key={step.step}
            style={{
              backgroundColor: 'var(--bg-base)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem',
            }}
          >
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 600,
              flexShrink: 0,
              marginTop: '2px',
            }}>
              {step.step}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '4px',
              }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  margin: 0,
                }}>
                  {step.conceptName}
                </h4>

                {step.prerequisites.length > 0 && (
                  <span style={{
                    fontSize: '11px',
                    color: '#F2555A',
                    backgroundColor: 'rgba(242, 85, 90, 0.1)',
                    border: '1px solid rgba(242, 85, 90, 0.25)',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <ArrowRight size={10} /> Requires: {step.prerequisites.join(', ')}
                  </span>
                )}
              </div>

              {step.description && (
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  margin: 0,
                  lineHeight: 1.45,
                }}>
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
