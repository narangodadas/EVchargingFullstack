import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    if (role === "Backoffice") {
      return <Navigate to="/backoffice-dashboard" />;
    } else if (role === "StationOperator") {
      return <Navigate to="/operator-dashboard" />;
    } else {
      return <Navigate to="/login" />;
    }
  }

  return children;
};

export default ProtectedRoute;