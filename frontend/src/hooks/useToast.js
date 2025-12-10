/**
 * useToast Hook
 *
 * Manages toast notifications with auto-dismiss
 */

import { useState } from 'react';
import { TOAST_DURATION } from '../config/constants';

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), TOAST_DURATION);
  };

  return { toast, showToast };
}
