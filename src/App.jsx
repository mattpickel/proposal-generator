/**
 * Main Application Component
 *
 * Refactored to use modular components and hooks
 */

import { useState } from 'react';
import './App.css';

// Components
import {
  Header,
  Toast,
  FirefliesUpload,
  FileList,
  CommentsInput,
  ProposalEditor
} from './components';

// Hooks
import { useLocalStorage } from './hooks/useLocalStorage';
import { useToast } from './hooks/useToast';
import { useGoogleDrive } from './hooks/useGoogleDrive';
import { useProposal } from './hooks/useProposal';
import { useFileManager } from './hooks/useFileManager';

// Constants
import { STORAGE_KEYS } from './config/constants';

function App() {
  // API Key
  const [apiKey] = useState(import.meta.env.VITE_OPENAI_API_KEY || '');

  // Toast notifications
  const { toast, showToast } = useToast();

  // Google Drive integration
  const googleDrive = useGoogleDrive();

  // File state
  const [firefliesFile, setFirefliesFile] = useState(null);
  const [exampleFiles, setExampleFiles] = useLocalStorage(STORAGE_KEYS.EXAMPLES);
  const [supportingDocs, setSupportingDocs] = useLocalStorage(STORAGE_KEYS.SUPPORTING_DOCS);
  const [comments, setComments] = useState('');

  // File managers
  const exampleManager = useFileManager(exampleFiles, setExampleFiles, showToast);
  const docsManager = useFileManager(supportingDocs, setSupportingDocs, showToast);

  // Proposal generation
  const proposal = useProposal(apiKey, showToast);

  // Fireflies file handlers
  const handleFirefliesSelect = (file) => {
    setFirefliesFile(file);
    showToast('File uploaded successfully', 'success');
  };

  const handleFirefliesRemove = () => {
    setFirefliesFile(null);
  };

  // Google Drive handlers
  const handleGoogleSignIn = () => {
    try {
      googleDrive.signIn();
      showToast('Signed in to Google Drive', 'success');
    } catch (error) {
      showToast('Failed to sign in', 'error');
    }
  };

  const handleGoogleSignOut = () => {
    googleDrive.signOut();
    showToast('Signed out from Google Drive', 'success');
  };

  const handlePickExamples = async () => {
    try {
      await googleDrive.pickFiles(
        'Select proposal examples from Drive',
        (files) => exampleManager.addFromDrive(files)
      );
    } catch (error) {
      showToast('Please sign in first', 'error');
    }
  };

  const handlePickDocs = async () => {
    try {
      await googleDrive.pickFiles(
        'Select supporting documents from Drive',
        (files) => docsManager.addFromDrive(files)
      );
    } catch (error) {
      showToast('Please sign in first', 'error');
    }
  };

  // Generate proposal
  const handleGenerate = () => {
    proposal.generate(firefliesFile, exampleFiles, supportingDocs, comments);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        isSignedIn={googleDrive.isSignedIn}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleGoogleSignOut}
      />

      {/* Main Content */}
      <main className="main-content">
        {/* Left Panel - Inputs */}
        <aside className="input-panel">
          {/* Fireflies Upload */}
          <FirefliesUpload
            file={firefliesFile}
            onFileSelect={handleFirefliesSelect}
            onFileRemove={handleFirefliesRemove}
          />

          {/* Example Proposals */}
          <FileList
            title="Example Proposals"
            icon="📚"
            files={exampleFiles}
            onAddFiles={exampleManager.addFiles}
            onAddFromDrive={handlePickExamples}
            onRemoveFile={exampleManager.removeFile}
            onClearAll={exampleManager.clearAll}
            emptyStateText="No example proposals yet"
            emptyStateSubtext="Click 📁 to upload from computer or Drive icon to select from Drive"
          />

          {/* Supporting Documents */}
          <FileList
            title="Supporting Documents"
            icon="📋"
            files={supportingDocs}
            onAddFiles={docsManager.addFiles}
            onAddFromDrive={handlePickDocs}
            onRemoveFile={docsManager.removeFile}
            onClearAll={docsManager.clearAll}
            emptyStateText="No supporting documents yet"
            emptyStateSubtext="Add meeting notes, brand guidelines, marketing plans, or other context"
          />

          {/* Comments */}
          <CommentsInput value={comments} onChange={setComments} />

          {/* Generate Button */}
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={proposal.isGenerating || !apiKey}
          >
            {proposal.isGenerating ? (
              <>
                <div className="spinner"></div>
                Generating...
              </>
            ) : (
              <>
                ✨ Generate Proposal
              </>
            )}
          </button>
        </aside>

        {/* Right Panel - Output */}
        <section className="output-panel">
          <ProposalEditor
            proposalText={proposal.proposalText}
            onProposalChange={proposal.setProposalText}
            wordCount={proposal.wordCount}
            isGenerating={proposal.isGenerating}
            onIterate={proposal.iterate}
          />
        </section>
      </main>

      {/* Toast Notification */}
      <Toast toast={toast} />
    </div>
  );
}

export default App;
