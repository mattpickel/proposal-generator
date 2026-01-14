/**
 * ProposalPreviewV2 Component
 *
 * Displays the rendered HTML preview of a proposal and provides
 * copy buttons for pasting into HighLevel.
 *
 * Features:
 * - Live HTML preview
 * - Copy Formatted (HTML) button
 * - Copy Plain Text button
 * - Full-screen preview option
 */

import { useState, useEffect } from 'react';

export function ProposalPreviewV2({
  proposal,
  renderedHtml,
  onRenderRequest,
  onCopyHtml,
  onCopyPlain,
  isLoading = false
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(null);

  // Request render when proposal changes
  useEffect(() => {
    if (proposal && onRenderRequest) {
      onRenderRequest();
    }
  }, [proposal, onRenderRequest]);

  const handleCopy = async (format) => {
    const handler = format === 'html' ? onCopyHtml : onCopyPlain;
    const success = await handler();
    if (success) {
      setCopied(format);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  if (!proposal) {
    return (
      <div className="proposal-preview-v2 empty">
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3>No Proposal Yet</h3>
          <p>Create a proposal to see the preview here.</p>
        </div>
      </div>
    );
  }

  if (isLoading && !renderedHtml) {
    return (
      <div className="proposal-preview-v2 loading">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Generating proposal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`proposal-preview-v2 ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="preview-header">
        <h2>Proposal Preview</h2>
        <div className="preview-actions">
          <button
            className={`btn btn-primary ${copied === 'html' ? 'copied' : ''}`}
            onClick={() => handleCopy('html')}
            disabled={isLoading}
          >
            {copied === 'html' ? 'Copied!' : 'Copy Formatted'}
          </button>
          <button
            className={`btn btn-secondary ${copied === 'plain' ? 'copied' : ''}`}
            onClick={() => handleCopy('plain')}
            disabled={isLoading}
          >
            {copied === 'plain' ? 'Copied!' : 'Copy Plain Text'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
      </div>

      <div className="preview-info">
        <span className="info-item">
          <strong>Status:</strong> {proposal.status}
        </span>
        <span className="info-item">
          <strong>Services:</strong> {proposal.services.filter(s => s.enabled).length} selected
        </span>
        <span className="info-item">
          <strong>Version:</strong> {proposal.version?.templateVersion}
        </span>
      </div>

      <div className="preview-content">
        {renderedHtml ? (
          <div
            className="rendered-proposal"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        ) : (
          <div className="render-placeholder">
            <p>Click a section to edit, or copy the proposal to paste into HighLevel.</p>
          </div>
        )}
      </div>

      {isFullscreen && (
        <button
          className="close-fullscreen"
          onClick={() => setIsFullscreen(false)}
        >
          X Close
        </button>
      )}

      <style>{`
        .proposal-preview-v2 {
          background: white;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .proposal-preview-v2.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          border-radius: 0;
        }
        .proposal-preview-v2.empty,
        .proposal-preview-v2.loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }
        .empty-state,
        .loading-state {
          text-align: center;
          color: #64748b;
        }
        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .empty-state h3 {
          margin: 0 0 0.5rem;
          color: #334155;
        }
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }
        .preview-header h2 {
          margin: 0;
          font-size: 1.1rem;
          color: #1e293b;
        }
        .preview-actions {
          display: flex;
          gap: 0.5rem;
        }
        .preview-actions .btn.copied {
          background: #059669;
          border-color: #059669;
        }
        .preview-info {
          display: flex;
          gap: 1.5rem;
          padding: 0.75rem 1rem;
          background: #f1f5f9;
          font-size: 0.85rem;
          color: #64748b;
        }
        .info-item strong {
          color: #475569;
        }
        .preview-content {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }
        .rendered-proposal {
          width: 100%;
        }
        .render-placeholder {
          text-align: center;
          color: #94a3b8;
          padding: 2rem;
        }
        .close-fullscreen {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 1001;
          padding: 0.5rem 1rem;
          background: #1e293b;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .close-fullscreen:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}
