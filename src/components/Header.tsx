import { Bell, HelpCircle, Menu, Settings, ChevronDown, Check, Shield, Sparkles, BookOpen, User, Clock, Calendar, ShieldCheck, Layers, Lock, Key, LogOut } from "lucide-react";
import { useAppContext, PRESET_USERS, UserRole, getMemberRoleCategory } from "@/context/AppContext";
import { useState, useRef, useEffect } from "react";
import { getMemberAvatar } from "@/utils/avatar";

interface HeaderProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onOpenGuide?: () => void;
  onToggleSidebar?: () => void;
}

export default function Header({ activeTab, setActiveTab, onOpenGuide, onToggleSidebar }: HeaderProps) {
  const { 
    data,
    currentUser, 
    switchUser, 
    logout,
    syncStatus, 
    syncNow,
    isAdminVerified,
    openAdminModal,
    openMemberModal,
    lockAdmin
  } = useAppContext();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Live Real-Time Clock
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${h}:${m}:${s}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time Unread Notifications Tracker
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

  // Real-time User Avatar Image Tracker
  const [userAvatarUrl, setUserAvatarUrl] = useState<string>("");

  useEffect(() => {
    const checkAvatar = () => {
      try {
        const found = getMemberAvatar(currentUser.id) || getMemberAvatar(currentUser.name);
        setUserAvatarUrl(found || "");
      } catch {
        setUserAvatarUrl("");
      }
    };

    checkAvatar();
    window.addEventListener("mqd_profile_updated", checkAvatar);
    window.addEventListener("storage", checkAvatar);
    return () => {
      window.removeEventListener("mqd_profile_updated", checkAvatar);
      window.removeEventListener("storage", checkAvatar);
    };
  }, [currentUser]);

  // Setting Hijri Date Visibility
  const [showHijri, setShowHijri] = useState(true);

  useEffect(() => {
    const checkSettings = () => {
      try {
        const saved = localStorage.getItem("mqd_setting_hijri");
        if (saved !== null) {
          setShowHijri(saved === "true");
        }
      } catch {}
    };

    checkSettings();
    window.addEventListener("mqd_settings_updated", checkSettings);
    window.addEventListener("storage", checkSettings);
    return () => {
      window.removeEventListener("mqd_settings_updated", checkSettings);
      window.removeEventListener("storage", checkSettings);
    };
  }, []);

  // Real-time Indonesian Gregorian & Hijri Date
  const getHeaderDates = () => {
    try {
      const now = new Date();
      const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"];
      const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      
      const dayName = days[now.getDay()];
      const dayNum = String(now.getDate()).padStart(2, '0');
      const monthName = months[now.getMonth()];
      const year = now.getFullYear();
      const gregText = `${dayName}, ${dayNum} ${monthName} ${year} M`;

      // Hijri calculation
      const parts = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).formatToParts(now);

      const hDay = parts.find(p => p.type === 'day')?.value || '27';
      const rawMonth = (parts.find(p => p.type === 'month')?.value || '').toLowerCase();
      let hMonth = "Robi'ul Akhir";
      if (rawMonth.includes("rabiulakhir") || rawMonth.includes("rab. akhir") || rawMonth.includes("thani")) {
        hMonth = "Robi'ul Akhir";
      } else if (rawMonth.includes("rabiulawal") || rawMonth.includes("rab. awal") || rawMonth.includes("awwal")) {
        hMonth = "Rabi'ul Awwal";
      } else if (rawMonth.includes("jumadilawal") || rawMonth.includes("jum. awal") || rawMonth.includes("al-awwal")) {
        hMonth = "Jumadil Ula";
      } else if (rawMonth.includes("jumadilakhir") || rawMonth.includes("jum. akhir") || rawMonth.includes("al-thani")) {
        hMonth = "Jumadits Tsani";
      } else if (rawMonth.includes("muharam") || rawMonth.includes("muharram")) hMonth = "Muharram";
      else if (rawMonth.includes("safar")) hMonth = "Safar";
      else if (rawMonth.includes("rajab")) hMonth = "Rajab";
      else if (rawMonth.includes("syakban") || rawMonth.includes("sha'ban")) hMonth = "Sya'ban";
      else if (rawMonth.includes("ramadan") || rawMonth.includes("ramadhan")) hMonth = "Ramadhan";
      else if (rawMonth.includes("syawal") || rawMonth.includes("shawwal")) hMonth = "Syawwal";
      else if (rawMonth.includes("zulkaidah") || rawMonth.includes("dzulqa'dah")) hMonth = "Dzulqa'dah";
      else if (rawMonth.includes("zulhijah") || rawMonth.includes("dzulhijjah")) hMonth = "Dzulhijjah";

      const hYear = parts.find(p => p.type === 'year')?.value || '1448';
      const hijriText = `${hDay} ${hMonth} ${hYear} H`;

      return { gregText, hijriText };
    } catch (e) {
      return {
        gregText: "Kamis, 08 Oktober 2026 M",
        hijriText: "27 Robi'ul Akhir 1448 H"
      };
    }
  };

  const [mounted, setMounted] = useState(false);
  const [headerDates, setHeaderDates] = useState({
    gregText: "Kamis, 08 Oktober 2026 M",
    hijriText: "27 Robi'ul Akhir 1448 H"
  });

  useEffect(() => {
    setMounted(true);
    setHeaderDates(getHeaderDates());
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-[#f8fafc] border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-20">
      {/* Left: Sidebar Toggle + Full Indonesian & Hijri Date (Gantikan Search) */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            title="Buka / Tutup Sidebar"
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="flex items-center gap-2.5 bg-white/90 border border-slate-200/90 px-3 py-1.5 rounded-2xl shadow-2xs" suppressHydrationWarning>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
            <Calendar size={15} className="stroke-[2.2]" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs" suppressHydrationWarning>
            <span className="font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
              {headerDates.gregText}
            </span>
            {showHijri && (
              <>
                <span className="text-slate-300 font-bold">/</span>
                <span className="font-bold text-emerald-800 whitespace-nowrap">
                  {headerDates.hijriText}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Center: Live Real-Time Clock */}
      <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs" suppressHydrationWarning>
        <Clock size={15} className="text-emerald-700 animate-pulse shrink-0" />
        <span className="font-mono text-xs sm:text-[13px] font-black text-slate-800 tracking-wider tabular-nums" suppressHydrationWarning>
          {currentTime || "18:58:24"}
        </span>
        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/70">
          WIB
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Realtime Cloud Sync Badge */}
        <button
          onClick={() => syncNow()}
          title="Status Sinkronisasi Cloud. Klik untuk memperbarui data sekarang."
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
            syncStatus === "syncing"
              ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
              : syncStatus === "error"
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
          }`}
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${
            syncStatus === "syncing" ? "bg-amber-500 animate-ping" : syncStatus === "error" ? "bg-rose-500" : "bg-emerald-500"
          }`}></span>
          <span>{syncStatus === "syncing" ? "Menyinkronkan..." : syncStatus === "error" ? "Offline" : "Sinkron Cloud"}</span>
        </button>

        <button 
          onClick={onOpenGuide}
          title="Panduan Ruang Kerja"
          className="p-2 text-slate-500 hover:bg-slate-200/60 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          <HelpCircle size={18} />
        </button>

        <button 
          onClick={() => setActiveTab?.('notifications')}
          title={unreadNotifCount > 0 ? `${unreadNotifCount} pemberitahuan belum dibaca` : "Pemberitahuan & Notifikasi (Semua terbaca)"}
          className={`p-2 rounded-xl transition-colors relative cursor-pointer ${
            activeTab === 'notifications' 
              ? 'bg-emerald-100 text-emerald-800' 
              : 'text-slate-500 hover:bg-slate-200/60 hover:text-slate-800'
          }`}
        >
          <Bell size={18} />
          {unreadNotifCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-[#f8fafc]"></span>
          )}
        </button>

        <button 
          onClick={() => setActiveTab?.('settings')}
          title="Pengaturan Sistem"
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'settings' 
              ? 'bg-emerald-100 text-emerald-800' 
              : 'text-slate-500 hover:bg-slate-200/60 hover:text-slate-800'
          }`}
        >
          <Settings size={18} />
        </button>

        {/* User Profile Pill Button with Role Switcher Dropdown */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            title="Ganti Peran / Buka Profil"
            className={`flex items-center gap-2 sm:gap-2.5 p-1 sm:pr-2.5 rounded-2xl transition-all cursor-pointer border ${
              activeTab === 'profile' || showRoleMenu
                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                : 'border-slate-200/60 bg-white hover:bg-slate-50 shadow-2xs'
            }`}
          >
            <div className={`w-8 h-8 rounded-full ${currentUser.avatarBg} text-white flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-xs overflow-hidden`}>
              {userAvatarUrl ? (
                <img src={userAvatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser.initials
              )}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1.5">
                {currentUser.name}
                {currentUser.role === "admin" ? (
                  <ShieldCheck size={12} className="text-emerald-600" />
                ) : currentUser.role === "kreatif" ? (
                  <Layers size={12} className="text-slate-400" />
                ) : (
                  <BookOpen size={12} className="text-slate-400" />
                )}
              </p>
              <p className="text-[10px] font-semibold text-slate-400">{currentUser.roleLabel}</p>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform hidden sm:block ${showRoleMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu: Real Account Status & Admin Verification */}
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Header Box */}
              <div className="px-3 py-2.5 border-b border-slate-100 mb-1.5 bg-slate-50/70 rounded-2xl">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Status Akun & Akses
                  </p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                    currentUser.role === "admin" && isAdminVerified
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-slate-200/80 text-slate-700"
                  }`}>
                    {currentUser.role === "admin" && isAdminVerified ? (
                      <>
                        <ShieldCheck size={11} className="text-emerald-700" />
                        <span>Terverifikasi</span>
                      </>
                    ) : (
                      <span>Mode Anggota</span>
                    )}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 mt-1 truncate">
                  {currentUser.fullName}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {currentUser.email}
                </p>
              </div>

              {/* Account Switcher List - All Members */}
              <div className="max-h-72 overflow-y-auto pr-1 space-y-3 divide-y divide-slate-100">
                {/* 1. Admin */}
                <div className="pt-1">
                  <p className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <ShieldCheck size={11} className="text-emerald-600" />
                    Admin / Tim Inti
                  </p>
                  <div className="space-y-1">
                    {data.members.filter(m => getMemberRoleCategory(m) === "admin").map((m) => {
                      const isCurrent = currentUser.id === m.id || (currentUser.role === "admin" && currentUser.name === m.name);
                      const initials = m.name ? m.name.slice(0, 2).toUpperCase() : "AD";
                      const avatar = getMemberAvatar(m.name);

                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            setShowRoleMenu(false);
                            if (isCurrent) return;
                            if (m.id === "u_numan") {
                              switchUser("admin");
                              return;
                            }
                            openMemberModal(m.id);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-2xl text-left transition-all cursor-pointer ${
                            isCurrent 
                              ? 'bg-emerald-50 border border-emerald-200/90 text-emerald-950 font-bold shadow-2xs' 
                              : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                              {avatar ? (
                                <img src={avatar} alt={m.name} className="w-full h-full object-cover" />
                              ) : (
                                initials
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold leading-tight truncate">{m.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{m.role}</p>
                            </div>
                          </div>
                          <div className="shrink-0 pl-1">
                            {isCurrent ? (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                <Check size={10} className="stroke-[3]" />
                                Aktif
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                <Lock size={9} />
                                PIN
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Tim Kreatif */}
                <div className="pt-2">
                  <p className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Layers size={11} className="text-purple-600" />
                    Tim Kreatif & Desain
                  </p>
                  <div className="space-y-1">
                    {data.members.filter(m => getMemberRoleCategory(m) === "kreatif").map((m) => {
                      const isCurrent = currentUser.id === m.id || (currentUser.role === "kreatif" && currentUser.name === m.name);
                      const initials = m.name ? m.name.slice(0, 2).toUpperCase() : "KR";
                      const avatar = getMemberAvatar(m.name);

                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            setShowRoleMenu(false);
                            if (isCurrent) return;
                            openMemberModal(m.id);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-2xl text-left transition-all cursor-pointer ${
                            isCurrent 
                              ? 'bg-purple-50 border border-purple-200/90 text-purple-950 font-bold shadow-2xs' 
                              : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                              {avatar ? (
                                <img src={avatar} alt={m.name} className="w-full h-full object-cover" />
                              ) : (
                                initials
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold leading-tight truncate">{m.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{m.role}</p>
                            </div>
                          </div>
                          <div className="shrink-0 pl-1">
                            {isCurrent ? (
                              <span className="text-[9px] font-bold text-purple-700 bg-purple-100 border border-purple-300 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                <Check size={10} className="stroke-[3]" />
                                Aktif
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                <Lock size={9} />
                                PIN
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Guru / Pengajar */}
                <div className="pt-2">
                  <p className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <BookOpen size={11} className="text-blue-600" />
                    Guru / Pengajar ({data.members.filter(m => getMemberRoleCategory(m) === "guru").length})
                  </p>
                  <div className="space-y-1">
                    {data.members.filter(m => getMemberRoleCategory(m) === "guru").map((m) => {
                      const isCurrent = currentUser.id === m.id || (currentUser.role === "guru" && currentUser.name === m.name);
                      const initials = m.name ? m.name.slice(0, 2).toUpperCase() : "GU";
                      const avatar = getMemberAvatar(m.name);

                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            setShowRoleMenu(false);
                            if (isCurrent) return;
                            openMemberModal(m.id);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-2xl text-left transition-all cursor-pointer ${
                            isCurrent 
                              ? 'bg-blue-50 border border-blue-200/90 text-blue-950 font-bold shadow-2xs' 
                              : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                              {avatar ? (
                                <img src={avatar} alt={m.name} className="w-full h-full object-cover" />
                              ) : (
                                initials
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold leading-tight truncate">{m.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{m.role}</p>
                            </div>
                          </div>
                          <div className="shrink-0 pl-1">
                            {isCurrent ? (
                              <span className="text-[9px] font-bold text-blue-700 bg-blue-100 border border-blue-300 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                <Check size={10} className="stroke-[3]" />
                                Aktif
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                <Lock size={9} />
                                PIN
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 mt-2 border-t border-slate-100 space-y-1">
                {currentUser.role === "admin" && isAdminVerified ? (
                  <button
                    onClick={() => {
                      lockAdmin();
                      setShowRoleMenu(false);
                    }}
                    className="w-full text-center py-2 px-3 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Lock size={12} />
                    <span>Kunci Hak Admin</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      openAdminModal();
                    }}
                    className="w-full text-center py-2 px-3 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Key size={12} />
                    <span>Masuk sebagai Admin (PIN)</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowRoleMenu(false);
                    if (window.confirm("Yakin ingin keluar dari akun?")) {
                      logout();
                    }
                  }}
                  className="w-full text-center py-2 px-3 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50/70 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogOut size={12} />
                  <span>Keluar / Ganti Akun</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
