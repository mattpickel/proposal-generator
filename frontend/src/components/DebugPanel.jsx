/**
 * DebugPanel Component
 *
 * Development tool for viewing logs and debugging the application
 * Only visible in development mode
 */

import { useState, useEffect } from 'react';
import { logger } from '../utils/logger';

export function DebugPanel({ lastDistillation }) {
  const [logs, setLogs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    // Subscribe to log updates
    const unsubscribe = logger.subscribe((newLogs) => {
      setLogs(newLogs);
    });

    // Load initial logs
    setLogs(logger.getLogs());

    return unsubscribe;
  }, []);

  // Filter logs by level
  const filteredLogs = filter === 'ALL'
    ? logs
    : logs.filter(log => log.level === filter);

  const handleExportLogs = () => {
    const content = logger.exportLogs();
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportDistillation = () => {
    const content = JSON.stringify(lastDistillation, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `distillation-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'DEBUG': return '#888';
      case 'INFO': return '#0066cc';
      case 'WARN': return '#ff9900';
      case 'ERROR': return '#cc0000';
      default: return '#000';
    }
  };

  if (!import.meta.env.DEV) {
    return null; // Don't show in production
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      backgroundColor: '#1a1a1a',
      color: '#fff',
      borderTop: '2px solid #333',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 16px',
        backgroundColor: '#222',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: isOpen ? '1px solid #333' : 'none',
        cursor: 'pointer'
      }}
      onClick={() => setIsOpen(!isOpen)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <strong>🔧 Debug Panel</strong>
          <span style={{ color: '#888' }}>
            {logs.length} logs
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isOpen && (
            <>
              <select
                value={filter}
                onChange={(e) => {
                  e.stopPropagation();
                  setFilter(e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#333',
                  color: '#fff',
                  border: '1px solid #555',
                  borderRadius: '4px'
                }}
              >
                <option value="ALL">All Levels</option>
                <option value="DEBUG">Debug</option>
                <option value="INFO">Info</option>
                <option value="WARN">Warn</option>
                <option value="ERROR">Error</option>
              </select>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExportLogs();
                }}
                style={{
                  padding: '4px 12px',
                  backgroundColor: '#444',
                  color: '#fff',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Export Logs
              </button>
              {lastDistillation && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportDistillation();
                  }}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: '#444',
                    color: '#fff',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Export Distillation
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  logger.clear();
                }}
                style={{
                  padding: '4px 12px',
                  backgroundColor: '#444',
                  color: '#fff',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            </>
          )}
          <span style={{ cursor: 'pointer' }}>
            {isOpen ? '▼' : '▲'}
          </span>
        </div>
      </div>

      {/* Content */}
      {isOpen && (
        <div style={{
          maxHeight: '400px',
          overflowY: 'auto',
          padding: '8px'
        }}>
          {filteredLogs.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#888' }}>
              No logs to display
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div
                key={index}
                style={{
                  padding: '6px 8px',
                  borderBottom: '1px solid #2a2a2a',
                  display: 'grid',
                  gridTemplateColumns: '140px 80px 120px 1fr',
                  gap: '12px',
                  fontSize: '11px'
                }}
              >
                <div style={{ color: '#888' }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
                <div style={{ color: getLevelColor(log.level), fontWeight: 'bold' }}>
                  {log.level}
                </div>
                <div style={{ color: '#66ccff' }}>
                  [{log.category}]
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>{log.message}</div>
                  {log.data && (
                    <details style={{ marginTop: '4px' }}>
                      <summary style={{
                        cursor: 'pointer',
                        color: '#888',
                        fontSize: '10px'
                      }}>
                        View Data
                      </summary>
                      <pre style={{
                        marginTop: '4px',
                        padding: '8px',
                        backgroundColor: '#0a0a0a',
                        borderRadius: '4px',
                        overflow: 'auto',
                        fontSize: '10px',
                        color: '#0f0'
                      }}>
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
