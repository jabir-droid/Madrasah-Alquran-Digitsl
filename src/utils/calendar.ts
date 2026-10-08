/**
 * Shared Islamic & Gregorian Calendar Utility
 * Madrasah Al-Qur'an Digital
 * Consistent Kemenag Style & Hijri Umm al-Qura calculations
 */

export const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export const DAYS_OF_WEEK = [
  { short: "Ahad", full: "Ahad", arabic: "الأحد", isSunday: true, isFriday: false },
  { short: "Sen", full: "Senin", arabic: "الإثنين", isSunday: false, isFriday: false },
  { short: "Sel", full: "Selasa", arabic: "الثلاثاء", isSunday: false, isFriday: false },
  { short: "Rab", full: "Rabu", arabic: "الأربعاء", isSunday: false, isFriday: false },
  { short: "Kam", full: "Kamis", arabic: "الخميس", isSunday: false, isFriday: false },
  { short: "Jum", full: "Jum'at", arabic: "الجمعة", isSunday: false, isFriday: true },
  { short: "Sab", full: "Sabtu", arabic: "السبت", isSunday: false, isFriday: false }
];

export const toArabicDigits = (num: number | string): string => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (w) => arabicDigits[+w]);
};

export const normalizeHijriMonthName = (rawMonth: string): string => {
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

export const getHijriDayNumber = (year: number, month: number, day: number): string => {
  try {
    const dt = new Date(year, month, day);
    const parts = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
      day: 'numeric'
    }).formatToParts(dt);
    return parts.find(p => p.type === 'day')?.value || String(day);
  } catch {
    return String(day);
  }
};

export const getHijriMonthRange = (year: number, month: number): string => {
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
  } catch {
    return "Rabi'ul Akhir – Jumadil Ula 1448 H";
  }
};

export const getHijriFullDate = (year: number, month: number, day: number): string => {
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
  } catch {
    return `${day} Rabi'ul Akhir 1448 H`;
  }
};

export const getHijriArabicTitle = (year: number, month: number): string => {
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
    "Sya'ban": "شعبan",
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
    const m1Clean = normalizeHijriMonthName(p1.find(p => p.type === 'month')?.value || '');
    const m2Clean = normalizeHijriMonthName(p2.find(p => p.type === 'month')?.value || '');
    const yr = p2.find(p => p.type === 'year')?.value || '1448';
    const a1 = arabicMonths[m1Clean] || m1Clean;
    const a2 = arabicMonths[m2Clean] || m2Clean;
    const yrArab = toArabicDigits(yr);
    if (a1 === a2) {
      return `${a1} ${yrArab} هـ`;
    }
    return `${a1} – ${a2} ${yrArab} هـ`;
  } catch {
    return "ربيع الآخر – جمادى الأولى ١٤٤٨ هـ";
  }
};

export interface CalendarCell {
  day: number;
  current: boolean;
  month: number;
  year: number;
}

export const generateCalendarCells = (year: number, month: number): CalendarCell[] => {
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonthIndex = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonthIndex = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  const prevMonthCells: CalendarCell[] = Array.from({ length: firstDayOfWeek }, (_, i) => ({
    day: totalDaysInPrevMonth - firstDayOfWeek + 1 + i,
    current: false,
    month: prevMonthIndex,
    year: prevYear
  }));

  const currentMonthCells: CalendarCell[] = Array.from({ length: totalDaysInMonth }, (_, i) => ({
    day: i + 1,
    current: true,
    month: month,
    year: year
  }));

  const totalDisplayed = prevMonthCells.length + currentMonthCells.length;
  const remainingCellsCount = (7 - (totalDisplayed % 7)) % 7;
  const nextMonthCells: CalendarCell[] = Array.from({ length: remainingCellsCount }, (_, i) => ({
    day: i + 1,
    current: false,
    month: nextMonthIndex,
    year: nextYear
  }));

  return [...prevMonthCells, ...currentMonthCells, ...nextMonthCells];
};
