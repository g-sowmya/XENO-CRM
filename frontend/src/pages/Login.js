import React from 'react';

const Login = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      <h2>Login to Mini CRM</h2>
      <button onClick={handleLogin} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
        Login with Google
      </button>
    </div>
  );
};

export default Login;
