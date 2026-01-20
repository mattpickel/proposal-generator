/**
 * useProposalV2 Hook
 *
 * Manages the JSON-first proposal workflow where:
 * - Proposals are stored as structured JSON
 * - AI only generates the "Comments" section
 * - Services are pulled from a library deterministically
 * - Rendering to HTML happens at the end
 */

import { useState, useCallback } from 'react';
import api from '../services/api';

export function useProposalV2(showToast) {
  const [proposal, setProposal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [renderedHtml, setRenderedHtml] = useState('');

  /**
   * Create a new proposal (assembles skeleton + generates AI comments)
   */
  const createProposal = useCallback(async ({
    opportunityId,
    clientBriefId,
    selectedServiceIds,
    proposalTitle,
    customInstructions
  }) => {
    setIsLoading(true);
    try {
      const result = await api.proposalsV2.create({
        opportunityId,
        clientBriefId,
        selectedServiceIds,
        proposalTitle,
        customInstructions
      });

      setProposal(result.proposal);

      if (result.validation && !result.validation.valid) {
        showToast(`Proposal created with warnings: ${result.validation.errors.join(', ')}`, 'warning');
      } else {
        showToast('Proposal created successfully!', 'success');
      }

      console.log('useProposalV2 - Proposal created', {
        proposalId: result.proposal.id,
        tokens: result.tokens
      });

      return result;
    } catch (error) {
      showToast(`Failed to create proposal: ${error.message}`, 'error');
      console.error('useProposalV2 - Create failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  /**
   * Load an existing proposal
   */
  const loadProposal = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const result = await api.proposalsV2.get(id);
      setProposal(result.proposal);
      console.log('useProposalV2 - Proposal loaded', { proposalId: id });
      return result.proposal;
    } catch (error) {
      // If v2 not found, return null (might be legacy proposal)
      if (error.message.includes('404') || error.message.includes('not found')) {
        console.log('useProposalV2 - V2 proposal not found', { id });
        return null;
      }
      showToast(`Failed to load proposal: ${error.message}`, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  /**
   * Update comments section (manual edit)
   */
  const updateComments = useCallback(async (id, comments) => {
    setIsLoading(true);
    try {
      const result = await api.proposalsV2.updateComments(id, { comments });
      setProposal(result.proposal);
      showToast('Comments updated!', 'success');
      return result.proposal;
    } catch (error) {
      showToast(`Failed to update comments: ${error.message}`, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  /**
   * Regenerate comments with AI feedback
   */
  const regenerateComments = useCallback(async (id, feedback) => {
    setIsLoading(true);
    try {
      showToast('Regenerating comments...', 'info');

      const result = await api.proposalsV2.updateComments(id, {
        regenerate: true,
        feedback
      });

      setProposal(result.proposal);
      showToast('Comments regenerated!', 'success');
      return result.proposal;
    } catch (error) {
      showToast(`Failed to regenerate comments: ${error.message}`, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  /**
   * Update cover block
   */
  const updateCover = useCallback(async (id, cover) => {
    setIsLoading(true);
    try {
      const result = await api.proposalsV2.updateCover(id, cover);
      setProposal(result.proposal);
      showToast('Cover updated!', 'success');
      return result.proposal;
    } catch (error) {
      showToast(`Failed to update cover: ${error.message}`, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  /**
   * Toggle service enabled/disabled
   */
  const toggleService = useCallback(async (id, serviceKey, enabled) => {
    setIsLoading(true);
    try {
      const result = await api.proposalsV2.updateService(id, serviceKey, { enabled });
      setProposal(result.proposal);
      return result.proposal;
    } catch (error) {
      showToast(`Failed to update service: ${error.message}`, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  /**
   * Update service overrides (custom text for subsections)
   */
  const updateServiceOverrides = useCallback(async (id, serviceKey, overrides) => {
    setIsLoading(true);
    try {
      const result = await api.proposalsV2.updateService(id, serviceKey, { overrides });
      setProposal(result.proposal);
      showToast('Service updated!', 'success');
      return result.proposal;
    } catch (error) {
      showToast(`Failed to update service: ${error.message}`, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  /**
   * Render proposal to HTML
   */
  const renderProposal = useCallback(async (id) => {
    try {
      const html = await api.proposalsV2.renderHtml(id);
      setRenderedHtml(html);
      return html;
    } catch (error) {
      showToast(`Failed to render proposal: ${error.message}`, 'error');
      throw error;
    }
  }, [showToast]);

  /**
   * Copy proposal to clipboard (HTML + plain text fallback)
   */
  const copyToClipboard = useCallback(async (format = 'html') => {
    if (!proposal) return false;

    try {
      if (format === 'html') {
        const html = await api.proposalsV2.renderHtml(proposal.id);
        const plain = await api.proposalsV2.renderPlain(proposal.id);

        // Try to copy both HTML and plain text
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'text/html': new Blob([html], { type: 'text/html' }),
              'text/plain': new Blob([plain], { type: 'text/plain' })
            })
          ]);
          showToast('Copied formatted text to clipboard!', 'success');
        } catch {
          // Fallback to plain text only
          await navigator.clipboard.writeText(plain);
          showToast('Copied as plain text (HTML not supported)', 'success');
        }
      } else {
        const plain = await api.proposalsV2.renderPlain(proposal.id);
        await navigator.clipboard.writeText(plain);
        showToast('Copied to clipboard!', 'success');
      }
      return true;
    } catch (error) {
      showToast(`Failed to copy: ${error.message}`, 'error');
      return false;
    }
  }, [proposal, showToast]);

  /**
   * Delete proposal
   */
  const deleteProposal = useCallback(async (id) => {
    setIsLoading(true);
    try {
      await api.proposalsV2.delete(id);
      setProposal(null);
      setRenderedHtml('');
      showToast('Proposal deleted', 'success');
    } catch (error) {
      showToast(`Failed to delete proposal: ${error.message}`, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  return {
    proposal,
    isLoading,
    renderedHtml,
    setProposal,
    createProposal,
    loadProposal,
    updateComments,
    regenerateComments,
    updateCover,
    toggleService,
    updateServiceOverrides,
    renderProposal,
    copyToClipboard,
    deleteProposal
  };
}
