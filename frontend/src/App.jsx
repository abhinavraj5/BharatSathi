import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/UserDashboard';
import ExpertDashboard from './pages/ExpertDashboard';
import Schemes from './pages/Schemes';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function ExpertProtected({ children }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user || profile?.role !== "expert") {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/dashboard" element={
            <Protected>
              <UserDashboard />
            </Protected>
          } />

          <Route path="/expert" element={
            <ExpertProtected>
              <ExpertDashboard />
            </ExpertProtected>
          } />

          <Route path="/schemes" element={<Schemes />} />
        </Routes>

      </SocketProvider>
    </AuthProvider>
  );
}