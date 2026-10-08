"use client";

import React, { useState, useEffect, useRef } from "react";
import { Shield, Lock, Eye, EyeOff, AlertCircle, X, CheckCircle2, KeyRound } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

export default function AdminAuthModal() {
  const { 
    isAdminModalOpen, 
    closeAdminModal, 
    verifyAdminPin, 
    currentUser 
  } = useAppContext();

  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdminModalOpen) {
      setPin("");
      setErrorMsg("");
      setIsSuccess(false);
      setShowPin(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isAdminModalOpen]);

  if (!isAdminModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setErrorMsg("Silakan masukkan PIN Admin.");
      return;
    }

    const result = verifyAdminPin(pin.trim());
    if (result.success) {
      setIsSuccess(true);
      setErrorMsg("");
      setTimeout(() => {
        closeAdminModal();
      }, 700);
    } else {
      setErrorMsg(result.message || "PIN Admin tidak sesuai. Silakan coba lagi.");
      setPin("");
      inputRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Header Accent */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600" />

        {/* Close Button */}
        <button
          onClick={closeAdminModal}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          title="Tutup"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-7 space-y-5">
          {/* Icon & Title */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/25">
              <Shield size={24} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                  Verifikasi Keamanan
                </span>
                <span className="text-[10px] font-bold text-slate-400">Mode Asli</span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl mt-1 leading-snug">
                Verifikasi Hak Akses Admin
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Akun Admin (Nukman / Tim Inti) memiliki wewenang penuh atas sistem. Masukkan PIN keamanan untuk verifikasi.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Masukkan PIN Admin (6 Digit):
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type={showPin ? "text" : "password"}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  maxLength={12}
                  placeholder="••••••"
                  className={`w-full px-4 py-3 rounded-2xl border text-center font-mono text-lg tracking-widest font-bold transition-all outline-none ${
                    errorMsg 
                      ? "border-rose-400 bg-rose-50/50 text-rose-900 focus:ring-2 focus:ring-rose-400/30" 
                      : isSuccess
                      ? "border-emerald-400 bg-emerald-50/50 text-emerald-900 focus:ring-2 focus:ring-emerald-400/30"
                      : "border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title={showPin ? "Sembunyikan PIN" : "Tampilkan PIN"}
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200/80 p-2.5 rounded-xl animate-in fade-in">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Feedback */}
              {isSuccess && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 p-2.5 rounded-xl animate-in fade-in">
                  <CheckCircle2 size={15} className="shrink-0" />
                  <span>PIN Benar! Hak akses Admin berhasil dibuka.</span>
                </div>
              )}
            </div>

            {/* Helper Hint */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2.5">
              <KeyRound size={15} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-700">
                  PIN Bawaan Resmi: <span className="font-mono font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded border border-emerald-300">123456</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Admin dapat mengganti kode PIN ini kapan saja di menu Pengaturan Keamanan.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={closeAdminModal}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSuccess}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Lock size={14} />
                <span>{isSuccess ? "Terverifikasi..." : "Verifikasi & Masuk"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
