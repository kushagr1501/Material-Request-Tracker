import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./components/Auth.tsx"
import MaterialRequests from "./pages/MaterialRequests.tsx";
import { useAuth } from "./hooks/useAuth.ts";
import { RefreshCw } from "lucide-react";

export default function App() {
  const { user, loading } = useAuth();

if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <div className="text-slate-600 font-medium">Loading requests...</div>
        </div>
      </div>
    );
  }

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
