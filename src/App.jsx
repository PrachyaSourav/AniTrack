import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ListProvider } from "./context/ListContext";
import { ProfileProvider } from "./context/ProfileContext";
import { NotificationProvider } from "./context/NotificationContext";
import Navbar from "./components/Navbar";
import AuthPage from "./pages/AuthPage";
import DiscoverPage from "./pages/DiscoverPage";
import MyListPage from "./pages/MyListPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import TrendingPage from "./pages/TrendingPage";
import SocialPage from "./pages/SocialPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import ImportPage from "./pages/ImportPage";

function AppInner() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-white/10 border-t-accent rounded-full animate-spin" />
        <p className="text-white/30 text-sm">Loading...</p>
      </div>
    </div>
  );

  if (!user) return <AuthPage />;

  return (
    <ProfileProvider>
      <NotificationProvider>
        <ListProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-surface">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<DiscoverPage />} />
                  <Route path="/mylist" element={<MyListPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/trending" element={<TrendingPage />} />
                  <Route path="/social" element={<SocialPage />} />
                  <Route path="/foryou" element={<RecommendationsPage />} />
                  <Route path="/import" element={<ImportPage />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </ListProvider>
      </NotificationProvider>
    </ProfileProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
