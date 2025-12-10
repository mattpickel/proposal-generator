/**
 * FileList Component
 *
 * Displays a list of files with add/remove capabilities
 * Reusable for both example proposals and supporting documents
 */

import { useRef } from 'react';
import { FILE_CONFIG } from '../config/constants';

export function FileList({
  title,
  icon,
  files,
  onAddFiles,
  onAddFromDrive,
  onRemoveFile,
  onClearAll,
  emptyStateText,
  emptyStateSubtext
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    await onAddFiles(selectedFiles);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          {icon} {title}
        </h3>
        <div className="card-header-actions">
          <button
            className="icon-button"
            onClick={() => fileInputRef.current?.click()}
            title="Add from computer"
          >
            📁
          </button>
          <button
            className="icon-button drive-icon-btn"
            onClick={onAddFromDrive}
            title="Add from Google Drive"
          >
            <img src="/assets/google-drive.png" alt="Google Drive" className="drive-icon" />
          </button>
          {files.length > 0 && (
            <button
              className="icon-button"
              onClick={onClearAll}
              title="Clear all"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
      <div className="card-body">
        <input
          ref={fileInputRef}
          type="file"
          accept={FILE_CONFIG.ACCEPTED_TYPES}
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        {files.length > 0 ? (
          <div className="example-files">
            {files.map(file => (
              <div key={file.id} className="example-file">
                <span className="example-file-name">{file.name}</span>
                <div className="example-actions">
                  <button
                    className="icon-button"
                    onClick={() => onRemoveFile(file.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-examples">
            <div className="empty-examples-icon">{icon}</div>
            <div className="empty-examples-text">{emptyStateText}</div>
            <div className="empty-examples-subtext">
              {emptyStateSubtext}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
