import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";


import LoginPage from "./pages/auth/LoginPage";
import StaffDashboard from "./pages/staff/StaffDashboard";
import SupervisorDashboard from "./pages/supervisor/SupervisorDashboard";
import HeadDashboard from "./pages/head/HeadDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import RoleProtectedRoute from "./routes/RoleProtectedRoute";
import ApplyLeavePage from "./pages/staff/ApplyLeavePage";
import MyLeaveRequestsPage from "./pages/staff/MyLeaveRequestsPage";
import MyLeaveBalancesPage from "./pages/staff/MyLeaveBalancesPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/staff/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={["staff"]}>
              <StaffDashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/supervisor/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={["supervisor"]}>
              <SupervisorDashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/head/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={["head_of_unit"]}>
              <HeadDashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/staff/apply-leave"
          element={
            <RoleProtectedRoute allowedRoles={["staff"]}>
              <ApplyLeavePage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/staff/my-leave-requests"
          element={
            <RoleProtectedRoute allowedRoles={["staff"]}>
              <MyLeaveRequestsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/staff/my-leave-balances"
          element={
            <RoleProtectedRoute allowedRoles={["staff"]}>
              <MyLeaveBalancesPage />
            </RoleProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;