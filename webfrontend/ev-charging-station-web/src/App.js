import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './Components/ProtectedRoute';




//Nipun's Routes (Import here)
import Navigation from './Components/ChargingStation/Navigation';
import Dashboard from './pages/StationOperator/StationOperatorDashboard/Dashboard';
import CreateStation from './pages/Backoffice/ChargingStationManagement/CreateStation';
import EditStation from './pages/Backoffice/ChargingStationManagement/EditStation';
import StationDetails from './pages/Backoffice/ChargingStationManagement/StationDetails';
import ManageStations from './pages/Backoffice/ChargingStationManagement/ManageStations';

















//Shenori's Routes (Import here)
import EVOwnerManagement from './pages/Backoffice/EVOwnerManagement/EVOwnerManagement';
import BookingPage from './pages/Booking/BookingPage';































//Public Routes (Import here) 
import Login from './pages/Login';














function App() {
  // const isAuthenticated = true; // Replace with actual authentication logic when needed

  return (
    <Router>
      <Navigation />
      <Routes>
        {/*Nipun's Routes - starts at 94*/}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-station" element={<CreateStation />} />
        <Route path="/edit-station/:id" element={<EditStation />} />
        <Route path="/station/:id" element={<StationDetails />} />
        <Route path="/manage-stations" element={<ManageStations />} />














        {/*Shenori's Routes - starts at 115*/}
        <Route path="/ev-owner-management" element={
          <ProtectedRoute allowedRoles={["Backoffice", "StationOperator"]}>
            <EVOwnerManagement />
          </ProtectedRoute>
        } />
        <Route path="/bookings" element={
          <ProtectedRoute allowedRoles={["Backoffice", "StationOperator"]}>
            <BookingPage />
          </ProtectedRoute>
        } />























        {/*Public Routes - starts at 140*/}
        <Route path="/login" element={<Login />} />












      </Routes>
    </Router>
  );
}

export default App;
