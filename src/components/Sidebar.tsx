"use client";

import { useState, useEffect } from "react";
import { 
  LayoutGrid, KanbanSquare, BookOpen, FileText, Activity, 
  Book, Users, LogOut, X, Bell, User, Settings 
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (t: string) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (o: boolean) => void;
  isHovered?: boolean;
  setIsHovered?: (h: boolean) => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isMobileOpen,
  setIsMobileOpen
}: SidebarProps) {
  const { data } = useAppContext();

  // Real-time unread notification count
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);

  useEffect(() => {
    const checkUnread = () => {
      try {
        const saved = localStorage.getItem("mqd_notifications");
        if (saved) {
          const list = JSON.parse(saved);
          if (Array.isArray(list)) {
            setUnreadNotifCount(list.filter((n: any) => !n.read).length);
            return;
          }
        }
        setUnreadNotifCount(3);
      } catch {
        setUnreadNotifCount(0);
      }
    };

    checkUnread();
    window.addEventListener("mqd_notifications_updated", checkUnread);
    window.addEventListener("storage", checkUnread);
    return () => {
      window.removeEventListener("mqd_notifications_updated", checkUnread);
      window.removeEventListener("storage", checkUnread);
    };
  }, []);

  const menus = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutGrid size={18} /> },
    { id: "board", label: "Papan Tugas", icon: <KanbanSquare size={18} /> },
    { id: "contents", label: "Materi Konten", icon: <BookOpen size={18} /> },
    { id: "notes", label: "Catatan & SOP", icon: <FileText size={18} /> },
    { id: "activity", label: "Aktivitas", icon: <Activity size={18} /> },
    { id: "notifications", label: "Notifikasi", icon: <Bell size={18} />, badge: unreadNotifCount > 0 ? String(unreadNotifCount) : undefined },
    { id: "members", label: "Anggota Tim", icon: <Users size={18} /> },
    { id: "profile", label: "Profil Saya", icon: <User size={18} /> },
    { id: "settings", label: "Pengaturan", icon: <Settings size={18} /> },
    { id: "guide", label: "Panduan", icon: <Book size={18} /> },
  ];

  const handleMenuClick = (id: string) => {
    setActiveTab(id);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen?.(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container: Fixed permanent open on desktop (w-[220px]) */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 h-screen w-[220px] bg-[#0b1320] flex flex-col justify-between select-none border-r border-slate-800/80 text-white shadow-xl shadow-black/25 transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Section: Logo & Menus */}
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Header Brand: Permanent Logo & Title */}
          <div className="p-3.5 py-4 flex items-center justify-between border-b border-slate-800/60">
            <div className="flex items-center gap-3 min-w-0">
              {/* Emerald Squircle Logo Badge */}
              <div className="w-9 h-9 rounded-xl bg-[#10b981] shadow-md shadow-emerald-500/20 flex items-center justify-center shrink-0 transition-transform hover:scale-105">
                <BookOpen size={18} className="text-white stroke-[2.5]" />
              </div>

              {/* Brand Title (Always visible) */}
              <div className="min-w-0">
                <h1 className="font-extrabold text-white text-[14px] tracking-tight leading-tight truncate">
                  Ruang Kerja
                </h1>
                <p className="text-[9px] text-slate-400 font-bold tracking-wider uppercase truncate">
                  MADRASAH DIGITAL
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            {isMobileOpen && (
              <button
                onClick={() => setIsMobileOpen?.(false)}
                className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Menus List: Permanently visible labels & icons */}
          <div className="flex-1 overflow-y-auto px-2.5 py-3 flex flex-col gap-1 no-scrollbar">
            {menus.map((menu) => {
              const isActive = activeTab === menu.id;

              return (
                <button
                  key={menu.id}
                  onClick={() => handleMenuClick(menu.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 cursor-pointer relative group ${
                    isActive
                      ? "bg-[#10b981] text-white font-bold shadow-md shadow-emerald-500/25"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 font-semibold"
                  }`}
                >
                  {/* Icon */}
                  <span className={`shrink-0 flex items-center justify-center w-5 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-100"}`}>
                    {menu.icon}
                  </span>

                  {/* Label */}
                  <span className="truncate text-left whitespace-nowrap font-medium">
                    {menu.label}
                  </span>

                  {/* Badge */}
                  {menu.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#10b981] text-white ml-auto shrink-0 shadow-2xs border border-emerald-400/40">
                      {menu.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Bottom Section: Permanent Tombol Keluar & Status Cloud Sync */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0b1320] flex flex-col gap-2">
          {/* Action Pill "Keluar" */}
          <button
            onClick={() => setActiveTab('dashboard')}
            title="Keluar"
            className="w-full bg-[#131d2e] hover:bg-[#1a263c] text-slate-300 hover:text-white rounded-xl p-2.5 border border-slate-700/50 shadow-xs flex items-center gap-3 cursor-pointer transition-all duration-200 group"
          >
            <span className="shrink-0 flex items-center justify-center w-5 text-slate-400 group-hover:text-white group-hover:scale-110 transition-transform">
              <LogOut size={17} />
            </span>
            <span className="truncate text-[13px] font-bold whitespace-nowrap">
              Keluar
            </span>
          </button>

          {/* Realtime Status Indicator */}
          <div className="flex items-center gap-2 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
            </div>
            <span className="truncate">Cloud Sync Aktif</span>
          </div>
        </div>

      </aside>
    </>
  );
}
