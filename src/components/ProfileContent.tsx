"use client";

import { useState, useEffect } from "react";
import { 
  User, Mail, Phone, MapPin, Calendar, Award, CheckCircle2, 
  BookOpen, Sparkles, Shield, Save, Edit3, Check, KanbanSquare, 
  Clock, ShieldCheck, HeartHandshake, Crown, Palette, GraduationCap,
  Lock, Key, Users, Database, FileText, Eye, ArrowRight, Layers, X,
  Camera, Image, Upload, Trash2
} from "lucide-react";
import { useAppContext, PRESET_USERS, UserRole } from "@/context/AppContext";
import { saveMemberAvatar, getMemberAvatar } from "@/utils/avatar";

export default function ProfileContent() {
  const { 
    data, 
    currentUser, 
    switchUser, 
    isAdminVerified, 
    openAdminModal, 
    lockAdmin,
    saveMember 
  } = useAppContext();
  
  // Profile state with LocalStorage persistence per user
  const [profile, setProfile] = useState({
    name: currentUser.name,
    fullName: currentUser.fullName,
    role: currentUser.roleLabel,
    email: currentUser.email,
    phone: "+62 812-8899-7721",
    location: "Jakarta Selatan, Indonesia",
    joinDate: "Oktober 2026",
    avatarUrl: "",
    bio: currentUser.bio,
    specializations: currentUser.role === "admin" 
      ? ["Manajemen Proyek Dakwah", "Kreator Konten & Naskah", "Kajian & Riset Tafsir", "Editing & Kurasi Desain", "Pengembangan Kurikulum Digital"]
      : currentUser.role === "kreatif"
      ? ["Kreator Konten & Naskah", "Editing Desain Grafis", "Sosial Media Dakwah", "Audio Visual & Motion"]
      : ["Pengajaran Al-Qur'an", "Tahsin & Tajwid", "Evaluasi Santri", "Kurikulum Madrasah"]
  });

  // Institution Slogan & Description state with LocalStorage persistence
  const [institutionInfo, setInstitutionInfo] = useState({
    name: "Madrasah Al-Qur'an Digital",
    slogan: "Membina Generasi Qur'ani Berbasis Keunggulan Digital",
    description: "Ruang kerja terpadu tim inti untuk manajemen kurikulum, produksi media dakwah, dan tata kelola pendidikan modern."
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingSlogan, setIsEditingSlogan] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load institutional info from localStorage
  useEffect(() => {
    try {
      const instStored = localStorage.getItem("mqd_institution_info");
      if (instStored) {
        setInstitutionInfo(JSON.parse(instStored));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("mqd_user_profile_" + currentUser.id);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile(parsed);
        return;
      }
    } catch {}

    setProfile(prev => ({
      ...prev,
      name: currentUser.name,
      fullName: currentUser.fullName,
      role: currentUser.roleLabel,
      email: currentUser.email,
      joinDate: prev.joinDate || "Oktober 2026",
      avatarUrl: prev.avatarUrl || "",
      bio: currentUser.bio,
      specializations: currentUser.role === "admin" 
        ? ["Manajemen Proyek Dakwah", "Kreator Konten & Naskah", "Kajian & Riset Tafsir", "Editing & Kurasi Desain", "Pengembangan Kurikulum Digital"]
        : currentUser.role === "kreatif"
        ? ["Kreator Konten & Naskah", "Editing Desain Grafis", "Sosial Media Dakwah", "Audio Visual & Motion"]
        : ["Pengajaran Al-Qur'an", "Tahsin & Tajwid", "Evaluasi Santri", "Kurikulum Madrasah"]
    }));
  }, [currentUser]);

  // Upload Profile Photo from Gallery
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Harap pilih file gambar (JPG, PNG, atau WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar terlalu besar. Maksimal 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setProfile(prev => {
          const updated = { ...prev, avatarUrl: dataUrl };
          try {
            localStorage.setItem("mqd_user_profile_" + currentUser.id, JSON.stringify(updated));
            saveMemberAvatar(currentUser.id, currentUser.name, dataUrl);
          } catch (err) {
            console.error(err);
          }
          return updated;
        });
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setProfile(prev => {
      const updated = { ...prev, avatarUrl: "" };
      try {
        localStorage.setItem("mqd_user_profile_" + currentUser.id, JSON.stringify(updated));
        saveMemberAvatar(currentUser.id, currentUser.name, "");
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  };

  // Open Edit Slogan: Admin Only with PIN verification requirement
  const handleOpenEditSlogan = () => {
    if (currentUser.role !== "admin") {
      alert("Akses Terbatas: Hanya Admin / Koordinator yang memiliki wewenang untuk mengubah slogan lembaga.");
      return;
    }
    if (!isAdminVerified) {
      openAdminModal(() => setIsEditingSlogan(true));
      return;
    }
    setIsEditingSlogan(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Sync updated member into global data.members & database
      const existingMember = data.members.find(m => m.id === currentUser.id);
      if (existingMember) {
        saveMember({
          ...existingMember,
          name: profile.name,
          role: profile.role
        });
      }

      // 2. Save avatar to shared avatar utility
      if (profile.avatarUrl) {
        saveMemberAvatar(currentUser.id, profile.name, profile.avatarUrl);
      }

      // 3. Persist local profile state
      localStorage.setItem("mqd_user_profile_" + currentUser.id, JSON.stringify(profile));
      if (currentUser.role === "admin") {
        localStorage.setItem("mqd_institution_info", JSON.stringify(institutionInfo));
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("mqd_profile_updated"));
      }
      setSavedSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSlogan = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role !== "admin") {
      alert("Hanya Admin yang berwenang mengubah slogan lembaga.");
      return;
    }
    try {
      localStorage.setItem("mqd_institution_info", JSON.stringify(institutionInfo));
      setIsEditingSlogan(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const cards = data.cards || [];
  const contents = data.contents || [];

  const myDoneTasks = cards.filter(c => !c.deleted && c.columnId === "c_2").length;
  const myActiveTasks = cards.filter(c => !c.deleted && c.columnId === "c_1").length;
  const myPublishedContents = contents.filter(c => !c.deleted && c.status.toLowerCase().includes("publish")).length;
  const totalMyTasks = myDoneTasks + myActiveTasks;
  const taskRate = totalMyTasks ? Math.round((myDoneTasks / totalMyTasks) * 100) : 100;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Toast Alert Sukses */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 shadow-md animate-in slide-in-from-top-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check size={16} />
          </div>
          <div>
            <p className="text-xs font-bold">Profil Berhasil Diperbarui!</p>
            <p className="text-[11px] text-emerald-700">Perubahan informasi profil Anda telah tersimpan rapi.</p>
          </div>
        </div>
      )}

      {/* Profile Header Hero Card */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        
        {/* Cover Banner (Rich Islamic Emerald & Obsidian Luxury) */}
        <div className="h-48 sm:h-56 bg-gradient-to-br from-[#021f17] via-[#064e3b] to-[#043327] relative p-5 sm:p-7 flex flex-col justify-between overflow-hidden">
          {/* Subtle Ambient Lighting */}
          <div className="pointer-events-none absolute -top-16 -right-16 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/4 w-72 h-72 bg-emerald-300/10 rounded-full blur-2xl" />
          <div className="pointer-events-none absolute top-1/3 right-1/4 w-60 h-60 bg-amber-400/10 rounded-full blur-3xl" />

          {/* Intricate Islamic Geometric Lattice Pattern Overlay (Smooth Continuous Vectors, No Dotted Lines) */}
          <svg className="pointer-events-none absolute inset-0 w-full h-full opacity-10 text-emerald-200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="islamic-lattice" width="56" height="56" patternUnits="userSpaceOnUse">
                <path d="M28 0 L56 28 L28 56 L0 28 Z" fill="none" stroke="currentColor" strokeWidth="0.6" />
                <path d="M0 0 L56 56 M56 0 L0 56" fill="none" stroke="currentColor" strokeWidth="0.4" />
                <polygon points="28,14 32,24 42,28 32,32 28,42 24,32 14,28 24,24" fill="none" stroke="currentColor" strokeWidth="0.6" />
                <circle cx="28" cy="28" r="4" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#islamic-lattice)" />
          </svg>

          {/* Top Banner Row: Badges (Clean executive design with geometric jewel accents & hairline dividers) */}
          <div className="relative z-10 flex items-center justify-between w-full flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/50 backdrop-blur-md border border-white/10 shadow-xs">
              <span className="w-1.5 h-1.5 rotate-45 bg-emerald-400 shadow-2xs"></span>
              <span className="text-[11px] font-bold tracking-[0.18em] text-emerald-200 uppercase">
                Portal Resmi Lembaga
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/50 backdrop-blur-md border border-emerald-400/25 text-xs font-semibold text-emerald-100 shadow-xs">
              <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
              <span className="font-mono text-emerald-200 text-[11px] font-semibold tracking-wider">
                ID: {currentUser.id.toUpperCase()}
              </span>
              <span className="w-px h-3 bg-emerald-400/35"></span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-300">
                TERVERIFIKASI
              </span>
            </div>
          </div>

          {/* Center: Prestigious Institutional Slogan & Description */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto px-4 py-2">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-950/70 backdrop-blur-md border border-amber-400/30 mb-2.5 shadow-sm">
              <svg className="w-3 h-3 text-amber-300/90 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12,2 14.5,8.5 21,9 16,14 17.5,21 12,17.5 6.5,21 8,14 3,9 9.5,8.5" />
              </svg>
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase text-amber-200">
                {institutionInfo.name}
              </span>
              <svg className="w-3 h-3 text-amber-300/90 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12,2 14.5,8.5 21,9 16,14 17.5,21 12,17.5 6.5,21 8,14 3,9 9.5,8.5" />
              </svg>
            </div>

            <h2 className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-sm max-w-2xl leading-snug">
              {institutionInfo.slogan}
            </h2>

            <p className="text-xs sm:text-[13px] text-emerald-100/85 max-w-xl mt-1.5 font-medium leading-relaxed hidden sm:block">
              {institutionInfo.description}
            </p>
          </div>

          {/* Bottom Banner Row: Leave bottom-left empty so avatar never collides with text */}
          <div className="relative z-10 flex items-center justify-end w-full">
            <span className="text-[10px] text-emerald-300/60 tracking-wider font-mono hidden sm:inline">
              SISTEM INFORMASI MANAJEMEN MQD
            </span>
          </div>
        </div>

        {/* Profile Details Container */}
        <div className="px-5 sm:px-8 pb-7 pt-0">
          
          {/* Avatar & Action Button Row (Clean separation, generous button size) */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
            {/* Avatar Container with Real Image Support & Gallery Upload */}
            <div className="relative group self-start">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-900 text-white flex flex-col items-center justify-center shadow-xl ring-4 ring-white border border-slate-700/50 overflow-hidden relative">
                {profile.avatarUrl ? (
                  <img 
                    src={profile.avatarUrl} 
                    alt={profile.fullName} 
                    className="w-full h-full object-cover object-center" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex flex-col items-center justify-center">
                    <span className="font-black text-2xl sm:text-3xl tracking-wider text-emerald-300">
                      {profile.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">
                      {currentUser.role}
                    </span>
                  </div>
                )}

                {/* Quick Gallery Upload Hover Trigger */}
                <label 
                  htmlFor="quick-avatar-upload"
                  className="absolute inset-0 bg-slate-950/75 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-2xs"
                  title="Klik untuk memilih foto profil dari galeri"
                >
                  <Camera size={20} className="text-emerald-400 mb-0.5" />
                  <span className="text-[9px] font-bold tracking-wider text-emerald-200 uppercase">Ubah Foto</span>
                </label>
                <input 
                  id="quick-avatar-upload"
                  type="file" 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden" 
                />
              </div>
              
              {/* Online Indicator Badge (Refined jewel diamond accent) */}
              <div 
                title="Status: Online & Aktif" 
                className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold border-2 border-white shadow-xs flex items-center gap-1 z-10"
              >
                <span className="w-1.5 h-1.5 rotate-45 bg-white shrink-0"></span>
                <span>AKTIF</span>
              </div>
            </div>

            {/* Action Buttons: Edit Slogan (Admin Only) & Edit Profil */}
            <div className="flex items-center gap-2 sm:self-end pt-2 sm:pt-0 flex-wrap">
              {currentUser.role === "admin" && (
                <button 
                  type="button"
                  onClick={handleOpenEditSlogan}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Ubah teks slogan dan deskripsi banner lembaga (Khusus Admin)"
                >
                  <Sparkles size={15} className="text-amber-500" />
                  <span>Edit Slogan</span>
                </button>
              )}

              <button 
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`inline-flex items-center gap-2.5 text-xs sm:text-sm font-bold px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl transition-all cursor-pointer shadow-sm active:scale-95 ${
                  isEditing
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                    : "bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 hover:shadow-md hover:ring-2 hover:ring-slate-900/10"
                }`}
              >
                <Edit3 size={16} strokeWidth={2} />
                <span>{isEditing ? "Tutup Formulir" : "Edit Profil"}</span>
              </button>
            </div>
          </div>

          {/* Name & Title Header */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{profile.fullName}</span>
                <span title="Terverifikasi" className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white shadow-2xs">
                  <Check size={12} strokeWidth={3} />
                </span>
              </h1>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
                {profile.role}
              </span>
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/80">
                Dewan Pengelola
              </span>
            </div>

            {/* Structured 4-Column Metadata Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
              {/* Email */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:bg-white hover:border-slate-300 transition-all group">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <Mail size={14} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Email Resmi</p>
                  <p className="text-xs text-slate-800 font-semibold truncate">{profile.email}</p>
                </div>
              </div>

              {/* Telepon */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:bg-white hover:border-slate-300 transition-all group">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <Phone size={14} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Kontak / WA</p>
                  <p className="text-xs text-slate-800 font-semibold truncate">{profile.phone}</p>
                </div>
              </div>

              {/* Lokasi */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:bg-white hover:border-slate-300 transition-all group">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <MapPin size={14} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Domisili</p>
                  <p className="text-xs text-slate-800 font-semibold truncate">{profile.location}</p>
                </div>
              </div>

              {/* Bergabung */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:bg-white hover:border-slate-300 transition-all group">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <Calendar size={14} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Masa Khidmah</p>
                  <p className="text-xs text-slate-800 font-semibold truncate">Sejak {profile.joinDate}</p>
                </div>
              </div>
            </div>

            {/* Bio Amanah Card */}
            <div className="mt-2 p-4 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-slate-50/80 to-slate-50/60 border border-emerald-200/60 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <HeartHandshake size={15} strokeWidth={2} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Amanah & Pernyataan Tugas Resmi
                </p>
                <p className="text-xs sm:text-[13px] text-slate-700 italic leading-relaxed">
                  &ldquo;{profile.bio}&rdquo;
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. ROLE SWITCHER & HAK AKSES SISTEM */}
      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs border ${
              currentUser.role === 'admin' && isAdminVerified 
                ? 'bg-slate-900 text-emerald-400 border-slate-800' 
                : 'bg-slate-900 text-slate-300 border-slate-800'
            }`}>
              <ShieldCheck size={20} strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-slate-900 text-base leading-tight">
                  Status Akun & Verifikasi Hak Akses
                </h2>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase text-slate-700 bg-slate-100 border border-slate-200/90 px-2.5 py-0.5 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Sistem Otorisasi Resmi
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Hak akses terproteksi sesuai struktur jabatan tim. Hak Admin memerlukan verifikasi PIN keamanan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
            {currentUser.role === 'admin' && isAdminVerified ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/90 shadow-2xs">
                <ShieldCheck size={14} strokeWidth={2} className="text-emerald-600" />
                <span>Admin Terverifikasi (Akses Penuh)</span>
              </div>
            ) : (
              <>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200/80">
                  <span>Peran: {currentUser.roleLabel}</span>
                </div>
                <button
                  onClick={() => openAdminModal()}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-xs"
                  title="Beralih atau verifikasi hak Admin"
                >
                  <Key size={12} strokeWidth={2} />
                  <span>Verifikasi Admin</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 3 Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {PRESET_USERS.map((u) => {
            const isSelected = currentUser.role === u.role;
            const isRoleAdmin = u.role === "admin";
            const isRoleKreatif = u.role === "kreatif";

            const theme = isRoleAdmin
              ? {
                  icon: ShieldCheck,
                  iconContainer: isSelected 
                    ? "bg-slate-900 text-emerald-400 border border-slate-800 shadow-xs" 
                    : "bg-slate-100 text-slate-600 border border-slate-200/90",
                  activeBorder: "border-slate-800 ring-1 ring-slate-800/10 bg-gradient-to-b from-slate-50/40 via-white to-white shadow-xs",
                  accentText: "text-slate-900",
                  summaryTag: "Akses Penuh Manajemen & Sistem",
                  summaryDesc: "Kontrol penuh alur kerja, kurikulum, data anggota, dan cadangan database."
                }
              : isRoleKreatif
              ? {
                  icon: Layers,
                  iconContainer: isSelected 
                    ? "bg-slate-900 text-violet-300 border border-slate-800 shadow-xs" 
                    : "bg-slate-100 text-slate-600 border border-slate-200/90",
                  activeBorder: "border-slate-800 ring-1 ring-slate-800/10 bg-gradient-to-b from-slate-50/40 via-white to-white shadow-xs",
                  accentText: "text-slate-900",
                  summaryTag: "Produksi Media, Konten & SOP",
                  summaryDesc: "Kelola alur tugas visual, materi konten dakwah, dan standardisasi kerja tim."
                }
              : {
                  icon: BookOpen,
                  iconContainer: isSelected 
                    ? "bg-slate-900 text-sky-300 border border-slate-800 shadow-xs" 
                    : "bg-slate-100 text-slate-600 border border-slate-200/90",
                  activeBorder: "border-slate-800 ring-1 ring-slate-800/10 bg-gradient-to-b from-slate-50/40 via-white to-white shadow-xs",
                  accentText: "text-slate-900",
                  summaryTag: "Kurikulum & Modul Pengajaran",
                  summaryDesc: "Alur tugas santri, silabus pembelajaran Al-Qur'an, dan materi keilmuan."
                };

            const RoleIcon = theme.icon;

            return (
              <button
                key={u.role}
                onClick={() => {
                  if (isSelected) return;
                  switchUser(u.role);
                }}
                className={`text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
                  isSelected
                    ? theme.activeBorder
                    : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/40 shadow-2xs"
                }`}
              >
                <div>
                  {/* Top Header inside Card */}
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 border ${theme.iconContainer}`}>
                      <RoleIcon size={18} strokeWidth={1.8} />
                    </div>

                    {isSelected ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-900 text-white shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        {isRoleAdmin ? "Aktif & Terverifikasi" : "Sedang Aktif"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 group-hover:text-slate-900 px-2 py-1 transition-colors">
                        <span>Beralih Akun</span>
                        <ArrowRight size={10} strokeWidth={2} className="group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    )}
                  </div>

                  {/* Role & User Detail */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {u.roleLabel}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <span className="font-medium text-slate-700">{u.name}</span>
                      <span className="text-slate-300">•</span>
                      <span className="truncate text-slate-400 text-[11px]">{u.email}</span>
                    </p>
                  </div>
                </div>

                {/* Features / Scope */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] space-y-1">
                  <p className={`font-semibold flex items-center gap-1.5 ${theme.accentText}`}>
                    <Check size={12} strokeWidth={2.5} className="shrink-0 text-emerald-600" />
                    <span>{theme.summaryTag}</span>
                  </p>
                  <p className="text-slate-500 text-[11px] leading-relaxed pl-4">
                    {theme.summaryDesc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Matriks Izin Operasional */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Izin Operasional Anda Saat Ini:
              </h4>
              <span className="text-xs font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
                {currentUser.roleLabel}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Hak Akses Sesuai Job Desk & Otorisasi Resmi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {/* 1. Papan Tugas */}
            <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/70">
                  <KanbanSquare size={14} strokeWidth={1.8} />
                </div>
                <span className="font-semibold text-slate-800 text-xs">Papan Tugas</span>
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  <Check size={11} strokeWidth={2.5} className="text-emerald-600" />
                  Akses Penuh
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Alur kerja, kanban & status</p>
              </div>
            </div>

            {/* 2. Materi Konten */}
            <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/70">
                  <Sparkles size={14} strokeWidth={1.8} />
                </div>
                <span className="font-semibold text-slate-800 text-xs">Materi Konten</span>
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  <Check size={11} strokeWidth={2.5} className="text-emerald-600" />
                  Akses Penuh
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Draft dakwah & publikasi</p>
              </div>
            </div>

            {/* 3. Catatan & SOP */}
            <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/70">
                  <FileText size={14} strokeWidth={1.8} />
                </div>
                <span className="font-semibold text-slate-800 text-xs">Catatan & SOP</span>
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  <Check size={11} strokeWidth={2.5} className="text-emerald-600" />
                  Akses Penuh
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Dokumentasi & panduan</p>
              </div>
            </div>

            {/* 4. Kelola Anggota */}
            <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/70">
                  <Users size={14} strokeWidth={1.8} />
                </div>
                <span className="font-semibold text-slate-800 text-xs">Kelola Anggota</span>
              </div>
              <div>
                {currentUser.role === 'admin' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    <Check size={11} strokeWidth={2.5} className="text-emerald-600" />
                    Tambah & Hapus
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                    <Eye size={10} strokeWidth={2} />
                    Hanya Lihat
                  </span>
                )}
                <p className="text-[10px] text-slate-400 mt-1">
                  {currentUser.role === 'admin' ? 'Manajemen seluruh tim' : 'Akses baca anggota tim'}
                </p>
              </div>
            </div>

            {/* 5. Backup & Sistem */}
            <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/70">
                  <Database size={14} strokeWidth={1.8} />
                </div>
                <span className="font-semibold text-slate-800 text-xs">Backup & Sistem</span>
              </div>
              <div>
                {currentUser.role === 'admin' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    <Check size={11} strokeWidth={2.5} className="text-emerald-600" />
                    Backup & Keamanan
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                    <Lock size={10} strokeWidth={2} />
                    Khusus Admin
                  </span>
                )}
                <p className="text-[10px] text-slate-400 mt-1">
                  {currentUser.role === 'admin' ? 'Proteksi & cadangan data' : 'Memerlukan otorisasi admin'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Statistik Kinerja & Spesialisasi */}
        <div className="space-y-6">
          
          {/* Statistik Kontribusi */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Award size={16} className="text-emerald-600" />
                Statistik Kinerja Saya
              </h3>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                {taskRate}% Tuntas
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Tugas Rampung</p>
                    <p className="text-[10px] text-slate-400">Papan Kanban</p>
                  </div>
                </div>
                <span className="text-base font-black text-slate-900">{myDoneTasks}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Konten Rilis</p>
                    <p className="text-[10px] text-slate-400">Dakwah Media</p>
                  </div>
                </div>
                <span className="text-base font-black text-slate-900">{myPublishedContents}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <KanbanSquare size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Sedang Berjalan</p>
                    <p className="text-[10px] text-slate-400">Fokus Saat Ini</p>
                  </div>
                </div>
                <span className="text-base font-black text-slate-900">{myActiveTasks}</span>
              </div>
            </div>
          </div>

          {/* Keahlian & Spesialisasi */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                Keahlian & Bidang Amanah
              </h3>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.specializations.map((spec, i) => (
                <span 
                  key={i}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Right Col: Rincian Data Pengguna (View Mode / Edit Form) */}
        <div className="lg:col-span-2">
          <div className="p-5 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {isEditing ? "Formulir Pembaruan Profil" : "Informasi Lengkap Akun"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isEditing 
                    ? "Ubah data akun Anda dan tekan simpan untuk memperbarui secara realtime" 
                    : "Rincian identitas dan data kontak resmi akun ruang kerja Anda"}
                </p>
              </div>

              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200/80 transition-colors"
                >
                  <Edit3 size={13} />
                  <span>Ubah Rincian</span>
                </button>
              )}
            </div>

            {/* Jika sedang mode EDIT: Form Input Interaktif */}
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4 animate-in fade-in">
                {/* Upload Foto Profil dari Galeri */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-center gap-4">
                  {/* Avatar Preview */}
                  <div className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-emerald-500/40 shadow-sm overflow-hidden relative shrink-0 flex items-center justify-center">
                    {profile.avatarUrl ? (
                      <img 
                        src={profile.avatarUrl} 
                        alt="Preview Foto Profil" 
                        className="w-full h-full object-cover object-center" 
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-emerald-300">
                        <span className="font-black text-xl">{profile.name.slice(0, 2).toUpperCase()}</span>
                        <span className="text-[8px] text-slate-400 font-semibold uppercase">{currentUser.role}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Info */}
                  <div className="space-y-1.5 flex-1 text-center sm:text-left">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-1.5">
                      <Image size={14} className="text-emerald-600" />
                      <span>Foto Profil Akun</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Pilih foto resmi dari galeri perangkat Anda (JPG, PNG, atau WEBP).
                    </p>

                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 flex-wrap">
                      <label 
                        htmlFor="form-avatar-upload"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-all active:scale-95"
                      >
                        <Upload size={13} />
                        <span>{profile.avatarUrl ? "Ganti dari Galeri" : "Pilih dari Galeri"}</span>
                      </label>
                      <input 
                        id="form-avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />

                      {profile.avatarUrl && (
                        <button 
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold cursor-pointer transition-all active:scale-95"
                          title="Hapus foto profil dan gunakan inisial default"
                        >
                          <Trash2 size={13} />
                          <span>Hapus Foto</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Nama Panggilan</label>
                    <input 
                      type="text"
                      required
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full text-xs font-semibold p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Nama Lengkap</label>
                    <input 
                      type="text"
                      required
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      className="w-full text-xs font-semibold p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Email Kerja</label>
                    <div className="relative">
                      <input 
                        type="email"
                        required
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full text-xs font-semibold p-3 pl-9 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">No. WhatsApp / HP</label>
                    <div className="relative">
                      <input 
                        type="text"
                        required
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full text-xs font-semibold p-3 pl-9 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Amanah & Peran</label>
                    <input 
                      type="text"
                      required
                      value={profile.role}
                      onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                      className="w-full text-xs font-semibold p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Lokasi Domisili</label>
                    <div className="relative">
                      <input 
                        type="text"
                        required
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        className="w-full text-xs font-semibold p-3 pl-9 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                      <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Masa Khidmah / Tanggal Bergabung</label>
                  <div className="relative">
                    <input 
                      type="text"
                      required
                      placeholder="Contoh: Oktober 2026 atau 1 Muharram 1448 H"
                      value={profile.joinDate}
                      onChange={(e) => setProfile({ ...profile, joinDate: e.target.value })}
                      className="w-full text-xs font-semibold p-3 pl-9 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Bio & Misi Khidmat Dakwah</label>
                  <textarea 
                    rows={3}
                    required
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full text-xs font-semibold p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed transition-all"
                  />
                </div>

                {/* Bagian Slogan & Identitas Lembaga (Khusus Admin) */}
                {currentUser.role === 'admin' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-slate-50 to-white border border-emerald-200/70 space-y-3.5">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-500" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-800">
                            Slogan &amp; Identitas Banner Lembaga
                          </h4>
                          <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                            Khusus Admin
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Teks ini ditampilkan di banner utama atas sebagai motto dan identitas resmi madrasah.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Nama Lembaga (Badge Atas)
                        </label>
                        <input 
                          type="text"
                          required
                          value={institutionInfo.name}
                          onChange={(e) => setInstitutionInfo({ ...institutionInfo, name: e.target.value })}
                          className="w-full text-xs font-semibold p-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Motto / Slogan Utama
                        </label>
                        <input 
                          type="text"
                          required
                          value={institutionInfo.slogan}
                          onChange={(e) => setInstitutionInfo({ ...institutionInfo, slogan: e.target.value })}
                          className="w-full text-xs font-semibold p-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Deskripsi Singkat / Visi Lembaga
                      </label>
                      <textarea 
                        rows={2}
                        required
                        value={institutionInfo.description}
                        onChange={(e) => setInstitutionInfo({ ...institutionInfo, description: e.target.value })}
                        className="w-full text-xs font-semibold p-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-xs font-bold px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>

                  <button 
                    type="submit"
                    className="flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Save size={14} />
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Jika sedang mode LIHAT: Tampilan Rapi & Berkelas */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 animate-in fade-in">
                
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</span>
                  <p className="text-sm font-bold text-slate-900">{profile.fullName}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Panggilan</span>
                  <p className="text-sm font-bold text-slate-900">{profile.name}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Akun</span>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Mail size={13} className="text-emerald-600" />
                    <span>{profile.email}</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No. WhatsApp</span>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Phone size={13} className="text-emerald-600" />
                    <span>{profile.phone}</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amanah & Peran</span>
                  <p className="text-sm font-bold text-slate-900">{profile.role}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lokasi Domisili</span>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin size={13} className="text-emerald-600" />
                    <span>{profile.location}</span>
                  </p>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>

      {/* MODAL CEPAT: EDIT SLOGAN & IDENTITAS LEMBAGA */}
      {isEditingSlogan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Edit Slogan &amp; Identitas</h3>
                  <p className="text-[11px] text-emerald-200/80">Perbarui slogan dan motto resmi banner</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingSlogan(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSlogan} className="p-5 sm:p-6 space-y-4">
              {/* Live Preview Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#021f17] via-[#064e3b] to-[#043327] text-white text-center space-y-2 border border-emerald-500/30 shadow-inner">
                <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-amber-300 bg-black/40 px-3 py-0.5 rounded-full border border-amber-400/30">
                  {institutionInfo.name || "Nama Lembaga"}
                </span>
                <p className="text-sm font-black text-white leading-snug">
                  {institutionInfo.slogan || "Slogan Utama Lembaga"}
                </p>
                <p className="text-[11px] text-emerald-100/80 line-clamp-2">
                  {institutionInfo.description || "Deskripsi singkat..."}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Lembaga (Badge Atas)
                </label>
                <input 
                  type="text"
                  required
                  value={institutionInfo.name}
                  onChange={(e) => setInstitutionInfo({ ...institutionInfo, name: e.target.value })}
                  className="w-full text-xs font-semibold p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Motto / Slogan Utama
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Contoh: Membina Generasi Qur'ani Berbasis Keunggulan Digital"
                  value={institutionInfo.slogan}
                  onChange={(e) => setInstitutionInfo({ ...institutionInfo, slogan: e.target.value })}
                  className="w-full text-xs font-semibold p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Deskripsi / Keterangan Singkat
                </label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Deskripsi peran atau ruang lingkup lembaga..."
                  value={institutionInfo.description}
                  onChange={(e) => setInstitutionInfo({ ...institutionInfo, description: e.target.value })}
                  className="w-full text-xs font-semibold p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingSlogan(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Save size={14} />
                  <span>Simpan Slogan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
