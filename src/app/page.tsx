"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import DashboardContent from "@/components/DashboardContent";
import BoardContent from "@/components/BoardContent";
import ContentPlanner from "@/components/ContentPlanner";
import NotesContent from "@/components/NotesContent";
import MembersContent from "@/components/MembersContent";
import ActivityContent from "@/components/ActivityContent";
import SettingsContent from "@/components/SettingsContent";
import NotificationsContent from "@/components/NotificationsContent";
import GuideModal from "@/components/GuideModal";
import AdminAuthModal from "@/components/AdminAuthModal";
import LoginPage from "@/components/LoginPage";
import { useAppContext } from "@/context/AppContext";
import { BookOpen } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isAuthLoading } = useAppContext();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showGuide, setShowGuide] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Jika sesi sedang diperiksa di localStorage
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#070d18] flex flex-col items-center justify-center text-white">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/25 animate-pulse mb-4">
          <BookOpen size={26} className="stroke-[2.5]" />
        </div>
        <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-2.5" />
        <p className="text-[11px] font-bold text-slate-300 tracking-wider uppercase">
          Memuat Ruang Kerja Madrasah...
        </p>
      </div>
    );
  }

  // Jika belum login, tampilkan halaman Login resmi
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleTabChange = (tab: string) => {
    if (tab === "guide") {
      setShowGuide(true);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800 selection:bg-brand-200">
      {/* Sidebar (Paten / tetap terbuka di desktop, drawer di mobile) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Desktop fixed spacer (220px) matching sidebar width */}
      <div className="shrink-0 hidden lg:block w-[220px]" />
      
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          onOpenGuide={() => setShowGuide(true)} 
          onToggleSidebar={() => setIsMobileOpen(prev => !prev)}
        />
        
        <main className="flex-1 overflow-y-auto">
          {activeTab === "dashboard" && (
            <DashboardContent 
              setActiveTab={setActiveTab} 
              onOpenGuide={() => setShowGuide(true)} 
            />
          )}
          {activeTab === "board" && <BoardContent />}
          {activeTab === "contents" && <ContentPlanner />}
          {activeTab === "notes" && <NotesContent />}
          {activeTab === "activity" && <ActivityContent setActiveTab={setActiveTab} />}
          {activeTab === "notifications" && <NotificationsContent setActiveTab={setActiveTab} />}
          {activeTab === "settings" && <SettingsContent />}
          {activeTab === "members" && <MembersContent />}
        </main>
      </div>

      <GuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
      <AdminAuthModal />
    </div>
  );
}
