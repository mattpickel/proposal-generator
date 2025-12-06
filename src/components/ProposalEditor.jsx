/**
 * ProposalEditor Component
 *
 * Editor and preview for proposal text
 */

import { useState } from 'react';
import { markdownToHtml } from '../utils/markdown';
import { downloadAsFile } from '../utils/fileUtils';
import { ProposalStats } from './ProposalStats';
import { IterationPanel } from './IterationPanel';

export function ProposalEditor({
  proposalText,
  onProposalChange,
  wordCount,
  isGenerating,
  onIterate
}) {
  const [isEditing, setIsEditing] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(proposalText);
  };

  const downloadMarkdown = () => {
    downloadAsFile(proposalText, `proposal-${Date.now()}.md`, 'text/markdown');
  };

  if (isGenerating) {
    return (
      <div className="output-card">
        <div className="output-header">
          <h2 className="output-title">Proposal Draft</h2>
        </div>
        <div className="output-body">
          <div className="loading">
            <div className="spinner"></div>
            <div className="loading-text">
              Generating your personalized proposal...<br/>
              This may take 20-30 seconds
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!proposalText) {
    return (
      <div className="output-card">
        <div className="output-header">
          <h2 className="output-title">Proposal Draft</h2>
        </div>
        <div className="output-body">
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-text">No proposal yet</div>
            <div className="empty-state-subtext">
              Click "Generate Proposal" to begin. Fireflies transcript is optional but recommended.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="output-card">
      <div className="output-header">
        <h2 className="output-title">Proposal Draft</h2>
        <div className="output-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? '👁️ Preview' : '✏️ Edit'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={copyToClipboard}
          >
            📋 Copy
          </button>
          <button
            className="btn btn-secondary"
            onClick={downloadMarkdown}
          >
            ⬇️ Download
          </button>
        </div>
      </div>

      <div className="output-body">
        {isEditing ? (
          <textarea
            className="editor-textarea"
            value={proposalText}
            onChange={(e) => onProposalChange(e.target.value)}
          />
        ) : (
          <div
            className="proposal-content"
            dangerouslySetInnerHTML={{
              __html: markdownToHtml(proposalText)
            }}
          />
        )}
      </div>

      <ProposalStats proposalText={proposalText} wordCount={wordCount} />

      <IterationPanel
        onIterate={onIterate}
        isGenerating={isGenerating}
        onSuccess={() => setIsEditing(false)}
      />
    </div>
  );
}
