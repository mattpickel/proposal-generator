/**
 * IterationPanel Component
 *
 * Allows users to provide feedback and iterate on proposals
 */

import { useState } from 'react';
import { VoiceMemoButton } from './VoiceMemoButton';

export function IterationPanel({ onIterate, isGenerating, onSuccess }) {
  const [iterationComment, setIterationComment] = useState('');

  const handleIterate = async () => {
    const success = await onIterate(iterationComment);
    if (success) {
      setIterationComment('');
      onSuccess?.();
    }
  };

  const handleVoiceTranscript = (text) => {
    setIterationComment(prev => prev ? `${prev}\n${text}` : text);
  };

  return (
    <div className="iteration-panel">
      <h3 className="iteration-title">
        🔄 Iterate on Proposal
      </h3>
      <div className="iteration-input">
        <div className="text-input-with-voice">
          <textarea
            placeholder="Request changes: 'Make it more casual', 'Add more detail to the services section', 'Emphasize ROI more', etc."
            value={iterationComment}
            onChange={(e) => setIterationComment(e.target.value)}
          />
          <VoiceMemoButton
            onTranscript={handleVoiceTranscript}
            disabled={isGenerating}
          />
        </div>
      </div>
      <button
        className="btn btn-primary"
        onClick={handleIterate}
        disabled={isGenerating || !iterationComment.trim()}
        style={{ marginTop: '0.5rem' }}
      >
        {isGenerating ? 'Updating...' : '🔄 Update'}
      </button>
    </div>
  );
}
