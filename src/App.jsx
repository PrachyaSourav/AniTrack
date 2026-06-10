import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ListProvider } from "./context/ListContext";
import { ProfileProvider } from "./context/ProfileContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ThemeProvider } from "./context/ThemeContext";
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
import BottomNav from "./components/BottomNav";
import InstallPrompt from "./components/InstallPrompt";
import EmailNotificationsPage from "./pages/EmailNotificationsPage";

function AppInner() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"var(--bg)"}}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-t-accent rounded-full animate-spin" style={{borderColor:"var(--border2)",borderTopColor:"var(--accent)"}}/>
        <p className="text-sm" style={{color:"var(--text3)"}}>Loading...</p>
      </div>
    </div>
  );
  if (!user) return <AuthPage />;
  return (
    <ProfileProvider>
      <NotificationProvider>
        <ListProvider>
          <BrowserRouter>
            <div className="min-h-screen" style={{background:"var(--bg)"}}>
              <Navbar />
              <main className="pb-16 md:pb-0">
                <Routes>
                  <Route path="/" element={<DiscoverPage />} />
                  <Route path="/mylist" element={<MyListPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/trending" element={<TrendingPage />} />
                  <Route path="/social" element={<SocialPage />} />
                  <Route path="/foryou" element={<RecommendationsPage />} />
                  <Route path="/import" element={<ImportPage />} />
                  <Route path="/notifications/email" element={<EmailNotificationsPage />} />
                </Routes>
              </main>
              <BottomNav />
              <InstallPrompt />
            </div>
          </BrowserRouter>
        </ListProvider>
      </NotificationProvider>
    </ProfileProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ThemeProvider>
  );
}
