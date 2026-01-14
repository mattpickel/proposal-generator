/**
 * CommentsEditor Component
 *
 * Displays and allows editing of the AI-generated "Comments from Marketing Lead" section.
 * This is the ONLY AI-generated content in the proposal.
 *
 * Features:
 * - View mode: Display comments nicely formatted
 * - Edit mode: Editable fields for greeting, paragraphs, signoff
 * - Regenerate with feedback input
 */

import { useState, useEffect } from 'react';
import { VoiceMemoButton } from './VoiceMemoButton';

export function CommentsEditor({
  comments,
  onSave,
  onRegenerate,
  isLoading = false
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedComments, setEditedComments] = useState(comments);
  const [feedback, setFeedback] = useState('');
  const [showRegenerateForm, setShowRegenerateForm] = useState(false);

  // Sync edited comments when props change
  useEffect(() => {
    setEditedComments(comments);
  }, [comments]);

  const handleParagraphChange = (index, value) => {
    const newParagraphs = [...editedComments.paragraphs];
    newParagraphs[index] = value;
    setEditedComments({ ...editedComments, paragraphs: newParagraphs });
  };

  const handleAddParagraph = () => {
    if (editedComments.paragraphs.length < 5) {
      setEditedComments({
        ...editedComments,
        paragraphs: [...editedComments.paragraphs, '']
      });
    }
  };

  const handleRemoveParagraph = (index) => {
    if (editedComments.paragraphs.length > 2) {
      const newParagraphs = editedComments.paragraphs.filter((_, i) => i !== index);
      setEditedComments({ ...editedComments, paragraphs: newParagraphs });
    }
  };

  const handleSave = () => {
    // Filter out empty paragraphs
    const cleanedComments = {
      ...editedComments,
      paragraphs: editedComments.paragraphs.filter(p => p && p.trim())
    };
    onSave(cleanedComments);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedComments(comments);
    setIsEditing(false);
  };

  const handleRegenerate = async () => {
    if (!feedback.trim()) return;

    try {
      await onRegenerate(feedback);
      setFeedback('');
      setShowRegenerateForm(false);
    } catch (error) {
      console.error('Regenerate failed:', error);
    }
  };

  if (!comments) {
    return (
      <div className="comments-editor empty">
        <p>No comments section yet.</p>
      </div>
    );
  }

  return (
    <div className="comments-editor">
      <div className="comments-header">
        <h3>{comments.heading}</h3>
        <div className="comments-actions">
          {!isEditing ? (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
              >
                Edit
              </button>
              <button
                className="btn btn-sm btn-ai"
                onClick={() => setShowRegenerateForm(!showRegenerateForm)}
                disabled={isLoading}
              >
                Refine with AI
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSave}
                disabled={isLoading}
              >
                Save
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="comments-edit-mode">
          <div className="form-field">
            <label>Greeting</label>
            <input
              type="text"
              value={editedComments.greetingLine}
              onChange={(e) => setEditedComments({
                ...editedComments,
                greetingLine: e.target.value
              })}
              className="text-input"
              placeholder="Hi [Name],"
            />
          </div>

          <div className="form-field">
            <label>
              Paragraphs ({editedComments.paragraphs.length}/5)
              {editedComments.paragraphs.length < 5 && (
                <button
                  className="btn btn-sm"
                  onClick={handleAddParagraph}
                  style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem' }}
                >
                  + Add
                </button>
              )}
            </label>
            {editedComments.paragraphs.map((p, i) => (
              <div key={i} className="paragraph-row" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <textarea
                  value={p}
                  onChange={(e) => handleParagraphChange(i, e.target.value)}
                  rows={3}
                  className="text-area"
                  style={{ flex: 1 }}
                  placeholder={`Paragraph ${i + 1}`}
                />
                {editedComments.paragraphs.length > 2 && (
                  <button
                    className="btn btn-sm"
                    onClick={() => handleRemoveParagraph(i)}
                    style={{ alignSelf: 'flex-start', padding: '0.25rem 0.5rem' }}
                  >
                    X
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="form-field">
            <label>Sign-off</label>
            <input
              type="text"
              value={editedComments.signoff}
              onChange={(e) => setEditedComments({
                ...editedComments,
                signoff: e.target.value
              })}
              className="text-input"
              placeholder="Kathryn"
            />
          </div>
        </div>
      ) : (
        <div className="comments-view-mode">
          <p className="greeting">{comments.greetingLine}</p>
          {comments.paragraphs.map((p, i) => (
            <p key={i} className="comment-paragraph">{p}</p>
          ))}
          <p className="signoff">{comments.signoff}</p>
        </div>
      )}

      {showRegenerateForm && !isEditing && (
        <div className="refine-section" style={{ marginTop: '1rem', padding: '1rem', background: '#f5f3ff', borderRadius: '8px', border: '1px solid #ddd6fe' }}>
          <h4 style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>Refine with AI</h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
            Describe what you&apos;d like to change or improve in the comments.
          </p>

          <div className="text-input-with-voice">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g., 'Make it more enthusiastic', 'Focus on their ROI goals', 'Keep it shorter'"
              rows={3}
              className="text-area"
              disabled={isLoading}
              style={{ borderColor: '#c4b5fd' }}
            />
            <VoiceMemoButton
              onTranscript={(text) => setFeedback(prev => prev ? `${prev} ${text}` : text)}
              disabled={isLoading}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleRegenerate}
              disabled={!feedback.trim() || isLoading}
            >
              {isLoading ? 'Refining...' : 'Apply'}
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setShowRegenerateForm(false);
                setFeedback('');
              }}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <style>{`
        .comments-editor {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          border: 1px solid #e2e8f0;
        }
        .comments-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .comments-header h3 {
          margin: 0;
          font-size: 1.1rem;
          color: #1e293b;
        }
        .comments-actions {
          display: flex;
          gap: 0.5rem;
        }
        .comments-view-mode .greeting {
          font-size: 1.05rem;
          color: #334155;
        }
        .comments-view-mode .comment-paragraph {
          color: #475569;
          line-height: 1.6;
          margin: 0.75rem 0;
        }
        .comments-view-mode .signoff {
          font-weight: 600;
          color: #1e293b;
          margin-top: 1.5rem;
        }
        .comments-edit-mode .form-field {
          margin-bottom: 1rem;
        }
        .comments-edit-mode label {
          display: block;
          font-weight: 500;
          margin-bottom: 0.25rem;
          color: #374151;
          font-size: 0.9rem;
        }
        .btn-ai {
          background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
          color: white;
          border: none;
        }
        .btn-ai:hover:not(:disabled) {
          background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
        }
        .btn-ai:disabled {
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}
