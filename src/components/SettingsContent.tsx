"use client";

import { useState, useEffect } from "react";
import { 
  Settings, Moon, Sun, Bell, Shield, Database, Download, 
  Upload, Check, RefreshCw, KeyRound, Monitor, Smartphone, 
  HelpCircle, Sparkles, CheckCircle2, ShieldCheck, Users,
  Eye, EyeOff, Lock, User
} from "lucide-react";
import { useAppContext, getMemberPin, getMemberRoleCategory } from "@/context/AppContext";
import { getMemberAvatar } from "@/utils/avatar";

export default function SettingsContent() {
  const { data, currentUser, switchUser, changeRolePin, changeMemberPin, openAdminModal, isAdminVerified } = useAppContext();
  const [activeSubTab, setActiveSubTab] = useState<"general" | "notifications" | "security" | "backup">("general");

  const isAdmin = currentUser.role === "admin" && isAdminVerified;

  // Settings State with LocalStorage Persistence
  const [hijriDateActive, setHijriDateActive] = useState(true);
  const [sidebarHoverActive, setSidebarHoverActive] = useState(true);
  const [soundNotify, setSoundNotify] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [taskReminder, setTaskReminder] = useState(true);
  const [contentReminder, setContentReminder] = useState(true);

  // Load saved settings from localStorage on mount
  useEffect(() => {
    try {
      const savedHijri = localStorage.getItem("mqd_setting_hijri");
      if (savedHijri !== null) setHijriDateActive(savedHijri === "true");

      const savedSound = localStorage.getItem("mqd_setting_sound_notify");
      if (savedSound !== null) setSoundNotify(savedSound === "true");

      const savedTask = localStorage.getItem("mqd_setting_task_reminder");
      if (savedTask !== null) setTaskReminder(savedTask === "true");

      const savedContent = localStorage.getItem("mqd_setting_content_reminder");
      if (savedContent !== null) setContentReminder(savedContent === "true");
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleToggleHijri = () => {
    const newVal = !hijriDateActive;
    setHijriDateActive(newVal);
    try {
      localStorage.setItem("mqd_setting_hijri", String(newVal));
      window.dispatchEvent(new Event("mqd_settings_updated"));
    } catch {}
    triggerToast(newVal ? "Penanggalan Hijriah diaktifkan di header & kalender." : "Penanggalan Hijriah dinonaktifkan.");
  };

  const handleToggleContentReminder = () => {
    const newVal = !contentReminder;
    setContentReminder(newVal);
    try {
      localStorage.setItem("mqd_setting_content_reminder", String(newVal));
      window.dispatchEvent(new Event("mqd_settings_updated"));
    } catch {}
    triggerToast(newVal ? "Pengingat rilis konten dakwah diaktifkan." : "Pengingat rilis konten dinonaktifkan.");
  };

  const handleToggleTaskReminder = () => {
    const newVal = !taskReminder;
    setTaskReminder(newVal);
    try {
      localStorage.setItem("mqd_setting_task_reminder", String(newVal));
      window.dispatchEvent(new Event("mqd_settings_updated"));
    } catch {}
    triggerToast(newVal ? "Pemberitahuan tugas baru diaktifkan." : "Pemberitahuan tugas baru dinonaktifkan.");
  };

  const handleToggleSound = () => {
    const newVal = !soundNotify;
    setSoundNotify(newVal);
    try {
      localStorage.setItem("mqd_setting_sound_notify", String(newVal));
      window.dispatchEvent(new Event("mqd_settings_updated"));
    } catch {}
    triggerToast(newVal ? "Suara nada notifikasi diaktifkan." : "Mode hening (suara notifikasi dimatikan).");
  };

  // Security State
  const [targetCategory, setTargetCategory] = useState<"admin" | "kreatif" | "guru">("guru");
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState("");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  const triggerToast = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(""), 3500);
  };

  // Group members with 100% consistent role categorization
  const adminMembers = data.members.filter(m => getMemberRoleCategory(m) === "admin");
  const creativeMembers = data.members.filter(m => getMemberRoleCategory(m) === "kreatif");
  const teacherMembers = data.members.filter(m => getMemberRoleCategory(m) === "guru");

  const currentCategoryMembers = targetCategory === "admin" 
    ? adminMembers 
    : targetCategory === "kreatif" 
    ? creativeMembers 
    : teacherMembers;

  // Selected member is always guaranteed to belong to active category
  const selectedMember = currentCategoryMembers.find(m => m.id === selectedMemberId) 
    || currentCategoryMembers[0] 
    || data.members[0];

  const handleCategorySelect = (cat: "admin" | "kreatif" | "guru") => {
    setTargetCategory(cat);
    const inCat = data.members.filter(m => getMemberRoleCategory(m) === cat);
    if (inCat.length > 0) {
      setSelectedMemberId(inCat[0].id);
    }
    setPinError("");
    setOldPin("");
    setNewPin("");
    setConfirmPin("");
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) {
      setPinError("Silakan pilih anggota terlebih dahulu.");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("Konfirmasi PIN baru tidak cocok!");
      return;
    }
    if (newPin.length < 4) {
      setPinError("PIN baru minimal 4 digit!");
      return;
    }
    const res = changeMemberPin(selectedMember.id, newPin, oldPin);
    if (res.success) {
      setOldPin("");
      setNewPin("");
      setConfirmPin("");
      setPinError("");
      triggerToast(res.message || `PIN untuk ${selectedMember.name} berhasil diperbarui!`);
    } else {
      setPinError(res.message || "Gagal mengubah PIN.");
    }
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `madrasah_quran_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast("Cadangan database JSON berhasil diunduh ke komputer Anda!");
  };



  return (
    <div className="p-3.5 sm:p-5 lg:p-6 max-w-5xl mx-auto space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      
      {/* Toast Alert */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 shadow-md animate-in slide-in-from-top-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check size={16} />
          </div>
          <div>
            <p className="text-xs font-bold">Pengaturan Berhasil Diterapkan</p>
            <p className="text-[11px] text-emerald-700">{saveSuccessMsg}</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-white flex items-center justify-center shadow-lg shadow-slate-900/10">
          <Settings size={22} className="text-emerald-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Pengaturan Ruang Kerja
            </h1>
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              Sistem Internal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Kelola preferensi antarmuka, notifikasi, keamanan akun, dan cadangan data aplikasi
          </p>
        </div>
      </div>

      {/* Role Alert Banner if Non-Admin */}
      {!isAdmin && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Shield size={18} />
            </div>
            <div>
              <p className="text-xs font-bold flex items-center gap-2">
                <span>Peran Terbatas:</span>
                <span className="px-2 py-0.5 rounded-full bg-white border border-amber-300 text-[11px] font-black text-amber-800">
                  {currentUser.role === 'kreatif' ? '🎨 Tim Kreatif' : '📚 Guru'} — {currentUser.name}
                </span>
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Pengaturan Keamanan Sandi Tim & Cadangan Database hanya dapat diubah oleh <strong>Admin / Tim Inti</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => switchUser('admin')}
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
          >
            <span>🔑 Verifikasi PIN Admin</span>
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <button
          onClick={() => setActiveSubTab("general")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "general"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Monitor size={15} />
          <span>Tampilan & Preferensi</span>
        </button>

        <button
          onClick={() => setActiveSubTab("notifications")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "notifications"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Bell size={15} />
          <span>Notifikasi & Pengingat</span>
        </button>

        <button
          onClick={() => setActiveSubTab("security")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "security"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Shield size={15} />
          <span>Keamanan & Sandi</span>
          {!isAdmin && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-normal">🔒 Kunci</span>}
        </button>

        <button
          onClick={() => setActiveSubTab("backup")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "backup"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Database size={15} />
          <span>Backup & Database</span>
          {!isAdmin && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-normal">🔒 Kunci</span>}
        </button>
      </div>

      {/* Tab 1: General & Preferences */}
      {activeSubTab === "general" && (
        <div className="p-5 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Preferensi Antarmuka & Kalender</h3>
            <p className="text-xs text-slate-500">Sesuaikan tata letak dan penanggalan ruang kerja</p>
          </div>

          <div className="divide-y divide-slate-100 space-y-4 pt-1">
            
            {/* Setting Item 1 */}
            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-xs font-bold text-slate-800">Tampilkan Penanggalan Hijriah</p>
                <p className="text-[11px] text-slate-400">Menampilkan tanggal Hijriah di samping tanggal Masehi pada dashboard</p>
              </div>
              <button
                type="button"
                onClick={handleToggleHijri}
                className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                  hijriDateActive ? "bg-emerald-600 justify-end" : "bg-slate-200 justify-start"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
              </button>
            </div>

            {/* Setting Item 2 */}
            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-xs font-bold text-slate-800">Status Sidebar Navigasi</p>
                <p className="text-[11px] text-slate-400">Sidebar selalu terbuka paten agar menu dan label mudah diakses langsung tanpa buka-tutup</p>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                📌 Paten / Tetap Terbuka
              </span>
            </div>

            {/* Setting Item 3 */}
            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-xs font-bold text-slate-800">Palet Tema Ruang Kerja</p>
                <p className="text-[11px] text-slate-400">Tema visual bawaan saat ini</p>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                ✨ Deep Navy & Emerald Gold (Aktif)
              </span>
            </div>

          </div>
        </div>
      )}

      {/* Tab 2: Notifications */}
      {activeSubTab === "notifications" && (
        <div className="p-5 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Notifikasi & Pengingat Tugas</h3>
            <p className="text-xs text-slate-500">Atur cara sistem memberi tahu Anda tentang pembaruan dakwah</p>
          </div>

          <div className="divide-y divide-slate-100 space-y-4 pt-1">
            
            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-xs font-bold text-slate-800">Pengingat Jadwal Rilis Konten Dakwah</p>
                <p className="text-[11px] text-slate-400">Kirim pemberitahuan H-1 jam sebelum jadwal konten tayang di media sosial</p>
              </div>
              <button
                type="button"
                onClick={handleToggleContentReminder}
                className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                  contentReminder ? "bg-emerald-600 justify-end" : "bg-slate-200 justify-start"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
              </button>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-xs font-bold text-slate-800">Pemberitahuan Tugas Baru yang Ditugaskan</p>
                <p className="text-[11px] text-slate-400">Dapatkan notifikasi saat anggota tim menugaskan kartu kanban kepada Anda</p>
              </div>
              <button
                type="button"
                onClick={handleToggleTaskReminder}
                className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                  taskReminder ? "bg-emerald-600 justify-end" : "bg-slate-200 justify-start"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
              </button>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-xs font-bold text-slate-800">Suara Nada Notifikasi</p>
                <p className="text-[11px] text-slate-400">Bunyikan nada lembut saat ada aktivitas atau pesan penting baru</p>
              </div>
              <button
                type="button"
                onClick={handleToggleSound}
                className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                  soundNotify ? "bg-emerald-600 justify-end" : "bg-slate-200 justify-start"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Tab 3: Security & Passwords */}
      {activeSubTab === "security" && (
        <div className="p-5 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Keamanan Akun & Ganti Kata Sandi</h3>
            <p className="text-xs text-slate-500">Pastikan akun tim Anda terlindungi dengan kata sandi yang kuat</p>
          </div>

          {!isAdmin ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center max-w-lg mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <Shield size={24} />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Akses Dibatasi — Khusus Admin / Tim Inti</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pengaturan PIN keamanan global dan proteksi sistem hanya dapat dikonfigurasi oleh <strong>Admin / Tim Inti</strong>. 
                Peran Anda saat ini adalah <span className="font-semibold text-slate-700">{currentUser.name} ({currentUser.role === 'kreatif' ? 'Tim Kreatif' : 'Guru'})</span>.
              </p>
              <button
                onClick={() => switchUser('admin')}
                className="mt-2 inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs"
              >
                <span>🔑 Verifikasi PIN untuk Buka Akses Admin</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Box 1: Kelola PIN Keamanan Tiap Anggota / Guru */}
              <div className="p-5 sm:p-7 rounded-3xl bg-white border border-slate-200/90 max-w-2xl space-y-5 shadow-xs">
                {/* Header Title */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                      Kelola PIN Keamanan Anggota & Guru
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pilih nama pengajar atau tim untuk mengatur kode PIN akses mandiri
                    </p>
                  </div>
                </div>

                {/* 1. Role Category Segmented Tabs */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Bagian / Divisi Tim:
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => handleCategorySelect("admin")}
                      className={`py-2 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        targetCategory === "admin"
                          ? "bg-white text-emerald-800 shadow-2xs font-extrabold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span>🛡️ Admin</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-200/70 text-slate-700">
                        {adminMembers.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCategorySelect("kreatif")}
                      className={`py-2 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        targetCategory === "kreatif"
                          ? "bg-white text-purple-800 shadow-2xs font-extrabold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span>🎨 Tim Kreatif</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-200/70 text-slate-700">
                        {creativeMembers.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCategorySelect("guru")}
                      className={`py-2 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        targetCategory === "guru"
                          ? "bg-white text-blue-800 shadow-2xs font-extrabold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span>📚 Guru</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-200/70 text-slate-700">
                        {teacherMembers.length}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 2. Interactive Member Selector Cards */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center justify-between">
                    <span>
                      Pilih Anggota ({currentCategoryMembers.length} orang tersedia):
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
                      Target Aktif: {selectedMember?.name}
                    </span>
                  </label>

                  <div className="space-y-2">
                    {currentCategoryMembers.map((m) => {
                      const isSelected = m.id === selectedMember?.id;
                      const hasCustom = Boolean((m as any).pin);
                      const currentPinVal = getMemberPin(m);

                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setSelectedMemberId(m.id);
                            setPinError("");
                            setOldPin("");
                            setNewPin("");
                            setConfirmPin("");
                          }}
                          className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? "bg-emerald-50/95 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                              : "bg-slate-50/70 border-slate-200/90 hover:bg-slate-100 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-2xl ${m.color || 'bg-emerald-600'} text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs overflow-hidden`}>
                              {getMemberAvatar(m.name) ? (
                                <img src={getMemberAvatar(m.name)!} alt={m.name} className="w-full h-full object-cover" />
                              ) : (
                                m.name?.slice(0, 2).toUpperCase() || "US"
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                                  {m.name}
                                </span>
                                {isSelected && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shrink-0 shadow-2xs">
                                    ✓ Dipilih
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">{m.role}</p>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-xl border inline-block whitespace-nowrap ${
                              hasCustom 
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
                                : "bg-white text-slate-600 border-slate-200 shadow-2xs"
                            }`}>
                              {hasCustom ? "🔒 PIN Kustom" : `🔑 Bawaan: ${currentPinVal}`}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. PIN Form for Selected Member */}
                {selectedMember && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">
                          Form Sandi PIN: {selectedMember.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Peran: <strong className="text-slate-600">{selectedMember.role}</strong>
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                        (selectedMember as any).pin 
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>
                        {(selectedMember as any).pin ? "🔒 PIN Kustom Aktif" : `🔑 Bawaan: ${getMemberPin(selectedMember)}`}
                      </span>
                    </div>

                    <form onSubmit={handlePinSubmit} className="space-y-3.5">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700">
                            PIN Baru (Min. 4 digit)
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowPin(!showPin)}
                            className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                          >
                            {showPin ? <EyeOff size={13} /> : <Eye size={13} />}
                            <span>{showPin ? "Sembunyikan" : "Tampilkan"}</span>
                          </button>
                        </div>
                        <input 
                          type={showPin ? "text" : "password"}
                          required
                          maxLength={12}
                          placeholder="Masukkan PIN baru"
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value)}
                          className="w-full text-xs font-mono font-bold p-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Konfirmasi PIN Baru
                        </label>
                        <input 
                          type={showPin ? "text" : "password"}
                          required
                          maxLength={12}
                          placeholder="Ulangi PIN baru"
                          value={confirmPin}
                          onChange={(e) => setConfirmPin(e.target.value)}
                          className="w-full text-xs font-mono font-bold p-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          PIN Lama <span className="text-[10px] text-slate-400 font-normal">(Kosongkan jika admin mereset langsung)</span>
                        </label>
                        <input 
                          type={showPin ? "text" : "password"}
                          placeholder={`PIN saat ini (${getMemberPin(selectedMember)})`}
                          value={oldPin}
                          onChange={(e) => setOldPin(e.target.value)}
                          className="w-full text-xs font-mono p-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      </div>

                      {pinError && (
                        <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 animate-in fade-in">
                          {pinError}
                        </p>
                      )}

                      <button 
                        type="submit"
                        className="flex items-center justify-center gap-2 text-xs font-bold w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-md transition-colors cursor-pointer"
                      >
                        <Check size={14} />
                        <span>Simpan PIN untuk {selectedMember.name}</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Box 2: Daftar Lengkap Status PIN Seluruh Anggota Madrasah */}
              <div className="p-5 sm:p-7 rounded-3xl bg-white border border-slate-200/90 max-w-2xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Users size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">
                        Status PIN Seluruh Tim ({data.members.length} Orang)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Klik tombol "Atur PIN" untuk langsung mengedit kode PIN anggota tersebut
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
                  {data.members.map((m) => {
                    const isTarget = m.id === selectedMember?.id;
                    const hasCustom = Boolean((m as any).pin);
                    const currentPinVal = getMemberPin(m);
                    const cat = getMemberRoleCategory(m);

                    return (
                      <div 
                        key={m.id} 
                        className={`py-2.5 px-3 flex items-center justify-between gap-3 rounded-2xl transition-all ${
                          isTarget 
                            ? "bg-emerald-50/80 border border-emerald-200/80 shadow-2xs" 
                            : "hover:bg-slate-50 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-full ${m.color || 'bg-slate-500'} text-white text-[10px] font-bold flex items-center justify-center shrink-0 overflow-hidden`}>
                            {getMemberAvatar(m.name) ? (
                              <img src={getMemberAvatar(m.name)!} alt={m.name} className="w-full h-full object-cover" />
                            ) : (
                              m.name?.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 leading-tight truncate">{m.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{m.role}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
                            hasCustom 
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}>
                            {hasCustom ? "PIN Kustom" : `Bawaan: ${currentPinVal}`}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              setTargetCategory(cat);
                              setSelectedMemberId(m.id);
                              setPinError("");
                              setOldPin("");
                              setNewPin("");
                              setConfirmPin("");
                            }}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                              isTarget 
                                ? "bg-emerald-600 text-white shadow-2xs" 
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            }`}
                          >
                            {isTarget ? "Dipilih" : "Atur PIN"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Info */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 max-w-xl">
                <p className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                  🛡️ Proteksi Akun Mandiri Aktif
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Setiap ustadz dan anggota tim kreatif memiliki akun dan PIN mandiri. Admin dapat mengelola atau mereset PIN setiap guru secara individual tanpa memengaruhi guru lainnya.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Backup & Database */}
      {activeSubTab === "backup" && (
        <div className="p-5 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Cadangan Data & Sinkronisasi Cloud</h3>
            <p className="text-xs text-slate-500">Kelola integritas data ruang kerja tim secara mandiri</p>
          </div>

          {!isAdmin ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center max-w-lg mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <Database size={24} />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Ekspor Database Terproteksi</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Demi keamanan dan integritas data madrasah, pencadangan dan ekspor berkas JSON hanya dapat diunduh oleh <strong>Admin / Tim Inti</strong>.
              </p>
              <button
                onClick={() => switchUser('admin')}
                className="mt-2 inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs"
              >
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Beralih ke Akun Admin</span>
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cloud Status */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Cloud KVDB Realtime Aktif</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Semua perubahan tugas, konten, dan catatan otomatis disimpan ke server cloud secara aman.
                  </p>
                </div>

                {/* Offline Cache Status */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                    <Database size={16} className="text-indigo-600" />
                    <span>Penyimpanan Lokal Browser</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Cadangan instan tersimpan di memori browser lokal untuk kecepatan akses maksimal.
                  </p>
                </div>
              </div>

              {/* Action Cards */}
              <div className="p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Unduh Berkas Cadangan Lengkap (.JSON)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Simpan salinan offline seluruh data tugas, materi konten, anggota, dan catatan ke komputer Anda.
                  </p>
                </div>
                <button 
                  onClick={handleExportBackup}
                  className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Download size={14} />
                  <span>Unduh Backup JSON</span>
                </button>
              </div>
            </>
          )}

        </div>
      )}

    </div>
  );
}
