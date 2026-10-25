import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import CreateCase from './pages/CreateCase';
import Evidence from './pages/Evidence';
import UploadEvidence from './pages/UploadEvidence';
import EvidenceDetails from './pages/EvidenceDetails';
import Reports from './pages/Reports';
import Users from './pages/Users';
import AuditLogs from './pages/AuditLogs';
import SystemConfig from './pages/SystemConfig';
import SystemHealth from './pages/SystemHealth';
import { AuthContext } from './context/AuthContext';
import { useContext } from 'react';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="cases" element={<Cases />} />
        <Route path="cases/new" element={<CreateCase />} />
        <Route path="evidence" element={<Evidence />} />
        <Route path="evidence/new" element={<UploadEvidence />} />
        <Route path="evidence/:id" element={<EvidenceDetails />} />
        <Route path="reports" element={<Reports />} />
        <Route path="audit" element={<AuditLogs />} />
        <Route path="settings" element={<SystemConfig />} />
        <Route path="health" element={<SystemHealth />} />
      </Route>
    </Routes>
  );
}

export default App;
