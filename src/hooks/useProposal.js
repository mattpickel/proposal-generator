/**
 * useProposal Hook
 *
 * Manages proposal generation and iteration
 */

import { useState } from 'react';
import { distillContent, generateProposal, iterateProposal } from '../services/openai';
import { readFileAsText } from '../utils/fileUtils';
import { countWords } from '../utils/markdown';

export function useProposal(apiKey, showToast) {
  const [proposalText, setProposalText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Update word count whenever proposal text changes
  const updateProposalText = (text) => {
    setProposalText(text);
    setWordCount(countWords(text));
  };

  // Generate a new proposal
  const generate = async (firefliesFile, exampleFiles, supportingDocs, comments) => {
    if (!apiKey) {
      showToast('Please enter your OpenAI API key', 'error');
      return;
    }

    setIsGenerating(true);

    try {
      // Step 1: Distill Fireflies transcript
      let distilledFireflies = '';
      if (firefliesFile) {
        showToast('Step 1/4: Analyzing meeting transcript...', 'success');
        const firefliesContent = await readFileAsText(firefliesFile);
        distilledFireflies = await distillContent(apiKey, firefliesContent, 'fireflies');
      }

      // Step 2: Distill example proposals
      let distilledExamples = '';
      if (exampleFiles.length > 0) {
        showToast(`Step 2/4: Analyzing ${exampleFiles.length} example proposal(s)...`, 'success');
        const combinedExamples = exampleFiles.map(ex =>
          `Example: ${ex.name}\n\n${ex.content}`
        ).join('\n\n---\n\n');
        distilledExamples = await distillContent(apiKey, combinedExamples, 'examples');
      }

      // Step 3: Distill supporting documents
      let distilledDocs = '';
      if (supportingDocs.length > 0) {
        showToast(`Step 3/4: Analyzing ${supportingDocs.length} supporting document(s)...`, 'success');
        const combinedDocs = supportingDocs.map(doc =>
          `Document: ${doc.name}\n\n${doc.content}`
        ).join('\n\n---\n\n');
        distilledDocs = await distillContent(apiKey, combinedDocs, 'supporting');
      }

      // Step 4: Generate proposal with distilled content
      showToast('Step 4/4: Generating your proposal...', 'success');

      const generatedText = await generateProposal(apiKey, {
        firefliesContent: distilledFireflies,
        examples: distilledExamples ? [{ name: 'Style Guide', content: distilledExamples }] : [],
        supportingDocuments: distilledDocs ? [{ name: 'Key Information', content: distilledDocs }] : [],
        userComments: comments
      });

      updateProposalText(generatedText);
      showToast('Proposal generated successfully!', 'success');

    } catch (error) {
      console.error('Error:', error);
      showToast(`Failed to generate: ${error.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Iterate on existing proposal
  const iterate = async (iterationComment) => {
    if (!iterationComment.trim()) {
      showToast('Please add comments for iteration', 'error');
      return;
    }

    setIsGenerating(true);

    try {
      const updatedText = await iterateProposal(apiKey, proposalText, iterationComment);
      updateProposalText(updatedText);
      showToast('Proposal updated successfully!', 'success');
      return true; // Signal success
    } catch (error) {
      console.error('Error:', error);
      showToast('Failed to iterate proposal', 'error');
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
    iterate
  };
}
