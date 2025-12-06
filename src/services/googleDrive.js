/**
 * Google Drive Service
 *
 * Handles Google Drive API initialization and file operations.
 */

import { GOOGLE_CONFIG } from '../config/constants';

/**
 * Initialize Google API Client
 */
export async function initializeGoogleAPI() {
  if (!window.gapi) {
    throw new Error('Google API not loaded');
  }

  await window.gapi.client.init({
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
    discoveryDocs: [GOOGLE_CONFIG.DISCOVERY_DOC],
  });
}

/**
 * Initialize Google Identity Services (OAuth)
 */
export function initializeGoogleAuth(callback) {
  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services not loaded');
  }

  return window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CONFIG.CLIENT_ID,
    scope: GOOGLE_CONFIG.SCOPES,
    callback
  });
}

/**
 * Get the current access token
 */
export function getAccessToken() {
  return window.gapi?.client?.getToken();
}

/**
 * Set the access token
 */
export function setAccessToken(token) {
  window.gapi?.client?.setToken(token);
}

/**
 * Sign out from Google
 */
export function signOut() {
  const token = getAccessToken();
  if (token !== null) {
    window.google.accounts.oauth2.revoke(token.access_token);
    setAccessToken('');
  }
}

/**
 * Download file content from Google Drive
 * Handles both Google Docs and regular files
 */
export async function downloadFileContent(fileId, mimeType) {
  let content = '';

  if (mimeType.includes('google-apps')) {
    // Export Google Docs as plain text
    const response = await window.gapi.client.drive.files.export({
      fileId,
      mimeType: 'text/plain'
    });
    content = response.body;
  } else {
    // Download regular files
    const response = await window.gapi.client.drive.files.get({
      fileId,
      alt: 'media'
    });
    content = response.body;
  }

  return content;
}

/**
 * Create and show Google Picker for file selection
 */
export function showFilePicker(title, callback) {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not signed in to Google Drive');
  }

  const docsView = new window.google.picker.DocsView()
    .setIncludeFolders(true)
    .setSelectFolderEnabled(false)
    .setParent(GOOGLE_CONFIG.DEFAULT_FOLDER_ID);

  const picker = new window.google.picker.PickerBuilder()
    .addView(docsView)
    .setOAuthToken(token.access_token)
    .setDeveloperKey('')
    .setCallback(callback)
    .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
    .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
    .setTitle(title)
    .build();

  picker.setVisible(true);
}
