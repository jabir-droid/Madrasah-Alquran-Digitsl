"use client";

import { useState } from "react";
import { 
  Settings, Moon, Sun, Bell, Shield, Database, Download, 
  Upload, Check, RefreshCw, KeyRound, Monitor, Smartphone, 
  HelpCircle, Sparkles, CheckCircle2, ShieldCheck
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";

export default function SettingsContent() {
  const { data, currentUser, switchUser, changeAdminPin, openAdminModal, isAdminVerified } = useAppContext();
  const [activeSubTab, setActiveSubTab] = useState<"general" | "notifications" | "security" | "backup">("general");

  const isAdmin = currentUser.role === "admin" && isAdminVerified;

  // Settings State
  const [hijriDateActive, setHijriDateActive] = useState(true);
  const [sidebarHoverActive, setSidebarHoverActive] = useState(true);
  const [soundNotify, setSoundNotify] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [taskReminder, setTaskReminder] = useState(true);
  const [contentReminder, setContentReminder] = useState(true);

  // Security State
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  const triggerToast = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(""), 3500);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin !== confirmPin) {
      setPinError("Konfirmasi PIN baru tidak cocok!");
      return;
    }
    const res = changeAdminPin(oldPin, newPin);
    if (res.success) {
      setOldPin("");
      setNewPin("");
      setConfirmPin("");
      setPinError("");
      triggerToast(res.message || "PIN Keamanan Admin berhasil diperbarui!");
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
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      
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
                onClick={() => {
                  setHijriDateActive(!hijriDateActive);
                  triggerToast("Penanggalan Hijriah berhasil diperbarui.");
                }}
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
                onClick={() => {
                  setContentReminder(!contentReminder);
                  triggerToast("Pengaturan pengingat konten diperbarui.");
                }}
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
                onClick={() => {
                  setTaskReminder(!taskReminder);
                  triggerToast("Pengaturan tugas baru diperbarui.");
                }}
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
                onClick={() => {
                  setSoundNotify(!soundNotify);
                  triggerToast("Suara notifikasi diperbarui.");
                }}
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
              {/* Box 1: Ubah PIN Akses Admin */}
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 max-w-md space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <KeyRound size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-emerald-950">PIN Keamanan Hak Admin</h4>
                    <p className="text-[11px] text-emerald-700">Ganti PIN untuk memverifikasi wewenang Admin sistem</p>
                  </div>
                </div>

                <form onSubmit={handlePinSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">PIN Lama (Saat ini)</label>
                    <input 
                      type="password"
                      required
                      placeholder="Masukkan PIN lama (default: 123456)"
                      value={oldPin}
                      onChange={(e) => setOldPin(e.target.value)}
                      className="w-full text-xs p-3 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">PIN Baru (Min 4 digit)</label>
                    <input 
                      type="password"
                      required
                      placeholder="Masukkan PIN baru"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      className="w-full text-xs p-3 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Konfirmasi PIN Baru</label>
                    <input 
                      type="password"
                      required
                      placeholder="Ulangi PIN baru"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      className="w-full text-xs p-3 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                    />
                  </div>

                  {pinError && (
                    <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
                      {pinError}
                    </p>
                  )}

                  <button 
                    type="submit"
                    className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <Check size={14} />
                    <span>Simpan PIN Baru</span>
                  </button>
                </form>
              </div>

              {/* Status Info */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 max-w-md">
                <p className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                  🛡️ Proteksi Keamanan Mode Asli Aktif
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Semua anggota yang bukan Admin tidak dapat mengubah daftar tim, pengaturan sistem, atau backup tanpa verifikasi PIN ini.
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
