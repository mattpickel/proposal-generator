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
  const [isSignedIn, setIsSignedIn] = useState(() => {
    // Check localStorage on initial load
    const savedState = localStorage.getItem('googleDriveSignedIn') === 'true';
    console.log('🔍 Google Drive - Initial state from localStorage:', savedState);
    return savedState;
  });
  const tokenClient = useRef(null);
  const gapiInited = useRef(false);
  const gisInited = useRef(false);

  // Initialize Google API
  useEffect(() => {
    console.log('🔍 Google Drive - Initializing...');

    const gapiLoaded = () => {
      console.log('🔍 Google Drive - GAPI loading...');
      window.gapi.load('client:picker', async () => {
        await initializeGoogleAPI();
        gapiInited.current = true;
        console.log('✅ Google Drive - GAPI initialized');

        // Check if we think we're signed in from localStorage
        const wasSignedIn = localStorage.getItem('googleDriveSignedIn') === 'true';
        console.log('🔍 Google Drive - Was signed in before?', wasSignedIn);

        if (wasSignedIn) {
          // Check if token still exists
          const token = getAccessToken();
          console.log('🔍 Google Drive - Existing token?', token !== null);

          if (token !== null) {
            console.log('✅ Google Drive - Token found, staying signed in');
            setIsSignedIn(true);
          } else {
            console.log('⚠️ Google Drive - No token found, will try auto-restore');
            // DON'T clear localStorage here - let auto-restore try first
            setIsSignedIn(false);
          }
        }
      });
    };

    const gisLoaded = () => {
      console.log('🔍 Google Drive - GIS loading...');
      tokenClient.current = initializeGoogleAuth(async (resp) => {
        if (resp.error !== undefined) {
          console.log('❌ Google Drive - Auth error:', resp.error);
          throw (resp);
        }
        console.log('✅ Google Drive - Auth successful, setting signed in');
        setIsSignedIn(true);
        localStorage.setItem('googleDriveSignedIn', 'true');
      });
      gisInited.current = true;
      console.log('✅ Google Drive - GIS initialized');
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
        console.log('✅ Google Drive - Both APIs ready');

        // Both APIs loaded - try to restore session
        const wasSignedIn = localStorage.getItem('googleDriveSignedIn') === 'true';
        console.log('🔍 Google Drive - Checking auto-restore... wasSignedIn:', wasSignedIn, 'tokenClient:', !!tokenClient.current);

        if (wasSignedIn && tokenClient.current) {
          console.log('🔄 Google Drive - Attempting auto-restore in 1 second...');
          setTimeout(() => {
            try {
              // Check if we already have a valid token
              const token = getAccessToken();
              console.log('🔍 Google Drive - Current token status:', token !== null ? 'exists' : 'missing');

              if (!token) {
                // Try silent refresh
                console.log('🔄 Google Drive - Requesting silent token refresh...');
                tokenClient.current.requestAccessToken({ prompt: '' });

                // If silent refresh fails after 3 seconds, clear localStorage
                setTimeout(() => {
                  const newToken = getAccessToken();
                  if (!newToken) {
                    console.log('❌ Google Drive - Auto-restore failed, clearing localStorage');
                    localStorage.removeItem('googleDriveSignedIn');
                  } else {
                    console.log('✅ Google Drive - Auto-restore successful!');
                  }
                }, 3000);
              } else {
                console.log('✅ Google Drive - Already have valid token');
              }
            } catch (error) {
              console.log('❌ Google Drive - Auto-restore failed:', error);
              localStorage.removeItem('googleDriveSignedIn');
            }
          }, 1000);
        } else {
          console.log('⏭️ Google Drive - Skipping auto-restore (not previously signed in)');
        }
      }
    }, 100);

    return () => clearInterval(checkAndInit);
  }, []);

  const handleSignIn = () => {
    const wasSignedInBefore = localStorage.getItem('googleDriveSignedIn') === 'true';

    if (getAccessToken() === null) {
      // Request new token - use silent refresh if signed in before
      tokenClient.current.requestAccessToken({
        prompt: wasSignedInBefore ? '' : 'consent'
      });
    } else {
      // Token exists, just request a refresh
      tokenClient.current.requestAccessToken({ prompt: '' });
    }
  };

  const handleSignOut = () => {
    signOut();
    setIsSignedIn(false);
    localStorage.removeItem('googleDriveSignedIn');
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
