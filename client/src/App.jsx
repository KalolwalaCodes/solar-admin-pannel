// App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import JoyOrderDashboardTemplate from './Mainaap';
import Login from './Pages/Login';
import ProtectedRoute from './Pages/ProtectedRoutes/ProtectedRoutes';
import './App.css'
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role,setRole]=useState('')
 // Logout function
 const handleLogout = () => {
  localStorage.removeItem('authToken'); // Remove the token
  setIsAuthenticated(false); // Set authentication to false
  navigate('/'); // Redirect to login
};
  return (
    <Router basename="/admin-pannel">
      <Routes>
        <Route path="/" element={<Login setRole={setRole} setAuthenticated={setIsAuthenticated} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <JoyOrderDashboardTemplate role={role} handleLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
