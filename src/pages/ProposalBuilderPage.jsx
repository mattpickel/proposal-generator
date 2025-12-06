/**
 * Proposal Builder Page
 *
 * Main workflow page for creating/editing proposals
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header, Toast } from '../components';
import { useToast } from '../hooks/useToast';
import { useProposalBuilder } from '../hooks/useProposalBuilder';
import { proposalInstances } from '../services/database';

export default function ProposalBuilderPage() {
  const { opportunityId } = useParams();
  const { toast, showToast } = useToast();
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENAI_API_KEY || '');
  const [isLoading, setIsLoading] = useState(true);
  const [workflowStep, setWorkflowStep] = useState('upload'); // upload, configure, generate, edit

  const builder = useProposalBuilder(apiKey, showToast);

  // Load or create proposal on mount
  useEffect(() => {
    async function loadOrCreate() {
      setIsLoading(true);
      try {
        // Try to load existing proposal
        const existing = await proposalInstances.getByOpportunityId(opportunityId);

        if (existing) {
          // Load existing proposal
          await builder.loadProposal(existing.id);

          // Determine workflow step based on proposal status
          if (existing.status === 'generated') {
            setWorkflowStep('edit');
          } else if (existing.status === 'draft' && existing.clientBriefId) {
            setWorkflowStep('configure');
          } else {
            setWorkflowStep('upload');
          }

          showToast('Proposal loaded', 'success');
        } else {
          // New proposal - start at upload step
          setWorkflowStep('upload');
          showToast(`Ready to create proposal for ${opportunityId}`, 'success');
        }
      } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
      } finally {
        setIsLoading(false);
      }
    }

    loadOrCreate();
  }, [opportunityId]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="app-container">
        <Header />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading proposal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header apiKey={apiKey} onApiKeyChange={setApiKey} />

      <main className="main-content">
        <div className="workflow-container">
          {/* Workflow Steps Indicator */}
          <div className="workflow-steps">
            <div className={`step ${workflowStep === 'upload' ? 'active' : ''} ${builder.clientBrief ? 'completed' : ''}`}>
              1. Upload Transcript
            </div>
            <div className={`step ${workflowStep === 'configure' ? 'active' : ''} ${builder.currentProposal ? 'completed' : ''}`}>
              2. Configure Services
            </div>
            <div className={`step ${workflowStep === 'generate' ? 'active' : ''} ${builder.currentProposal?.status === 'generated' ? 'completed' : ''}`}>
              3. Generate Proposal
            </div>
            <div className={`step ${workflowStep === 'edit' ? 'active' : ''}`}>
              4. Review & Edit
            </div>
          </div>

          {/* Step Content */}
          {workflowStep === 'upload' && (
            <UploadStep
              opportunityId={opportunityId}
              builder={builder}
              onComplete={() => setWorkflowStep('configure')}
            />
          )}

          {workflowStep === 'configure' && (
            <ConfigureStep
              opportunityId={opportunityId}
              builder={builder}
              onComplete={() => setWorkflowStep('generate')}
              onBack={() => setWorkflowStep('upload')}
            />
          )}

          {workflowStep === 'generate' && (
            <GenerateStep
              builder={builder}
              onComplete={() => setWorkflowStep('edit')}
              onBack={() => setWorkflowStep('configure')}
            />
          )}

          {workflowStep === 'edit' && (
            <EditStep
              builder={builder}
              onBack={() => setWorkflowStep('generate')}
            />
          )}
        </div>
      </main>

      <Toast toast={toast} />
    </div>
  );
}

/**
 * Step 1: Upload Transcript
 */
function UploadStep({ opportunityId, builder, onComplete }) {
  const [file, setFile] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    try {
      const brief = await builder.processTranscript(file);
      if (brief) {
        onComplete();
      }
    } catch (error) {
      console.error('Failed to process transcript:', error);
    }
  };

  return (
    <div className="step-content">
      <h2>Upload Fireflies Transcript</h2>
      <p>Upload a Fireflies transcript from your discovery call with {opportunityId}.</p>

      <div className="file-upload-area">
        <input
          type="file"
          accept=".txt,.docx"
          onChange={handleFileSelect}
          id="transcript-upload"
        />
        <label htmlFor="transcript-upload" className="upload-label">
          {file ? `📄 ${file.name}` : '📁 Choose File'}
        </label>
      </div>

      {file && (
        <button
          className="btn btn-primary"
          onClick={handleProcess}
          disabled={builder.isProcessing}
        >
          {builder.isProcessing ? 'Processing...' : 'Process Transcript'}
        </button>
      )}

      {builder.clientBrief && (
        <div className="brief-preview">
          <h3>Client Brief</h3>
          <p><strong>Client:</strong> {builder.clientBrief.clientName}</p>
          <p><strong>Industry:</strong> {builder.clientBrief.industry || 'Not specified'}</p>
          <p><strong>Goals:</strong> {builder.clientBrief.goals?.length || 0} identified</p>
          <p><strong>Pain Points:</strong> {builder.clientBrief.painPoints?.length || 0} identified</p>
        </div>
      )}
    </div>
  );
}

/**
 * Step 2: Configure Services
 */
function ConfigureStep({ opportunityId, builder, onComplete, onBack }) {
  const [businessName, setBusinessName] = useState(builder.clientBrief?.clientName || '');
  const [selectedServices, setSelectedServices] = useState(builder.suggestedServices || []);

  const serviceOptions = [
    { id: 'marketing_machine', label: 'Marketing Machine', price: '$7,500' },
    { id: 'internal_comms', label: 'Internal Communications', price: '$2,500' },
    { id: 'seo_hosting', label: 'SEO & Hosting', price: '$3,500' },
    { id: 'digital_upgrades', label: 'Digital Upgrades', price: '$5,000' },
    { id: '828_marketing', label: '828 Marketing (Monthly)', price: '$3,000/mo' },
    { id: 'fractional_cmo', label: 'Fractional CMO (Monthly)', price: '$5,000/mo' }
  ];

  const toggleService = (serviceId) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleCreate = async () => {
    if (!businessName.trim() || selectedServices.length === 0) return;

    try {
      const proposal = await builder.createProposal(
        opportunityId,
        builder.clientBrief.id,
        businessName,
        selectedServices
      );

      if (proposal) {
        onComplete();
      }
    } catch (error) {
      console.error('Failed to create proposal:', error);
    }
  };

  return (
    <div className="step-content">
      <h2>Configure Proposal</h2>

      <div className="form-group">
        <label htmlFor="businessName">Business Name:</label>
        <input
          id="businessName"
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Client's business name"
        />
      </div>

      <div className="form-group">
        <label>Select Services:</label>
        <div className="service-selection">
          {serviceOptions.map(service => (
            <label key={service.id} className="service-option">
              <input
                type="checkbox"
                checked={selectedServices.includes(service.id)}
                onChange={() => toggleService(service.id)}
              />
              <span className="service-label">{service.label}</span>
              <span className="service-price">{service.price}</span>
            </label>
          ))}
        </div>
      </div>

      {builder.suggestedServices.length > 0 && (
        <p className="suggested-hint">
          ✨ Services suggested based on transcript are pre-selected
        </p>
      )}

      <div className="button-group">
        <button className="btn btn-secondary" onClick={onBack}>
          Back
        </button>
        <button
          className="btn btn-primary"
          onClick={handleCreate}
          disabled={!businessName.trim() || selectedServices.length === 0 || builder.isProcessing}
        >
          {builder.isProcessing ? 'Creating...' : 'Create Proposal'}
        </button>
      </div>
    </div>
  );
}

/**
 * Step 3: Generate Proposal
 */
function GenerateStep({ builder, onComplete, onBack }) {
  const handleGenerate = async () => {
    try {
      await builder.generateProposal(builder.currentProposal.id);
      onComplete();
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  return (
    <div className="step-content">
      <h2>Generate Proposal Sections</h2>

      {builder.currentProposal && (
        <div className="proposal-info">
          <p><strong>Proposal:</strong> {builder.currentProposal.proposalName}</p>
          <p><strong>Services:</strong> {builder.currentProposal.serviceIds.length} selected</p>
        </div>
      )}

      {builder.generationProgress && (
        <div className="generation-progress">
          <h3>Generating...</h3>
          <p>{builder.generationProgress.sectionTitle}</p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(builder.generationProgress.current / builder.generationProgress.total) * 100}%` }}
            />
          </div>
          <p>{builder.generationProgress.current} of {builder.generationProgress.total} sections</p>
        </div>
      )}

      {!builder.generationProgress && (
        <div className="button-group">
          <button className="btn btn-secondary" onClick={onBack}>
            Back
          </button>
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={builder.isProcessing}
          >
            Generate All Sections
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Step 4: Edit Proposal
 */
function EditStep({ builder }) {
  return (
    <div className="step-content">
      <h2>Review & Edit Proposal</h2>
      <p>Proposal editing interface coming soon...</p>
      <p>Current status: {builder.currentProposal?.status}</p>
    </div>
  );
}
