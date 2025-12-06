/**
 * Toast Component
 *
 * Displays notification messages with auto-dismiss
 */

export function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div className={`toast ${toast.type}`}>
      <div className="toast-icon">
        {toast.type === 'success' ? '✓' : '✕'}
      </div>
      <div className="toast-message">{toast.message}</div>
    </div>
  );
}
