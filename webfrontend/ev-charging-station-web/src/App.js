import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './Components/ProtectedRoute';
import Navigation from './Components/ChargingStation/Navigation';
import StationOperatorDashboard from './Pages/StationOperator/StationOperatorDashboard/StationOperatorDashboard';
import CreateStation from './Pages/Backoffice/ChargingStationManagement/CreateStation';
import EditStation from './Pages/Backoffice/ChargingStationManagement/EditStation';
import StationDetails from './Pages/Backoffice/ChargingStationManagement/StationDetails';
import ManageStations from './Pages/Backoffice/ChargingStationManagement/ManageStations';
import ScheduleManagement from './Pages/Backoffice/ScheduleManagement/ScheduleManagement';
import EVOwnerManagement from './Pages/Backoffice/EVOwnerManagement/EVOwnerManagement';
import BookingPage from './Pages/Booking/BookingPage';
import BackofficeDashboard from './Pages/Backoffice/BackOfficeDashboard';
import Login from './Pages/Login';
import Navbar from './Components/Layout/Navbar';
import Home from './Pages/Home';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        {/*Nipun's Routes - starts at 94*/}
        <Route path="/" element={
          localStorage.getItem("token") ? (
            localStorage.getItem("role") === "Backoffice" ?
              <Navigate to="/backoffice-dashboard" replace /> :
              <Navigate to="/operator-dashboard" replace />
          ) : (
            <Navigate to="/" replace />
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

                {/*Nipun's Routes - starts at 94*/}
                <Route path="/create-station" element={<CreateStation />} />
                <Route path="/edit-station/:id" element={<EditStation />} />
                <Route path="/station/:id" element={<StationDetails />} />
                <Route path="/manage-stations" element={<ManageStations />} />

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
                <Route path="/" element={<Home />} />
        </Routes>
    </Router>
  );
}

export default App;