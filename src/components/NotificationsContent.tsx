"use client";

import { useState, useEffect } from "react";
import { 
  Bell, CheckCheck, Trash2, ArrowRight, KanbanSquare, 
  BookOpen, FileText, CheckCircle2, Clock, Sparkles, Filter
} from "lucide-react";

interface NotificationsContentProps {
  setActiveTab?: (tab: string) => void;
}

interface NotificationItem {
  id: string;
  category: "tasks" | "contents" | "notes" | "system";
  title: string;
  description: string;
  timeAgo: string;
  timestamp: number;
  read: boolean;
  targetTab: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    category: "contents",
    title: "Pengingat Rilis: Video Tilawah Juz 30",
    description: "Materi video tilawah terjadwal untuk dipublikasikan sore ini pukul 16.00 WIB.",
    timeAgo: "25 menit yang lalu",
    timestamp: Date.now() - 1500000,
    read: false,
    targetTab: "contents"
  },
  {
    id: "notif_2",
    category: "tasks",
    title: "Tugas Baru Ditugaskan: 'Review Naskah Tafsir'",
    description: "Nu'man menugaskan kartu kanban baru kepada Anda di kolom Perlu Dikerjakan.",
    timeAgo: "1 jam yang lalu",
    timestamp: Date.now() - 3600000,
    read: false,
    targetTab: "board"
  },
  {
    id: "notif_3",
    category: "tasks",
    title: "Tugas Selesai: 'Backup Link KBA'",
    description: "Tugas berhasil dipindahkan ke kolom Selesai oleh tim teknis.",
    timeAgo: "3 jam yang lalu",
    timestamp: Date.now() - 10800000,
    read: false,
    targetTab: "board"
  },
  {
    id: "notif_4",
    category: "notes",
    title: "Catatan SOP Baru Ditambahkan",
    description: "Dokumen standar penulisan transliterasi Arab telah diperbarui.",
    timeAgo: "Kemarin, 14.30 WIB",
    timestamp: Date.now() - 86400000,
    read: true,
    targetTab: "notes"
  },
  {
    id: "notif_5",
    category: "system",
    title: "Sinkronisasi Cloud Berhasil",
    description: "Semua data kartu dan materi tersinkronisasi aman ke cloud storage.",
    timeAgo: "2 hari yang lalu",
    timestamp: Date.now() - 172800000,
    read: true,
    targetTab: "settings"
  }
];

export default function NotificationsContent({ setActiveTab }: NotificationsContentProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filterType, setFilterType] = useState<"all" | "unread" | "tasks" | "contents">("all");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mqd_notifications");
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveNotifications = (newList: NotificationItem[]) => {
    setNotifications(newList);
    try {
      localStorage.setItem("mqd_notifications", JSON.stringify(newList));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("mqd_notifications_updated"));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const markSingleAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: !n.read } : n);
    saveNotifications(updated);
  };

  const clearReadNotifications = () => {
    const updated = notifications.filter(n => !n.read);
    saveNotifications(updated);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    if (filterType === "unread") return !n.read;
    if (filterType === "tasks") return n.category === "tasks";
    if (filterType === "contents") return n.category === "contents";
    return true;
  });

  return (
    <div className="p-3.5 sm:p-5 lg:p-6 max-w-4xl mx-auto space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 relative">
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white absolute -top-1 -right-1"></span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Pusat Pemberitahuan
              </h1>
              {unreadCount > 0 ? (
                <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  {unreadCount} Belum Dibaca
                </span>
              ) : (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Semua Terbaca
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Notifikasi operasional tugas tim, jadwal rilis dakwah, dan pengumuman sistem
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-emerald-700 transition-all cursor-pointer shadow-2xs"
            >
              <CheckCheck size={14} />
              <span>Tandai Semua Terbaca</span>
            </button>
          )}

          <button 
            onClick={clearReadNotifications}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-rose-600 transition-all cursor-pointer shadow-2xs"
          >
            <Trash2 size={13} />
            <span>Bersihkan Terbaca</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-xs">
        <button
          onClick={() => setFilterType("all")}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            filterType === "all" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Semua ({notifications.length})
        </button>

        <button
          onClick={() => setFilterType("unread")}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            filterType === "unread" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Belum Dibaca ({unreadCount})
        </button>

        <button
          onClick={() => setFilterType("tasks")}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            filterType === "tasks" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Papan Tugas
        </button>

        <button
          onClick={() => setFilterType("contents")}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            filterType === "contents" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Materi Dakwah
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Bell size={22} />
            </div>
            <p className="text-sm font-bold text-slate-700">Tidak ada notifikasi di kategori ini</p>
            <p className="text-xs text-slate-400">Semua tugas dan pemberitahuan telah Anda periksa.</p>
          </div>
        ) : (
          filtered.map((item) => {
            let iconEl = <KanbanSquare size={16} className="text-emerald-600" />;
            let iconBg = "bg-emerald-100";
            if (item.category === "contents") {
              iconEl = <BookOpen size={16} className="text-indigo-600" />;
              iconBg = "bg-indigo-100";
            } else if (item.category === "notes") {
              iconEl = <FileText size={16} className="text-amber-600" />;
              iconBg = "bg-amber-100";
            } else if (item.category === "system") {
              iconEl = <Sparkles size={16} className="text-slate-600" />;
              iconBg = "bg-slate-100";
            }

            return (
              <div 
                key={item.id}
                className={`p-4 sm:p-5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                  item.read ? "bg-white hover:bg-slate-50/60" : "bg-emerald-50/30 hover:bg-emerald-50/60"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Category Icon */}
                  <div className={`w-10 h-10 rounded-2xl ${iconBg} flex items-center justify-center shrink-0 shadow-xs`}>
                    {iconEl}
                  </div>

                  {/* Body Content */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      )}
                      <h4 className={`text-xs sm:text-sm font-bold ${item.read ? "text-slate-800" : "text-slate-950 font-extrabold"}`}>
                        {item.title}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.description}
                    </p>

                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 pt-0.5">
                      <Clock size={11} /> {item.timeAgo}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <button 
                    onClick={() => markSingleAsRead(item.id)}
                    className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    {item.read ? "Tandai Belum Dibaca" : "Tandai Dibaca"}
                  </button>

                  {setActiveTab && (
                    <button
                      onClick={() => setActiveTab(item.targetTab)}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline cursor-pointer group-hover:translate-x-0.5 transition-transform"
                    >
                      Buka Terkait <ArrowRight size={11} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
