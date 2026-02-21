import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { ROUTES } from '../constants/routes';
import { ROUTE_ROLES } from '../constants/roles';
import { LoginPage } from '../pages/AuthPage/LoginPage';
import { RegisterPage } from '../pages/AuthPage/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage/DashboardPage';
import { VehicleRegistryPage } from '../pages/VehicleRegistryPage/VehicleRegistryPage';
import { TripDispatcherPage } from '../pages/TripDispatcherPage/TripDispatcherPage';
import { MaintenancePage } from '../pages/MaintenancePage/MaintenancePage';
import { ExpensePage } from '../pages/ExpensePage/ExpensePage';
import { DriverProfilePage } from '../pages/DriverProfilePage/DriverProfilePage';
import { AnalyticsPage } from '../pages/AnalyticsPage/AnalyticsPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={ROUTE_ROLES.dashboard}>
                <DashboardPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.VEHICLES}
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={ROUTE_ROLES.vehicles}>
                <VehicleRegistryPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.TRIPS}
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={ROUTE_ROLES.trips}>
                <TripDispatcherPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MAINTENANCE}
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={ROUTE_ROLES.maintenance}>
                <MaintenancePage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.EXPENSES}
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={ROUTE_ROLES.expenses}>
                <ExpensePage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.DRIVERS}
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={ROUTE_ROLES.drivers}>
                <DriverProfilePage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ANALYTICS}
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={ROUTE_ROLES.analytics}>
                <AnalyticsPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Landing/Default points to Login */}
        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  );
};
