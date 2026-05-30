import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";

import LoginPage from "./pages/auth/LoginPage";

import StaffDashboard from "./pages/staff/StaffDashboard";
import ApplyLeavePage from "./pages/staff/ApplyLeavePage";
import MyLeaveRequestsPage from "./pages/staff/MyLeaveRequestsPage";
import MyLeaveBalancesPage from "./pages/staff/MyLeaveBalancesPage";
import MyLeaveRequestDetailPage from "./pages/staff/MyLeaveRequestDetailPage";

import SupervisorDashboard from "./pages/supervisor/SupervisorDashboard";
import SupervisorPendingRequestsPage from "./pages/supervisor/SupervisorPendingRequestsPage";
import SupervisorLeaveRequestDetailPage from "./pages/supervisor/SupervisorLeaveRequestDetailPage";

import HeadDashboard from "./pages/head/HeadDashboard";
import HeadPendingRequestsPage from "./pages/head/HeadPendingRequestsPage";
import HeadLeaveRequestDetailPage from "./pages/head/HeadLeaveRequestDetailPage";

import AdminDashboard from "./pages/admin/AdminDashboard";

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

import RoleProtectedRoute from "./routes/RoleProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* staff */}
        <Route
          path="/staff/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={["staff"]}>
              <AppLayout>
                <StaffDashboard />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/staff/apply-leave"
          element={
            <RoleProtectedRoute allowedRoles={["staff"]}>
              <AppLayout>
                <ApplyLeavePage />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/staff/my-leave-requests"
          element={
            <RoleProtectedRoute allowedRoles={["staff"]}>
              <AppLayout>
                <MyLeaveRequestsPage />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/staff/my-leave-requests/:requestId"
          element={
            <RoleProtectedRoute allowedRoles={["staff"]}>
              <AppLayout>
                <MyLeaveRequestDetailPage />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/staff/my-leave-balances"
          element={
            <RoleProtectedRoute allowedRoles={["staff"]}>
              <AppLayout>
                <MyLeaveBalancesPage />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />

        {/* supervisor */}
        <Route
          path="/supervisor/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={["supervisor"]}>
              <AppLayout>
                <SupervisorDashboard />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/supervisor/pending-requests"
          element={
            <RoleProtectedRoute allowedRoles={["supervisor"]}>
              <AppLayout>
                <SupervisorPendingRequestsPage />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/supervisor/leave-requests/:requestId"
          element={
            <RoleProtectedRoute allowedRoles={["supervisor"]}>
              <AppLayout>
                <SupervisorLeaveRequestDetailPage />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />

        {/* head of unit */}
        <Route
          path="/head/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={["head_of_unit"]}>
              <AppLayout>
                <HeadDashboard />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/head/pending-requests"
          element={
            <RoleProtectedRoute allowedRoles={["head_of_unit"]}>
              <AppLayout>
                <HeadPendingRequestsPage />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/head/leave-requests/:requestId"
          element={
            <RoleProtectedRoute allowedRoles={["head_of_unit"]}>
              <AppLayout>
                <HeadLeaveRequestDetailPage />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />

        {/* admin */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AppLayout>
                <AdminDashboard />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AppLayout>
                <UsersListPage />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/users/create"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AppLayout>
                <CreateUserPage />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:userId/edit"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AppLayout>
                <EditUserPage />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/units"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AppLayout>
                <UnitsListPage />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/units/create"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AppLayout>
                <CreateUnitPage />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/units/:unitId/edit"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AppLayout>
                <EditUnitPage />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AppLayout>
                <RolesListPage />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/roles/create"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AppLayout>
                <CreateRolePage />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/roles/:roleId/edit"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AppLayout>
                <EditRolePage />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/leave-types"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AppLayout>
                <LeaveTypesListPage />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/leave-types/create"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AppLayout>
                <CreateLeaveTypePage />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/leave-types/:leaveTypeId/edit"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AppLayout>
                <EditLeaveTypePage />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/leave-balances"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AppLayout>
                <LeaveBalancesListPage />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/leave-balances/:balanceId/edit"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AppLayout>
                <EditLeaveBalancePage />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;