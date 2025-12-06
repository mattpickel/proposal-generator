/**
 * FirefliesUpload Component
 *
 * Handles Fireflies transcript upload
 */

import { useRef } from 'react';
import { formatFileSize } from '../utils/fileUtils';
import { FILE_CONFIG } from '../config/constants';

export function FirefliesUpload({ file, onFileSelect, onFileRemove }) {
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          📄 Fireflies Transcript (Optional)
        </h3>
      </div>
      <div className="card-body">
        {!file ? (
          <div
            className="file-upload-zone"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="file-upload-icon">📁</div>
            <div className="file-upload-text">
              Drop your Fireflies transcript here
            </div>
            <div className="file-upload-label">
              or click to browse
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={FILE_CONFIG.FIREFLIES_TYPES}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div className="uploaded-file">
            <div className="file-icon">📄</div>
            <div className="file-info">
              <div className="file-name">{file.name}</div>
              <div className="file-size">{formatFileSize(file.size)}</div>
            </div>
            <button className="remove-file" onClick={onFileRemove}>
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
