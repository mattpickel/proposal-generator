/**
 * Proposal Builder Page - Modern Redesigned Interface
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header, Toast, ProposalEditor } from '../components';
import { useToast } from '../hooks/useToast';
import { useProposalBuilder } from '../hooks/useProposalBuilder';
import api from '../services/api';

export default function ProposalBuilderPage() {
  const { opportunityId } = useParams();
  const { toast, showToast } = useToast();
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [customPrompt, setCustomPrompt] = useState('');

  // File state
  const [transcriptFile, setTranscriptFile] = useState(null);
  const [supportingDocs, setSupportingDocs] = useState([]);

  // Generated sections
  const [generatedSections, setGeneratedSections] = useState([]);
  const [fullProposalText, setFullProposalText] = useState('');

  const builder = useProposalBuilder(apiKey, showToast);

  const serviceOptions = [
    { id: 'marketing_machine', label: 'Marketing Machine', price: '$7,500' },
    { id: 'internal_comms', label: 'Internal Communications', price: '$2,500' },
    { id: 'seo_hosting', label: 'SEO & Hosting', price: '$3,500' },
    { id: 'digital_upgrades', label: 'Digital Upgrades', price: '$5,000' },
    { id: '828_marketing', label: '828 Marketing (Monthly)', price: '$3,000/mo' },
    { id: 'fractional_cmo', label: 'Fractional CMO (Monthly)', price: '$5,000/mo' }
  ];

  // Load existing proposal on mount
  useEffect(() => {
    async function loadExisting() {
      setIsLoading(true);
      try {
        const existingArray = await api.database.proposals.getByOpportunityId(opportunityId);
        const existing = existingArray && existingArray.length > 0 ? existingArray[0] : null;

        if (existing) {
          await builder.loadProposal(existing.id);
          setBusinessName(existing.proposalName?.split(' - ')[1]?.replace(' Marketing Proposal', '') || '');
          setSelectedServices(existing.serviceIds || []);

          // Load generated sections
          const sections = await api.database.sections.getByProposalId(existing.id);
          setGeneratedSections(sections || []);

          // Combine sections into full text
          if (sections && sections.length > 0) {
            const combined = sections
              .sort((a, b) => a.sectionId.localeCompare(b.sectionId))
              .map(s => s.content)
              .join('\n\n---\n\n');
            setFullProposalText(combined);
          }

          showToast('Proposal loaded', 'success');
        } else {
          showToast(`Ready to create proposal for ${opportunityId}`, 'success');
        }
      } catch (error) {
        console.error('Error loading proposal:', error);
        showToast(`Error: ${error.message}`, 'error');
      } finally {
        setIsLoading(false);
      }
    }

    loadExisting();
  }, [opportunityId]);

  // Auto-populate business name from client brief
  useEffect(() => {
    if (builder.clientBrief?.clientName && !businessName) {
      setBusinessName(builder.clientBrief.clientName);
    }
  }, [builder.clientBrief]);

  // Auto-select suggested services
  useEffect(() => {
    if (builder.suggestedServices?.length > 0 && selectedServices.length === 0) {
      setSelectedServices(builder.suggestedServices);
    }
  }, [builder.suggestedServices]);

  const handleTranscriptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTranscriptFile(file);

    try {
      await builder.processTranscript(file);
    } catch (error) {
      console.error('Failed to process transcript:', error);
    }
  };

  const handleSupportingDocUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSupportingDocs(prev => [...prev, ...files]);
    showToast(`Added ${files.length} supporting document(s)`, 'success');
  };

  const removeSupportingDoc = (index) => {
    setSupportingDocs(prev => prev.filter((_, i) => i !== index));
  };

  const toggleService = (serviceId) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleGenerate = async () => {
    if (!businessName.trim() || selectedServices.length === 0) {
      showToast('Please enter business name and select at least one service', 'error');
      return;
    }

    try {
      // Create proposal if it doesn't exist
      let proposalId = builder.currentProposal?.id;

      if (!proposalId) {
        const clientBriefId = builder.clientBrief?.id || 'manual_entry';
        const proposal = await builder.createProposal(
          opportunityId,
          clientBriefId,
          businessName,
          selectedServices
        );
        proposalId = proposal.id;
      }

      // Generate all sections
      const sections = await builder.generateProposal(proposalId);
      setGeneratedSections(sections || []);

      // Combine sections into full text
      if (sections && sections.length > 0) {
        const combined = sections
          .sort((a, b) => a.sectionId.localeCompare(b.sectionId))
          .map(s => s.content)
          .join('\n\n---\n\n');
        setFullProposalText(combined);
      }

    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  const handleReviseSection = async (sectionId) => {
    const comment = prompt('Enter revision instructions:');
    if (!comment) return;

    try {
      const section = generatedSections.find(s => s.sectionId === sectionId);
      if (!section) return;

      const revised = await builder.reviseProposalSection(section.id, comment);

      // Update the section in the list
      const updatedSections = generatedSections.map(s => s.id === section.id ? revised : s);
      setGeneratedSections(updatedSections);

      // Update full text
      const combined = updatedSections
        .sort((a, b) => a.sectionId.localeCompare(b.sectionId))
        .map(s => s.content)
        .join('\n\n---\n\n');
      setFullProposalText(combined);
    } catch (error) {
      console.error('Revision failed:', error);
    }
  };

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
      <Header />

      <main className="builder-main">
        <div className="builder-header">
          <h1 className="builder-title">Proposal Builder</h1>
          <div className="opportunity-badge">{opportunityId}</div>
        </div>

        <div className="builder-layout">
          {/* Left Column - Configuration */}
          <div className="builder-sidebar">

            {/* Transcript Upload Card */}
            <div className="builder-card">
              <div className="card-icon">📝</div>
              <h3 className="card-title">Meeting Transcript</h3>
              <p className="card-description">Upload Fireflies transcript to auto-extract client info</p>

              <div className="upload-area">
                <input
                  type="file"
                  accept=".txt,.docx"
                  onChange={handleTranscriptUpload}
                  id="transcript-upload"
                  style={{ display: 'none' }}
                />
                <label htmlFor="transcript-upload" className="upload-button">
                  {transcriptFile ? `✓ ${transcriptFile.name}` : '+ Upload Transcript'}
                </label>
              </div>

              {builder.clientBrief && (
                <div className="info-box success">
                  <strong>✓ Brief Extracted</strong>
                  <p>{builder.clientBrief.clientName} • {builder.clientBrief.industry}</p>
                </div>
              )}
            </div>

            {/* Client Info Card */}
            <div className="builder-card">
              <div className="card-icon">🏢</div>
              <h3 className="card-title">Client Information</h3>

              <div className="form-field">
                <label>Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter client business name"
                  className="text-input"
                />
              </div>
            </div>

            {/* Services Card */}
            <div className="builder-card">
              <div className="card-icon">⚙️</div>
              <h3 className="card-title">Select Services</h3>

              <div className="services-list">
                {serviceOptions.map(service => (
                  <label key={service.id} className="service-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.id)}
                      onChange={() => toggleService(service.id)}
                    />
                    <div className="service-details">
                      <span className="service-name">{service.label}</span>
                      <span className="service-pricing">{service.price}</span>
                    </div>
                  </label>
                ))}
              </div>

              {builder.suggestedServices.length > 0 && (
                <div className="info-box">
                  ✨ Services pre-selected based on transcript
                </div>
              )}
            </div>

            {/* Custom Instructions Card */}
            <div className="builder-card">
              <div className="card-icon">✏️</div>
              <h3 className="card-title">Custom Instructions</h3>
              <p className="card-description">Optional: Add specific requirements or focus areas</p>

              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., 'Focus on ROI metrics', 'Use casual tone', 'Emphasize quick wins'"
                className="text-area"
                rows={4}
              />
            </div>

            {/* Supporting Documents Card */}
            <div className="builder-card">
              <div className="card-icon">📎</div>
              <h3 className="card-title">Supporting Documents</h3>
              <p className="card-description">Brand guidelines, existing materials, etc.</p>

              <div className="upload-area">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.txt,.docx"
                  onChange={handleSupportingDocUpload}
                  id="supporting-docs"
                  style={{ display: 'none' }}
                />
                <label htmlFor="supporting-docs" className="upload-button">
                  + Add Documents
                </label>
              </div>

              {supportingDocs.length > 0 && (
                <div className="file-list">
                  {supportingDocs.map((file, index) => (
                    <div key={index} className="file-item">
                      <span className="file-name">📄 {file.name}</span>
                      <button
                        className="remove-btn"
                        onClick={() => removeSupportingDoc(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              className="generate-btn"
              onClick={handleGenerate}
              disabled={builder.isProcessing || !businessName.trim() || selectedServices.length === 0}
            >
              {builder.isProcessing ? '⏳ Generating...' : '🚀 Generate Proposal'}
            </button>

            {builder.generationProgress && (
              <div className="progress-card">
                <p className="progress-label">{builder.generationProgress.sectionTitle}</p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${(builder.generationProgress.current / builder.generationProgress.total) * 100}%` }}
                  />
                </div>
                <p className="progress-text">
                  {builder.generationProgress.current} of {builder.generationProgress.total} sections
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Generated Proposal */}
          <div className="builder-content">
            {generatedSections.length > 0 ? (
              <ProposalEditor
                proposalText={fullProposalText}
                onProposalChange={setFullProposalText}
                wordCount={fullProposalText.split(/\s+/).length}
                isGenerating={builder.isProcessing}
                onIterate={async (feedback) => {
                  // Handle iteration
                  showToast('Iteration feature coming soon!', 'info');
                }}
              />
            ) : (
              <div className="empty-proposal">
                <div className="empty-icon">📄</div>
                <h2>No Proposal Yet</h2>
                <p>Fill in the client information and select services, then click Generate Proposal to begin.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Toast toast={toast} />
    </div>
  );
}
