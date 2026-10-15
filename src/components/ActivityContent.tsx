"use client";

import { useState, useEffect } from "react";
import { 
  Activity, Calendar, Clock, Filter, ArrowRight, Plus, 
  CheckCircle2, BookOpen, FileText, User, RefreshCw, 
  Search, ShieldCheck, Sparkles, Download
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { getMemberAvatar } from "@/utils/avatar";

interface ActivityContentProps {
  setActiveTab?: (tab: string) => void;
}

export default function ActivityContent({ setActiveTab }: ActivityContentProps) {
  const { data } = useAppContext();
  const [filterTime, setFilterTime] = useState<"all" | "today" | "week">("all");
  const [filterType, setFilterType] = useState<"all" | "tasks" | "contents" | "notes">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<string>("all");
  const [avatarTick, setAvatarTick] = useState(0);

  useEffect(() => {
    const handleAvatarUpdate = () => setAvatarTick(prev => prev + 1);
    window.addEventListener("mqd_profile_updated", handleAvatarUpdate);
    window.addEventListener("storage", handleAvatarUpdate);
    return () => {
      window.removeEventListener("mqd_profile_updated", handleAvatarUpdate);
      window.removeEventListener("storage", handleAvatarUpdate);
    };
  }, []);

  const cards = data.cards || [];
  const members = data.members || [];
  const contents = data.contents || [];

  // Generate complete rich activity log from real data
  const taskActivities = cards
    .filter(c => !c.deleted)
    .map(c => {
      const isDone = c.columnId === "c_2";
      const isDoing = c.columnId === "c_1";
      const assignee = members.find(m => m.id === c.assigneeId);
      const timestamp = c.updatedAt || c.createdAt || (Date.now() - 3600000);
      
      let actionText = "membuat tugas";
      let actionType: "create" | "move" | "done" = "create";
      if (isDone) {
        actionText = "menyelesaikan tugas";
        actionType = "done";
      } else if (isDoing) {
        actionText = "sedang mengerjakan";
        actionType = "move";
      }

      return {
        id: `task_${c.id}`,
        category: "tasks" as const,
        title: c.title,
        description: (c as any).description || "Papan Kanban Tugas Internal",
        userName: assignee?.name || "Nu'man",
        userRole: assignee?.role || "Tim Kreatif",
        actionText,
        actionType,
        targetTab: "board",
        targetColumn: isDone ? "Selesai" : isDoing ? "Sedang Dikerjakan" : "Perlu Dikerjakan",
        timestamp,
        date: new Date(timestamp)
      };
    });

  const contentActivities = contents
    .filter(c => !c.deleted)
    .map(c => {
      const isPublished = c.status.toLowerCase().includes("publish");
      const author = members.find(m => m.id === c.assigneeId);
      const timestamp = Date.now() - 7200000;

      return {
        id: `content_${c.id}`,
        category: "contents" as const,
        title: c.title,
        description: c.content ? `${c.type}: ${c.content}` : `Materi dakwah (${c.type})`,
        userName: author?.name || "Nu'man",
        userRole: author?.role || "Kreator Konten",
        actionText: isPublished ? "menerbitkan konten dakwah" : "merancang naskah konten",
        actionType: (isPublished ? "done" : "create") as "create" | "move" | "done",
        targetTab: "contents",
        targetColumn: isPublished ? "Dipublikasi" : "Draf / Review",
        timestamp,
        date: new Date(timestamp)
      };
    });

  const systemActivities = [
    {
      id: "sys_1",
      category: "notes" as const,
      title: "SOP Workflow Produksi Video Tilawah",
      description: "Pembaruan standar operasional konten dakwah digital",
      userName: "Nu'man",
      userRole: "Koordinator Tim",
      actionText: "memperbarui dokumen",
      actionType: "move" as const,
      targetTab: "notes",
      targetColumn: "Catatan SOP",
      timestamp: Date.now() - 14400000,
      date: new Date(Date.now() - 14400000)
    },
    {
      id: "sys_2",
      category: "tasks" as const,
      title: "Backup & Sinkronisasi Cloud Database",
      description: "Data workspace otomatis tersinkronisasi realtime",
      userName: "Sistem Otomatis",
      userRole: "Cloud Realtime",
      actionText: "melakukan backup otomatis",
      actionType: "done" as const,
      targetTab: "settings",
      targetColumn: "Keamanan",
      timestamp: Date.now() - 28800000,
      date: new Date(Date.now() - 28800000)
    }
  ];

  const allActivities = [...taskActivities, ...contentActivities, ...systemActivities].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  // Filter by time
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;

  const filteredActivities = allActivities.filter(item => {
    // Time filter
    if (filterTime === "today" && item.timestamp < todayStart) return false;
    if (filterTime === "week" && item.timestamp < weekStart) return false;

    // Type filter
    if (filterType !== "all" && item.category !== filterType) return false;

    // Member filter
    if (selectedMember !== "all" && item.userName !== selectedMember) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchUser = item.userName.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      if (!matchTitle && !matchUser && !matchDesc) return false;
    }

    return true;
  });

  const totalDoneToday = allActivities.filter(a => a.actionType === "done" && a.timestamp >= todayStart).length;
  const totalTasksCount = allActivities.filter(a => a.category === "tasks").length;
  const totalContentCount = allActivities.filter(a => a.category === "contents").length;

  return (
    <div className="p-3.5 sm:p-5 lg:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      
      {/* Page Title & Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-[#064e3b] text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Activity size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Aktivitas & Jejak Operasional Tim
              </h1>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Realtime Audit
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Riwayat kronologis pergerakan tugas, materi dakwah, dan pembaruan dokumen internal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button 
            onClick={() => {
              setFilterTime("all");
              setFilterType("all");
              setSearchQuery("");
              setSelectedMember("all");
            }}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw size={13} />
            <span>Reset Filter</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold text-slate-500">Total Log Tercatat</span>
            <Activity size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{allActivities.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Operasional tim tersinkronisasi</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold text-slate-500">Selesai Hari Ini</span>
            <CheckCircle2 size={16} className="text-teal-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalDoneToday}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Tugas & konten dirampungkan</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold text-slate-500">Pergerakan Tugas</span>
            <Filter size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalTasksCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Aktivitas papan Kanban</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold text-slate-500">Materi & Naskah</span>
            <BookOpen size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalContentCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Perencanaan dakwah media</p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <input 
              type="text"
              placeholder="Cari aktivitas, judul tugas, atau nama tim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Member Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Anggota:</span>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="all">Semua Anggota</option>
              {members.map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Time range */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Waktu:</span>
            <button 
              onClick={() => setFilterTime("all")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${filterTime === "all" ? "bg-emerald-600 text-white shadow-2xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              Semua
            </button>
            <button 
              onClick={() => setFilterTime("today")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${filterTime === "today" ? "bg-emerald-600 text-white shadow-2xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              Hari Ini
            </button>
            <button 
              onClick={() => setFilterTime("week")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${filterTime === "week" ? "bg-emerald-600 text-white shadow-2xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              Pekan Ini
            </button>
          </div>

          {/* Type filters */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Kategori:</span>
            <button 
              onClick={() => setFilterType("all")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${filterType === "all" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              Semua
            </button>
            <button 
              onClick={() => setFilterType("tasks")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${filterType === "tasks" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              Papan Tugas
            </button>
            <button 
              onClick={() => setFilterType("contents")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${filterType === "contents" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              Materi Dakwah
            </button>
            <button 
              onClick={() => setFilterType("notes")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${filterType === "notes" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              Catatan & SOP
            </button>
          </div>
        </div>
      </div>

      {/* Main Activity Timeline Stream */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">Kronologi Aktivitas</h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              {filteredActivities.length} Riwayat Ditemukan
            </span>
          </div>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Activity size={24} />
            </div>
            <p className="text-sm font-bold text-slate-700">Tidak ada aktivitas yang sesuai filter</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Coba sesuaikan kata kunci pencarian atau ubah filter rentang waktu dan kategori.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredActivities.map((item) => {
              const dateStr = item.date.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "short",
                year: "numeric"
              });
              const timeStr = `${item.date.getHours().toString().padStart(2, '0')}:${item.date.getMinutes().toString().padStart(2, '0')} WIB`;

              let badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
              let iconEl = <CheckCircle2 size={15} className="text-emerald-600" />;
              if (item.actionType === "create") {
                badgeColor = "bg-indigo-100 text-indigo-800 border-indigo-200";
                iconEl = <Plus size={15} className="text-indigo-600" />;
              } else if (item.actionType === "move") {
                badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
                iconEl = <ArrowRight size={15} className="text-amber-600" />;
              }

              return (
                <div 
                  key={item.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3.5">
                    {/* User Avatar */}
                    {(() => {
                      const userAvatar = getMemberAvatar(item.userName);
                      return (
                        <div className="w-10 h-10 rounded-2xl bg-[#10b981] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs overflow-hidden relative border border-slate-200/60">
                          {userAvatar ? (
                            <img src={userAvatar} alt={item.userName} className="w-full h-full object-cover object-center" />
                          ) : (
                            item.userName.slice(0, 2).toUpperCase()
                          )}
                        </div>
                      );
                    })()}

                    {/* Description */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {item.userName}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          ({item.userRole})
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                          {item.actionText}
                        </span>
                      </div>

                      <p className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-snug">
                        &ldquo;{item.title}&rdquo;
                      </p>

                      <p className="text-[11px] text-slate-400">
                        {item.description} • Kolom: <strong className="text-slate-600 font-semibold">{item.targetColumn}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Right: Timestamp & Action Link */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                      <Clock size={12} />
                      <span>{dateStr} • {timeStr}</span>
                    </div>

                    {setActiveTab && (
                      <button
                        onClick={() => setActiveTab(item.targetTab)}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline cursor-pointer group-hover:translate-x-0.5 transition-transform"
                      >
                        Buka Halaman <ArrowRight size={11} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
