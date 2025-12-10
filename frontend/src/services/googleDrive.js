/**
 * Google Drive Service
 * Handles all Google Drive API interactions
 */

const GOOGLE_CLIENT_ID = '917115566645-o8ohv7uiqeerafj8cvf5j5qev0mgu4uk.apps.googleusercontent.com';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';
const DEFAULT_FOLDER_ID = '1fvdEMZ-JNlpfSP1BZWDCzDFE_YfXs1hc';

/**
 * Initialize Google API client
 */
export async function initializeGoogleAPI() {
  try {
    await window.gapi.client.init({
      discoveryDocs: [DISCOVERY_DOC],
    });
  } catch (error) {
    console.error('Error initializing gapi client:', error);
    throw error;
  }
}

/**
 * Initialize Google Identity Services (OAuth)
 */
export function initializeGoogleAuth(callback) {
  return window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: SCOPES,
    callback: callback,
  });
}

/**
 * Get current access token
 */
export function getAccessToken() {
  return window.gapi.client.getToken();
}

/**
 * Sign out from Google
 */
export function signOut() {
  const token = window.gapi.client.getToken();
  if (token !== null) {
    window.google.accounts.oauth2.revoke(token.access_token);
    window.gapi.client.setToken('');
  }
}

/**
 * Show Google Drive file picker
 */
export function showFilePicker(title, callback, options = {}) {
  const {
    multiselect = true,
    folderId = DEFAULT_FOLDER_ID
  } = options;

  const token = getAccessToken();
  if (!token) {
    throw new Error('Not signed in');
  }

  // Create a standard Google Drive view with folder hierarchy
  const docsView = new window.google.picker.DocsView()
    .setIncludeFolders(true)
    .setSelectFolderEnabled(false)
    .setMode(window.google.picker.DocsViewMode.LIST); // Use list mode for better hierarchy

  // Add a "Recent" view as a second tab for convenience
  const recentView = new window.google.picker.DocsView(window.google.picker.ViewId.RECENTLY_PICKED)
    .setIncludeFolders(true)
    .setSelectFolderEnabled(false);

  const pickerBuilder = new window.google.picker.PickerBuilder()
    .addView(docsView)
    .addView(recentView)
    .setOAuthToken(token.access_token)
    .setDeveloperKey('')
    .setCallback(callback)
    .setTitle(title);

  if (multiselect) {
    pickerBuilder.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
  }

  const picker = pickerBuilder.build();
  picker.setVisible(true);
}

/**
 * Download file content from Google Drive
 */
export async function downloadFileContent(fileId, mimeType) {
  try {
    let content = '';

    if (mimeType.includes('google-apps')) {
      // Export Google Docs as plain text
      const exportMimeType = 'text/plain';
      const response = await window.gapi.client.drive.files.export({
        fileId: fileId,
        mimeType: exportMimeType
      });
      content = response.body;
    } else {
      // Download regular files
      const response = await window.gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media'
      });
      content = response.body;
    }

    return content;
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}
