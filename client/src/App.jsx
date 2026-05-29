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
import MyLeaveRequestDetailPage from "./pages/staff/MyLeaveRequestDetailPage"
import SupervisorPendingRequestsPage from "./pages/supervisor/SupervisorPendingRequestsPage";
import SupervisorLeaveRequestDetailPage from "./pages/supervisor/SupervisorLeaveRequestDetailPage";
import HeadPendingRequestsPage from "./pages/head/HeadPendingRequestsPage";
import HeadLeaveRequestDetailPage from "./pages/head/HeadLeaveRequestDetailPage";
import UsersListPage from "./pages/admin/users/UsersListPage";
import CreateUserPage from "./pages/admin/users/CreateUserPage";
import EditUserPage from "./pages/admin/users/EditUserPage";
import UnitsListPage from "./pages/admin/units/UnitsListPage";
import CreateUnitPage from "./pages/admin/units/CreateUnitPage";
import EditUnitPage from "./pages/admin/units/EditUnitPage";
import RolesListPage from "./pages/admin/roles/RolesListPage";
import CreateRolePage from "./pages/admin/roles/CreateRolePage";
import EditRolePage from "./pages/admin/roles/EditRolePage";
import LeaveTypesListPage from "./pages/admin/leaveTypes/LeaveTypesListPage";
import CreateLeaveTypePage from "./pages/admin/leaveTypes/CreateLeaveTypePage";
import EditLeaveTypePage from "./pages/admin/leaveTypes/EditLeaveTypePage";
import LeaveBalancesListPage from "./pages/admin/leaveBalances/LeaveBalancesListPage";
import EditLeaveBalancePage from "./pages/admin/leaveBalances/EditLeaveBalancePage";










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
          path="/staff/my-leave-requests/:requestId"
          element={
            <RoleProtectedRoute allowedRoles={["staff"]}>
              <MyLeaveRequestDetailPage />
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

        {/* supervisor */}

        <Route
          path="/supervisor/pending-requests"
          element={
            <RoleProtectedRoute allowedRoles={["supervisor"]}>
              <SupervisorPendingRequestsPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/supervisor/leave-requests/:requestId"
          element={
            <RoleProtectedRoute allowedRoles={["supervisor"]}>
              <SupervisorLeaveRequestDetailPage />
            </RoleProtectedRoute>
          }
        />

        {/* HoU */}
        <Route
          path="/head/pending-requests"
          element={
            <RoleProtectedRoute allowedRoles={["head_of_unit"]}>
              <HeadPendingRequestsPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/head/leave-requests/:requestId"
          element={
            <RoleProtectedRoute allowedRoles={["head_of_unit"]}>
              <HeadLeaveRequestDetailPage />
            </RoleProtectedRoute>
          }
        />

        {/* admin panel */}
        <Route
          path="/admin/users"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <UsersListPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/users/create"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <CreateUserPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/users/:userId/edit"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <EditUserPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/units"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <UnitsListPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/units/create"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <CreateUnitPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/units/:unitId/edit"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <EditUnitPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/roles"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <RolesListPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/roles/create"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <CreateRolePage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/roles/:roleId/edit"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <EditRolePage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/leave-types"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <LeaveTypesListPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/leave-types/create"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <CreateLeaveTypePage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/leave-types/:leaveTypeId/edit"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <EditLeaveTypePage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/leave-balances"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <LeaveBalancesListPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/leave-balances/:balanceId/edit"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <EditLeaveBalancePage />
            </RoleProtectedRoute>
          }
        />








      </Routes>
    </BrowserRouter>
  );
}

export default App;