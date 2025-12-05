import { useState, useRef, useEffect } from 'react'
import './App.css'

const STORAGE_KEY = 'proposal-generator-examples';
const STORAGE_KEY_DOCS = 'proposal-generator-supporting-docs';
const GOOGLE_CLIENT_ID = '917115566645-o8ohv7uiqeerafj8cvf5j5qev0mgu4uk.apps.googleusercontent.com';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';
const DEFAULT_FOLDER_ID = '1fvdEMZ-JNlpfSP1BZWDCzDFE_YfXs1hc';

function App() {
  const [firefliesFile, setFirefliesFile] = useState(null);
  const [exampleFiles, setExampleFiles] = useState([]);
  const [supportingDocs, setSupportingDocs] = useState([]);
  const [comments, setComments] = useState('');
  const [proposalText, setProposalText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [iterationComment, setIterationComment] = useState('');
  const [toast, setToast] = useState(null);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENAI_API_KEY || '');
  const [wordCount, setWordCount] = useState(0);
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);

  const fileInputRef = useRef(null);
  const exampleFileInputRef = useRef(null);
  const supportingDocsInputRef = useRef(null);
  const tokenClient = useRef(null);
  const gapiInited = useRef(false);
  const gisInited = useRef(false);

  // Load examples from localStorage on mount
  useEffect(() => {
    const savedExamples = localStorage.getItem(STORAGE_KEY);
    if (savedExamples) {
      try {
        const examples = JSON.parse(savedExamples);
        setExampleFiles(examples);
      } catch (error) {
        console.error('Error loading saved examples:', error);
      }
    }
  }, []);

  // Save examples to localStorage whenever they change
  useEffect(() => {
    if (exampleFiles.length > 0) {
      // Only save name, id, and content (not the File object)
      const examplesData = exampleFiles.map(({ id, name, content }) => ({
        id,
        name,
        content
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(examplesData));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [exampleFiles]);

  // Load supporting docs from localStorage on mount
  useEffect(() => {
    const savedDocs = localStorage.getItem(STORAGE_KEY_DOCS);
    if (savedDocs) {
      try {
        const docs = JSON.parse(savedDocs);
        setSupportingDocs(docs);
      } catch (error) {
        console.error('Error loading saved docs:', error);
      }
    }
  }, []);

  // Save supporting docs to localStorage whenever they change
  useEffect(() => {
    if (supportingDocs.length > 0) {
      const docsData = supportingDocs.map(({ id, name, content }) => ({
        id,
        name,
        content
      }));
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(docsData));
    } else {
      localStorage.removeItem(STORAGE_KEY_DOCS);
    }
  }, [supportingDocs]);

  // Initialize Google API
  useEffect(() => {
    const initializeGapiClient = async () => {
      await window.gapi.client.init({
        apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
        discoveryDocs: [DISCOVERY_DOC],
      });
      gapiInited.current = true;
    };

    const gapiLoaded = () => {
      window.gapi.load('client:picker', initializeGapiClient);
    };

    const gisLoaded = () => {
      tokenClient.current = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
      });
      gisInited.current = true;
    };

    // Check if scripts are loaded
    const checkAndInit = setInterval(() => {
      if (window.gapi && !gapiInited.current) {
        gapiLoaded();
      }
      if (window.google && !gisInited.current) {
        gisLoaded();
      }
      if (gapiInited.current && gisInited.current) {
        clearInterval(checkAndInit);
      }
    }, 100);

    return () => clearInterval(checkAndInit);
  }, []);

  // Calculate word count
  const updateWordCount = (text) => {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  };

  // Handle Fireflies file upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFirefliesFile(file);
      showToast('File uploaded successfully', 'success');
    }
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFirefliesFile(file);
      showToast('File uploaded successfully', 'success');
    }
  };

  // Remove Fireflies file
  const removeFirefliesFile = () => {
    setFirefliesFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle example file upload
  const handleExampleFileSelect = async (e) => {
    const files = Array.from(e.target.files);

    for (const file of files) {
      try {
        const content = await readFileAsText(file);
        const newId = Math.max(...exampleFiles.map(f => f.id), 0) + 1;
        const newExample = {
          id: newId,
          name: file.name,
          file: file,
          content: content
        };
        setExampleFiles(prev => [...prev, newExample]);
      } catch (error) {
        console.error('Error reading file:', error);
        showToast(`Failed to read ${file.name}`, 'error');
      }
    }

    showToast(`Added ${files.length} example(s)`, 'success');

    // Reset input
    if (exampleFileInputRef.current) {
      exampleFileInputRef.current.value = '';
    }
  };

  // Trigger file input for examples
  const addExampleFile = () => {
    exampleFileInputRef.current?.click();
  };

  // Remove example file
  const removeExampleFile = (id) => {
    setExampleFiles(exampleFiles.filter(f => f.id !== id));
  };

  // Clear all examples
  const clearAllExamples = () => {
    setExampleFiles([]);
    showToast('All examples cleared', 'success');
  };

  // Handle supporting docs file upload
  const handleSupportingDocsSelect = async (e) => {
    const files = Array.from(e.target.files);

    for (const file of files) {
      try {
        const content = await readFileAsText(file);
        const newId = Math.max(...supportingDocs.map(f => f.id), 0) + 1;
        const newDoc = {
          id: newId,
          name: file.name,
          file: file,
          content: content
        };
        setSupportingDocs(prev => [...prev, newDoc]);
      } catch (error) {
        console.error('Error reading file:', error);
        showToast(`Failed to read ${file.name}`, 'error');
      }
    }

    showToast(`Added ${files.length} document(s)`, 'success');

    if (supportingDocsInputRef.current) {
      supportingDocsInputRef.current.value = '';
    }
  };

  // Trigger file input for supporting docs
  const addSupportingDoc = () => {
    supportingDocsInputRef.current?.click();
  };

  // Remove supporting doc
  const removeSupportingDoc = (id) => {
    setSupportingDocs(supportingDocs.filter(f => f.id !== id));
  };

  // Clear all supporting docs
  const clearAllSupportingDocs = () => {
    setSupportingDocs([]);
    showToast('All documents cleared', 'success');
  };

  // Google Drive: Sign in and request access
  const handleGoogleSignIn = () => {
    tokenClient.current.callback = async (resp) => {
      if (resp.error !== undefined) {
        throw (resp);
      }
      setIsGoogleSignedIn(true);
      showToast('Signed in to Google Drive', 'success');
    };

    if (window.gapi.client.getToken() === null) {
      // Prompt the user to select a Google Account and ask for consent
      tokenClient.current.requestAccessToken({ prompt: 'consent' });
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      tokenClient.current.requestAccessToken({ prompt: '' });
    }
  };

  // Google Drive: Sign out
  const handleGoogleSignOut = () => {
    const token = window.gapi.client.getToken();
    if (token !== null) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken('');
      setIsGoogleSignedIn(false);
      showToast('Signed out from Google Drive', 'success');
    }
  };

  // Google Drive: Pick files for examples
  const pickExamplesFromDrive = () => {
    const token = window.gapi.client.getToken();
    if (!token) {
      handleGoogleSignIn();
      showToast('Please sign in first', 'error');
      return;
    }

    // Create a view that shows folders and allows navigation
    const docsView = new window.google.picker.DocsView()
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false)
      .setParent(DEFAULT_FOLDER_ID); // Start in default folder

    const picker = new window.google.picker.PickerBuilder()
      .addView(docsView)
      .setOAuthToken(token.access_token)
      .setDeveloperKey('')
      .setCallback((data) => drivePickerCallback(data, 'examples'))
      .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
      .enableFeature(window.google.picker.Feature.NAV_HIDDEN) // Hide nav for cleaner look
      .setTitle('Select proposal examples from Drive')
      .build();

    picker.setVisible(true);
  };

  // Google Drive: Pick files for supporting docs
  const pickSupportingDocsFromDrive = () => {
    const token = window.gapi.client.getToken();
    if (!token) {
      handleGoogleSignIn();
      showToast('Please sign in first', 'error');
      return;
    }

    // Create a view that shows folders and allows navigation
    const docsView = new window.google.picker.DocsView()
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false)
      .setParent(DEFAULT_FOLDER_ID); // Start in default folder

    const picker = new window.google.picker.PickerBuilder()
      .addView(docsView)
      .setOAuthToken(token.access_token)
      .setDeveloperKey('')
      .setCallback((data) => drivePickerCallback(data, 'supporting'))
      .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
      .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
      .setTitle('Select supporting documents from Drive')
      .build();

    picker.setVisible(true);
  };

  // Google Picker callback
  const drivePickerCallback = async (data, type) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const files = data.docs;

      for (const file of files) {
        try {
          // Download file content - handle both Google Docs and regular files
          let content = '';

          if (file.mimeType.includes('google-apps')) {
            // Export Google Docs as plain text
            const exportMimeType = 'text/plain';
            const response = await window.gapi.client.drive.files.export({
              fileId: file.id,
              mimeType: exportMimeType
            });
            content = response.body;
          } else {
            // Download regular files
            const response = await window.gapi.client.drive.files.get({
              fileId: file.id,
              alt: 'media'
            });
            content = response.body;
          }

          if (type === 'examples') {
            const newId = Math.max(...exampleFiles.map(f => f.id), 0) + 1;
            setExampleFiles(prev => [...prev, {
              id: newId,
              name: file.name,
              content: content,
              fromDrive: true
            }]);
          } else {
            const newId = Math.max(...supportingDocs.map(f => f.id), 0) + 1;
            setSupportingDocs(prev => [...prev, {
              id: newId,
              name: file.name,
              content: content,
              fromDrive: true
            }]);
          }
        } catch (error) {
          console.error(`Error loading ${file.name}:`, error);
          showToast(`Failed to load ${file.name}`, 'error');
        }
      }

      showToast(`Added ${files.length} file(s) from Drive`, 'success');
    }
  };

  // Distill content using AI
  const distillContent = async (content, type) => {
    const prompts = {
      fireflies: `Analyze this discovery call transcript and extract the key information in a concise summary (max 500 words):

- Client's business and industry
- Main challenges and pain points discussed
- Goals and objectives mentioned
- Budget or timeline discussed
- Any specific requirements or preferences
- Key quotes that reveal client needs

Transcript:
${content}

Provide a structured summary:`,

      examples: `Analyze these proposal examples and extract the key elements of our proposal writing style (max 400 words):

${content}

Extract:
- Tone and voice (formal/casual, technical level)
- Structure and section organization
- How we present value propositions
- How we handle pricing/packages
- Key phrases or terminology we use
- Overall approach and methodology

Provide a concise style guide:`,

      supporting: `Analyze these supporting documents and extract key information relevant to creating a marketing proposal (max 400 words):

${content}

Extract:
- Brand voice and personality
- Key brand values or messaging
- Target audience insights
- Important facts about the business
- Any guidelines or requirements to follow
- Relevant background context

Provide a structured summary:`
    };

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 800,
          temperature: 0.3,
          messages: [{
            role: 'user',
            content: prompts[type]
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Distillation failed');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error(`Error distilling ${type}:`, error);
      return content.substring(0, 2000); // Fallback: just truncate
    }
  };

  // Build prompt helper
  const buildPrompt = (firefliesContent, examples, supportingDocuments, userComments) => {
    return `You are an expert marketing proposal writer for Good Circle Marketing. Create a highly personalized, professional proposal.

${firefliesContent ? `# DISCOVERY CALL TRANSCRIPT

${firefliesContent}

---

` : `# NO MEETING TRANSCRIPT AVAILABLE

Generate a professional proposal based on example structure and user comments.

---

`}
# EXAMPLE PROPOSALS

${examples.length > 0 ? `I'm providing ${examples.length} example proposal(s) below. Study these carefully to understand our tone, structure, and approach. Match this professional style in your output.

${examples.map((ex, index) => `
## EXAMPLE ${index + 1}: ${ex.name}

${ex.content}

---
`).join('\n')}
` : 'No example proposals provided. Create a professional proposal using standard marketing proposal structure and best practices.\n\n---\n'}

${supportingDocuments.length > 0 ? `# SUPPORTING DOCUMENTS & CONTEXT

I'm providing ${supportingDocuments.length} additional document(s) with important context about the client, their business, brand guidelines, marketing plans, or other relevant information. Review these carefully to inform your proposal.

${supportingDocuments.map((doc, index) => `
## DOCUMENT ${index + 1}: ${doc.name}

${doc.content}

---
`).join('\n')}

` : ''}
${userComments ? `# SPECIAL INSTRUCTIONS FROM USER

${userComments}

---

` : ''}
# YOUR TASK

Create a complete marketing proposal following this structure:

## 1. EXECUTIVE SUMMARY
${firefliesContent ? '- Reference the discovery call and specific conversation points' : '- Professional introduction'}
- Summarize main challenges and opportunities
- Preview recommended solution
- 150-200 words

## 2. UNDERSTANDING YOUR BUSINESS
- Demonstrate understanding of their business
${firefliesContent ? '- Include specific quotes or details from the call' : '- Show industry knowledge'}
- 200-300 words

## 3. CHALLENGES & OPPORTUNITIES
- List 3-4 specific challenges
- Explain opportunity in each
- 300-400 words

## 4. OUR APPROACH
- Strategic overview
- Why this approach works
- 200-300 words

## 5. RECOMMENDED SERVICES
- Detail 3-5 specific services
- For each: what's included, how it helps, expected outcomes
- 600-800 words

## 6. TIMELINE & PROCESS
- Phase breakdown
- Realistic milestones
- 200-250 words

## 7. INVESTMENT
- Clear pricing structure
- What's included
- Value proposition
- 200-300 words
- NOTE: Do not include itemized products/prices - just package structure

## 8. WHY GOOD CIRCLE MARKETING
- Our experience and approach
- What makes us different
- 150-200 words

## 9. NEXT STEPS
- Clear call to action
- 100-150 words

---

# CRITICAL REQUIREMENTS

1. Use Markdown formatting
2. Professional, confident tone
3. Specific and personalized
4. 2000-2500 words total
5. No placeholder text
6. Match Good Circle Marketing's voice from examples
7. DO NOT include legal disclaimers or itemized pricing tables (these are in our template)

Output ONLY the proposal in markdown. No preamble or postamble.

Begin now:`;
  };

  // Generate proposal with multi-step distillation
  const generateProposal = async () => {
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
        distilledFireflies = await distillContent(firefliesContent, 'fireflies');
      }

      // Step 2: Distill example proposals
      let distilledExamples = '';
      if (exampleFiles.length > 0) {
        showToast(`Step 2/4: Analyzing ${exampleFiles.length} example proposal(s)...`, 'success');
        const combinedExamples = exampleFiles.map(ex =>
          `Example: ${ex.name}\n\n${ex.content}`
        ).join('\n\n---\n\n');
        distilledExamples = await distillContent(combinedExamples, 'examples');
      }

      // Step 3: Distill supporting documents
      let distilledDocs = '';
      if (supportingDocs.length > 0) {
        showToast(`Step 3/4: Analyzing ${supportingDocs.length} supporting document(s)...`, 'success');
        const combinedDocs = supportingDocs.map(doc =>
          `Document: ${doc.name}\n\n${doc.content}`
        ).join('\n\n---\n\n');
        distilledDocs = await distillContent(combinedDocs, 'supporting');
      }

      // Step 4: Generate proposal with distilled content
      showToast('Step 4/4: Generating your proposal...', 'success');

      const prompt = buildPrompt(
        distilledFireflies,
        distilledExamples ? [{ name: 'Style Guide', content: distilledExamples }] : [],
        distilledDocs ? [{ name: 'Key Information', content: distilledDocs }] : [],
        comments
      );

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          max_tokens: 4000,
          temperature: 0.3,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
      }

      const data = await response.json();
      const generatedText = data.choices[0].message.content;

      setProposalText(generatedText);
      updateWordCount(generatedText);
      showToast('Proposal generated successfully!', 'success');

    } catch (error) {
      console.error('Error:', error);
      showToast(`Failed to generate: ${error.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Iterate on proposal
  const iterateProposal = async () => {
    if (!iterationComment.trim()) {
      showToast('Please add comments for iteration', 'error');
      return;
    }

    setIsGenerating(true);

    try {
      const iterationPrompt = `
# CURRENT PROPOSAL

${proposalText}

---

# ITERATION REQUEST

${iterationComment}

---

# YOUR TASK

Update the proposal based on the iteration request above. Keep all the good parts that work, and improve based on the feedback. Output the complete updated proposal in markdown format.

Output ONLY the updated proposal. No preamble or postamble.
`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          max_tokens: 4000,
          temperature: 0.3,
          messages: [{
            role: 'user',
            content: iterationPrompt
          }]
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const updatedText = data.choices[0].message.content;
      
      setProposalText(updatedText);
      updateWordCount(updatedText);
      setIterationComment('');
      setIsEditing(false);
      showToast('Proposal updated successfully!', 'success');

    } catch (error) {
      console.error('Error:', error);
      showToast('Failed to iterate proposal', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper: Read file as text
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(proposalText);
    showToast('Copied to clipboard!', 'success');
  };

  // Download as markdown
  const downloadMarkdown = () => {
    const blob = new Blob([proposalText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proposal-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded as markdown!', 'success');
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Simple markdown to HTML converter
  const markdownToHtml = (markdown) => {
    return markdown
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/(<li>.*?<\/li>\n?)+/gs, '<ul>$&</ul>')
      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
      .replace(/^(?!<[h|u|l|p])(.*$)/gm, '<p>$1</p>')
      .replace(/<p><\/p>/g, '')
      .replace(/<p>(<[h|u])/g, '$1')
      .replace(/(<\/[h|u|l]>)<\/p>/g, '$1');
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <img src="/assets/GoodCircle-Icon.png" alt="Good Circle Marketing" className="logo-image" />
            <span>Good Circle Marketing</span>
          </div>
          <div className="header-status">
            {!isGoogleSignedIn ? (
              <button className="btn btn-secondary" onClick={handleGoogleSignIn}>
                Sign in with Google Drive
              </button>
            ) : (
              <>
                <div className="signed-in-status">
                  ✓ Signed in to Drive
                </div>
                <button className="btn btn-secondary btn-sm" onClick={handleGoogleSignOut}>
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Left Panel - Inputs */}
        <aside className="input-panel">
          {/* Fireflies Upload */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                📄 Fireflies Transcript (Optional)
              </h3>
            </div>
            <div className="card-body">
              {!firefliesFile ? (
                <div
                  className="file-upload-zone"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div className="file-upload-icon">📁</div>
                  <div className="file-upload-text">
                    Drop your Fireflies transcript here
                  </div>
                  <div className="file-upload-label">
                    or click to browse
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf,.docx"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </div>
              ) : (
                <div className="uploaded-file">
                  <div className="file-icon">📄</div>
                  <div className="file-info">
                    <div className="file-name">{firefliesFile.name}</div>
                    <div className="file-size">{formatFileSize(firefliesFile.size)}</div>
                  </div>
                  <button className="remove-file" onClick={removeFirefliesFile}>
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Example Proposals */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                📚 Example Proposals
              </h3>
              <div className="card-header-actions">
                <button className="icon-button" onClick={addExampleFile} title="Add from computer">
                  📁
                </button>
                <button className="icon-button drive-icon-btn" onClick={pickExamplesFromDrive} title="Add from Google Drive">
                  <img src="/assets/google-drive.png" alt="Google Drive" className="drive-icon" />
                </button>
                {exampleFiles.length > 0 && (
                  <button className="icon-button" onClick={clearAllExamples} title="Clear all examples">
                    🗑️
                  </button>
                )}
              </div>
            </div>
            <div className="card-body">
              <input
                ref={exampleFileInputRef}
                type="file"
                accept=".txt,.pdf,.docx,.md"
                multiple
                onChange={handleExampleFileSelect}
                style={{ display: 'none' }}
              />
              {exampleFiles.length > 0 ? (
                <div className="example-files">
                  {exampleFiles.map(file => (
                    <div key={file.id} className="example-file">
                      <span className="example-file-name">{file.name}</span>
                      <div className="example-actions">
                        <button
                          className="icon-button"
                          onClick={() => removeExampleFile(file.id)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-examples">
                  <div className="empty-examples-icon">📚</div>
                  <div className="empty-examples-text">No example proposals yet</div>
                  <div className="empty-examples-subtext">
                    Click 📁 to upload from computer or Drive icon to select from Drive
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Supporting Documents */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                📋 Supporting Documents
              </h3>
              <div className="card-header-actions">
                <button className="icon-button" onClick={addSupportingDoc} title="Add from computer">
                  📁
                </button>
                <button className="icon-button drive-icon-btn" onClick={pickSupportingDocsFromDrive} title="Add from Google Drive">
                  <img src="/assets/google-drive.png" alt="Google Drive" className="drive-icon" />
                </button>
                {supportingDocs.length > 0 && (
                  <button className="icon-button" onClick={clearAllSupportingDocs} title="Clear all documents">
                    🗑️
                  </button>
                )}
              </div>
            </div>
            <div className="card-body">
              <input
                ref={supportingDocsInputRef}
                type="file"
                accept=".txt,.pdf,.docx,.md"
                multiple
                onChange={handleSupportingDocsSelect}
                style={{ display: 'none' }}
              />
              {supportingDocs.length > 0 ? (
                <div className="example-files">
                  {supportingDocs.map(doc => (
                    <div key={doc.id} className="example-file">
                      <span className="example-file-name">{doc.name}</span>
                      <div className="example-actions">
                        <button
                          className="icon-button"
                          onClick={() => removeSupportingDoc(doc.id)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-examples">
                  <div className="empty-examples-icon">📋</div>
                  <div className="empty-examples-text">No supporting documents yet</div>
                  <div className="empty-examples-subtext">
                    Add meeting notes, brand guidelines, marketing plans, or other context
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                💬 Comments & Instructions
              </h3>
            </div>
            <div className="card-body">
              <textarea
                placeholder="Add any special instructions, focus areas, or specific details to include in the proposal..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
          </div>

          {/* Generate Button */}
          <button
            className="btn btn-primary"
            onClick={generateProposal}
            disabled={isGenerating || !apiKey}
          >
            {isGenerating ? (
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
          <div className="output-card">
            <div className="output-header">
              <h2 className="output-title">Proposal Draft</h2>
              {proposalText && (
                <div className="output-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? '👁️ Preview' : '✏️ Edit'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={copyToClipboard}
                  >
                    📋 Copy
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={downloadMarkdown}
                  >
                    ⬇️ Download
                  </button>
                </div>
              )}
            </div>

            <div className="output-body">
              {isGenerating ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <div className="loading-text">
                    Generating your personalized proposal...<br/>
                    This may take 20-30 seconds
                  </div>
                </div>
              ) : proposalText ? (
                isEditing ? (
                  <textarea
                    className="editor-textarea"
                    value={proposalText}
                    onChange={(e) => {
                      setProposalText(e.target.value);
                      updateWordCount(e.target.value);
                    }}
                  />
                ) : (
                  <div
                    className="proposal-content"
                    dangerouslySetInnerHTML={{
                      __html: markdownToHtml(proposalText)
                    }}
                  />
                )
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">📝</div>
                  <div className="empty-state-text">No proposal yet</div>
                  <div className="empty-state-subtext">
                    Click "Generate Proposal" to begin. Fireflies transcript is optional but recommended.
                  </div>
                </div>
              )}
            </div>

            {/* Word Count */}
            {proposalText && (
              <div className="stats-bar">
                <div className="word-count">
                  <div className="stat">
                    <div className="stat-value">{wordCount}</div>
                    <div className="stat-label">Words</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">{Math.ceil(wordCount / 250)}</div>
                    <div className="stat-label">Minutes Read</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">{proposalText.split('\n\n').length}</div>
                    <div className="stat-label">Paragraphs</div>
                  </div>
                </div>
              </div>
            )}

            {/* Iteration Panel */}
            {proposalText && (
              <div className="iteration-panel">
                <h3 className="iteration-title">
                  🔄 Iterate on Proposal
                </h3>
                <div className="iteration-input">
                  <textarea
                    placeholder="Request changes: 'Make it more casual', 'Add more detail to the services section', 'Emphasize ROI more', etc."
                    value={iterationComment}
                    onChange={(e) => setIterationComment(e.target.value)}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={iterateProposal}
                    disabled={isGenerating || !iterationComment.trim()}
                  >
                    {isGenerating ? 'Updating...' : '🔄 Update'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' ? '✓' : '✕'}
          </div>
          <div className="toast-message">{toast.message}</div>
        </div>
      )}
    </div>
  );
}

export default App;
