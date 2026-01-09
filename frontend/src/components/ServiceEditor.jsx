/**
 * ServiceEditor Component
 *
 * Displays and allows editing of service sections in the proposal.
 * Services come from the library - users can:
 * - Toggle services on/off
 * - Expand to see subsections
 * - Edit subsection content (if allowClientSpecificEdits is true)
 */

import { useState } from 'react';

export function ServiceEditor({
  service,
  onToggle,
  onUpdateOverrides,
  isLoading = false
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingSubsection, setEditingSubsection] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleEditClick = (subsection) => {
    const currentValue = service.overrides?.[`subsection_${subsection.number}`] || subsection.bodyMarkdown;
    setEditValue(currentValue);
    setEditingSubsection(subsection.number);
  };

  const handleSaveSubsection = (subsectionNumber) => {
    onUpdateOverrides({ [`subsection_${subsectionNumber}`]: editValue });
    setEditingSubsection(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingSubsection(null);
    setEditValue('');
  };

  const handleResetSubsection = (subsection) => {
    // Remove the override to revert to original
    onUpdateOverrides({ [`subsection_${subsection.number}`]: subsection.bodyMarkdown });
  };

  return (
    <div className={`service-editor ${service.enabled ? '' : 'disabled'}`}>
      <div className="service-header">
        <label className="service-toggle">
          <input
            type="checkbox"
            checked={service.enabled}
            onChange={() => onToggle(!service.enabled)}
            disabled={isLoading}
          />
          <span className="service-name">{service.displayNameCaps}</span>
        </label>

        {service.enabled && (
          <button
            className="btn btn-sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        )}
      </div>

      {service.enabled && (
        <div className="service-summary">
          <span className="service-investment">{service.investment?.renderHint || ''}</span>
          {service.timeline && (
            <span className="service-timeline">{service.timeline}</span>
          )}
        </div>
      )}

      {isExpanded && service.enabled && (
        <div className="service-content">
          {service.subsections.map((sub) => {
            const hasOverride = service.overrides?.[`subsection_${sub.number}`] &&
              service.overrides[`subsection_${sub.number}`] !== sub.bodyMarkdown;

            return (
              <div key={sub.number} className="subsection">
                <div className="subsection-header">
                  <h4>
                    {sub.number}. {sub.title}
                    {hasOverride && <span className="override-badge">Modified</span>}
                  </h4>
                  <div className="subsection-actions">
                    {sub.allowClientSpecificEdits && editingSubsection !== sub.number && (
                      <button
                        className="btn btn-sm"
                        onClick={() => handleEditClick(sub)}
                        disabled={isLoading}
                      >
                        Edit
                      </button>
                    )}
                    {hasOverride && editingSubsection !== sub.number && (
                      <button
                        className="btn btn-sm"
                        onClick={() => handleResetSubsection(sub)}
                        disabled={isLoading}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {editingSubsection === sub.number ? (
                  <div className="subsection-edit">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={8}
                      className="text-area"
                      disabled={isLoading}
                    />
                    <div className="edit-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSaveSubsection(sub.number)}
                        disabled={isLoading}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={handleCancelEdit}
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="subsection-content">
                    {(service.overrides?.[`subsection_${sub.number}`] || sub.bodyMarkdown)
                      .split('\n')
                      .filter(line => line.trim())
                      .map((line, i) => (
                        <p key={i}>{line.startsWith('- ') ? line : line}</p>
                      ))}
                  </div>
                )}
              </div>
            );
          })}

          {service.outcome && (
            <div className="service-outcome">
              <strong>Expected Outcome:</strong> {service.outcome}
            </div>
          )}
        </div>
      )}

      <style>{`
        .service-editor {
          background: white;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid #e2e8f0;
          margin-bottom: 1rem;
        }
        .service-editor.disabled {
          opacity: 0.6;
          background: #f8fafc;
        }
        .service-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .service-toggle {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }
        .service-toggle input[type="checkbox"] {
          width: 1.25rem;
          height: 1.25rem;
          cursor: pointer;
        }
        .service-name {
          font-weight: 600;
          color: #1e40af;
          font-size: 1rem;
        }
        .service-summary {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
          font-size: 0.9rem;
          color: #64748b;
        }
        .service-investment {
          font-weight: 500;
          color: #059669;
        }
        .service-content {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }
        .subsection {
          margin-bottom: 1.25rem;
        }
        .subsection-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .subsection-header h4 {
          margin: 0;
          font-size: 0.95rem;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .subsection-actions {
          display: flex;
          gap: 0.25rem;
        }
        .override-badge {
          font-size: 0.7rem;
          background: #fef3c7;
          color: #92400e;
          padding: 0.125rem 0.375rem;
          border-radius: 4px;
          font-weight: 500;
        }
        .subsection-content {
          font-size: 0.9rem;
          color: #4b5563;
          line-height: 1.5;
          padding-left: 1rem;
        }
        .subsection-content p {
          margin: 0.25rem 0;
        }
        .subsection-edit {
          margin-top: 0.5rem;
        }
        .subsection-edit .text-area {
          width: 100%;
          font-family: inherit;
          font-size: 0.9rem;
          line-height: 1.5;
        }
        .edit-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .service-outcome {
          margin-top: 1rem;
          padding: 0.75rem;
          background: #f0fdf4;
          border-radius: 6px;
          font-size: 0.9rem;
          color: #166534;
        }
      `}</style>
    </div>
  );
}
