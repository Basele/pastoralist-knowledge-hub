import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/common/Layout';
import HomePage from './pages/HomePage';
import KnowledgePage from './pages/KnowledgePage';
import KnowledgeDetailPage from './pages/KnowledgeDetailPage';
import ContributePage from './pages/ContributePage';
import MapPage from './pages/MapPage';
import CommunityPage from './pages/CommunityPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';

function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles.length && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="knowledge" element={<KnowledgePage />} />
        <Route path="knowledge/:id" element={<KnowledgeDetailPage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="contribute" element={
          <ProtectedRoute><ContributePage /></ProtectedRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="admin" element={
          <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN', 'ELDER_CUSTODIAN']}>
            <AdminPage />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}
