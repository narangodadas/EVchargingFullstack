import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import ProtectedRoute from "./Components/ProtectedRoute";






//Shenori's Routes (Import here)
import BackofficeDashboard from "./Pages/BackofficeDashboard";


















//Nipun's Routes (Import here)



















import LoginPage from './Pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />







        {/* Protected routes - starts from line 65 */}
        <Route
          path="/admin-dashboard"
          element={
              <BackofficeDashboard />
          }
        />


























          
          
          {/* Nipun's Routes (Add here) starts from line 100 */}































        {/* Default redirect to login */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
