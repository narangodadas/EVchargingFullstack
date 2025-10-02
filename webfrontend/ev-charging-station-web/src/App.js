import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import CreateStation from './pages/CreateStation';
import EditStation from './pages/EditStation';
import StationDetails from './pages/StationDetails';
import ManageStations from './pages/ManageStations';
import Login from './pages/Login';

function App() {
  const isAuthenticated = true; // Replace with actual authentication logic

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {isAuthenticated ? (
          <>
            <Navigation />
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-station" element={<CreateStation />} />
                <Route path="/edit-station/:id" element={<EditStation />} />
                <Route path="/station/:id" element={<StationDetails />} />
                <Route path="/manage-stations" element={<ManageStations />} />
              </Routes>
            </main>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
