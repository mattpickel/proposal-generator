/**
 * Firebase Configuration
 * Uses Firebase Admin SDK for server-side operations
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccountPath = join(__dirname, '../../service-account-key.json');
let app;

try {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

  app = initializeApp({
    credential: cert(serviceAccount)
  });
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error.message);
  console.error('Make sure service-account-key.json exists in the backend directory');
  process.exit(1);
}

// Initialize Firestore
export const db = getFirestore(app);

// Collection names
export const COLLECTIONS = {
  CLIENT_BRIEFS: 'clientBriefs',
  PROPOSAL_TEMPLATES: 'proposalTemplates',
  STYLE_CARDS: 'styleCards',
  SERVICE_MODULES: 'serviceModules',
  SECTION_EXEMPLARS: 'sectionExemplars',
  PROPOSAL_INSTANCES: 'proposalInstances',
  PROPOSAL_SECTIONS: 'proposalSections',
  SUPPORTING_DOCUMENTS: 'supportingDocuments'
};
