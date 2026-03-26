/**
 * Main Application Component - Router
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProposalBuilderPage from './pages/ProposalBuilderPage';
import ServiceTemplateEditorPage from './pages/ServiceTemplateEditorPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/proposal/:opportunityId" element={<ProposalBuilderPage />} />
      <Route path="/admin/services" element={<ServiceTemplateEditorPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
