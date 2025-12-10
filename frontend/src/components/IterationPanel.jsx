/**
 * IterationPanel Component
 *
 * Allows users to provide feedback and iterate on proposals
 */

import { useState } from 'react';

export function IterationPanel({ onIterate, isGenerating, onSuccess }) {
  const [iterationComment, setIterationComment] = useState('');

  const handleIterate = async () => {
    const success = await onIterate(iterationComment);
    if (success) {
      setIterationComment('');
      onSuccess?.();
    }
  };

  return (
    <div className="iteration-panel">
      <h3 className="iteration-title">
        🔄 Iterate on Proposal
      </h3>
      <div className="iteration-input">
        <textarea
          placeholder="Request changes: 'Make it more casual', 'Add more detail to the services section', 'Emphasize ROI more', etc."
          value={iterationComment}
          onChange={(e) => setIterationComment(e.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={handleIterate}
          disabled={isGenerating || !iterationComment.trim()}
        >
          {isGenerating ? 'Updating...' : '🔄 Update'}
        </button>
      </div>
    </div>
  );
}
