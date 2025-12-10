/**
 * useProposal Hook
 *
 * Manages proposal generation and iteration with enhanced error handling and debugging
 */

import { useState } from 'react';
import { distillContent, generateProposal, iterateProposal, OpenAIError } from '../services/openai';
import { readFileAsText } from '../utils/fileUtils';
import { countWords } from '../utils/markdown';
import { log } from '../utils/logger';

export function useProposal(apiKey, showToast) {
  const [proposalText, setProposalText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Store distilled content for debugging/reuse
  const [lastDistillation, setLastDistillation] = useState({
    fireflies: null,
    examples: null,
    supporting: null
  });

  // Update word count whenever proposal text changes
  const updateProposalText = (text) => {
    setProposalText(text);
    setWordCount(countWords(text));
  };

  // Handle errors with detailed logging and user-friendly messages
  const handleError = (error, step, originalContent = null) => {
    if (error instanceof OpenAIError) {
      log.error('Proposal', `${step} failed`, {
        statusCode: error.statusCode,
        errorType: error.errorType,
        message: error.message,
        isRateLimit: error.isRateLimitError,
        isAuth: error.isAuthError
      });

      // Provide specific guidance based on error type
      if (error.isRateLimitError) {
        showToast(`⚠️ Rate limit hit on ${step}. Using fallback (truncated content).`, 'warn');
        return { fallback: true, content: originalContent?.substring(0, 2000) || '' };
      } else if (error.isAuthError) {
        showToast(`🔐 Authentication failed on ${step}. Check your API key.`, 'error');
        return { fallback: false, content: null };
      } else {
        showToast(`❌ ${step} failed: ${error.message}`, 'error');
        return { fallback: true, content: originalContent?.substring(0, 2000) || '' };
      }
    } else {
      log.error('Proposal', `Unexpected error on ${step}`, {
        error: error.message,
        stack: error.stack
      });
      showToast(`❌ Unexpected error on ${step}: ${error.message}`, 'error');
      return { fallback: false, content: null };
    }
  };

  // Generate a new proposal
  const generate = async (firefliesFile, exampleFiles, supportingDocs, comments) => {
    if (!apiKey) {
      showToast('Please enter your OpenAI API key', 'error');
      return;
    }

    log.info('Workflow', 'Starting proposal generation workflow', {
      hasFireflies: !!firefliesFile,
      exampleCount: exampleFiles.length,
      docCount: supportingDocs.length,
      hasComments: !!comments
    });

    setIsGenerating(true);

    const distillation = {
      fireflies: '',
      examples: '',
      supporting: ''
    };

    let continueWorkflow = true;

    try {
      // Step 1: Distill Fireflies transcript
      if (firefliesFile && continueWorkflow) {
        showToast('Step 1/4: Analyzing meeting transcript...', 'success');
        try {
          const firefliesContent = await readFileAsText(firefliesFile);
          log.debug('Workflow', 'Read Fireflies file', {
            filename: firefliesFile.name,
            size: firefliesContent.length
          });

          distillation.fireflies = await distillContent(apiKey, firefliesContent, 'fireflies');

          log.info('Workflow', 'Step 1/4 completed: Fireflies distilled');
        } catch (error) {
          const result = handleError(error, 'Step 1 (Fireflies)', await readFileAsText(firefliesFile));
          if (result.fallback) {
            distillation.fireflies = result.content;
            log.warn('Workflow', 'Step 1/4 using fallback content');
          } else {
            continueWorkflow = false;
          }
        }
      }

      // Step 2: Distill example proposals
      if (exampleFiles.length > 0 && continueWorkflow) {
        showToast(`Step 2/4: Analyzing ${exampleFiles.length} example proposal(s)...`, 'success');
        try {
          const combinedExamples = exampleFiles.map(ex =>
            `Example: ${ex.name}\n\n${ex.content}`
          ).join('\n\n---\n\n');

          log.debug('Workflow', 'Combined examples', {
            count: exampleFiles.length,
            totalLength: combinedExamples.length
          });

          distillation.examples = await distillContent(apiKey, combinedExamples, 'examples');

          log.info('Workflow', 'Step 2/4 completed: Examples distilled');
        } catch (error) {
          const combinedExamples = exampleFiles.map(ex =>
            `Example: ${ex.name}\n\n${ex.content}`
          ).join('\n\n---\n\n');
          const result = handleError(error, 'Step 2 (Examples)', combinedExamples);
          if (result.fallback) {
            distillation.examples = result.content;
            log.warn('Workflow', 'Step 2/4 using fallback content');
          } else {
            continueWorkflow = false;
          }
        }
      }

      // Step 3: Distill supporting documents
      if (supportingDocs.length > 0 && continueWorkflow) {
        showToast(`Step 3/4: Analyzing ${supportingDocs.length} supporting document(s)...`, 'success');
        try {
          const combinedDocs = supportingDocs.map(doc =>
            `Document: ${doc.name}\n\n${doc.content}`
          ).join('\n\n---\n\n');

          log.debug('Workflow', 'Combined supporting docs', {
            count: supportingDocs.length,
            totalLength: combinedDocs.length
          });

          distillation.supporting = await distillContent(apiKey, combinedDocs, 'supporting');

          log.info('Workflow', 'Step 3/4 completed: Supporting docs distilled');
        } catch (error) {
          const combinedDocs = supportingDocs.map(doc =>
            `Document: ${doc.name}\n\n${doc.content}`
          ).join('\n\n---\n\n');
          const result = handleError(error, 'Step 3 (Supporting Docs)', combinedDocs);
          if (result.fallback) {
            distillation.supporting = result.content;
            log.warn('Workflow', 'Step 3/4 using fallback content');
          } else {
            continueWorkflow = false;
          }
        }
      }

      // Save distillation for debugging
      setLastDistillation(distillation);
      log.debug('Workflow', 'Distillation complete', {
        firefliesLength: distillation.fireflies.length,
        examplesLength: distillation.examples.length,
        supportingLength: distillation.supporting.length
      });

      // Step 4: Generate proposal with distilled content
      if (continueWorkflow) {
        showToast('Step 4/4: Generating your proposal...', 'success');

        const generatedText = await generateProposal(apiKey, {
          firefliesContent: distillation.fireflies,
          examples: distillation.examples ? [{ name: 'Style Guide', content: distillation.examples }] : [],
          supportingDocuments: distillation.supporting ? [{ name: 'Key Information', content: distillation.supporting }] : [],
          userComments: comments
        });

        updateProposalText(generatedText);
        log.info('Workflow', 'Proposal generation workflow completed successfully');
        showToast('✅ Proposal generated successfully!', 'success');
      } else {
        log.error('Workflow', 'Workflow stopped due to critical error');
        showToast('❌ Workflow stopped. Check console/logs for details.', 'error');
      }

    } catch (error) {
      log.error('Workflow', 'Fatal error in workflow', {
        error: error.message,
        stack: error.stack
      });
      showToast(`❌ Failed to generate: ${error.message}`, 'error');
    } finally {
      setIsGenerating(false);
      log.info('Workflow', 'Workflow ended', { success: continueWorkflow });
    }
  };

  // Iterate on existing proposal
  const iterate = async (iterationComment) => {
    if (!iterationComment.trim()) {
      showToast('Please add comments for iteration', 'error');
      return;
    }

    log.info('Iteration', 'Starting proposal iteration', {
      commentLength: iterationComment.length,
      proposalLength: proposalText.length
    });

    setIsGenerating(true);

    try {
      const updatedText = await iterateProposal(apiKey, proposalText, iterationComment);
      updateProposalText(updatedText);
      log.info('Iteration', 'Iteration completed successfully');
      showToast('✅ Proposal updated successfully!', 'success');
      return true; // Signal success
    } catch (error) {
      const result = handleError(error, 'Iteration');
      log.error('Iteration', 'Iteration failed', {
        error: error.message
      });
      showToast('❌ Failed to iterate proposal', 'error');
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    proposalText,
    setProposalText: updateProposalText,
    wordCount,
    isGenerating,
    generate,
    iterate,
    lastDistillation // Export for debugging
  };
}
