import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';

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

// Placeholder Dashboard Component
const DashboardPlaceholder = () => {
  const authContext = useContext(AuthContext);
  
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Dashboard Placeholder</h1>
      <div style={{ backgroundColor: '#f3f4f6', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem' }}>
        <p><strong>Welcome,</strong> {authContext?.user?.name}!</p>
        <p><strong>Email:</strong> {authContext?.user?.email}</p>
        <p>
          <strong>Role:</strong>{' '}
          <span style={{ 
            backgroundColor: authContext?.user?.role === 'Manager' ? '#dbeafe' : '#dcfce7',
            color: authContext?.user?.role === 'Manager' ? '#1e40af' : '#166534',
            padding: '4px 8px', 
            borderRadius: '4px',
            fontSize: '0.875rem' 
          }}>
            {authContext?.user?.role}
          </span>
        </p>
        <button 
          onClick={authContext?.logout}
          style={{
            marginTop: '1.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
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
              <DashboardPlaceholder />
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
