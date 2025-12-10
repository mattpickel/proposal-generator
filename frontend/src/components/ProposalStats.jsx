/**
 * ProposalStats Component
 *
 * Displays proposal statistics (word count, reading time, paragraphs)
 */

import { estimateReadingTime, countParagraphs } from '../utils/markdown';

export function ProposalStats({ proposalText, wordCount }) {
  if (!proposalText) return null;

  return (
    <div className="stats-bar">
      <div className="word-count">
        <div className="stat">
          <div className="stat-value">{wordCount}</div>
          <div className="stat-label">Words</div>
        </div>
        <div className="stat">
          <div className="stat-value">{estimateReadingTime(wordCount)}</div>
          <div className="stat-label">Minutes Read</div>
        </div>
        <div className="stat">
          <div className="stat-value">{countParagraphs(proposalText)}</div>
          <div className="stat-label">Paragraphs</div>
        </div>
      </div>
    </div>
  );
}
