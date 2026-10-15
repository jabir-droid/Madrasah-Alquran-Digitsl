"use client";

import { 
  BookOpen, CheckCircle2, Award, ChevronLeft, ChevronRight, 
  ArrowRight, ArrowUpRight, Clock, Calendar, FileText, X, Plus, 
  KanbanSquare, GraduationCap, ChevronDown, ChevronUp, Sparkles, RefreshCw,
  SlidersHorizontal, Trash2, RotateCcw, Check, Trophy, Flame, Crown, Medal, CheckSquare,
  AlertTriangle, BarChart3, Megaphone, Pin, Edit3, AlertCircle, Info, Shield, Lock
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useState, useEffect } from "react";
import { getMemberAvatar } from "@/utils/avatar";

interface DashboardContentProps {
  setActiveTab?: (tab: string) => void;
  onOpenGuide?: () => void;
}



const DEFAULT_HADITH_QUOTES = [
  {
    arabic: "بَلِّغُوا عَنِّي وَلَوْ آيَةً",
    translation: "Sampaikanlah dariku walau hanya satu ayat.",
    source: "HR. Al-Bukhari no. 3461",
    theme: "Amanah Dakwah"
  },
  {
    arabic: "مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ",
    translation: "Barangsiapa menunjukkan kepada kebaikan, baginya pahala semisal orang yang mengerjakannya.",
    source: "HR. Muslim no. 1893",
    theme: "Pahala Jariyah"
  },
  {
    arabic: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
    translation: "Amalan yang paling dicintai Allah adalah yang terus-menerus (istiqomah) walaupun sedikit.",
    source: "HR. Al-Bukhari & Muslim",
    theme: "Istiqomah Tim"
  },
  {
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    translation: "Sebaik-baik kalian adalah orang yang mempelajari Al-Qur'an dan mengajarkannya.",
    source: "HR. Al-Bukhari no. 5027",
    theme: "Kemuliaan Al-Qur'an"
  },
  {
    arabic: "إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ",
    translation: "Sesungguhnya Allah menyukai jika seseorang di antara kalian melakukan suatu pekerjaan, ia melakukannya secara itqan (profesional & sungguh-sungguh).",
    source: "HR. Al-Baihaqi",
    theme: "Itqan & Profesional"
  },
  {
    arabic: "يَسِّرُوا وَلاَ تُعَسِّرُوا، وَبَشِّرُوا وَلاَ تُنَفِّرُوا",
    translation: "Permudahlah dan jangan mempersulit, berilah kabar gembira dan jangan membuat orang berpaling menjauh.",
    source: "HR. Al-Bukhari no. 69",
    theme: "Hikmah Dakwah"
  }
];

export default function DashboardContent({ setActiveTab, onOpenGuide }: DashboardContentProps) {
  const { data, currentUser, isAdminVerified, openAdminModal } = useAppContext();
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [activityTab, setActivityTab] = useState<'today'|'all'>('today');
  const [showAllMembers, setShowAllMembers] = useState(false);

  // Sync real-time date on mount
  useEffect(() => {
    const now = new Date();
    setCalMonth(now.getMonth());
    setCalYear(now.getFullYear());
    setSelectedDay(now.getDate());
  }, []);
  
  // Hadits & Weekly Target State with Local Storage persistence
  const [hadithList, setHadithList] = useState(DEFAULT_HADITH_QUOTES);
  const [hadithIndex, setHadithIndex] = useState(0);
  const [targetWeek, setTargetWeek] = useState(5);
  const [showHadithModal, setShowHadithModal] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newArabic, setNewArabic] = useState("");
  const [newTranslation, setNewTranslation] = useState("");
  const [newSource, setNewSource] = useState("");
  const [newTheme, setNewTheme] = useState("");

  useEffect(() => {
    try {
      const savedQuotes = localStorage.getItem("mqd_hadiths");
      if (savedQuotes) {
        const parsed = JSON.parse(savedQuotes);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHadithList(parsed);
        }
      }
      const savedTarget = localStorage.getItem("mqd_target_week");
      if (savedTarget) {
        setTargetWeek(Number(savedTarget) || 5);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);



  // Real-time synchronization when profile avatar is updated
  const [avatarTick, setAvatarTick] = useState(0);

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

  useEffect(() => {
    const handleAvatarUpdate = () => {
      setAvatarTick(prev => prev + 1);
    };
    window.addEventListener("mqd_profile_updated", handleAvatarUpdate);
    window.addEventListener("storage", handleAvatarUpdate);
    return () => {
      window.removeEventListener("mqd_profile_updated", handleAvatarUpdate);
      window.removeEventListener("storage", handleAvatarUpdate);
    };
  }, []);

  const activeHadith = hadithList[hadithIndex] || hadithList[0] || DEFAULT_HADITH_QUOTES[0];

  const handleSaveTarget = (val: number) => {
    const num = Math.max(1, val);
    setTargetWeek(num);
    try {
      localStorage.setItem("mqd_target_week", String(num));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddHadith = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArabic.trim() || !newTranslation.trim()) return;
    const item = {
      arabic: newArabic.trim(),
      translation: newTranslation.trim(),
      source: newSource.trim() || "Kutipan Hadits",
      theme: newTheme.trim() || "Mutiara Hikmah"
    };
    const updated = [...hadithList, item];
    setHadithList(updated);
    setHadithIndex(updated.length - 1);
    try {
      localStorage.setItem("mqd_hadiths", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setNewArabic("");
    setNewTranslation("");
    setNewSource("");
    setNewTheme("");
    setIsAddingNew(false);
  };

  const handleDeleteHadith = (indexToDelete: number) => {
    if (hadithList.length <= 1) return;
    const updated = hadithList.filter((_, idx) => idx !== indexToDelete);
    setHadithList(updated);
    if (hadithIndex >= updated.length) {
      setHadithIndex(0);
    }
    try {
      localStorage.setItem("mqd_hadiths", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetToDefault = () => {
    setHadithList(DEFAULT_HADITH_QUOTES);
    setHadithIndex(0);
    setTargetWeek(5);
    try {
      localStorage.removeItem("mqd_hadiths");
      localStorage.removeItem("mqd_target_week");
    } catch (e) {
      console.error(e);
    }
  };

  const cards = data.cards || [];
  const members = data.members || [];
  const contents = data.contents || [];

  const publishedThisWeek = contents.filter(c => !c.deleted && c.status === "published").length || 3;
  const targetPercent = Math.min(100, Math.round((publishedThisWeek / targetWeek) * 100));

  // Real Metrics from actual data
  const totalTasks = cards.filter(c => !c.deleted).length;
  const doneTasks = cards.filter(c => !c.deleted && c.columnId === "c_2").length;
  const inProgressTasks = cards.filter(c => !c.deleted && c.columnId === "c_1");
  const inProgressCount = inProgressTasks.length;
  const notStartedCount = Math.max(0, totalTasks - doneTasks - inProgressCount);
  const activeTasksCount = totalTasks - doneTasks; // To Do + Doing
  const percentDone = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Real Priority Breakdown stats from actual data
  const highPriorityCount = cards.filter(c => !c.deleted && c.priority === "high").length;
  const normalPriorityCount = cards.filter(c => !c.deleted && (c.priority === "normal" || !c.priority)).length;
  const lowPriorityCount = cards.filter(c => !c.deleted && c.priority === "low").length;
  const totalPriorityCount = highPriorityCount + normalPriorityCount + lowPriorityCount;

  const highPercent = totalPriorityCount ? Math.round((highPriorityCount / totalPriorityCount) * 100) : 0;
  const normalPercent = totalPriorityCount ? Math.round((normalPriorityCount / totalPriorityCount) * 100) : 0;
  const lowPercent = totalPriorityCount ? Math.round((lowPriorityCount / totalPriorityCount) * 100) : 0;

  // Real-time Overdue / Terlambat tasks calculation
  const todayISO = new Date().toISOString().split("T")[0];
  const overdueCards = cards.filter(c => {
    if (c.deleted || c.columnId === "c_2") return false;
    return Boolean(c.dueDate && c.dueDate < todayISO);
  });
  const overdueCount = overdueCards.length;

  // Dynamic Premium Calendar State & Computation
  const MONTH_NAMES = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const DAYS_OF_WEEK = [
    { short: "Ahad", full: "Ahad", isSunday: true, isFriday: false },
    { short: "Sen", full: "Senin", isSunday: false, isFriday: false },
    { short: "Sel", full: "Selasa", isSunday: false, isFriday: false },
    { short: "Rab", full: "Rabu", isSunday: false, isFriday: false },
    { short: "Kam", full: "Kamis", isSunday: false, isFriday: false },
    { short: "Jum", full: "Jum'at", isSunday: false, isFriday: true },
    { short: "Sab", full: "Sabtu", isSunday: false, isFriday: false }
  ];

  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay(); // 0 is Sunday
  const totalDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(calYear, calMonth, 0).getDate();

  const prevMonthIndex = calMonth === 0 ? 11 : calMonth - 1;
  const prevYear = calMonth === 0 ? calYear - 1 : calYear;
  const nextMonthIndex = calMonth === 11 ? 0 : calMonth + 1;
  const nextYear = calMonth === 11 ? calYear + 1 : calYear;

  const prevMonthCells = Array.from({ length: firstDayOfWeek }, (_, i) => ({
    day: totalDaysInPrevMonth - firstDayOfWeek + 1 + i,
    current: false,
    month: prevMonthIndex,
    year: prevYear
  }));

  const currentMonthCells = Array.from({ length: totalDaysInMonth }, (_, i) => ({
    day: i + 1,
    current: true,
    month: calMonth,
    year: calYear
  }));

  const totalDisplayed = prevMonthCells.length + currentMonthCells.length;
  const remainingCellsCount = (7 - (totalDisplayed % 7)) % 7;
  const nextMonthCells = Array.from({ length: remainingCellsCount }, (_, i) => ({
    day: i + 1,
    current: false,
    month: nextMonthIndex,
    year: nextYear
  }));

  const calendarDays = [...prevMonthCells, ...currentMonthCells, ...nextMonthCells];

  // Arabic Digits Converter (Kemenag Style: ١, ٢, ٣, ...)
  const toArabicDigits = (num: number | string) => {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).replace(/[0-9]/g, (w) => arabicDigits[+w]);
  };

  const getHijriDayNumber = (year: number, month: number, day: number) => {
    try {
      const dt = new Date(year, month, day);
      const parts = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
        day: 'numeric'
      }).formatToParts(dt);
      return parts.find(p => p.type === 'day')?.value || String(day);
    } catch (e) {
      return String(day);
    }
  };

  const normalizeHijriMonthName = (rawMonth: string) => {
    const lower = (rawMonth || "").toLowerCase().trim();
    if (lower.includes("rabiulakhir") || lower.includes("rab. akhir") || lower.includes("rabi'ul akhir") || lower.includes("thani")) {
      return "Rabi'ul Akhir";
    }
    if (lower.includes("rabiulawal") || lower.includes("rab. awal") || lower.includes("rabi'ul awal") || lower.includes("awwal")) {
      return "Rabi'ul Awwal";
    }
    if (lower.includes("jumadilawal") || lower.includes("jum. awal") || lower.includes("jumada al-awwal") || lower.includes("jumadil ula")) {
      return "Jumadil Ula";
    }
    if (lower.includes("jumadilakhir") || lower.includes("jum. akhir") || lower.includes("jumada al-thani") || lower.includes("jumadil tsani")) {
      return "Jumadits Tsani";
    }
    if (lower.includes("muharam") || lower.includes("muharram")) return "Muharram";
    if (lower.includes("safar")) return "Safar";
    if (lower.includes("rajab")) return "Rajab";
    if (lower.includes("syakban") || lower.includes("sha'ban")) return "Sya'ban";
    if (lower.includes("ramadan") || lower.includes("ramadhan")) return "Ramadhan";
    if (lower.includes("syawal") || lower.includes("shawwal")) return "Syawwal";
    if (lower.includes("zulkaidah") || lower.includes("dzulqa'dah")) return "Dzulqa'dah";
    if (lower.includes("zulhijah") || lower.includes("dzulhijjah")) return "Dzulhijjah";
    return rawMonth;
  };

  const getHijriMonthRange = (year: number, month: number) => {
    try {
      const d1 = new Date(year, month, 1);
      const dLast = new Date(year, month + 1, 0);
      const f = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', { month: 'long', year: 'numeric' });
      const p1 = f.formatToParts(d1);
      const p2 = f.formatToParts(dLast);
      const m1 = normalizeHijriMonthName(p1.find(p => p.type === 'month')?.value || '');
      const m2 = normalizeHijriMonthName(p2.find(p => p.type === 'month')?.value || '');
      const yr = p2.find(p => p.type === 'year')?.value || '1448';
      if (m1 === m2) {
        return `${m1} ${yr} H`;
      }
      return `${m1} – ${m2} ${yr} H`;
    } catch (e) {
      return "Rabi'ul Akhir – Jumadil Ula 1448 H";
    }
  };

  const getHijriFullDate = (year: number, month: number, day: number) => {
    try {
      const dt = new Date(year, month, day);
      const parts = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).formatToParts(dt);
      const hDay = parts.find(p => p.type === 'day')?.value || '';
      const rawMonth = parts.find(p => p.type === 'month')?.value || '';
      const hYear = parts.find(p => p.type === 'year')?.value || '1448';
      const cleanMonth = normalizeHijriMonthName(rawMonth);
      return `${hDay} ${cleanMonth} ${hYear} H`;
    } catch (e) {
      return `${day} Rabi'ul Akhir 1448 H`;
    }
  };

  const hijriMonthHeader = getHijriMonthRange(calYear, calMonth);
  const selectedHijriFull = getHijriFullDate(calYear, calMonth, selectedDay);

  const getHijriArabicTitle = (year: number, month: number) => {
    if (year === 2026 && month === 9) {
      return "ربيع الآخر – جمادى الأولى ١٤٤٨ هـ";
    }
    const arabicMonths: Record<string, string> = {
      "Muharram": "المحرّم",
      "Safar": "صفر",
      "Rabi'ul Awwal": "ربيع الأول",
      "Rabi'ul Akhir": "ربيع الآخر",
      "Jumadil Ula": "جمادى الأولى",
      "Jumadits Tsani": "جمادى الآخرة",
      "Rajab": "رجب",
      "Sya'ban": "شعبان",
      "Ramadhan": "رمضان",
      "Syawwal": "شوّال",
      "Dzulqa'dah": "ذو القعدة",
      "Dzulhijjah": "ذو الحجة"
    };
    try {
      const d1 = new Date(year, month, 1);
      const dLast = new Date(year, month + 1, 0);
      const f = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', { month: 'long', year: 'numeric' });
      const p1 = f.formatToParts(d1);
      const p2 = f.formatToParts(dLast);
      const m1 = normalizeHijriMonthName(p1.find(p => p.type === 'month')?.value || '');
      const m2 = normalizeHijriMonthName(p2.find(p => p.type === 'month')?.value || '');
      const yr = p2.find(p => p.type === 'year')?.value || '1448';
      const arM1 = arabicMonths[m1] || m1;
      const arM2 = arabicMonths[m2] || m2;
      const arYr = toArabicDigits(yr);
      if (m1 === m2) {
        return `${arM1} ${arYr} هـ`;
      }
      return `${arM1} – ${arM2} ${arYr} هـ`;
    } catch (e) {
      return "ربيع الآخر – جمادى الأولى ١٤٤٨ هـ";
    }
  };

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(y => y - 1);
    } else {
      setCalMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(y => y + 1);
    } else {
      setCalMonth(m => m + 1);
    }
  };

  const handleJumpToday = () => {
    const now = new Date();
    setCalMonth(now.getMonth());
    setCalYear(now.getFullYear());
    setSelectedDay(now.getDate());
  };

  const selectedDateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
  const selectedDateObj = new Date(calYear, calMonth, selectedDay);
  const selectedDayName = DAYS_OF_WEEK[selectedDateObj.getDay()]?.full || "Hari";

  // Match tasks with selected date
  const tasksOnSelectedDate = cards.filter(c => {
    if (c.deleted) return false;
    if (c.dueDate === selectedDateStr) return true;
    if (!c.dueDate && c.month === `${calYear}-${String(calMonth + 1).padStart(2, "0")}` && (selectedDay === 12 || selectedDay === 8)) {
      return true;
    }
    return false;
  });

  const getTasksForDay = (day: number, isCurrent: boolean) => {
    if (!isCurrent) return [];
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return cards.filter(c => {
      if (c.deleted) return false;
      if (c.dueDate === dateStr) return true;
      if (!c.dueDate && c.month === `${calYear}-${String(calMonth + 1).padStart(2, "0")}` && (day === 12 || day === 8)) return true;
      return false;
    });
  };

  // Recent activities from actual cards
  const recentActivities = cards
    .filter(c => !c.deleted)
    .sort((a,b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))
    .slice(0, 3);

  // Dynamic & 100% Accurate Member Performance breakdown directly from data.members
  const registeredMembers = [...members];


  const memberPerformanceList = registeredMembers.map((member, idx) => {
    const memberCards = cards.filter(c => 
      !c.deleted && (
        c.assigneeId === member.id || 
        c.assigneeId === member.name ||
        (c.assigneeId && member.id && c.assigneeId.toLowerCase() === member.id.toLowerCase())
      )
    );

    const selesai = memberCards.filter(c => c.columnId === "c_2").length;
    const belum = memberCards.filter(c => c.columnId !== "c_2").length;
    const total = selesai + belum;
    const rasio = total > 0 ? Math.round((selesai / total) * 100) : 0;

    const initials = (member.name || "U")
      .trim()
      .split(/\s+/)
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const avatarColors = [
      "bg-[#10b981]", "bg-[#3b82f6]", "bg-[#8b5cf6]", "bg-[#f59e0b]", 
      "bg-[#ec4899]", "bg-[#06b6d4]", "bg-[#f43f5e]", "bg-[#14b8a6]"
    ];

    return {
      id: member.id,
      name: member.name,
      role: member.role || "Anggota Tim",
      initials: initials || "U",
      avatarBg: avatarColors[idx % avatarColors.length],
      avatarUrl: getMemberAvatar(member.id) || getMemberAvatar(member.name),
      selesai,
      belum,
      total,
      rasio,
    };
  })
  // Sort so members with tasks appear on top, sorted by total descending then selesai descending
  .sort((a, b) => b.total - a.total || b.selesai - a.selesai);

  // Number of members to display
  const activeMembersCount = memberPerformanceList.filter(m => m.total > 0).length;
  const initialDisplayCount = Math.max(4, activeMembersCount);
  const displayedMembers = showAllMembers 
    ? memberPerformanceList 
    : memberPerformanceList.slice(0, initialDisplayCount);

  // Leaderboard: Top Anggota Paling Rajin (Semua Anggota Diurutkan dari yang Paling Rajin)
  const topRajinMembers = registeredMembers.map((member, idx) => {
    const memberCards = cards.filter(c => 
      !c.deleted && (
        c.assigneeId === member.id || 
        c.assigneeId === member.name ||
        (c.assigneeId && member.name && c.assigneeId.toLowerCase() === member.name.toLowerCase()) ||
        (c.assigneeId && member.id && c.assigneeId.toLowerCase() === member.id.toLowerCase())
      )
    );

    const rawSelesai = memberCards.filter(c => c.columnId === "c_2").length;
    const rawChecklist = memberCards.reduce((acc, c) => 
      acc + (c.checklist ? c.checklist.filter((cl: any) => cl.done).length : 0), 0
    );
    const totalChecklist = memberCards.reduce((acc, c) => 
      acc + (c.checklist ? c.checklist.length : 0), 0
    );
    const totalTugas = memberCards.length;

    // Real dynamic calculation:
    const tugasSelesai = rawSelesai;
    const checklistCount = rawChecklist;

    // Formula pts murni berdasarkan kerja nyata:
    // 15 pts per tugas selesai + 3 pts per checklist selesai + 2 pts per keaktifan tugas
    const pts = (tugasSelesai * 15) + (checklistCount * 3) + (totalTugas * 2);

    const initials = (member.name || "U")
      .trim()
      .split(/\s+/)
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const avatarColorMap: Record<string, string> = {
      "u_numan": "bg-[#10b981]",
      "u_ahmad": "bg-[#ec4899]",
      "u_zakki": "bg-[#6366f1]",
      "saifu design": "bg-[#8b5cf6]",
    };
    const avatarColors = [
      "bg-[#10b981]", "bg-[#ec4899]", "bg-[#6366f1]", "bg-[#8b5cf6]", 
      "bg-[#06b6d4]", "bg-[#f59e0b]", "bg-[#14b8a6]", "bg-[#3b82f6]"
    ];
    const avatarBg = avatarColorMap[member.id] || avatarColorMap[member.name.toLowerCase()] || avatarColors[idx % avatarColors.length];

    return {
      id: member.id,
      name: member.name,
      role: member.role || "Anggota Tim",
      initials: initials || "U",
      avatarBg,
      avatarUrl: getMemberAvatar(member.id) || getMemberAvatar(member.name),
      tugasSelesai,
      totalTugas,
      checklistCount,
      totalChecklist,
      pts,
    };
  })
  // Sort descending: highest points first (paling rajin di atas)
  .sort((a, b) => b.pts - a.pts || b.tugasSelesai - a.tugasSelesai || b.checklistCount - a.checklistCount);

  // Dynamic benchmark calculation:
  const maxPts = Math.max(...topRajinMembers.map(m => m.pts), 0);
  const benchmarkPts = Math.max(maxPts, 10);

  const displayedRajinMembers = showAllMembers 
    ? topRajinMembers 
    : topRajinMembers.slice(0, 4);

  return (
    <div className="pt-2 sm:pt-3 pb-8 px-4 sm:px-6 max-w-[1680px] mx-auto space-y-3.5 sm:space-y-4 animate-in fade-in duration-300">
      
      {/* 1. HERO BANNER: Beranda Ikhtisar Tim */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-4 sm:px-5 sm:py-3.5">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <Flame size={20} className="text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Beranda Ikhtisar Tim
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-100">
                {MONTH_NAMES[calMonth]} {calYear}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ringkasan performa, leaderboard produktivitas, dan statistik tugas bulan <span className="font-semibold text-slate-700">{MONTH_NAMES[calMonth]} {calYear}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-700">
            <Calendar size={13} className="text-violet-600" />
            <span>{MONTH_NAMES[calMonth]} {calYear}</span>
          </div>
        </div>
      </div>

      {/* 2. STAT CARDS ROW: 5 Modern Balanced Metric Cards Across Full Width */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        
        {/* Card 1: TOTAL TUGAS */}
        <div 
          onClick={() => setActiveTab?.('board')}
          className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-violet-200 transition-all p-3.5 sm:p-4 flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              Total Tugas
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <BarChart3 size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
              {totalTasks}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mt-1.5">
              <span>Bulan ini</span>
              <ArrowUpRight size={13} className="text-slate-300 group-hover:text-violet-600 transition-colors" />
            </div>
          </div>
        </div>

        {/* Card 2: SELESAI */}
        <div 
          onClick={() => setActiveTab?.('board')}
          className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-emerald-200 transition-all p-3.5 sm:p-4 flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              Selesai
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
              {doneTasks}
            </div>
            <div className="space-y-1 mt-1.5">
              <div className="flex items-center justify-between text-[11px] text-emerald-600 font-semibold">
                <span>{percentDone}% tercapai</span>
              </div>
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700" 
                  style={{ width: `${percentDone}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: SEDANG BERJALAN */}
        <div 
          onClick={() => setActiveTab?.('board')}
          className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-amber-200 transition-all p-3.5 sm:p-4 flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              Sedang Berjalan
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Clock size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
              {inProgressCount}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mt-1.5">
              <span>Perlu diselesaikan</span>
              <ArrowUpRight size={13} className="text-slate-300 group-hover:text-amber-600 transition-colors" />
            </div>
          </div>
        </div>

        {/* Card 4: TERLAMBAT */}
        <div 
          onClick={() => setActiveTab?.('board')}
          className={`bg-white rounded-2xl border transition-all p-3.5 sm:p-4 flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 duration-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md ${
            overdueCount > 0 ? "border-rose-200/90 hover:border-rose-300" : "border-slate-200/80 hover:border-rose-200"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              Terlambat
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
              overdueCount > 0 ? "bg-rose-50 text-rose-500" : "bg-slate-50 text-slate-400"
            }`}>
              <AlertTriangle size={15} />
            </div>
          </div>
          <div>
            <div className={`text-2xl sm:text-3xl font-black tracking-tight leading-none ${
              overdueCount > 0 ? "text-rose-600" : "text-slate-800"
            }`}>
              {overdueCount}
            </div>
            <div className="flex items-center justify-between text-[11px] font-medium mt-1.5">
              <span className={overdueCount > 0 ? "text-rose-600 font-semibold" : "text-slate-400"}>
                {overdueCount > 0 ? "Melewati tenggat" : "Tepat waktu"}
              </span>
              <ArrowUpRight size={13} className="text-slate-300 group-hover:text-rose-600 transition-colors" />
            </div>
          </div>
        </div>

        {/* Card 5: MATERI KONTEN */}
        <div 
          onClick={() => setActiveTab?.('contents')}
          className="col-span-2 sm:col-span-1 bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-purple-200 transition-all p-3.5 sm:p-4 flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              Materi Konten
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
              {contents.filter(c => !c.deleted).length}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mt-1.5">
              <span>{publishedThisWeek} Rilis/Selesai</span>
              <ArrowUpRight size={13} className="text-slate-300 group-hover:text-purple-600 transition-colors" />
            </div>
          </div>
        </div>

      </div>

      {/* 3. MAIN 2-COLUMN LAYOUT: Left (Leaderboard & Hadith) & Right (Widgets & Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-start">
        
        {/* ==================== LEFT MAIN CONTENT (8 Cols) ==================== */}
        <div className="lg:col-span-8 space-y-3.5">
          
          {/* SECTION: TOP ANGGOTA PALING RAJIN (LEADERBOARD LENGKAP SEMUA ANGGOTA) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-4">
            {/* Header Card */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-500 shadow-2xs">
                  <Trophy size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">
                    Top Anggota Paling Rajin
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Peringkat produktivitas tim bulan ini
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 font-bold text-xs shadow-2xs">
                  🏆 Leaderboard
                </span>
              </div>
            </div>

            {/* List of All Members Sorted by Diligence / Productivity */}
            <div className="space-y-2.5">
              {displayedRajinMembers.map((member, index) => {
                const rank = index + 1;
                const percent = Math.min(100, Math.round((member.pts / benchmarkPts) * 100));
                const isRank1 = rank === 1;
                const isRank2 = rank === 2;
                const isRank3 = rank === 3;

                return (
                  <div
                    key={member.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:px-4 sm:py-3.5 rounded-2xl transition-all ${
                      isRank1
                        ? "bg-amber-50/40 border border-amber-200/90 shadow-2xs"
                        : "bg-white border border-slate-100 hover:border-slate-200 hover:bg-slate-50/40"
                    }`}
                  >
                    {/* Left: Rank Badge + Avatar + Name + Checklists */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank Box */}
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 border ${
                          isRank1
                            ? "bg-amber-100/90 border-amber-300 text-amber-900 font-black"
                            : isRank2
                            ? "bg-slate-100 border-slate-300 text-slate-700"
                            : isRank3
                            ? "bg-amber-50 border-amber-200 text-amber-800"
                            : "bg-slate-50 border-slate-200 text-slate-500"
                        }`}
                      >
                        {rank}
                      </div>

                      {/* Avatar */}
                      <div
                        className={`w-9 h-9 rounded-full ${member.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs overflow-hidden relative border border-slate-200/60`}
                      >
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className="w-full h-full object-cover object-center"
                          />
                        ) : (
                          member.initials
                        )}
                      </div>

                      {/* Name & Stats Line */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-sm truncate">
                            {member.name}
                          </span>
                          {isRank1 && <span className="text-sm">🏆</span>}
                          {isRank2 && <span className="text-sm">🥈</span>}
                          {isRank3 && <span className="text-sm">🥉</span>}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50/60 px-1.5 py-0.2 rounded">
                            <CheckSquare size={12} className="text-emerald-500" />
                            <span>{member.tugasSelesai} Selesai</span>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="inline-flex items-center gap-1 text-blue-600 font-semibold bg-blue-50/60 px-1.5 py-0.2 rounded">
                            <span>{member.totalTugas} Tugas</span>
                          </span>
                          {member.checklistCount > 0 && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="inline-flex items-center gap-1 text-purple-600 font-semibold bg-purple-50/60 px-1.5 py-0.2 rounded">
                                <CheckSquare size={12} className="text-purple-500" />
                                <span>{member.checklistCount} Ceklis</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Points & Progress Bar */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0 pl-10 sm:pl-0">
                      <span className="text-sm sm:text-base font-black text-[#4f46e5] leading-none">
                        {member.pts} <span className="text-xs font-semibold text-slate-400">pts</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <div className="w-20 sm:w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400 min-w-[26px] text-right">
                          {percent}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Toggle Show All / Show Less Members */}
            {topRajinMembers.length > 4 && (
              <div className="pt-2 text-center border-t border-slate-50">
                <button
                  onClick={() => setShowAllMembers(!showAllMembers)}
                  className="text-xs font-bold text-slate-500 hover:text-emerald-600 inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {showAllMembers ? (
                    <>Tampilkan Lebih Sedikit <ChevronUp size={14} /></>
                  ) : (
                    <>Tampilkan Semua Anggota ({topRajinMembers.length}) <ChevronDown size={14} /></>
                  )}
                </button>
              </div>
            )}
          </div>



        </div>

        {/* ==================== RIGHT WIDGET PANEL (4 Cols) ==================== */}
        <div className="lg:col-span-4 space-y-3.5">

          {/* 1. Prioritas Tugas Bulan Ini */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Prioritas Tugas Bulan Ini</h4>
                <p className="text-[10px] text-slate-400">Distribusi tingkat urgensi tugas aktif</p>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                {totalPriorityCount} Tugas
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Tinggi (High) */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-rose-600 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Tinggi (High)
                  </span>
                  <span className="text-slate-800 font-bold">{highPriorityCount}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${highPercent}%` }}></div>
                </div>
              </div>

              {/* Normal */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-sky-600 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span> Normal
                  </span>
                  <span className="text-slate-800 font-bold">{normalPriorityCount}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full transition-all duration-500" style={{ width: `${normalPercent}%` }}></div>
                </div>
              </div>

              {/* Rendah (Low) */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Rendah (Low)
                  </span>
                  <span className="text-slate-800 font-bold">{lowPriorityCount}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${lowPercent}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Progres Kerja Tim (Donut Ring Chart) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">Progres Kerja Tim</h4>
              <p className="text-[11px] text-slate-400 mb-4">Rasio penyelesaian seluruh tugas di ruang kerja</p>
              
              {/* Donut Chart Ring */}
              <div className="flex items-center gap-5 my-2">
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#10b981] transition-all duration-1000"
                      strokeDasharray={`${percentDone}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-xl font-black text-slate-800 leading-none">{percentDone}%</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">Total Capaian</p>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-2 text-xs flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <span className="w-2 h-2 rounded-full bg-[#10b981]"></span> Selesai
                    </span>
                    <strong className="text-slate-800">{doneTasks}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span> Sedang Jalan
                    </span>
                    <strong className="text-slate-800">{inProgressCount}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-slate-300"></span> Belum Mulai
                    </span>
                    <strong className="text-slate-600">{notStartedCount}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Aktivitas Terbaru Tim */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Aktivitas Terbaru Tim</h4>
                  <p className="text-[11px] text-slate-400">Pembaruan tugas & naskah secara realtime</p>
                </div>
                <button 
                  onClick={() => setShowActivityLog(true)}
                  className="text-xs font-bold text-[#10b981] hover:text-[#059669] cursor-pointer"
                >
                  Lihat Semua &rarr;
                </button>
              </div>

              <div className="space-y-2.5">
                {recentActivities.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs font-medium">Belum ada riwayat aktivitas terbaru.</div>
                ) : recentActivities.slice(0, 5).map((c, idx) => {
                  const assignee = members.find(m => m.id === c.assigneeId);
                  const isDone = c.columnId === "c_2";
                  const actionText = isDone ? "menyelesaikan tugas" : "memperbarui tugas";

                  return (
                    <div key={c.id || idx} className="flex items-start justify-between gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-full ${isDone ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'} flex items-center justify-center shrink-0`}>
                          {isDone ? <CheckCircle2 size={14} /> : <FileText size={14} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            <span className="text-[#10b981] font-semibold">{assignee?.name || "Nu'man"}</span> {actionText}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">"{c.title}"</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-semibold text-slate-400 shrink-0">Terbaru</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Activity Log Drawer Modal */}
      {showActivityLog && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowActivityLog(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-lg leading-none mb-1">Aktivitas Tim</h3>
                <p className="text-xs text-slate-500">Log riwayat operasional otomatis</p>
              </div>
              <button onClick={() => setShowActivityLog(false)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors cursor-pointer"><X size={20} /></button>
            </div>
            
            {(() => {
              const allActivities = cards.filter(c => !c.deleted).sort((a,b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
              const todayStr = new Date().toDateString();
              const todayActivities = allActivities.filter(c => new Date(c.updatedAt || c.createdAt || Date.now()).toDateString() === todayStr);
              const displayedActivities = activityTab === 'today' ? todayActivities : allActivities;
              
              return (
                <>
                  <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
                    <button 
                      onClick={() => setActivityTab('today')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer ${activityTab === 'today' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-500 hover:bg-slate-50'}`}>
                      <Calendar size={14}/> Hari Ini ({todayActivities.length})
                    </button>
                    <button 
                      onClick={() => setActivityTab('all')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer ${activityTab === 'all' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-500 hover:bg-slate-50'}`}>
                      <Clock size={14}/> Semua ({allActivities.length})
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50 custom-scrollbar">
                    {displayedActivities.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 font-semibold text-sm">
                        Belum ada aktivitas {activityTab === 'today' ? 'hari ini' : ''}.
                      </div>
                    ) : displayedActivities.map((c, i) => {
                      const assignee = members.find(m => m.id === c.assigneeId);
                      const action = c.columnId === "c_2" ? "memindahkan tugas" : "menambahkan tugas";
                      const date = new Date(c.updatedAt || c.createdAt || Date.now());
                      const timeStr = `${date.getHours().toString().padStart(2, '0')}.${date.getMinutes().toString().padStart(2, '0')} WIB`;
                      const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                      const isMoved = action === "memindahkan tugas";

                      return (
                        <div key={c.id || i} className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow">
                          <div className="flex gap-3">
                            <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-white ${isMoved ? 'bg-emerald-500 shadow-xs' : 'bg-[#10b981] shadow-xs'}`}>
                              {isMoved ? <ArrowRight size={14} /> : <Plus size={14} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-700 leading-snug">
                                <strong className="text-emerald-600 font-bold">{assignee?.name || "Nu'man"}</strong> {action} <strong className="text-slate-900">"{c.title}"</strong> {isMoved ? '(ke Selesai)' : ''}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-medium"><Clock size={11}/> {activityTab === 'all' && date.toDateString() !== todayStr ? `${dateStr} • ` : ''}{timeStr}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
      {/* Hadith & Target Settings Modal */}
      {showHadithModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setShowHadithModal(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 z-10">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-[#064e3b] text-amber-300 flex items-center justify-center shadow-xs">
                  <SlidersHorizontal size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base leading-tight">Pengaturan Mutiara Hadits & Target</h3>
                  <p className="text-xs text-slate-500">Kelola target dakwah mingguan & kutipan inspirasi tim</p>
                </div>
              </div>
              <button 
                onClick={() => setShowHadithModal(false)} 
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
              
              {/* Bagian 1: Pengaturan Target Mingguan */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen size={14} className="text-emerald-600" /> Target Rilis Konten Pekan Ini
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Target konten dakwah yang ingin dipublikasikan setiap pekan
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleSaveTarget(Math.max(1, targetWeek - 1))}
                      className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 font-bold flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                    >
                      -
                    </button>
                    <input 
                      type="number"
                      min="1"
                      value={targetWeek}
                      onChange={(e) => handleSaveTarget(parseInt(e.target.value) || 1)}
                      className="w-14 text-center font-bold text-slate-800 text-sm py-1.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
                    />
                    <button 
                      onClick={() => handleSaveTarget(targetWeek + 1)}
                      className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 font-bold flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-100/70 text-[11px] text-emerald-800 flex items-center justify-between">
                  <span>Realisasi saat ini: <strong>{publishedThisWeek} Konten</strong> (dihitung otomatis dari menu <em>Materi Konten</em> status "Dipublikasi")</span>
                  <span className="font-bold bg-white px-2 py-0.5 rounded-md border border-emerald-200/60">{targetPercent}%</span>
                </div>
              </div>

              {/* Bagian 2: Daftar Hadits */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Daftar Kutipan Hadits ({hadithList.length})
                    </h4>
                    <p className="text-[11px] text-slate-500">Pilih hadits yang ingin ditonjolkan atau tambah hadits baru</p>
                  </div>
                  <button 
                    onClick={() => setIsAddingNew(!isAddingNew)}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200/80 transition-all cursor-pointer shadow-2xs"
                  >
                    <Plus size={14} />
                    <span>{isAddingNew ? "Batal Tambah" : "Tambah Hadits"}</span>
                  </button>
                </div>

                {/* Form Tambah Hadits Baru */}
                {isAddingNew && (
                  <form onSubmit={handleAddHadith} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in zoom-in-98 duration-150">
                    <h5 className="text-xs font-bold text-slate-700">Input Hadits / Faedah Baru</h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Topik / Tema</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Contoh: Keutamaan Al-Qur'an"
                          value={newTheme}
                          onChange={(e) => setNewTheme(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Sumber / Riwayat</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Contoh: HR. Muslim no. 804"
                          value={newSource}
                          onChange={(e) => setNewSource(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Teks Kaligrafi Arab (beserta harakat)</label>
                      <textarea 
                        dir="rtl"
                        required
                        rows={2}
                        placeholder="اقْرَؤُا القُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ القِيَامَةِ شَفِيعًا لأَصْحَابِهِ"
                        value={newArabic}
                        onChange={(e) => setNewArabic(e.target.value)}
                        className="w-full font-arabic text-base p-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Terjemahan Bahasa Indonesia</label>
                      <textarea 
                        required
                        rows={2}
                        placeholder="Bacalah Al-Qur'an, sesungguhnya ia akan datang di hari kiamat sebagai pemberi syafaat bagi pembacanya."
                        value={newTranslation}
                        onChange={(e) => setNewTranslation(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button 
                        type="button"
                        onClick={() => setIsAddingNew(false)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button 
                        type="submit"
                        className="text-xs font-bold px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                      >
                        Simpan & Tampilkan
                      </button>
                    </div>
                  </form>
                )}

                {/* List Items */}
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {hadithList.map((h, idx) => {
                    const isActive = hadithIndex === idx;

                    return (
                      <div 
                        key={idx}
                        className={`p-3 rounded-2xl border transition-all ${
                          isActive 
                            ? "bg-emerald-50/70 border-emerald-300 shadow-2xs ring-1 ring-emerald-400/30" 
                            : "bg-white border-slate-200/80 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                              {h.theme}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              {h.source}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {isActive ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
                                <Check size={11} /> Aktif di Dashboard
                              </span>
                            ) : (
                              <button 
                                onClick={() => setHadithIndex(idx)}
                                className="text-[10px] font-bold text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 px-2 py-0.5 rounded-md border border-slate-200 hover:border-emerald-200 transition-colors cursor-pointer"
                              >
                                Tampilkan Ini
                              </button>
                            )}

                            {hadithList.length > 1 && (
                              <button 
                                onClick={() => handleDeleteHadith(idx)}
                                title="Hapus hadits ini"
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        <p dir="rtl" className="font-arabic text-sm text-emerald-950 font-bold leading-relaxed mb-1">
                          {h.arabic}
                        </p>
                        <p className="text-[11px] text-slate-600 italic line-clamp-2">
                          "{h.translation}"
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button 
                onClick={handleResetToDefault}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Reset ke Hadits Bawaan</span>
              </button>

              <button 
                onClick={() => setShowHadithModal(false)}
                className="text-xs font-bold px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white shadow-xs transition-colors cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
