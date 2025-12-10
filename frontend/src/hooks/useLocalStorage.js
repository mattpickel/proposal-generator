/**
 * useLocalStorage Hook
 *
 * Persists state to localStorage with automatic sync
 */

import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue = []) {
  // Initialize state from localStorage or use initial value
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading from localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Save to localStorage whenever value changes
  useEffect(() => {
    try {
      if (value.length > 0) {
        // Only save id, name, and content (not File objects)
        const dataToSave = value.map(({ id, name, content }) => ({
          id,
          name,
          content
        }));
        localStorage.setItem(key, JSON.stringify(dataToSave));
      } else {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
}
