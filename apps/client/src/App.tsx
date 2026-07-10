import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Authentication from './pages/Authentication';
import Builder from './pages/Builder';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import LaunchPad from './pages/LaunchPad';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Authentication />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/launch-pad" element={<LaunchPad />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
