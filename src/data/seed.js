/**
 * Database Seeding Script
 *
 * Populates Firestore with default data
 * Run this once to initialize your database
 */

import {
  proposalTemplates,
  styleCards,
  serviceModules,
  sectionExemplars
} from '../services/database';
import {
  defaultProposalTemplate,
  houseStyleCard,
  serviceModules as serviceModuleData,
  sectionExemplars as exemplarData
} from './seedData';
import { log } from '../utils/logger';

export async function seedDatabase() {
  log.info('Seed', 'Starting database seed...');

  try {
    // 1. Create default proposal template
    log.info('Seed', 'Creating proposal template...');
    await proposalTemplates.createWithId(
      defaultProposalTemplate.id,
      defaultProposalTemplate
    );

    // 2. Create house style card
    log.info('Seed', 'Creating style card...');
    await styleCards.createWithId(
      houseStyleCard.id,
      houseStyleCard
    );

    // 3. Create service modules
    log.info('Seed', `Creating ${serviceModuleData.length} service modules...`);
    for (const module of serviceModuleData) {
      await serviceModules.createWithId(module.id, module);
    }

    // 4. Create section exemplars
    log.info('Seed', `Creating ${exemplarData.length} section exemplars...`);
    for (const exemplar of exemplarData) {
      await sectionExemplars.create(exemplar);
    }

    log.info('Seed', '✅ Database seeded successfully!');
    return {
      success: true,
      counts: {
        templates: 1,
        styleCards: 1,
        serviceModules: serviceModuleData.length,
        exemplars: exemplarData.length
      }
    };
  } catch (error) {
    log.error('Seed', 'Error seeding database', error);
    throw error;
  }
}

/**
 * Check if database is already seeded
 */
export async function isSeeded() {
  try {
    const template = await proposalTemplates.get('gcm_standard_v1');
    return !!template;
  } catch (error) {
    return false;
  }
}

/**
 * Clear all seed data (for testing)
 */
export async function clearSeedData() {
  log.warn('Seed', 'Clearing seed data...');

  try {
    // Delete template
    await proposalTemplates.delete('gcm_standard_v1');

    // Delete style card
    await styleCards.delete('gcm_house_style_v1');

    // Delete service modules
    for (const module of serviceModuleData) {
      await serviceModules.delete(module.id);
    }

    // Delete exemplars
    const allExemplars = await sectionExemplars.getAll();
    for (const exemplar of allExemplars) {
      await sectionExemplars.delete(exemplar.id);
    }

    log.info('Seed', '✅ Seed data cleared');
  } catch (error) {
    log.error('Seed', 'Error clearing seed data', error);
    throw error;
  }
}
