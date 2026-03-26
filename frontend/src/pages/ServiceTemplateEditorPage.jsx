/**
 * Service Template Editor Page
 * Admin page for managing service content templates used in proposal generation.
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Header } from '../components/Header';

const EMPTY_SERVICE = {
  serviceKey: '',
  displayNameCaps: '',
  subsections: [
    { number: 1, title: '', bodyMarkdown: '', allowClientSpecificEdits: false }
  ],
  investment: {
    model: 'one_time',
    amount: 0,
    currency: 'USD',
    notes: '',
    renderHint: ''
  },
  timeline: '',
  outcome: '',
  enabled: true
};

export default function ServiceTemplateEditorPage() {
  const [services, setServices] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [toast, setToast] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.serviceLibrary.getAll();
      setServices(data);
    } catch (err) {
      showToast('Failed to load services: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const selectService = (service) => {
    if (hasChanges && !confirm('You have unsaved changes. Discard them?')) return;
    setSelectedId(service.id || service.serviceKey);
    setFormData(JSON.parse(JSON.stringify(service)));
    setIsNew(false);
    setHasChanges(false);
  };

  const startNewService = () => {
    if (hasChanges && !confirm('You have unsaved changes. Discard them?')) return;
    setSelectedId(null);
    setFormData(JSON.parse(JSON.stringify(EMPTY_SERVICE)));
    setIsNew(true);
    setHasChanges(false);
  };

  const updateField = (path, value) => {
    setFormData(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return updated;
    });
    setHasChanges(true);
  };

  const updateSubsection = (index, field, value) => {
    setFormData(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.subsections[index][field] = value;
      return updated;
    });
    setHasChanges(true);
  };

  const addSubsection = () => {
    setFormData(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.subsections.push({
        number: updated.subsections.length + 1,
        title: '',
        bodyMarkdown: '',
        allowClientSpecificEdits: false
      });
      return updated;
    });
    setHasChanges(true);
  };

  const removeSubsection = (index) => {
    setFormData(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.subsections.splice(index, 1);
      // Renumber
      updated.subsections.forEach((s, i) => { s.number = i + 1; });
      return updated;
    });
    setHasChanges(true);
  };

  const moveSubsection = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= formData.subsections.length) return;
    setFormData(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const [item] = updated.subsections.splice(index, 1);
      updated.subsections.splice(newIndex, 0, item);
      updated.subsections.forEach((s, i) => { s.number = i + 1; });
      return updated;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!formData.serviceKey.trim()) {
      showToast('Service key is required', 'error');
      return;
    }
    if (!formData.displayNameCaps.trim()) {
      showToast('Display name is required', 'error');
      return;
    }

    try {
      setSaving(true);
      if (isNew) {
        await api.serviceLibrary.create(formData);
        showToast('Service created successfully');
      } else {
        await api.serviceLibrary.update(selectedId, formData);
        showToast('Service updated successfully');
      }
      setHasChanges(false);
      setIsNew(false);
      await loadServices();
      // Select the saved service
      setSelectedId(formData.serviceKey);
    } catch (err) {
      showToast('Failed to save: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${formData.displayNameCaps}"? This cannot be undone.`)) return;
    try {
      setSaving(true);
      await api.serviceLibrary.delete(selectedId);
      showToast('Service deleted');
      setFormData(null);
      setSelectedId(null);
      setHasChanges(false);
      await loadServices();
    } catch (err) {
      showToast('Failed to delete: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImportDefaults = async () => {
    if (!confirm('Import default services from the static library? This will overwrite any services with matching keys.')) return;
    try {
      setImporting(true);
      const result = await api.serviceLibrary.importDefaults();
      showToast(`Imported ${result.count} services`);
      await loadServices();
    } catch (err) {
      showToast('Failed to import: ' + err.message, 'error');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="ste-page">
      {/* Toast */}
      {toast && (
        <div className={`ste-toast ste-toast--${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Shared Header */}
      <Header />

      {/* Page Toolbar */}
      <div className="ste-toolbar">
        <h1>Service Template Editor</h1>
        <button
          className="ste-btn ste-btn--secondary"
          onClick={handleImportDefaults}
          disabled={importing}
        >
          {importing ? 'Importing...' : 'Import Defaults'}
        </button>
      </div>

      <div className="ste-layout">
        {/* Sidebar - Service List */}
        <aside className="ste-sidebar">
          <div className="ste-sidebar-header">
            <h2>Services</h2>
            <button className="ste-btn ste-btn--small" onClick={startNewService}>
              + New
            </button>
          </div>

          {loading ? (
            <div className="ste-loading">Loading services...</div>
          ) : services.length === 0 ? (
            <div className="ste-empty">
              <p>No services in database.</p>
              <button className="ste-btn ste-btn--primary" onClick={handleImportDefaults}>
                Import Defaults
              </button>
            </div>
          ) : (
            <ul className="ste-service-list">
              {services.map(service => (
                <li
                  key={service.id || service.serviceKey}
                  className={`ste-service-item ${(service.id || service.serviceKey) === selectedId ? 'ste-service-item--active' : ''} ${!service.enabled ? 'ste-service-item--disabled' : ''}`}
                  onClick={() => selectService(service)}
                >
                  <span className="ste-service-name">{service.displayNameCaps}</span>
                  <span className="ste-service-meta">
                    {service.investment?.renderHint || (service.investment?.amount != null ? `$${service.investment.amount.toLocaleString()}` : service.price || '')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Main Editor */}
        <main className="ste-editor">
          {!formData ? (
            <div className="ste-placeholder">
              <h2>Select a service to edit</h2>
              <p>Choose a service from the list or create a new one.</p>
            </div>
          ) : (
            <div className="ste-form">
              <div className="ste-form-header">
                <h2>{isNew ? 'New Service' : formData.displayNameCaps}</h2>
                <div className="ste-form-actions">
                  {!isNew && (
                    <button
                      className="ste-btn ste-btn--danger"
                      onClick={handleDelete}
                      disabled={saving}
                    >
                      Delete
                    </button>
                  )}
                  <button
                    className="ste-btn ste-btn--primary"
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

              {/* Basic Info */}
              <section className="ste-section">
                <h3>Basic Info</h3>
                <div className="ste-field-row">
                  <div className="ste-field">
                    <label>Service Key</label>
                    <input
                      type="text"
                      value={formData.serviceKey}
                      onChange={e => updateField('serviceKey', e.target.value)}
                      placeholder="e.g., marketing_machine"
                      disabled={!isNew}
                    />
                    {isNew && <span className="ste-hint">Unique identifier, cannot be changed later</span>}
                  </div>
                  <div className="ste-field">
                    <label>Display Name (CAPS)</label>
                    <input
                      type="text"
                      value={formData.displayNameCaps}
                      onChange={e => updateField('displayNameCaps', e.target.value)}
                      placeholder="e.g., THE MARKETING MACHINE"
                    />
                  </div>
                </div>
                <div className="ste-field-row">
                  <div className="ste-field ste-field--checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.enabled}
                        onChange={e => updateField('enabled', e.target.checked)}
                      />
                      Enabled
                    </label>
                  </div>
                </div>
              </section>

              {/* Subsections */}
              <section className="ste-section">
                <div className="ste-section-header">
                  <h3>Subsections</h3>
                  <button className="ste-btn ste-btn--small" onClick={addSubsection}>
                    + Add Subsection
                  </button>
                </div>

                {formData.subsections.map((sub, index) => (
                  <div key={index} className="ste-subsection-card">
                    <div className="ste-subsection-header">
                      <span className="ste-subsection-number">#{sub.number}</span>
                      <div className="ste-subsection-actions">
                        <button
                          className="ste-btn ste-btn--icon"
                          onClick={() => moveSubsection(index, -1)}
                          disabled={index === 0}
                          title="Move up"
                        >
                          &uarr;
                        </button>
                        <button
                          className="ste-btn ste-btn--icon"
                          onClick={() => moveSubsection(index, 1)}
                          disabled={index === formData.subsections.length - 1}
                          title="Move down"
                        >
                          &darr;
                        </button>
                        <button
                          className="ste-btn ste-btn--icon ste-btn--danger"
                          onClick={() => removeSubsection(index)}
                          title="Remove"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                    <div className="ste-field">
                      <label>Title</label>
                      <input
                        type="text"
                        value={sub.title}
                        onChange={e => updateSubsection(index, 'title', e.target.value)}
                        placeholder="e.g., Discovery & Research"
                      />
                    </div>
                    <div className="ste-field">
                      <label>Content (Markdown bullets)</label>
                      <textarea
                        value={sub.bodyMarkdown}
                        onChange={e => updateSubsection(index, 'bodyMarkdown', e.target.value)}
                        placeholder="- Bullet point 1&#10;- Bullet point 2&#10;- Bullet point 3"
                        rows={6}
                      />
                    </div>
                    <div className="ste-field ste-field--checkbox">
                      <label>
                        <input
                          type="checkbox"
                          checked={sub.allowClientSpecificEdits}
                          onChange={e => updateSubsection(index, 'allowClientSpecificEdits', e.target.checked)}
                        />
                        Allow client-specific edits
                      </label>
                    </div>
                  </div>
                ))}
              </section>

              {/* Investment */}
              <section className="ste-section">
                <h3>Investment</h3>
                <div className="ste-field-row">
                  <div className="ste-field">
                    <label>Pricing Model</label>
                    <select
                      value={formData.investment.model}
                      onChange={e => updateField('investment.model', e.target.value)}
                    >
                      <option value="one_time">One-Time</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div className="ste-field">
                    <label>Amount (USD)</label>
                    <input
                      type="number"
                      value={formData.investment.amount}
                      onChange={e => updateField('investment.amount', Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="ste-field">
                  <label>Render Hint (display text)</label>
                  <input
                    type="text"
                    value={formData.investment.renderHint}
                    onChange={e => updateField('investment.renderHint', e.target.value)}
                    placeholder="e.g., $7,500 one-time investment"
                  />
                </div>
                <div className="ste-field">
                  <label>Payment Notes</label>
                  <textarea
                    value={formData.investment.notes}
                    onChange={e => updateField('investment.notes', e.target.value)}
                    placeholder="e.g., Payment terms: 50% due at signing..."
                    rows={3}
                  />
                </div>
              </section>

              {/* Timeline & Outcome */}
              <section className="ste-section">
                <h3>Timeline & Outcome</h3>
                <div className="ste-field">
                  <label>Timeline</label>
                  <textarea
                    value={formData.timeline}
                    onChange={e => updateField('timeline', e.target.value)}
                    placeholder="e.g., Typically completed over 6-8 weeks..."
                    rows={3}
                  />
                </div>
                <div className="ste-field">
                  <label>Outcome</label>
                  <textarea
                    value={formData.outcome}
                    onChange={e => updateField('outcome', e.target.value)}
                    placeholder="e.g., You will have a complete marketing foundation..."
                    rows={3}
                  />
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
