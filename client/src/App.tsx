import { Navigate } from "react-router-dom";
import { atminSelector } from "./hook/reduxHook";

export default function App() {
  const { isAuthenticated, userRole } = atminSelector((state) => state.auth);

  if (!isAuthenticated || !userRole) {
    return <Navigate to="/login" replace />;
  }

  const role = userRole.toLowerCase();

  if (role === "admin" || role === "staff") {
    return <Navigate to="/admin" replace />;
  }
  if (role === "agent") {
    return <Navigate to="/b2b" replace />;
  }
  if (role === "customer") {
    return <Navigate to="/b2c" replace />;
  }

  return <Navigate to="/login" replace />;
}
