// Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Input, Typography } from '@mui/joy';

const Login = ({ setAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Check if the user is already authenticated and redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthenticated(true); // Mark as authenticated
      navigate('/dashboard'); // Redirect to dashboard
    }
  }, [setAuthenticated, navigate]);

  const handleLogin = async () => {
    try {
      const response = await fetch('/admin-panel/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token); // Store token in local storage
        setAuthenticated(true); // Mark user as authenticated
        navigate('/dashboard'); // Redirect to dashboard
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Invalid credentials');
      }
    } catch (error) {
      setErrorMessage('An error occurred while logging in. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <div className="w-[500px] h-[400px] p-[5%] rounded-lg m-auto" style={{ position: 'relative' }}>
        <Typography level="h4" component="h1" sx={{ mb: 2 }}>
          Login
        </Typography>
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        {errorMessage && (
          <Typography color="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
        )}
        <Button
          variant="solid"
          sx={{
            minWidth: '100%',
            maxWidth: '100%',
            textTransform: 'capitalize',
            background: `"#C7DFF7`,
          }}
          onClick={handleLogin}
        >
          Login
        </Button>
      </div>
    </Box>
  );
};

export default Login;
