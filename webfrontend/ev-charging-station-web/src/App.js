import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './Components/ProtectedRoute';




//Nipun's Routes (Import here)
import Navigation from './Components/ChargingStation/Navigation';
import StationOperatorDashboard from './Pages/StationOperator/StationOperatorDashboard/StationOperatorDashboard';
import CreateStation from './Pages/Backoffice/ChargingStationManagement/CreateStation';
import EditStation from './Pages/Backoffice/ChargingStationManagement/EditStation';
import StationDetails from './Pages/Backoffice/ChargingStationManagement/StationDetails';
import ManageStations from './Pages/Backoffice/ChargingStationManagement/ManageStations';
import ScheduleManagement from './Pages/Backoffice/ScheduleManagement/ScheduleManagement';

















//Shenori's Routes (Import here)
import EVOwnerManagement from './Pages/Backoffice/EVOwnerManagement/EVOwnerManagement';
import BookingPage from './Pages/Booking/BookingPage';
import BackofficeDashboard from './Pages/Backoffice/BackOfficeDashboard';






























//Public Routes (Import here) 
import Login from './Pages/Login';
import Navbar from './Components/Layout/Navbar';












function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        {/*Nipun's Routes - starts at 94*/}
        <Route path="/" element={
          localStorage.getItem("token") ? (
            localStorage.getItem("role") === "Backoffice" ?
              <Navigate to="/backoffice-dashboard" replace /> :
              <Navigate to="/operator-dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        <Route path="/operator-dashboard" element={
          <ProtectedRoute allowedRoles={["StationOperator"]}>
            <StationOperatorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/create-station" element={
          <ProtectedRoute allowedRoles={["Backoffice"]}>
            <CreateStation />
          </ProtectedRoute>
        } />
        <Route path="/edit-station/:id" element={
          <ProtectedRoute allowedRoles={["Backoffice"]}>
            <EditStation />
          </ProtectedRoute>
        } />
        <Route path="/station/:id" element={
          <ProtectedRoute allowedRoles={["Backoffice", "StationOperator"]}>
            <StationDetails />
          </ProtectedRoute>
        } />
        <Route path="/manage-stations" element={
          <ProtectedRoute allowedRoles={["Backoffice"]}>
            <ManageStations />
          </ProtectedRoute>
        } />
        <Route path="/schedule" element={
          <ProtectedRoute allowedRoles={["Backoffice"]}>
            <ScheduleManagement />
          </ProtectedRoute>
        } />

        {/*Shenori's Routes - starts at 115*/}
        <Route path="/ev-owner-management" element={
          <ProtectedRoute allowedRoles={["Backoffice"]}>
            <EVOwnerManagement />
          </ProtectedRoute>
        } />
        <Route path="/bookings" element={
          <ProtectedRoute allowedRoles={["Backoffice", "StationOperator"]}>
            <BookingPage />
          </ProtectedRoute>
        } />
        <Route path="/backoffice-dashboard" element={
          <ProtectedRoute allowedRoles={["Backoffice"]}>
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
