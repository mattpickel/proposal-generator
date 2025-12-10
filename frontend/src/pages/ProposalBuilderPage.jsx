/**
 * Proposal Builder Page - Modern Redesigned Interface
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header, Toast, ProposalEditor, VoiceMemoButton } from '../components';
import { useToast } from '../hooks/useToast';
import { useProposalBuilder } from '../hooks/useProposalBuilder';
import { useGoogleDrive } from '../hooks/useGoogleDrive';
import api from '../services/api';

export default function ProposalBuilderPage() {
  const { opportunityId } = useParams();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [clientName, setClientName] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [customPrompt, setCustomPrompt] = useState('');

  // File state
  const [transcriptFile, setTranscriptFile] = useState(null);
  const [isAnalyzingTranscript, setIsAnalyzingTranscript] = useState(false);
  const [supportingDocs, setSupportingDocs] = useState([]);
  const [processedDocs, setProcessedDocs] = useState([]); // { file, summary, status }
  const [isAnalyzingSupportingDocs, setIsAnalyzingSupportingDocs] = useState(false);

  // Generated proposal (unified format)
  const [generatedSections, setGeneratedSections] = useState([]); // Legacy support
  const [fullProposalText, setFullProposalText] = useState('');
  const [serviceDescriptions, setServiceDescriptions] = useState([]);

  const builder = useProposalBuilder(apiKey, showToast);
  const googleDrive = useGoogleDrive();

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

          // Load service descriptions from proposal instance
          if (existing.serviceDescriptions && existing.serviceDescriptions.length > 0) {
            setServiceDescriptions(existing.serviceDescriptions);
          }

          // Load generated sections
          const sections = await api.database.sections.getByProposalId(existing.id);
          setGeneratedSections(sections || []);

          // Handle unified format vs legacy sections
          if (sections && sections.length > 0) {
            // Check if this is a unified proposal (single section with sectionId 'unified_proposal')
            const unifiedSection = sections.find(s => s.sectionId === 'unified_proposal');

            if (unifiedSection) {
              // New unified format
              setFullProposalText(unifiedSection.content);
              // Service descriptions already loaded from proposal instance above
            } else {
              // Legacy format - combine multiple sections
              const combined = sections
                .sort((a, b) => a.sectionId.localeCompare(b.sectionId))
                .map(s => s.content)
                .join('\n\n---\n\n');
              setFullProposalText(combined);
            }
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

  const handleTranscriptUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTranscriptFile(file);
  };

  const handleAnalyzeTranscript = async () => {
    if (!transcriptFile) return;

    setIsAnalyzingTranscript(true);
    try {
      await builder.processTranscript(transcriptFile);
    } catch (error) {
      console.error('Failed to process transcript:', error);
    } finally {
      setIsAnalyzingTranscript(false);
    }
  };

  const handleSupportingDocUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setSupportingDocs(prev => [...prev, ...files]);
  };

  const handleAnalyzeSupportingDocs = async () => {
    if (supportingDocs.length === 0) return;

    // Filter out already processed docs
    const unprocessedDocs = supportingDocs.filter(
      file => !processedDocs.find(d => d.file === file && d.status === 'complete')
    );

    if (unprocessedDocs.length === 0) {
      showToast('All documents already analyzed', 'info');
      return;
    }

    setIsAnalyzingSupportingDocs(true);
    try {
      for (const file of unprocessedDocs) {
        setProcessedDocs(prev => [...prev.filter(d => d.file !== file), { file, status: 'processing', summary: null }]);

        if (builder.currentProposal?.id) {
          try {
            const doc = await builder.processSupportingDocument(file, builder.currentProposal.id);
            setProcessedDocs(prev => prev.map(d =>
              d.file === file ? { ...d, status: 'complete', summary: doc.processedSummary } : d
            ));
          } catch (error) {
            setProcessedDocs(prev => prev.map(d =>
              d.file === file ? { ...d, status: 'error' } : d
            ));
          }
        } else {
          // Mark as pending if no proposal yet
          setProcessedDocs(prev => prev.map(d =>
            d.file === file ? { ...d, status: 'pending', summary: 'Will process after creating proposal' } : d
          ));
        }
      }
    } finally {
      setIsAnalyzingSupportingDocs(false);
    }
  };

  const removeSupportingDoc = (index) => {
    setSupportingDocs(prev => prev.filter((_, i) => i !== index));
  };

  // Google Drive: Handle transcript from Drive
  const handleTranscriptFromDrive = async () => {
    try {
      await googleDrive.pickFiles('Select transcript from Drive', async (files) => {
        if (files.length > 0) {
          const file = files[0];
          const blob = new Blob([file.content], { type: 'text/plain' });
          const fileObj = new File([blob], file.name, { type: 'text/plain' });
          setTranscriptFile(fileObj);
        }
      });
    } catch (error) {
      console.error('Failed to load transcript from Drive:', error);
      showToast('Failed to load transcript from Drive', 'error');
    }
  };

  // Google Drive: Handle supporting docs from Drive
  const handleSupportingDocsFromDrive = async () => {
    try {
      await googleDrive.pickFiles('Select supporting documents from Drive', async (files) => {
        const fileObjects = files.map(f => {
          const blob = new Blob([f.content], { type: 'text/plain' });
          return new File([blob], f.name, { type: 'text/plain' });
        });
        setSupportingDocs(prev => [...prev, ...fileObjects]);
      });
    } catch (error) {
      console.error('Failed to load documents from Drive:', error);
      showToast('Failed to load documents from Drive', 'error');
    }
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

      // Build proposal metadata from custom prompt if provided
      const proposalMetadata = customPrompt ? {
        highLevelObjective: customPrompt
      } : {};

      // Generate unified proposal
      const result = await builder.generateProposal(proposalId, proposalMetadata);

      // Handle new unified format
      if (result.proposalBody) {
        setFullProposalText(result.proposalBody);
        setServiceDescriptions(result.serviceDescriptions || []);
        // Clear legacy sections
        setGeneratedSections([]);
      } else if (result && Array.isArray(result)) {
        // Legacy format (array of sections) - for backwards compatibility
        setGeneratedSections(result);
        const combined = result
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
          <div className="builder-header-right">
            <div className="opportunity-badge">{opportunityId}</div>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              + New Proposal
            </button>
          </div>
        </div>

        <div className="builder-layout">
          {/* Left Column - Configuration */}
          <div className="builder-sidebar">

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

              <div className="form-field">
                <label>Client Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client contact name"
                  className="text-input"
                />
              </div>
            </div>

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

                {/* Google Drive Integration */}
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {!googleDrive.isSignedIn ? (
                    <button
                      onClick={googleDrive.signIn}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%' }}
                    >
                      <span style={{ marginRight: '0.5rem' }}>📁</span>
                      Sign in to Google Drive
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleTranscriptFromDrive}
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%' }}
                      >
                        <span style={{ marginRight: '0.5rem' }}>📁</span>
                        Select from Google Drive
                      </button>
                      <button
                        onClick={googleDrive.signOut}
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem' }}
                      >
                        Sign out
                      </button>
                    </>
                  )}
                </div>

                {/* Analyze Button */}
                {transcriptFile && (
                  <div style={{ marginTop: '1rem' }}>
                    {isAnalyzingTranscript ? (
                      <div className="analyze-loading">
                        <div className="spinner-small"></div>
                        <span>Analyzing transcript...</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleAnalyzeTranscript}
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%' }}
                      >
                        {builder.clientBrief ? 'Re-analyze Transcript' : 'Analyze Transcript'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {builder.clientBrief && (
                <div style={{ marginTop: '1rem' }}>
                  <div className="info-box success">
                    <strong>✓ Brief Extracted</strong>
                    <div style={{ fontSize: '0.95rem', marginTop: '0.5rem' }}>
                      <div><strong>{builder.clientBrief.clientName}</strong></div>
                      {builder.clientBrief.industry && <div>{builder.clientBrief.industry}</div>}
                      {builder.clientBrief.location && <div>📍 {builder.clientBrief.location}</div>}
                    </div>
                  </div>

                  {/* Goals */}
                  {builder.clientBrief.goals && builder.clientBrief.goals.length > 0 && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#0f172a' }}>Goals:</div>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#475569' }}>
                        {builder.clientBrief.goals.slice(0, 3).map((goal, i) => (
                          <li key={i} style={{ marginBottom: '0.25rem' }}>{goal}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Pain Points */}
                  {builder.clientBrief.painPoints && builder.clientBrief.painPoints.length > 0 && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#0f172a' }}>Challenges:</div>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#475569' }}>
                        {builder.clientBrief.painPoints.slice(0, 3).map((pain, i) => (
                          <li key={i} style={{ marginBottom: '0.25rem' }}>{pain}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
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

              <div className="text-input-with-voice">
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g., 'Focus on ROI metrics', 'Use casual tone', 'Emphasize quick wins'"
                  className="text-area"
                  rows={4}
                />
                <VoiceMemoButton
                  onTranscript={(text) => setCustomPrompt(prev => prev ? `${prev}\n${text}` : text)}
                  disabled={builder.isProcessing}
                />
              </div>
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

                {/* Google Drive Integration */}
                {googleDrive.isSignedIn && (
                  <div style={{ marginTop: '1rem' }}>
                    <button
                      onClick={handleSupportingDocsFromDrive}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%' }}
                    >
                      <span style={{ marginRight: '0.5rem' }}>📁</span>
                      Select from Google Drive
                    </button>
                  </div>
                )}
              </div>

              {supportingDocs.length > 0 && (
                <>
                  <div className="file-list">
                    {supportingDocs.map((file, index) => {
                      const processed = processedDocs.find(d => d.file === file);
                      // Parse summary if it's a JSON string
                      let summaryData = null;
                      if (processed?.summary) {
                        try {
                          summaryData = typeof processed.summary === 'string'
                            ? JSON.parse(processed.summary)
                            : processed.summary;
                        } catch {
                          summaryData = { keyPoints: [processed.summary] };
                        }
                      }
                      return (
                        <div key={index} className="file-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="file-name" style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              minWidth: 0,
                              flex: 1
                            }}>
                              📄 {file.name}
                              {processed?.status === 'processing' && ' ⏳'}
                              {processed?.status === 'complete' && ' ✓'}
                              {processed?.status === 'pending' && ' ⏸'}
                              {processed?.status === 'error' && ' ❌'}
                            </span>
                            <button
                              className="remove-btn"
                              onClick={() => removeSupportingDoc(index)}
                              style={{ flexShrink: 0 }}
                            >
                              ×
                            </button>
                          </div>
                          {summaryData && (
                            <div style={{
                              marginTop: '0.5rem',
                              fontSize: '0.85rem',
                              color: '#64748b',
                              lineHeight: '1.4',
                              paddingLeft: '1.5rem',
                              width: '100%'
                            }}>
                              {summaryData.keyPoints && summaryData.keyPoints.length > 0 && (
                                <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                                  {summaryData.keyPoints.slice(0, 3).map((point, i) => (
                                    <li key={i} style={{ marginBottom: '0.25rem' }}>{point}</li>
                                  ))}
                                </ul>
                              )}
                              {summaryData.uniqueValue && (
                                <div style={{ marginTop: '0.25rem', fontStyle: 'italic' }}>
                                  {summaryData.uniqueValue}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Analyze Button */}
                  <div style={{ marginTop: '1rem' }}>
                    {isAnalyzingSupportingDocs ? (
                      <div className="analyze-loading">
                        <div className="spinner-small"></div>
                        <span>Analyzing documents...</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleAnalyzeSupportingDocs}
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%' }}
                        disabled={supportingDocs.every(file =>
                          processedDocs.find(d => d.file === file && d.status === 'complete')
                        )}
                      >
                        Analyze Documents
                      </button>
                    )}
                  </div>
                </>
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
            {fullProposalText ? (
              <>
                <ProposalEditor
                  proposalText={fullProposalText}
                  onProposalChange={setFullProposalText}
                  wordCount={fullProposalText.split(/\s+/).length}
                  isGenerating={builder.isProcessing}
                  onIterate={async (feedback) => {
                    try {
                      showToast('Updating proposal...', 'info');
                      const result = await api.generation.iterateProposal(apiKey, fullProposalText, feedback);
                      if (result.proposal) {
                        setFullProposalText(result.proposal);
                        showToast('Proposal updated successfully!', 'success');
                        return true;
                      }
                    } catch (error) {
                      showToast(`Failed to update proposal: ${error.message}`, 'error');
                    }
                    return false;
                  }}
                />
              </>
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
