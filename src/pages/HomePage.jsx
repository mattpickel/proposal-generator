/**
 * Home Page - Simple landing page for creating/accessing proposals
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [opportunityId, setOpportunityId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (opportunityId.trim()) {
      navigate(`/proposal/${opportunityId.trim()}`);
    }
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
      </div>
    </div>
  );
}
