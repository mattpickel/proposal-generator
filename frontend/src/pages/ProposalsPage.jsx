/**
 * Proposals Page - Full list of proposals with management actions
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import api from '../services/api';

export default function ProposalsPage() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const data = await api.database.proposals.getAll();
      data.sort((a, b) => {
        const dateA = a.updatedAt?._seconds || a.updatedAt || 0;
        const dateB = b.updatedAt?._seconds || b.updatedAt || 0;
        return dateB - dateA;
      });
      setProposals(data);
    } catch (err) {
      showToast('Failed to load proposals: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (e, id) => {
    e.stopPropagation();
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(p => p.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} proposal${selected.size > 1 ? 's' : ''}? This cannot be undone.`)) return;
    setDeleting(true);
    let deleted = 0;
    for (const id of selected) {
      try {
        await api.proposalsV2.delete(id);
        deleted++;
      } catch (err) {
        console.error(`Failed to delete ${id}:`, err);
      }
    }
    setProposals(prev => prev.filter(p => !selected.has(p.id)));
    setSelected(new Set());
    setDeleting(false);
    showToast(`Deleted ${deleted} proposal${deleted > 1 ? 's' : ''}`);
  };

  const getProposalTitle = (p) =>
    p.proposalJson?.cover?.proposalTitle || `Proposal ${p.opportunityId || p.id}`;

  const getClientName = (p) =>
    p.proposalJson?.cover?.forClientOrg || p.proposalJson?.cover?.forClientName || '';

  const getServiceNames = (p) =>
    p.proposalJson?.services?.map(s => s.displayNameCaps).join(', ') || '';

  const getServiceCount = (p) =>
    p.proposalJson?.services?.length || p.serviceIds?.length || 0;

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp._seconds
      ? new Date(timestamp._seconds * 1000)
      : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filtered = proposals.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      getProposalTitle(p).toLowerCase().includes(q) ||
      getClientName(p).toLowerCase().includes(q) ||
      (p.opportunityId || '').toLowerCase().includes(q) ||
      getServiceNames(p).toLowerCase().includes(q)
    );
  });

  return (
    <div className="pp-page">
      {toast && (
        <div className={`ste-toast ste-toast--${toast.type}`}>
          {toast.message}
        </div>
      )}

      <Header />

      <div className="pp-toolbar">
        <div className="pp-toolbar-left">
          <h1>Proposals</h1>
          {selected.size > 0 && (
            <button
              className="ste-btn ste-btn--danger"
              onClick={handleDeleteSelected}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : `Delete ${selected.size} selected`}
            </button>
          )}
        </div>
        <div className="pp-toolbar-right">
          <input
            type="text"
            className="pp-search"
            placeholder="Search proposals..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            className="ste-btn ste-btn--primary"
            onClick={() => navigate('/')}
          >
            + New Proposal
          </button>
        </div>
      </div>

      <div className="pp-content">
        {loading ? (
          <p className="pp-empty">Loading proposals...</p>
        ) : filtered.length === 0 ? (
          <p className="pp-empty">
            {search ? 'No proposals match your search.' : 'No proposals yet.'}
          </p>
        ) : (
          <table className="pp-table">
            <thead>
              <tr>
                <th className="pp-cell-check">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selected.size === filtered.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Title</th>
                <th>Client</th>
                <th>Services</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr
                  key={p.id}
                  className={`pp-row ${selected.has(p.id) ? 'pp-row--selected' : ''}`}
                  onClick={() => navigate(`/proposal/${p.opportunityId || p.id}`)}
                >
                  <td className="pp-cell-check" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={e => toggleSelect(e, p.id)}
                    />
                  </td>
                  <td className="pp-cell-title">
                    <span className="pp-title">{getProposalTitle(p)}</span>
                    <span className="pp-opp-id">{p.opportunityId || p.id}</span>
                  </td>
                  <td>{getClientName(p)}</td>
                  <td>
                    {getServiceCount(p) > 0 && (
                      <span className="pp-service-count">{getServiceCount(p)} services</span>
                    )}
                  </td>
                  <td>
                    <span className={`home-proposal-status home-proposal-status--${p.status || 'draft'}`}>
                      {p.status || 'draft'}
                    </span>
                  </td>
                  <td className="pp-cell-date">{formatDate(p.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
