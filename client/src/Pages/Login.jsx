// Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Input, Typography } from '@mui/joy';
import '../App.css'
const Login = ({ setAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    // Simulate a login verification
    if (username === 'admin' && password === 'password') { // Replace with real verification logic
      setAuthenticated(true);
      navigate('/dashboard'); // Redirect to the dashboard after login
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <Box  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', }}>
<div className='w-[500px] h-[400px] p-[5%] rounded-lg m-auto  ' style={{ position: 'relative' }}>

    
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
       <Button
            
            variant="solid"
            sx={{
              minWidth: "100%",
              maxWidth: "100%",
              textTransform: "capitalize",
              background: `"#C7DFF7`,
            }}
            onClick={handleLogin}
          >Login</Button>
      
      </div>
    </Box>
  );
};

export default Login;
