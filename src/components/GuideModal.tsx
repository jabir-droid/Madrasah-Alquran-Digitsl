"use client";

import { useState } from "react";
import { 
  X, GraduationCap, Users, PlusCircle, CheckCircle2, 
  CalendarDays, BarChart3, RefreshCw, Archive, Download, 
  Moon, Sparkles, ArrowRight, ArrowLeft 
} from "lucide-react";

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuideModal({ isOpen, onClose }: GuideModalProps) {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const stepsData = [
    {
      step: 1,
      title: "Atur anggota tim",
      desc: "Klik \"Anggota\" untuk menambah atau menghapus nama tim. Setiap anggota punya warna & inisial sendiri — tugas jadi jelas siapa pegangnya.",
      icon: <Users size={20} className="stroke-[2.2]" />,
    },
    {
      step: 2,
      title: "Buat tugas & checklist",
      desc: "Tambah kartu di kolom mana pun. Isi deskripsi, daftar kerja (checklist), tenggat, dan prioritas. Seret kartu antar kolom untuk ubah status: Todo → Doing → Done.",
      icon: <PlusCircle size={20} className="stroke-[2.2]" />,
    },
    {
      step: 3,
      title: "Selesaikan & laporkan",
      desc: "Pindahkan tugas ke kolom selesai (tandai dengan ✓ di menu kolom), lalu isi hasil kerja + link bukti di kartunya. Tugas selesai otomatis masuk Laporan.",
      icon: <CheckCircle2 size={20} className="stroke-[2.2]" />,
    },
    {
      step: 4,
      title: "Pantau via Kalender",
      desc: "Lihat semua tenggat dalam kalender bulanan — telat berwarna merah, selesai tercoret, hari ini di-highlight. Geser ‹ › untuk bulan lain.",
      icon: <CalendarDays size={20} className="stroke-[2.2]" />,
    },
    {
      step: 5,
      title: "Baca Laporan",
      desc: "Rekap otomatis: jumlah selesai, persentase, performa tepat waktu, dan breakdown per anggota. Export CSV tiap pekan untuk laporan resmi.",
      icon: <BarChart3 size={20} className="stroke-[2.2]" />,
    },
  ];

  const current = stepsData[step - 1];

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Dialog */}
      <div className="relative w-full max-w-[530px] bg-white rounded-3xl shadow-2xl border border-slate-100/90 p-7 sm:p-8 animate-in zoom-in-95 duration-200 z-10 flex flex-col justify-between">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Top Header */}
        <div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2dd4bf] to-[#0284c7] text-white flex items-center justify-center shadow-sm mb-4">
            <GraduationCap size={26} className="stroke-[2.2]" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-1">
            Panduan Ruang Kerja Kampus
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
            Kelola tugas tim dalam 5 langkah — dari anggota sampai laporan.
          </p>
        </div>

        {/* Divider & Step Tracker */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
            LANGKAH {step} DARI 5
          </p>

          {/* Step Body */}
          <div className="flex items-start gap-4 min-h-[92px]">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100/60 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
              {current.icon}
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">
                {current.title}
              </h4>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                {current.desc}
              </p>
            </div>
          </div>

          {/* Quick Tips Box (Only Step 5) */}
          {step === 5 && (
            <div className="mt-4 pt-3 border-t border-slate-100 animate-in fade-in duration-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                TIPS CEPAT
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-3 text-[11px] text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <RefreshCw size={13} className="text-indigo-600 shrink-0" />
                  <span>Sinkron antar device tiap 20 detik</span>
                </div>
                <div className="flex items-center gap-2">
                  <Archive size={13} className="text-indigo-600 shrink-0" />
                  <span>Tugas belum selesai pindah bulan otomatis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download size={13} className="text-indigo-600 shrink-0" />
                  <span>Export JSON = backup data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Moon size={13} className="text-indigo-600 shrink-0" />
                  <span>Mode gelap & terang tersedia</span>
                </div>
              </div>
            </div>
          )}

          {/* Dots Indicator (Hidden on Step 5 or showing dots) */}
          {step < 5 && (
            <div className="flex items-center gap-1.5 mt-6 mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <div 
                  key={s} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step 
                      ? "w-7 bg-indigo-600" 
                      : "w-1.5 bg-slate-200"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`mt-2 flex items-center justify-between ${step === 5 ? "pt-4 border-t border-slate-50" : ""}`}>
          {step < 5 ? (
            <>
              <button
                onClick={handlePrev}
                disabled={step === 1}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200/90 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ArrowLeft size={13} />
                Kembali
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
              >
                <span>{step === 4 ? "Lihat tips" : "Lanjut"}</span>
                <ArrowRight size={14} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 py-2 transition-colors cursor-pointer"
              >
                <Sparkles size={14} className="text-indigo-600" />
                Ulangi
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
              >
                Mulai bekerja
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
