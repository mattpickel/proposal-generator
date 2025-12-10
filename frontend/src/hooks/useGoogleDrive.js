/**
 * useGoogleDrive Hook
 *
 * Manages Google Drive authentication and file operations
 */

import { useState, useEffect, useRef } from 'react';
import {
  initializeGoogleAPI,
  initializeGoogleAuth,
  getAccessToken,
  signOut,
  showFilePicker,
  downloadFileContent
} from '../services/googleDrive';

export function useGoogleDrive() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const tokenClient = useRef(null);
  const gapiInited = useRef(false);
  const gisInited = useRef(false);

  // Initialize Google API
  useEffect(() => {
    const gapiLoaded = () => {
      window.gapi.load('client:picker', async () => {
        await initializeGoogleAPI();
        gapiInited.current = true;
      });
    };

    const gisLoaded = () => {
      tokenClient.current = initializeGoogleAuth(async (resp) => {
        if (resp.error !== undefined) {
          throw (resp);
        }
        setIsSignedIn(true);
      });
      gisInited.current = true;
    };

    // Check if scripts are loaded
    const checkAndInit = setInterval(() => {
      if (window.gapi && !gapiInited.current) {
        gapiLoaded();
      }
      if (window.google && !gisInited.current) {
        gisLoaded();
      }
      if (gapiInited.current && gisInited.current) {
        clearInterval(checkAndInit);
      }
    }, 100);

    return () => clearInterval(checkAndInit);
  }, []);

  const handleSignIn = () => {
    if (getAccessToken() === null) {
      tokenClient.current.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.current.requestAccessToken({ prompt: '' });
    }
  };

  const handleSignOut = () => {
    signOut();
    setIsSignedIn(false);
  };

  const pickFiles = async (title, onFilesSelected) => {
    const token = getAccessToken();
    if (!token) {
      throw new Error('Not signed in to Google Drive');
    }

    showFilePicker(title, async (data) => {
      if (data.action === window.google.picker.Action.PICKED) {
        const files = [];

        for (const file of data.docs) {
          try {
            const content = await downloadFileContent(file.id, file.mimeType);
            files.push({
              name: file.name,
              content,
              fromDrive: true
            });
          } catch (error) {
            console.error(`Error loading ${file.name}:`, error);
            throw error;
          }
        }

        onFilesSelected(files);
      }
    });
  };

  return {
    isSignedIn,
    signIn: handleSignIn,
    signOut: handleSignOut,
    pickFiles
  };
}
