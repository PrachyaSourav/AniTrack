import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ListProvider } from "./context/ListContext";
import Navbar from "./components/Navbar";
import DiscoverPage from "./pages/DiscoverPage";
import MyListPage from "./pages/MyListPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
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
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ListProvider>
  );
}
