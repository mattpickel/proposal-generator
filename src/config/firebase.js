/**
 * Firebase Configuration
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

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
