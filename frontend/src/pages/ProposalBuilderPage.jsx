/**
 * Proposal Builder Page - Unified Single-Page Interface
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header, Toast } from '../components';
import { useToast } from '../hooks/useToast';
import { useProposalBuilder } from '../hooks/useProposalBuilder';
import api from '../services/api';

export default function ProposalBuilderPage() {
  const { opportunityId } = useParams();
  const { toast, showToast } = useToast();
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENAI_API_KEY || '');
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
      setGeneratedSections(prev =>
        prev.map(s => s.id === section.id ? revised : s)
      );
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
      <Header apiKey={apiKey} onApiKeyChange={setApiKey} />

      <main className="main-content">
        <div className="unified-builder">
          <h1>Proposal Builder: {opportunityId}</h1>

          {/* Section 1: Meeting Minutes / Transcript */}
          <section className="builder-section">
            <h2>📝 Meeting Minutes / Transcript</h2>
            <p className="section-description">Upload Fireflies transcript or meeting notes to auto-extract client information</p>

            <div className="file-upload-area">
              <input
                type="file"
                accept=".txt,.docx"
                onChange={handleTranscriptUpload}
                id="transcript-upload"
                style={{ display: 'none' }}
              />
              <label htmlFor="transcript-upload" className="upload-btn">
                {transcriptFile ? `📄 ${transcriptFile.name}` : '📁 Upload Transcript'}
              </label>
            </div>

            {builder.clientBrief && (
              <div className="brief-preview">
                <h3>✅ Client Brief Extracted</h3>
                <div className="brief-details">
                  <p><strong>Client:</strong> {builder.clientBrief.clientName}</p>
                  <p><strong>Industry:</strong> {builder.clientBrief.industry || 'Not specified'}</p>
                  <p><strong>Goals:</strong> {builder.clientBrief.goals?.join(', ') || 'None specified'}</p>
                  <p><strong>Pain Points:</strong> {builder.clientBrief.painPoints?.join(', ') || 'None specified'}</p>
                </div>
              </div>
            )}
          </section>

          {/* Section 2: Supporting Documents */}
          <section className="builder-section">
            <h2>📎 Supporting Documents</h2>
            <p className="section-description">Add brand guidelines, existing materials, or reference documents</p>

            <div className="file-upload-area">
              <input
                type="file"
                multiple
                accept=".pdf,.txt,.docx"
                onChange={handleSupportingDocUpload}
                id="supporting-docs-upload"
                style={{ display: 'none' }}
              />
              <label htmlFor="supporting-docs-upload" className="upload-btn">
                📁 Add Supporting Documents
              </label>
            </div>

            {supportingDocs.length > 0 && (
              <div className="file-list">
                {supportingDocs.map((file, index) => (
                  <div key={index} className="file-item">
                    <span>📄 {file.name}</span>
                    <button
                      className="btn-remove"
                      onClick={() => removeSupportingDoc(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 3: Proposal Examples (placeholder for future) */}
          <section className="builder-section">
            <h2>💡 Proposal Examples</h2>
            <p className="section-description">Reference examples are managed in the database (coming soon: upload UI)</p>
            <p className="info-text">Currently using pre-seeded section exemplars from database</p>
          </section>

          {/* Section 4: Client Information & Services */}
          <section className="builder-section">
            <h2>🏢 Client Information & Services</h2>

            <div className="form-group">
              <label htmlFor="businessName">Business Name:</label>
              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter client's business name"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Select Services:</label>
              <div className="service-grid">
                {serviceOptions.map(service => (
                  <label key={service.id} className="service-card">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.id)}
                      onChange={() => toggleService(service.id)}
                    />
                    <div className="service-info">
                      <span className="service-label">{service.label}</span>
                      <span className="service-price">{service.price}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {builder.suggestedServices.length > 0 && (
              <p className="suggested-hint">
                ✨ Services suggested based on transcript are pre-selected
              </p>
            )}
          </section>

          {/* Section 5: Custom Prompting */}
          <section className="builder-section">
            <h2>✏️ Custom Instructions</h2>
            <p className="section-description">Add any specific requests or instructions for the AI to consider</p>

            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., 'Emphasize ROI and data-driven approach', 'Use casual, friendly tone', 'Focus on quick wins in first 90 days'"
              className="custom-prompt-textarea"
              rows={4}
            />
          </section>

          {/* Section 6: Generate Button */}
          <section className="builder-section">
            <button
              className="btn btn-primary btn-large"
              onClick={handleGenerate}
              disabled={builder.isProcessing || !businessName.trim() || selectedServices.length === 0}
            >
              {builder.isProcessing ? '⏳ Generating Proposal...' : '🚀 Generate Proposal'}
            </button>

            {builder.generationProgress && (
              <div className="generation-progress">
                <h3>Generating Sections...</h3>
                <p className="progress-section-title">{builder.generationProgress.sectionTitle}</p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${(builder.generationProgress.current / builder.generationProgress.total) * 100}%` }}
                  />
                </div>
                <p className="progress-text">
                  Section {builder.generationProgress.current} of {builder.generationProgress.total}
                </p>
              </div>
            )}
          </section>

          {/* Section 7: Generated Proposal */}
          {generatedSections.length > 0 && (
            <section className="builder-section generated-proposal">
              <h2>📄 Generated Proposal</h2>

              <div className="sections-list">
                {generatedSections
                  .sort((a, b) => a.sectionId.localeCompare(b.sectionId))
                  .map((section) => (
                    <div key={section.id} className="proposal-section">
                      <div className="section-header">
                        <h3>{section.sectionId.replace(/_/g, ' ').toUpperCase()}</h3>
                        <button
                          className="btn btn-small btn-secondary"
                          onClick={() => handleReviseSection(section.sectionId)}
                          disabled={builder.isProcessing}
                        >
                          ✏️ Revise
                        </button>
                      </div>
                      <div className="section-content">
                        <pre>{section.content}</pre>
                      </div>
                      {section.version > 1 && (
                        <p className="version-info">Version {section.version}</p>
                      )}
                    </div>
                  ))}
              </div>

              <div className="export-actions">
                <button className="btn btn-secondary">
                  📥 Export as Word
                </button>
                <button className="btn btn-secondary">
                  📥 Export as Markdown
                </button>
              </div>
            </section>
          )}
        </div>
      </main>

      <Toast toast={toast} />
    </div>
  );
}
