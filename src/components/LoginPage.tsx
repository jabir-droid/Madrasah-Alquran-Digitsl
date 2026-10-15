"use client";

import React, { useState } from "react";
import { 
  BookOpen, Lock, User, Key, Eye, EyeOff, 
  ShieldCheck, ArrowRight, MessageCircle, HelpCircle, 
  Check, Info, Sparkles, AlertCircle, X, Shield, Palette, GraduationCap
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";

export default function LoginPage() {
  const { login, data } = useAppContext();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminContactModal, setShowAdminContactModal] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    setTimeout(() => {
      const res = login(name, password);
      if (!res.success) {
        setErrorMessage(res.message || "Nama atau kata sandi tidak cocok.");
        setIsLoading(false);
      } else {
        // Success login handled by context
        setIsLoading(false);
      }
    }, 350);
  };

  const handleQuickLogin = (demoName: string, demoPass: string) => {
    setName(demoName);
    setPassword(demoPass);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen w-full bg-[#070d18] relative flex flex-col justify-between overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* Decorative Islamic Radial Gradients & Glow Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-emerald-600/20 via-teal-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-900/15 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-indigo-950/25 blur-3xl pointer-events-none rounded-full" />

      {/* Subtle Geometric Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, white 2%, transparent 0%)`,
          backgroundSize: '100px 100px'
        }}
      />

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md">

          {/* Login Card */}
          <div className="relative bg-[#0e1728]/95 backdrop-blur-2xl border border-emerald-500/20 hover:border-emerald-500/30 shadow-2xl shadow-black/80 rounded-3xl p-6 sm:p-8 space-y-6 transition-all">
            
            {/* Tombol Bantuan '?' di Pojok Kanan Atas Kartu */}
            <button
              type="button"
              onClick={() => setShowAdminContactModal(true)}
              title="Bantuan / Hubungi Admin"
              className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-emerald-500/20 border border-slate-700/70 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-300 flex items-center justify-center transition-all cursor-pointer group shadow-2xs"
            >
              <HelpCircle size={16} className="group-hover:scale-110 transition-transform text-slate-400 group-hover:text-emerald-400" />
            </button>
            
            {/* Header Branding (Foto 3 replacing Foto 2) */}
            <div className="flex flex-col items-center text-center space-y-2 pb-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 border border-emerald-300/40 mb-1 hover:scale-105 transition-transform">
                <BookOpen size={28} className="stroke-[2.5]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase leading-snug">
                MADRASAH AL-QUR'AN DIGITAL
              </h2>
              <p className="text-xs sm:text-sm text-emerald-400 font-semibold tracking-wide">
                Ruang Kerja Kolaborasi &amp; Manajemen Dakwah
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed pt-1">
                Silakan masuk menggunakan nama dan kata sandi yang telah dibuatkan oleh Admin.
              </p>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <AlertCircle size={17} className="text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <p className="font-semibold text-rose-200">Gagal Masuk</p>
                  <p className="text-[11px] text-rose-300/90 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Field 1: Nama Pengguna */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block flex items-center justify-between">
                  <span>Nama Pengguna</span>
                  <span className="text-[10px] text-emerald-400/70 font-normal">Sesuai data Admin</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    placeholder="Contoh: Nu'man atau Jabir"
                    className="w-full pl-10 pr-4 py-3 bg-[#142237] border border-slate-700/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-white rounded-2xl text-xs sm:text-sm font-medium transition-all placeholder:text-slate-500 outline-none"
                  />
                </div>
              </div>

              {/* Field 2: Kata Sandi */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    Kata Sandi (Password)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAdminContactModal(true)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors cursor-pointer"
                  >
                    Lupa sandi?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    placeholder="Masukkan kata sandi..."
                    className="w-full pl-10 pr-11 py-3 bg-[#142237] border border-slate-700/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-white rounded-2xl text-xs sm:text-sm font-medium transition-all placeholder:text-slate-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    title={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Ruang Kerja</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Notice: Akun dibuatkan admin */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
                <Info size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-300 leading-relaxed">
                  <span className="font-bold text-white block mb-0.5">Belum memiliki akun?</span>
                  Akun & kata sandi dibuatkan langsung oleh <strong>Admin Madrasah</strong> sesuai peran Anda.
                  <button
                    type="button"
                    onClick={() => setShowAdminContactModal(true)}
                    className="mt-1 font-bold text-emerald-400 hover:text-emerald-300 underline block cursor-pointer transition-colors"
                  >
                    Minta pembuatan akun ke Admin &rarr;
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Demo Access Collapsible (Untuk Kemudahan Pengujian & Peninjauan) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-colors py-1 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-400" />
                  <span>Akun Terdaftar untuk Uji Coba</span>
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {showDemoAccounts ? "Tutup" : "Lihat Demo"}
                </span>
              </button>

              {showDemoAccounts && (
                <div className="mt-2 p-3 rounded-2xl bg-[#142237]/80 border border-slate-700/60 space-y-2 animate-in fade-in duration-200">
                  <p className="text-[10px] text-slate-400">
                    Klik salah satu akun di bawah untuk mengisi form otomatis:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin("Nu'man", "Numan.99")}
                      className="text-left p-2 rounded-xl bg-slate-800/80 hover:bg-emerald-950/40 border border-slate-700/60 hover:border-emerald-500/40 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-emerald-300">Nu'man</span>
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">Admin</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Sandi: Numan.99</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin("Jabir", "222222")}
                      className="text-left p-2 rounded-xl bg-slate-800/80 hover:bg-purple-950/40 border border-slate-700/60 hover:border-purple-500/40 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-purple-300">Jabir</span>
                        <span className="text-[9px] font-bold text-purple-400 bg-purple-500/15 px-1.5 py-0.5 rounded">Tim Kreatif</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Sandi: 222222</p>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Role Structure Footnote */}
          <div className="mt-6 grid grid-cols-3 gap-2 text-center text-slate-400 text-[11px]">
            <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center">
              <Shield size={14} className="text-emerald-400 mb-1" />
              <span className="font-bold text-slate-300">Admin / Inti</span>
              <span className="text-[9px] text-slate-500">Kelola Akses</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center">
              <Palette size={14} className="text-purple-400 mb-1" />
              <span className="font-bold text-slate-300">Tim Kreatif</span>
              <span className="text-[9px] text-slate-500">Konten Media</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center">
              <GraduationCap size={14} className="text-blue-400 mb-1" />
              <span className="font-bold text-slate-300">Guru / Asatidz</span>
              <span className="text-[9px] text-slate-500">Halaqah Quran</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-[11px] text-slate-500 border-t border-slate-800/40">
        &copy; {new Date().getFullYear()} Madrasah Al-Qur'an Digital &bull; Sistem Terpadu Pembelajaran & Media Dakwah
      </footer>

      {/* Modal Hubungi Admin */}
      {showAdminContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0f192b] border border-slate-700 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Hubungi Admin Madrasah</h3>
                  <p className="text-xs text-slate-400">Pembuatan Akun & Reset Kata Sandi</p>
                </div>
              </div>
              <button
                onClick={() => setShowAdminContactModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#142237] border border-slate-700/80 space-y-3 text-xs leading-relaxed text-slate-300">
              <p>
                Untuk menjaga keamanan data halaqah dan tugas madrasah, seluruh akun dibuatkan secara resmi oleh <strong>Admin / Tim Inti</strong>.
              </p>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Admin Utama:</span>
                  <span className="font-bold text-white">Nu'man (Koordinator Inti)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Role yang Tersedia:</span>
                  <span className="font-bold text-emerald-300">Admin, Tim Kreatif, Guru</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Silakan kirimkan nama lengkap dan posisi Anda kepada Admin. Admin akan memberikan Nama Pengguna dan Kata Sandi untuk login ke portal ini.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <a
                href="https://wa.me/?text=Assalamu%27alaikum%20Admin%2C%20saya%20ingin%20meminta%20dibuatkan%20akun%20Madrasah%20Al-Qur%27an%20Digital%20(Nama%20%26%20Role%20Peran)."
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-emerald-600/30"
              >
                <MessageCircle size={15} />
                <span>Kirim Pesan ke Admin</span>
              </a>
              <button
                type="button"
                onClick={() => setShowAdminContactModal(false)}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
