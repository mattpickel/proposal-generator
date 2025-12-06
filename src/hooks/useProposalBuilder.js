/**
 * useProposalBuilder Hook
 *
 * Manages the complete proposal building workflow
 */

import { useState } from 'react';
import { proposalInstances, clientBriefs, supportingDocuments } from '../services/database';
import { extractClientBrief, extractDocumentSummary, suggestServices } from '../services/extraction';
import { generateAllSections, reviseSection } from '../services/proposalGenerator';
import { readFileAsText } from '../utils/fileUtils';
import { log } from '../utils/logger';

export function useProposalBuilder(apiKey, showToast) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProposal, setCurrentProposal] = useState(null);
  const [clientBrief, setClientBrief] = useState(null);
  const [suggestedServices, setSuggestedServices] = useState([]);
  const [generationProgress, setGenerationProgress] = useState(null);

  /**
   * Process Fireflies transcript into ClientBrief
   */
  const processTranscript = async (transcriptFile) => {
    setIsProcessing(true);
    try {
      showToast('Analyzing transcript...', 'success');

      const text = await readFileAsText(transcriptFile);
      const brief = await extractClientBrief(apiKey, text);

      // Save to database
      const savedBrief = await clientBriefs.create(brief);
      setClientBrief(savedBrief);

      // Suggest services
      const suggestions = await suggestServices(apiKey, savedBrief);
      setSuggestedServices(suggestions.recommendedServices || []);

      showToast('✅ Transcript processed!', 'success');
      log.info('ProposalBuilder', 'Transcript processed', {
        briefId: savedBrief.id,
        suggestedServices: suggestions.recommendedServices
      });

      return savedBrief;
    } catch (error) {
      showToast(`❌ Failed to process transcript: ${error.message}`, 'error');
      log.error('ProposalBuilder', 'Transcript processing failed', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Process supporting document
   */
  const processSupportingDocument = async (file, proposalInstanceId) => {
    try {
      showToast(`Processing ${file.name}...`, 'success');

      const text = await readFileAsText(file);
      const summary = await extractDocumentSummary(apiKey, text, file.type);

      // Save to database
      const doc = await supportingDocuments.create({
        proposalInstanceId,
        filename: file.name,
        type: file.type,
        rawContent: text,
        processedSummary: JSON.stringify(summary)
      });

      showToast(`✅ Processed ${file.name}`, 'success');
      log.info('ProposalBuilder', 'Supporting document processed', {
        docId: doc.id,
        filename: file.name
      });

      return doc;
    } catch (error) {
      showToast(`❌ Failed to process ${file.name}`, 'error');
      log.error('ProposalBuilder', 'Document processing failed', {
        filename: file.name,
        error: error.message
      });
      throw error;
    }
  };

  /**
   * Create a new proposal instance
   */
  const createProposal = async (opportunityId, clientBriefId, businessName, selectedServiceIds) => {
    setIsProcessing(true);
    try {
      const proposalName = `${opportunityId} - ${businessName} Marketing Proposal`;

      const proposal = await proposalInstances.createWithId(opportunityId, {
        opportunityId,
        proposalName,
        templateId: 'gcm_standard_v1',
        templateVersion: 1,
        clientBriefId,
        serviceIds: selectedServiceIds,
        supportingDocumentIds: [],
        status: 'draft'
      });

      setCurrentProposal(proposal);
      showToast('✅ Proposal created!', 'success');
      log.info('ProposalBuilder', 'Proposal instance created', {
        id: proposal.id,
        name: proposalName
      });

      return proposal;
    } catch (error) {
      showToast(`❌ Failed to create proposal: ${error.message}`, 'error');
      log.error('ProposalBuilder', 'Proposal creation failed', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Generate all sections
   */
  const generateProposal = async (proposalInstanceId) => {
    setIsProcessing(true);
    setGenerationProgress({ current: 0, total: 9 });

    try {
      showToast('Starting proposal generation...', 'success');

      const sections = await generateAllSections(
        apiKey,
        proposalInstanceId,
        (progress) => {
          setGenerationProgress(progress);
          showToast(`Generating: ${progress.sectionTitle} (${progress.current}/${progress.total})`, 'success');
        }
      );

      setGenerationProgress(null);
      showToast('✅ Proposal generated successfully!', 'success');
      log.info('ProposalBuilder', 'Proposal fully generated', {
        proposalInstanceId,
        sectionsCount: sections.length
      });

      return sections;
    } catch (error) {
      setGenerationProgress(null);
      showToast(`❌ Generation failed: ${error.message}`, 'error');
      log.error('ProposalBuilder', 'Generation failed', {
        proposalInstanceId,
        error: error.message
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Revise a section
   */
  const reviseProposalSection = async (sectionInstanceId, comment) => {
    setIsProcessing(true);
    try {
      showToast('Revising section...', 'success');

      const revised = await reviseSection(apiKey, sectionInstanceId, comment);

      showToast('✅ Section revised!', 'success');
      log.info('ProposalBuilder', 'Section revised', {
        sectionInstanceId,
        newVersion: revised.version
      });

      return revised;
    } catch (error) {
      showToast(`❌ Revision failed: ${error.message}`, 'error');
      log.error('ProposalBuilder', 'Section revision failed', {
        sectionInstanceId,
        error: error.message
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Load existing proposal
   */
  const loadProposal = async (proposalInstanceId) => {
    setIsProcessing(true);
    try {
      const proposal = await proposalInstances.get(proposalInstanceId);

      if (!proposal) {
        throw new Error('Proposal not found');
      }

      setCurrentProposal(proposal);

      // Load client brief
      const brief = await clientBriefs.get(proposal.clientBriefId);
      setClientBrief(brief);

      log.info('ProposalBuilder', 'Proposal loaded', {
        id: proposalInstanceId,
        status: proposal.status
      });

      return proposal;
    } catch (error) {
      showToast(`❌ Failed to load proposal: ${error.message}`, 'error');
      log.error('ProposalBuilder', 'Proposal load failed', {
        proposalInstanceId,
        error: error.message
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    currentProposal,
    clientBrief,
    suggestedServices,
    generationProgress,
    processTranscript,
    processSupportingDocument,
    createProposal,
    generateProposal,
    reviseProposalSection,
    loadProposal
  };
}
