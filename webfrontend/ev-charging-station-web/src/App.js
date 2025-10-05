import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';





//Nipun's Routes (Import here)
import Navigation from './Components/ChargingStation/Navigation';
import Dashboard from './Pages/StationOperator/StationOperatorDashboard/Dashboard';
import CreateStation from './Pages/Backoffice/ChargingStationManagement/CreateStation';
import EditStation from './Pages/Backoffice/ChargingStationManagement/EditStation';
import StationDetails from './Pages/Backoffice/ChargingStationManagement/StationDetails';
import ManageStations from './Pages/Backoffice/ChargingStationManagement/ManageStations';

















//Shenori's Routes (Import here)
import EVOwnerManagement from './Pages/Backoffice/EVOwnerManagement/EVOwnerManagement';
































//Public Routes (Import here) 
import Login from './Pages/Login';














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
                {/*Nipun's Routes - starts at 94*/}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-station" element={<CreateStation />} />
                <Route path="/edit-station/:id" element={<EditStation />} />
                <Route path="/station/:id" element={<StationDetails />} />
                <Route path="/manage-stations" element={<ManageStations />} />














                {/*Shenori's Routes - starts at 115*/}
                <Route path="/ev-owner-management" element={<EVOwnerManagement />} />























                
                {/*Public Routes - starts at 140*/}













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
