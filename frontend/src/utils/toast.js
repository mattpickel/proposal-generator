/**
 * Toast Notification Helper
 *
 * This is a simple helper for creating toast state objects.
 * Actual rendering is handled by the Toast component.
 */

export function createToast(message, type = 'success') {
  return { message, type };
}
