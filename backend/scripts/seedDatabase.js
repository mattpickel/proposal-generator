/**
 * Database Seed Script (Node.js)
 *
 * Run this once to populate Firebase with default data
 * Usage: node scripts/seedDatabase.js
 *
 * Requires: service-account-key.json in backend/ directory
 * Get it from: Firebase Console > Project Settings > Service Accounts > Generate new private key
 */

import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { serviceContentTemplates } from '../src/data/serviceContentTemplates.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Load service account key
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../service-account-key.json'), 'utf8')
);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.VITE_FIREBASE_PROJECT_ID
});

const db = admin.firestore();

// Collection names
const COLLECTIONS = {
  PROPOSAL_TEMPLATES: 'proposalTemplates',
  STYLE_CARDS: 'styleCards',
  SERVICE_MODULES: 'serviceModules',
  SECTION_EXEMPLARS: 'sectionExemplars'
};

// Seed data
const defaultProposalTemplate = {
  id: 'gcm_standard_v1',
  name: 'Good Circle Marketing Standard Proposal',
  version: 1,
  sections: [
    { id: 'header', title: 'Header', description: 'Client name, date, proposal title' },
    { id: 'overview', title: 'Overview', description: 'Introduction and summary of proposal' },
    { id: 'services_summary', title: 'Services Summary', description: 'High-level overview of recommended services' },
    { id: 'scope', title: 'Scope of Work', description: 'Detailed scope for each service' },
    { id: 'deliverables', title: 'Deliverables', description: 'Specific deliverables for each service' },
    { id: 'timeline', title: 'Timeline', description: 'Project timeline and milestones' },
    { id: 'investment', title: 'Investment', description: 'Pricing breakdown by service' },
    { id: 'terms', title: 'Terms & Conditions', description: 'Standard terms and payment schedule' },
    { id: 'signature', title: 'Signature Block', description: 'Signature section for approval' }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const houseStyleCard = {
  id: 'gcm_house_style_v1',
  name: 'Good Circle Marketing House Style',
  version: 1,
  tone: ['calm', 'confident', 'collaborative'],
  voice: [
    'Use "we" for Good Circle Marketing',
    'Use "you" to address the client',
    'Avoid corporate jargon',
    'Write conversationally but professionally'
  ],
  structureGuidelines: [
    'Keep paragraphs to 2-4 sentences',
    'Use bullet points for lists of 3+ items',
    'Bold key terms and deliverables',
    'Use headers to break up sections'
  ],
  languagePatterns: [
    'Focus on outcomes and benefits, not features',
    'Be specific with numbers and timelines',
    'Use active voice',
    'Avoid superlatives unless backed by data'
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const serviceModules = [
  {
    id: 'marketing_machine',
    label: 'Marketing Machine',
    category: 'strategy',
    summary: 'Strategic foundation including messaging, positioning, and funnel architecture',
    billingType: 'one_time',
    lineItemDefaults: [
      { label: 'Discovery & Research', description: 'Market analysis and competitive research', price: 1500 },
      { label: 'Messaging Framework', description: 'Core messaging and positioning', price: 2500 },
      { label: 'Funnel Architecture', description: 'Customer journey mapping', price: 2000 },
      { label: 'Implementation Guide', description: 'Playbook and documentation', price: 1500 }
    ]
  },
  {
    id: 'internal_comms',
    label: 'Internal Communications',
    category: 'operations',
    summary: 'Internal communication systems and employee engagement',
    billingType: 'one_time',
    lineItemDefaults: [
      { label: 'Communication Audit', description: 'Current state assessment', price: 1000 },
      { label: 'System Design', description: 'Internal comms framework', price: 1500 }
    ]
  },
  {
    id: 'seo_hosting',
    label: 'SEO & Hosting',
    category: 'technical',
    summary: 'Technical SEO optimization and managed hosting',
    billingType: 'one_time',
    lineItemDefaults: [
      { label: 'Technical SEO Audit', description: 'Site analysis and recommendations', price: 1500 },
      { label: 'On-Page Optimization', description: 'Meta tags, schema, site structure', price: 1500 },
      { label: 'Hosting Setup', description: 'Managed WordPress hosting', price: 500 }
    ]
  },
  {
    id: 'digital_upgrades',
    label: 'Digital Upgrades',
    category: 'technical',
    summary: 'Website improvements, CRM integration, and technical enhancements',
    billingType: 'one_time',
    lineItemDefaults: [
      { label: 'Website Audit', description: 'UX and technical assessment', price: 1500 },
      { label: 'CRM Integration', description: 'Setup and configuration', price: 2000 },
      { label: 'Custom Development', description: 'Features and improvements', price: 1500 }
    ]
  },
  {
    id: '828_marketing',
    label: '828 Marketing (Monthly)',
    category: 'ongoing',
    summary: 'Ongoing content creation, email campaigns, and marketing execution',
    billingType: 'monthly',
    lineItemDefaults: [
      { label: 'Content Creation', description: '4-6 blog posts or articles per month', price: 1500 },
      { label: 'Email Campaigns', description: '2-4 campaigns per month', price: 1000 },
      { label: 'Social Media', description: 'Content and scheduling', price: 500 }
    ]
  },
  {
    id: 'fractional_cmo',
    label: 'Fractional CMO',
    category: 'ongoing',
    summary: 'Strategic marketing leadership and team guidance',
    billingType: 'monthly',
    lineItemDefaults: [
      { label: 'Strategic Planning', description: '8-10 hours per month', price: 3000 },
      { label: 'Team Leadership', description: 'Marketing team guidance', price: 1500 },
      { label: 'Performance Reporting', description: 'Monthly analytics and insights', price: 500 }
    ]
  }
];

const sectionExemplars = [
  {
    sectionId: 'overview',
    serviceId: null,
    title: 'General Overview Example',
    excerpt: `Thanks for taking the time to meet with us. We enjoyed learning about your business and the challenges you're facing with customer acquisition. Based on our conversation, we've put together a proposal that addresses your immediate needs while setting you up for sustainable growth.

We believe the combination of foundational strategy work and ongoing execution will give you the traction you're looking for. Let's dive in.`
  },
  {
    sectionId: 'services_summary',
    serviceId: 'marketing_machine',
    title: 'Marketing Machine Service Summary',
    excerpt: `**Marketing Machine** - Before we start creating content or running campaigns, we need a solid foundation. This includes clarifying your messaging, mapping your customer journey, and building a funnel that converts. Think of this as the blueprint for everything else.`
  },
  {
    sectionId: 'investment',
    serviceId: null,
    title: 'Investment Section Example',
    excerpt: `## Investment

**One-Time Services**
- Marketing Machine: $7,500
- SEO & Hosting: $3,500

**Monthly Services** (beginning Month 2)
- 828 Marketing: $3,000/month

**Total Initial Investment:** $11,000
**Ongoing Monthly:** $3,000

Payment terms: 50% due upon contract signing, 50% due upon completion of one-time services. Monthly services billed in advance.`
  }
];

// Main seed function
async function seedDatabase() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Seed proposal template
    console.log('📄 Seeding proposal template...');
    await db.collection(COLLECTIONS.PROPOSAL_TEMPLATES).doc(defaultProposalTemplate.id).set(defaultProposalTemplate);
    console.log('   ✓ Proposal template created');

    // Seed style card
    console.log('🎨 Seeding style card...');
    await db.collection(COLLECTIONS.STYLE_CARDS).doc(houseStyleCard.id).set(houseStyleCard);
    console.log('   ✓ Style card created');

    // Seed service modules (with content templates)
    console.log('📦 Seeding service modules...');
    for (const service of serviceModules) {
      // Merge with content template if available
      const contentTemplate = serviceContentTemplates[service.id] || {};

      await db.collection(COLLECTIONS.SERVICE_MODULES).doc(service.id).set({
        ...service,
        contentTemplate, // Add the detailed content template
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`   ✓ Service: ${service.label}`);
    }

    // Seed section exemplars
    console.log('📝 Seeding section exemplars...');
    for (let i = 0; i < sectionExemplars.length; i++) {
      const exemplar = sectionExemplars[i];
      await db.collection(COLLECTIONS.SECTION_EXEMPLARS).doc(`exemplar_${i + 1}`).set({
        ...exemplar,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`   ✓ Exemplar: ${exemplar.title}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSeeded data includes:');
    console.log('  - 1 Proposal Template (9 sections)');
    console.log('  - 1 Style Card');
    console.log(`  - ${serviceModules.length} Service Modules`);
    console.log(`  - ${sectionExemplars.length} Section Exemplars`);
    console.log('\nYou can now start the dev server: npm run dev');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    console.error('\nMake sure you have:');
    console.error('  1. Created a Firebase project');
    console.error('  2. Added Firebase config to .env file');
    console.error('  3. Installed dependencies (npm install)');
    console.error('\nError details:', error);
    process.exit(1);
  }
}

// Run seed
seedDatabase();
