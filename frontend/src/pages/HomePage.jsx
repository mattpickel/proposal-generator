/**
 * Home Page - Landing page for creating/accessing proposals
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function HomePage() {
  const [opportunityId, setOpportunityId] = useState('');
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const data = await api.database.proposals.getAll();
      // Sort by most recently updated
      data.sort((a, b) => {
        const dateA = a.updatedAt?._seconds || a.updatedAt || 0;
        const dateB = b.updatedAt?._seconds || b.updatedAt || 0;
        return dateB - dateA;
      });
      setProposals(data);
    } catch (err) {
      console.error('Failed to load proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (opportunityId.trim()) {
      navigate(`/proposal/${opportunityId.trim()}`);
    }
  };

  const handleDelete = async (e, proposal) => {
    e.stopPropagation();
    const name = proposal.proposalJson?.cover?.forClientOrg || proposal.opportunityId || proposal.id;
    if (!confirm(`Delete proposal for "${name}"? This cannot be undone.`)) return;
    try {
      await api.proposalsV2.delete(proposal.id);
      setProposals(prev => prev.filter(p => p.id !== proposal.id));
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Failed to delete proposal: ' + err.message);
    }
  };

  const getProposalTitle = (p) =>
    p.proposalJson?.cover?.proposalTitle || `Proposal ${p.opportunityId || p.id}`;

  const getClientName = (p) =>
    p.proposalJson?.cover?.forClientOrg || p.proposalJson?.cover?.forClientName || '';

  const getServiceCount = (p) =>
    p.proposalJson?.services?.length || p.serviceIds?.length || 0;

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp._seconds
      ? new Date(timestamp._seconds * 1000)
      : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <h1>Good Circle Marketing</h1>
        <h2>Proposal Generator</h2>

        <form onSubmit={handleSubmit} className="opportunity-form">
          <label htmlFor="opportunityId">
            Enter Opportunity ID:
          </label>
          <input
            id="opportunityId"
            type="text"
            value={opportunityId}
            onChange={(e) => setOpportunityId(e.target.value)}
            placeholder="e.g., OPP-2024-123"
            autoFocus
          />
          <button type="submit" disabled={!opportunityId.trim()}>
            Create / Open Proposal
          </button>
        </form>

        <div className="home-info">
          <p>Enter an opportunity ID to create a new proposal or continue working on an existing one.</p>
        </div>

        {/* Recent Proposals */}
        <div className="home-proposals">
          <h3>Recent Proposals</h3>
          {loading ? (
            <p className="home-proposals-empty">Loading proposals...</p>
          ) : proposals.length === 0 ? (
            <p className="home-proposals-empty">No proposals yet.</p>
          ) : (
            <ul className="home-proposals-list">
              {proposals.slice(0, 10).map(p => (
                <li
                  key={p.id}
                  className="home-proposal-item"
                  onClick={() => navigate(`/proposal/${p.opportunityId || p.id}`)}
                >
                  <div className="home-proposal-info">
                    <span className="home-proposal-title">{getProposalTitle(p)}</span>
                    <span className="home-proposal-meta">
                      {getClientName(p)}
                      {getServiceCount(p) > 0 && ` \u00B7 ${getServiceCount(p)} services`}
                      {formatDate(p.updatedAt) && ` \u00B7 ${formatDate(p.updatedAt)}`}
                    </span>
                  </div>
                  <div className="home-proposal-actions">
                    <span className={`home-proposal-status home-proposal-status--${p.status || 'draft'}`}>
                      {p.status || 'draft'}
                    </span>
                    <button
                      className="home-proposal-delete"
                      onClick={(e) => handleDelete(e, p)}
                      title="Delete proposal"
                    >
                      &times;
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {proposals.length > 10 && (
            <a className="home-proposals-viewall" onClick={() => navigate('/proposals')}>
              View all {proposals.length} proposals &rarr;
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
