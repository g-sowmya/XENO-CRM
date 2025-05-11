import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import CreateCampaign from './pages/CreateCampaign';
import History from './pages/History';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in by calling backend or checking session
    // For demo, assume user is logged in if session exists
    fetch('http://localhost:5000/auth/check', { credentials: 'include' })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then(data => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

const PrivateRoute = ({ children }) => {
  const { user } = React.useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/create-campaign" element={
            <PrivateRoute>
              <CreateCampaign />
            </PrivateRoute>
          } />
          <Route path="/history" element={
            <PrivateRoute>
              <History />
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
