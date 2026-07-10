import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import TeamMemberDashboard from './pages/TeamMemberDashboard';
import ManagerDashboard from './pages/ManagerDashboard';

// ProtectedRoute Component: Ensures user is authenticated before accessing wrapped routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const authContext = useContext(AuthContext);
  
  // Wait for initial localStorage check to finish
  if (authContext?.loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading application...</p>
      </div>
    );
  }

  // If no user is found, redirect to login page
  if (!authContext?.user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the requested component
  return <>{children}</>;
};

// Role-based routing component for the root path
const DashboardRedirect = () => {
  const authContext = useContext(AuthContext);
  
  if (authContext?.user?.role === 'Manager') {
    return <ManagerDashboard />;
  }
  
  if (authContext?.user?.role === 'Team Member') {
    return <TeamMemberDashboard />;
  }
  
  // Fallback if role is undefined or invalid
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Invalid role detected.</p>
      <button onClick={authContext?.logout}>Sign Out</button>
    </div>
  );
};

// Main routing structure
const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

// Root App Component wrapped with AuthProvider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
