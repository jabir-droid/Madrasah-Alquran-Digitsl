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
import ProfileContent from "@/components/ProfileContent";
import SettingsContent from "@/components/SettingsContent";
import NotificationsContent from "@/components/NotificationsContent";
import GuideModal from "@/components/GuideModal";
import AdminAuthModal from "@/components/AdminAuthModal";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showGuide, setShowGuide] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
          {activeTab === "profile" && <ProfileContent />}
          {activeTab === "settings" && <SettingsContent />}
          {activeTab === "members" && <MembersContent />}
        </main>
      </div>

      <GuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
      <AdminAuthModal />
    </div>
  );
}
