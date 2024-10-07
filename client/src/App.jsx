// App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import JoyOrderDashboardTemplate from './Mainaap';
import Login from './Pages/Login';
import ProtectedRoute from './Pages/ProtectedRoutes/ProtectedRoutes';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  return (
<Router basename={import.meta.env.VITE_BASE_PATH}>
      <Routes>
        {/* <Route path="/" element={<Login setAuthenticated={setIsAuthenticated} />} /> */}
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <JoyOrderDashboardTemplate />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
