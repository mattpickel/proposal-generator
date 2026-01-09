/**
 * Proposal Builder Page - V2 JSON-First System
 *
 * This page implements the new JSON-first proposal system where:
 * - Proposals are stored as structured JSON
 * - AI only generates the "Comments from Marketing Lead" section
 * - Services are pulled from a library deterministically
 * - Rendering to HTML happens at the end for copy/paste to HighLevel
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Header,
  Toast,
  VoiceMemoButton,
  CommentsEditor,
  ServiceEditor,
  ProposalPreviewV2
} from '../components';
import { useToast } from '../hooks/useToast';
import { useProposalBuilder } from '../hooks/useProposalBuilder';
import { useProposalV2 } from '../hooks/useProposalV2';
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
  const [processedDocs, setProcessedDocs] = useState([]);
  const [isAnalyzingSupportingDocs, setIsAnalyzingSupportingDocs] = useState(false);

  // GHL import state
  const [isImportingFromGHL, setIsImportingFromGHL] = useState(false);
  const [ghlImportData, setGhlImportData] = useState(null);

  // View mode: 'edit' shows editors, 'preview' shows rendered HTML
  const [viewMode, setViewMode] = useState('edit');

  // Old builder hook (for transcript processing and client brief extraction)
  const builder = useProposalBuilder(apiKey, showToast);

  // New V2 proposal hook (for JSON-first proposal management)
  const proposalV2 = useProposalV2(apiKey, showToast);

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
        // First try to load V2 proposal
        const v2Proposal = await proposalV2.loadProposal(opportunityId);

        if (v2Proposal) {
          // V2 proposal found
          setBusinessName(v2Proposal.cover?.forClientOrg || '');
          setClientName(v2Proposal.cover?.forClientName || '');
          setSelectedServices(v2Proposal.services?.map(s => s.serviceKey) || []);

          // Load client brief if available
          if (v2Proposal.clientBriefId && v2Proposal.clientBriefId !== 'manual_entry') {
            try {
              const brief = await api.database.clientBriefs.get(v2Proposal.clientBriefId);
              if (brief) {
                builder.clientBrief = brief;
              }
            } catch {
              // Client brief not found, that's ok
            }
          }

          showToast('V2 Proposal loaded', 'success');
        } else {
          // No V2 proposal, check for legacy proposal
          const existingArray = await api.database.proposals.getByOpportunityId(opportunityId);
          const existing = existingArray && existingArray.length > 0 ? existingArray[0] : null;

          if (existing) {
            await builder.loadProposal(existing.id);
            setBusinessName(existing.proposalName?.split(' - ')[1]?.replace(' Marketing Proposal', '') || '');
            setSelectedServices(existing.serviceIds || []);
            showToast('Legacy proposal loaded - generate again to convert to V2', 'info');
          } else {
            showToast(`Ready to create proposal for ${opportunityId}`, 'success');
          }
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

  // Auto-populate from client brief
  useEffect(() => {
    if (builder.clientBrief?.clientName && !businessName) {
      setBusinessName(builder.clientBrief.clientName);
    }
    if (builder.clientBrief?.contactName && !clientName) {
      setClientName(builder.clientBrief.contactName);
    }
  }, [builder.clientBrief]);

  // Auto-select suggested services
  useEffect(() => {
    if (builder.suggestedServices?.length > 0 && selectedServices.length === 0) {
      setSelectedServices(builder.suggestedServices);
    }
  }, [builder.suggestedServices]);

  // Transcript handling
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

  // Supporting docs handling
  const handleSupportingDocUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setSupportingDocs(prev => [...prev, ...files]);
  };

  const handleAnalyzeSupportingDocs = async () => {
    if (supportingDocs.length === 0) return;

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
          } catch {
            setProcessedDocs(prev => prev.map(d =>
              d.file === file ? { ...d, status: 'error' } : d
            ));
          }
        } else {
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

  // Google Drive handlers
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

  // GHL import handler
  const handleImportFromGHL = async () => {
    if (!opportunityId) {
      showToast('No opportunity ID available', 'error');
      return;
    }

    setIsImportingFromGHL(true);
    try {
      const result = await api.ghl.importOpportunity(opportunityId);

      if (result.clientBrief) {
        // Store the imported data
        setGhlImportData(result);

        // Populate form fields from the client brief
        if (result.clientBrief.clientName) {
          setBusinessName(result.clientBrief.clientName);
        }
        if (result.clientBrief.stakeholders?.[0]?.name) {
          setClientName(result.clientBrief.stakeholders[0].name);
        }

        // Set the client brief in the builder
        builder.clientBrief = result.clientBrief;

        showToast('Client info imported from GHL', 'success');
      }
    } catch (error) {
      console.error('GHL import failed:', error);
      showToast(`GHL import failed: ${error.message}`, 'error');
    } finally {
      setIsImportingFromGHL(false);
    }
  };

  // Service toggle
  const toggleService = (serviceId) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Generate V2 proposal
  const handleGenerate = async () => {
    if (!businessName.trim() || selectedServices.length === 0) {
      showToast('Please enter business name and select at least one service', 'error');
      return;
    }

    try {
      // Get or create client brief ID
      let clientBriefId = builder.clientBrief?.id || 'manual_entry';

      // If manual entry, create a minimal client brief
      if (clientBriefId === 'manual_entry' && businessName) {
        const brief = await api.database.clientBriefs.create({
          clientName: businessName,
          contactName: clientName || businessName,
          clientOrganization: businessName,
          goals: [],
          painPoints: [],
          opportunities: [],
          stakeholders: []
        });
        clientBriefId = brief.id;
      }

      // Create V2 proposal
      await proposalV2.createProposal({
        opportunityId,
        clientBriefId,
        selectedServiceIds: selectedServices,
        proposalTitle: `Marketing Proposal for ${businessName}`,
        customInstructions: customPrompt || null
      });

      // Render the proposal for preview
      await proposalV2.renderProposal(opportunityId);

    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  // Comments handlers
  const handleSaveComments = async (comments) => {
    if (!proposalV2.proposal?.id) return;
    await proposalV2.updateComments(proposalV2.proposal.id, comments);
    await proposalV2.renderProposal(proposalV2.proposal.id);
  };

  const handleRegenerateComments = async (feedback) => {
    if (!proposalV2.proposal?.id) return;
    await proposalV2.regenerateComments(proposalV2.proposal.id, feedback);
    await proposalV2.renderProposal(proposalV2.proposal.id);
  };

  // Service toggle in proposal
  const handleToggleService = async (serviceKey, enabled) => {
    if (!proposalV2.proposal?.id) return;
    await proposalV2.toggleService(proposalV2.proposal.id, serviceKey, enabled);
    await proposalV2.renderProposal(proposalV2.proposal.id);
  };

  // Service overrides
  const handleUpdateServiceOverrides = async (serviceKey, overrides) => {
    if (!proposalV2.proposal?.id) return;
    await proposalV2.updateServiceOverrides(proposalV2.proposal.id, serviceKey, overrides);
    await proposalV2.renderProposal(proposalV2.proposal.id);
  };

  // Render request callback
  const handleRenderRequest = useCallback(async () => {
    if (proposalV2.proposal?.id) {
      await proposalV2.renderProposal(proposalV2.proposal.id);
    }
  }, [proposalV2.proposal?.id]);

  // Copy handlers
  const handleCopyHtml = async () => {
    return await proposalV2.copyToClipboard('html');
  };

  const handleCopyPlain = async () => {
    return await proposalV2.copyToClipboard('plain');
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

  const isProcessing = builder.isProcessing || proposalV2.isLoading;

  return (
    <div className="app-container">
      <Header />

      <main className="builder-main">
        <div className="builder-header">
          <h1 className="builder-title">Proposal Builder</h1>
          <div className="builder-header-right">
            <div className="opportunity-badge">{opportunityId}</div>
            {proposalV2.proposal && (
              <div className="view-toggle">
                <button
                  className={`toggle-btn ${viewMode === 'edit' ? 'active' : ''}`}
                  onClick={() => setViewMode('edit')}
                >
                  Edit
                </button>
                <button
                  className={`toggle-btn ${viewMode === 'preview' ? 'active' : ''}`}
                  onClick={() => setViewMode('preview')}
                >
                  Preview
                </button>
              </div>
            )}
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
              <div className="card-icon">&#x1F3E2;</div>
              <h3 className="card-title">Client Information</h3>

              {/* GHL Import Button */}
              <div style={{ marginBottom: '1rem' }}>
                <button
                  onClick={handleImportFromGHL}
                  disabled={isImportingFromGHL}
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                >
                  {isImportingFromGHL ? (
                    <>
                      <span className="spinner-small" style={{ marginRight: '0.5rem' }}></span>
                      Importing from GHL...
                    </>
                  ) : (
                    <>
                      <span style={{ marginRight: '0.5rem' }}>&#x1F517;</span>
                      Import from GoHighLevel
                    </>
                  )}
                </button>
                {ghlImportData && (
                  <div className="info-box success" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    Imported from GHL opportunity
                  </div>
                )}
              </div>

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

              {/* Show GHL contact details if imported */}
              {ghlImportData?.clientBrief?.stakeholders?.[0] && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>GHL Contact Info:</div>
                  {ghlImportData.clientBrief.stakeholders[0].email && (
                    <div style={{ color: '#64748b' }}>
                      &#x2709;&#xFE0F; {ghlImportData.clientBrief.stakeholders[0].email}
                    </div>
                  )}
                  {ghlImportData.clientBrief.stakeholders[0].phone && (
                    <div style={{ color: '#64748b' }}>
                      &#x1F4DE; {ghlImportData.clientBrief.stakeholders[0].phone}
                    </div>
                  )}
                  {ghlImportData.clientBrief.location && (
                    <div style={{ color: '#64748b' }}>
                      &#x1F4CD; {ghlImportData.clientBrief.location}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Transcript Upload Card */}
            <div className="builder-card">
              <div className="card-icon">&#x1F4DD;</div>
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
                  {transcriptFile ? `OK ${transcriptFile.name}` : '+ Upload Transcript'}
                </label>

                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {!googleDrive.isSignedIn ? (
                    <button
                      onClick={googleDrive.signIn}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%' }}
                    >
                      <span style={{ marginRight: '0.5rem' }}>&#x1F4C1;</span>
                      Sign in to Google Drive
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleTranscriptFromDrive}
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%' }}
                      >
                        <span style={{ marginRight: '0.5rem' }}>&#x1F4C1;</span>
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
                    <strong>OK Brief Extracted</strong>
                    <div style={{ fontSize: '0.95rem', marginTop: '0.5rem' }}>
                      <div><strong>{builder.clientBrief.clientName}</strong></div>
                      {builder.clientBrief.industry && <div>{builder.clientBrief.industry}</div>}
                      {builder.clientBrief.location && <div>&#x1F4CD; {builder.clientBrief.location}</div>}
                    </div>
                  </div>

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
              <div className="card-icon">&#x2699;&#xFE0F;</div>
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
                  Services pre-selected based on transcript
                </div>
              )}
            </div>

            {/* Custom Instructions Card */}
            <div className="builder-card">
              <div className="card-icon">&#x270F;&#xFE0F;</div>
              <h3 className="card-title">Custom Instructions</h3>
              <p className="card-description">Optional: Add specific requirements for the comments section</p>

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
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Supporting Documents Card */}
            <div className="builder-card">
              <div className="card-icon">&#x1F4CE;</div>
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

                {googleDrive.isSignedIn && (
                  <div style={{ marginTop: '1rem' }}>
                    <button
                      onClick={handleSupportingDocsFromDrive}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%' }}
                    >
                      <span style={{ marginRight: '0.5rem' }}>&#x1F4C1;</span>
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
                              &#x1F4C4; {file.name}
                              {processed?.status === 'processing' && ' ...'}
                              {processed?.status === 'complete' && ' OK'}
                              {processed?.status === 'pending' && ' ||'}
                              {processed?.status === 'error' && ' X'}
                            </span>
                            <button
                              className="remove-btn"
                              onClick={() => removeSupportingDoc(index)}
                              style={{ flexShrink: 0 }}
                            >
                              x
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

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
              disabled={isProcessing || !businessName.trim() || selectedServices.length === 0}
            >
              {isProcessing ? '... Generating...' : 'Generate Proposal'}
            </button>

            {proposalV2.isLoading && (
              <div className="progress-card">
                <p className="progress-label">Creating proposal...</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '50%' }} />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Proposal Content */}
          <div className="builder-content">
            {proposalV2.proposal ? (
              viewMode === 'edit' ? (
                <div className="proposal-edit-view">
                  {/* Comments Editor */}
                  <CommentsEditor
                    comments={proposalV2.proposal.comments}
                    onSave={handleSaveComments}
                    onRegenerate={handleRegenerateComments}
                    isLoading={proposalV2.isLoading}
                  />

                  {/* Service Editors */}
                  <div className="services-section" style={{ marginTop: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Services</h3>
                    {proposalV2.proposal.services.map(service => (
                      <ServiceEditor
                        key={service.serviceKey}
                        service={service}
                        onToggle={(enabled) => handleToggleService(service.serviceKey, enabled)}
                        onUpdateOverrides={(overrides) => handleUpdateServiceOverrides(service.serviceKey, overrides)}
                        isLoading={proposalV2.isLoading}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <ProposalPreviewV2
                  proposal={proposalV2.proposal}
                  renderedHtml={proposalV2.renderedHtml}
                  onRenderRequest={handleRenderRequest}
                  onCopyHtml={handleCopyHtml}
                  onCopyPlain={handleCopyPlain}
                  isLoading={proposalV2.isLoading}
                />
              )
            ) : (
              <div className="empty-proposal">
                <div className="empty-icon">&#x1F4C4;</div>
                <h2>No Proposal Yet</h2>
                <p>Fill in the client information and select services, then click Generate Proposal to begin.</p>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '1rem' }}>
                  This uses the new JSON-first system where AI only generates the personal comments section.
                  Services, pricing, and terms come directly from templates.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Toast toast={toast} />

      <style>{`
        .view-toggle {
          display: flex;
          background: #f1f5f9;
          border-radius: 6px;
          padding: 2px;
        }
        .toggle-btn {
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 4px;
          font-size: 0.9rem;
          color: #64748b;
          transition: all 0.2s;
        }
        .toggle-btn.active {
          background: white;
          color: #1e293b;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .toggle-btn:hover:not(.active) {
          color: #334155;
        }
        .proposal-edit-view {
          padding: 1rem;
        }
        .services-section h3 {
          font-size: 1.1rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
