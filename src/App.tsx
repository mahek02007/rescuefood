import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';

// Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { DemoModeBanner } from './components/common/DemoModeBanner';

import { DonationDetailModal } from './components/donations/DonationDetailModal';

// Pages
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { DonorDashboardPage } from './pages/DonorDashboardPage';
import { NgoDashboardPage } from './pages/NgoDashboardPage';
import { VolunteerDashboardPage } from './pages/VolunteerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AboutPage } from './pages/AboutPage';
import { ProfilePage } from './pages/ProfilePage';

// Protected Route Wrapper
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F8F2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#245C45]/20 border-t-[#245C45] animate-spin" />
          <p className="text-sm font-bold text-[#245C45]">Loading FoodRescue...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Main App Structure
const AppShell: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { donations } = useData();
  const location = useLocation();

  // Global detail modal handler for notifications
  const [globalDonationId, setGlobalDonationId] = useState<string | null>(null);
  const selectedDonation = donations.find((d) => d.id === globalDonationId) || null;

  const isAuthRoute = location.pathname === '/auth';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F2] text-[#25312D]">

      {/* Demo Mode Banner - always on top */}
      {!isAuthRoute && isAuthenticated && <DemoModeBanner />}

      {/* Main Navbar */}
      {!isAuthRoute && <Navbar onSelectDonation={(id) => setGlobalDonationId(id)} />}

      {/* App Routes */}
      <main className="flex-1">
        <Routes>
          <Route path="/auth" element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} />

          <Route
            path="/"
            element={
              <ProtectedLayout>
                <HomePage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/donate"
            element={
              <ProtectedLayout>
                <DonorDashboardPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/find-food"
            element={
              <ProtectedLayout>
                <NgoDashboardPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/volunteer"
            element={
              <ProtectedLayout>
                <VolunteerDashboardPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedLayout>
                <AdminDashboardPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/about"
            element={
              <ProtectedLayout>
                <AboutPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedLayout>
                <ProfilePage />
              </ProtectedLayout>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      {!isAuthRoute && <Footer />}

      {/* Global Notification Detail Modal */}
      <DonationDetailModal
        donation={selectedDonation}
        isOpen={!!selectedDonation}
        onClose={() => setGlobalDonationId(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
