import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Personal from "./pages/Personal";
import ChangePassword from "./pages/ChangePassword";
import NotFound from "./pages/NotFound";

import "./App.css";
import ReportsPage from "./pages/Reports";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          {/* <div className="min-h-screen bg-background"> */}
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Outlet />
                    </AppLayout>
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="asistencias" element={<Attendance />} />
                 <Route path="reports" element={<ReportsPage />} />
                <Route path="personal" element={<Personal />} />
                <Route path="cambiar-contrasena" element={<ChangePassword />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          {/* </div> */}
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;