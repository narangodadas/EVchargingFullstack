import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './Components/ProtectedRoute';




//Nipun's Routes (Import here)
import Navigation from './Components/ChargingStation/Navigation';
import Dashboard from './Pages/StationOperator/StationOperatorDashboard/Dashboard';
import CreateStation from './Pages/Backoffice/ChargingStationManagement/CreateStation';
import EditStation from './Pages/Backoffice/ChargingStationManagement/EditStation';
import StationDetails from './Pages/Backoffice/ChargingStationManagement/StationDetails';
import ManageStations from './Pages/Backoffice/ChargingStationManagement/ManageStations';

















//Shenori's Routes (Import here)
import EVOwnerManagement from './Pages/Backoffice/EVOwnerManagement/EVOwnerManagement';
import BookingPage from './Pages/Booking/BookingPage';
import BackofficeDashboard from './Pages/Backoffice/BackOfficeDashboard';






























//Public Routes (Import here) 
import Login from './Pages/Login';














function App() {
  const isAuthenticated = true; // Replace with actual authentication logic

  return (
    <Router>
            <Navigation />
              <Routes>
                {/*Nipun's Routes - starts at 94*/}
                <Route path="/" element={<Navigate to="/login" replace />} />
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
                <Route path="/backoffice-dashboard" element={
                  <ProtectedRoute allowedRoles={["Backoffice", "StationOperator"]}>
                    <BackofficeDashboard />
                  </ProtectedRoute>
                } />






















                
                {/*Public Routes - starts at 140*/}
                <Route path="/login" element={<Login />} />












              </Routes>
    </Router>
  );
}

export default App;
