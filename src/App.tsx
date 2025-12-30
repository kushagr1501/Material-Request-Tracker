import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./components/Auth.tsx"
import MaterialRequests from "./pages/MaterialRequests.tsx";
import { useAuth } from "./hooks/useAuth.ts";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>

      <Route
        path="/login"
        element={!user ? <Auth /> : <Navigate to="/material-requests" />}
      />

      <Route
        path="/material-requests"
        element={user ? <MaterialRequests /> : <Navigate to="/login" />}
      />
      
      
      <Route path="*" element={<Navigate to="/material-requests" />} />
    </Routes>
  );
}
