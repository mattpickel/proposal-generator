/**
 * Application Constants
 */

// LocalStorage keys
export const STORAGE_KEYS = {
  EXAMPLES: 'proposal-generator-examples',
  SUPPORTING_DOCS: 'proposal-generator-supporting-docs'
};

// Google Drive configuration
export const GOOGLE_CONFIG = {
  CLIENT_ID: '917115566645-o8ohv7uiqeerafj8cvf5j5qev0mgu4uk.apps.googleusercontent.com',
  DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  SCOPES: 'https://www.googleapis.com/auth/drive.readonly',
  DEFAULT_FOLDER_ID: '1fvdEMZ-JNlpfSP1BZWDCzDFE_YfXs1hc'
};

// File upload configuration
export const FILE_CONFIG = {
  ACCEPTED_TYPES: '.txt,.pdf,.docx,.md',
  FIREFLIES_TYPES: '.txt,.pdf,.docx'
};

// Toast notification duration
export const TOAST_DURATION = 3000;
