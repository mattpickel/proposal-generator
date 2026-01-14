/**
 * useProposalBuilder Hook
 *
 * Manages the complete proposal building workflow
 */

import { useState } from 'react';
import api from '../services/api';
import { readFileAsText } from '../utils/fileUtils';

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
      console.log('ProposalBuilder - Transcript text length:', text.length);
      console.log('ProposalBuilder - Transcript preview:', text.substring(0, 500));

      const brief = await api.extraction.extractClientBrief(apiKey, text);
      console.log('ProposalBuilder - Extracted brief:', brief);

      // Save to database
      const savedBrief = await api.database.clientBriefs.create(brief);
      setClientBrief(savedBrief);

      // Suggest services
      const suggestions = await api.extraction.suggestServices(apiKey, savedBrief);
      setSuggestedServices(suggestions.recommendedServices || []);

      showToast('✅ Transcript processed!', 'success');
      console.log('ProposalBuilder - Transcript processed', {
        briefId: savedBrief.id,
        suggestedServices: suggestions.recommendedServices
      });

      return savedBrief;
    } catch (error) {
      showToast(`❌ Failed to process transcript: ${error.message}`, 'error');
      console.error('ProposalBuilder - Transcript processing failed', error);
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
      const summary = await api.extraction.extractDocumentSummary(apiKey, text, file.type);

      // Save to database
      const doc = await api.database.documents.create({
        proposalInstanceId,
        filename: file.name,
        type: file.type,
        rawContent: text,
        processedSummary: JSON.stringify(summary)
      });

      showToast(`✅ Processed ${file.name}`, 'success');
      console.log('ProposalBuilder - Supporting document processed', {
        docId: doc.id,
        filename: file.name
      });

      return doc;
    } catch (error) {
      showToast(`❌ Failed to process ${file.name}`, 'error');
      console.error('ProposalBuilder - Document processing failed', {
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

      const proposal = await api.database.proposals.createWithId(opportunityId, {
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
      console.log('ProposalBuilder - Proposal instance created', {
        id: proposal.id,
        name: proposalName
      });

      return proposal;
    } catch (error) {
      showToast(`❌ Failed to create proposal: ${error.message}`, 'error');
      console.error('ProposalBuilder - Proposal creation failed', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Generate proposal using unified single-pass approach
   * @param {string} proposalInstanceId - The proposal instance ID
   * @param {object} proposalMetadata - Optional metadata (title, timeline, investmentSummary, nextSteps)
   */
  const generateProposal = async (proposalInstanceId, proposalMetadata = {}) => {
    setIsProcessing(true);
    setGenerationProgress({ current: 1, total: 1, status: 'Generating proposal...' });

    try {
      showToast('Generating proposal...', 'success');

      // Use new unified generation
      const result = await api.generation.generateUnified(apiKey, proposalInstanceId, proposalMetadata);

      setGenerationProgress(null);
      showToast('✅ Proposal generated successfully!', 'success');
      console.log('ProposalBuilder - Unified proposal generated', {
        proposalInstanceId,
        proposalBodyLength: result.proposalBody?.length,
        servicesCount: result.serviceDescriptions?.length,
        tokens: result.tokens
      });

      return result;
    } catch (error) {
      setGenerationProgress(null);
      showToast(`❌ Generation failed: ${error.message}`, 'error');
      console.error('ProposalBuilder - Generation failed', {
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

      const revised = await api.generation.reviseSection(apiKey, sectionInstanceId, comment);

      showToast('✅ Section revised!', 'success');
      console.log('ProposalBuilder - Section revised', {
        sectionInstanceId,
        newVersion: revised.version
      });

      return revised;
    } catch (error) {
      showToast(`❌ Revision failed: ${error.message}`, 'error');
      console.error('ProposalBuilder - Section revision failed', {
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
      const proposal = await api.database.proposals.get(proposalInstanceId);

      if (!proposal) {
        throw new Error('Proposal not found');
      }

      setCurrentProposal(proposal);

      // Load client brief
      const brief = await api.database.clientBriefs.get(proposal.clientBriefId);
      setClientBrief(brief);

      console.log('ProposalBuilder - Proposal loaded', {
        id: proposalInstanceId,
        status: proposal.status
      });

      return proposal;
    } catch (error) {
      showToast(`❌ Failed to load proposal: ${error.message}`, 'error');
      console.error('ProposalBuilder - Proposal load failed', {
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
    setClientBrief,
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
