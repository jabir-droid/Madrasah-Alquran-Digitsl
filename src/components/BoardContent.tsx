import { MoreHorizontal, Calendar, CheckSquare, Plus, CheckCircle2, ChevronLeft, ChevronRight, ChevronDown, Archive, Check, FileText, Flame, Sparkles, ArrowRight } from "lucide-react";
import db from "@/data/db.json";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useAppContext } from "@/context/AppContext";
import { useState, useEffect } from "react";
import CardModal from "./CardModal";
import { getMemberAvatar } from "@/utils/avatar";
import { 
  MONTH_NAMES, 
  DAYS_OF_WEEK, 
  toArabicDigits, 
  getHijriDayNumber, 
  getHijriMonthRange, 
  getHijriArabicTitle,
  getHijriFullDate,
  generateCalendarCells 
} from "@/utils/calendar";

export default function BoardContent() {
  const { data, moveCard, toggleChecklist, addCard } = useAppContext();
  const [view, setView] = useState("board");
  const [editingCard, setEditingCard] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultColumnId, setDefaultColumnId] = useState("");
  const [memberFilter, setMemberFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [dueDateFilter, setDueDateFilter] = useState("");
  const [showMonthSelect, setShowMonthSelect] = useState(false);
  const [avatarTick, setAvatarTick] = useState(0);

  // Calendar View Specific Month & Year State
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<number | null>(() => new Date().getDate());

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(prev => prev - 1);
    } else {
      setCalMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(prev => prev + 1);
    } else {
      setCalMonth(prev => prev + 1);
    }
  };

  const handleResetToCurrentMonth = () => {
    const now = new Date();
    setCalMonth(now.getMonth());
    setCalYear(now.getFullYear());
    setSelectedCalendarDate(now.getDate());
  };

  useEffect(() => {
    const now = new Date();
    setCalMonth(now.getMonth());
    setCalYear(now.getFullYear());
    setSelectedCalendarDate(now.getDate());
  }, []);

  useEffect(() => {
    const handleAvatarUpdate = () => setAvatarTick(prev => prev + 1);
    window.addEventListener("mqd_profile_updated", handleAvatarUpdate);
    window.addEventListener("storage", handleAvatarUpdate);
    return () => {
      window.removeEventListener("mqd_profile_updated", handleAvatarUpdate);
      window.removeEventListener("storage", handleAvatarUpdate);
    };
  }, []);

  const members = data.members;

  const getAssignee = (id?: string) => {
    if (!id) {
      const avatarUrl = getMemberAvatar("Nu'man") || getMemberAvatar("u_numan");
      return { name: "Nu'man", initial: "N", color: "bg-emerald-500", avatarUrl };
    }
    const member = members.find(m => m.id === id || m.name.toLowerCase() === id.toLowerCase());
    if (!member) {
      const numan = members.find(m => m.id === "u_numan");
      const avatarUrl = getMemberAvatar("u_numan") || getMemberAvatar("Nu'man");
      return { 
        name: numan?.name || "Nu'man", 
        initial: "N", 
        color: "bg-emerald-500",
        avatarUrl
      };
    }
    const colors = ["bg-emerald-500", "bg-blue-500", "bg-purple-500", "bg-emerald-600", "bg-amber-500"];
    const initial = member.name.charAt(0).toUpperCase();
    const color = (member as any).color || colors[member.name.length % colors.length] || "bg-emerald-500";
    const avatarUrl = getMemberAvatar(member.id) || getMemberAvatar(member.name);
    return { name: member.name, initial, color, avatarUrl };
  };

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      return `${d.getDate()} ${months[d.getMonth()]}`;
    } catch {
      return dateStr;
    }
  };

  const columns = data.columns.sort((a, b) => a.order - b.order).map(col => {
    const colCards = data.cards.filter(c => {
      if (c.deleted || c.columnId !== col.id) return false;
      
      // Member Filter
      if (memberFilter && memberFilter !== "me" && c.assigneeId !== memberFilter) return false;
      if (memberFilter === "me") {
        // Asumsi admin adalah member pertama atau tidak difilter ketat
        // but let's actually just show all if "me" since we don't have user ID
      }
      
      // Priority Filter
      if (priorityFilter && c.priority !== priorityFilter) return false;
      
      // Due Date Filter
      if (dueDateFilter) {
        if (!c.dueDate) return false; // if filtering by date and card has no date, hide it
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const cardDate = new Date(c.dueDate);
        cardDate.setHours(0, 0, 0, 0);
        
        if (dueDateFilter === "today" && cardDate.getTime() !== today.getTime()) return false;
        if (dueDateFilter === "tomorrow" && cardDate.getTime() !== tomorrow.getTime()) return false;
        if (dueDateFilter === "overdue" && cardDate.getTime() < today.getTime() && !col.isDone) return false; 
        // Note: if column is done, is it overdue? Usually overdue only applies to unfinished tasks.
      }

      return true;
    }).sort((a, b) => a.order - b.order);
    
    let color = "text-slate-600";
    let bg = "bg-slate-50";
    let border = "border-t-slate-500";
    if (col.id === "c_0") { color = "text-indigo-600"; bg = "bg-indigo-50"; border = "border-t-indigo-500"; }
    else if (col.id === "c_1") { color = "text-amber-600"; bg = "bg-amber-50"; border = "border-t-amber-500"; }
    else if (col.id === "c_2") { color = "text-emerald-600"; bg = "bg-emerald-50"; border = "border-t-emerald-500"; }
    
    return {
      ...col,
      count: colCards.length,
      color, bg, border,
      cards: colCards
    };
  });

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    moveCard(result.draggableId, result.destination.droppableId, result.destination.index);
  };

  return (
    <div className={`flex flex-col p-4 sm:p-5 lg:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ${view === 'kalender' ? 'min-h-full pb-24' : 'h-full overflow-x-hidden'}`}>
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setView("board")}
              className={`px-3 sm:px-4 py-1.5 font-bold text-xs sm:text-sm rounded flex items-center gap-2 transition-colors cursor-pointer ${view === 'board' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              <KanbanIcon size={16} /> Board
            </button>
            <button 
              onClick={() => setView("daftar")}
              className={`px-3 sm:px-4 py-1.5 font-bold text-xs sm:text-sm rounded flex items-center gap-2 transition-colors cursor-pointer ${view === 'daftar' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
               Daftar
            </button>
            <button 
              onClick={() => setView("kalender")}
              className={`px-3 sm:px-4 py-1.5 font-bold text-xs sm:text-sm rounded flex items-center gap-2 transition-colors cursor-pointer ${view === 'kalender' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              <Calendar size={16} /> Kalender
            </button>
          </div>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 relative z-20">
             <button onClick={handlePrevMonth} title="Bulan Sebelumnya" className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded cursor-pointer active:scale-95"><ChevronLeft size={16}/></button>
             <button onClick={() => setShowMonthSelect(!showMonthSelect)} className="px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5 hover:bg-slate-50 rounded cursor-pointer"><Calendar size={14} className="text-emerald-700"/> {MONTH_NAMES[calMonth].slice(0, 3)} {calYear} <ChevronDown size={14}/></button>
             <button onClick={handleNextMonth} title="Bulan Berikutnya" className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded cursor-pointer active:scale-95"><ChevronRight size={16}/></button>
             
             {showMonthSelect && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 w-72 z-50 animate-in fade-in zoom-in-95 duration-150">
                   <div className="flex justify-between items-center mb-4">
                      <button onClick={() => setCalYear(prev => prev - 1)} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer"><ChevronLeft size={16}/></button>
                      <span className="font-bold text-slate-800 text-sm">{calYear}</span>
                      <button onClick={() => setCalYear(prev => prev + 1)} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer"><ChevronRight size={16}/></button>
                   </div>
                   <div className="grid grid-cols-3 gap-2 mb-4">
                      {MONTH_NAMES.map((m, idx) => (
                         <button 
                           onClick={() => { setCalMonth(idx); setShowMonthSelect(false); }} 
                           key={m} 
                           className={`py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                             calMonth === idx 
                               ? 'bg-[#064e3b] text-white shadow-xs' 
                               : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
                           }`}
                         >
                           {m.slice(0, 3)}
                         </button>
                      ))}
                   </div>
                   <button onClick={() => { handleResetToCurrentMonth(); setShowMonthSelect(false); }} className="w-full py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors cursor-pointer">Bulan Berjalan ({MONTH_NAMES[new Date().getMonth()].slice(0, 3)} {new Date().getFullYear()})</button>
                </div>
             )}
          </div>
          <button className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-xs sm:text-sm font-semibold rounded-lg px-3 py-1.5 sm:py-2 hover:bg-slate-50 transition-colors cursor-pointer"><Archive size={15}/> Arsip</button>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <select 
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 outline-none focus:border-brand-500 shadow-2xs">
            <option value="">Semua Anggota Tim</option>
            <option value="me">Tugasku Saja</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <select 
            value={dueDateFilter}
            onChange={(e) => setDueDateFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 outline-none focus:border-brand-500 shadow-2xs">
            <option value="">Semua Tenggat</option>
            <option value="today">Hari Ini</option>
            <option value="tomorrow">Besok</option>
            <option value="overdue">Terlambat</option>
          </select>
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 outline-none focus:border-brand-500 shadow-2xs">
            <option value="">Semua Prioritas</option>
            <option value="high">Prioritas Tinggi</option>
            <option value="normal">Prioritas Normal</option>
            <option value="low">Prioritas Rendah</option>
          </select>
        </div>
      </div>

      {view === "board" && (
        <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 flex gap-4 sm:gap-5 overflow-x-auto pb-4 custom-scrollbar">
          {columns.map((col) => (
            <div key={col.id} className="flex-1 min-w-[260px] max-w-sm flex flex-col">
              <div className={`px-4 py-3 rounded-t-xl border-t border-x border-slate-200 bg-white flex justify-between items-center ${col.border} border-t-4`}>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-800">{col.title}</h4>
                  {col.isDone && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase">Selesai</span>}
                </div>
                <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${col.bg} ${col.color}`}>
                  {col.count}
                </span>
              </div>
              
              <Droppable droppableId={col.id}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="bg-slate-50 border-x border-b border-slate-200 rounded-b-xl flex-1 p-3 space-y-3 overflow-y-auto min-h-[200px]">
                    {col.cards.map((card, idx) => {
                      const assignee = getAssignee(card.assigneeId);
                      const checks = card.checklist || [];
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const isOverdue = card.dueDate && new Date(card.dueDate) < today && !col.isDone;

                      return (
                        <Draggable key={card.id} draggableId={card.id} index={idx}>
                          {(provided) => (
                            <div 
                              onClick={() => {
                                setEditingCard(card);
                                setIsModalOpen(true);
                              }} 
                              ref={provided.innerRef} 
                              {...provided.draggableProps} 
                              {...provided.dragHandleProps} 
                              className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-grab active:cursor-grabbing group relative select-none"
                            >
                              {/* Header: Judul Tugas + Indicator Dot (seperti Foto 2) */}
                              <div className="flex items-start justify-between gap-2.5 mb-1.5">
                                <h5 className="font-bold text-slate-900 text-sm leading-snug flex-1">
                                  {card.title}
                                </h5>
                                <span 
                                  className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 shadow-2xs ${
                                    card.priority === "high" 
                                      ? "bg-rose-400" 
                                      : card.priority === "low" 
                                        ? "bg-emerald-400" 
                                        : "bg-rose-400"
                                  }`} 
                                  title={`Prioritas: ${card.priority === 'high' ? 'Tinggi' : card.priority === 'low' ? 'Rendah' : 'Normal'}`}
                                />
                              </div>

                              {/* Deskripsi Tugas (seperti Foto 2) */}
                              {card.description && (
                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                                  {card.description}
                                </p>
                              )}

                              {/* Daftar Ceklis / Sub-task Terlihat Langsung (seperti Foto 2) */}
                              {checks.length > 0 && (
                                <div className="space-y-2 mb-3.5">
                                  {checks.slice(0, 3).map((cl: any) => (
                                    <div 
                                      key={cl.id} 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleChecklist(card.id, cl.id);
                                      }}
                                      className="flex items-start gap-2.5 group/chk cursor-pointer text-xs"
                                    >
                                      <div className={`mt-0.5 w-4 h-4 rounded shrink-0 flex items-center justify-center transition-all ${
                                        cl.done 
                                          ? "bg-[#6366f1] text-white shadow-2xs" 
                                          : "border-2 border-slate-300 bg-white group-hover/chk:border-[#6366f1]"
                                      }`}>
                                        {cl.done && <Check size={11} strokeWidth={3} />}
                                      </div>
                                      <span className={`leading-snug text-xs break-words flex-1 ${
                                        cl.done 
                                          ? "line-through text-slate-400" 
                                          : "text-slate-600 group-hover/chk:text-slate-900"
                                      }`}>
                                        {cl.text}
                                      </span>
                                    </div>
                                  ))}

                                  {checks.length > 3 && (
                                    <p className="text-[11px] text-slate-400 font-semibold pl-6.5 pt-0.5">
                                      +{checks.length - 3} lainnya
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Row 1 Badges: Kategori / Tag & Penanggung Jawab (seperti Foto 2) */}
                              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                                {/* Tag / Kategori (misal: "laporan") */}
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-xs font-semibold">
                                  <FileText size={12} className="text-emerald-600" />
                                  <span>{(card as any).category || (card as any).tag || (card.report ? "laporan" : "tugas")}</span>
                                </span>

                                {/* Penanggung Jawab Capsule (Avatar Bulat [N] + Nama + Api 🔥) */}
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50/80 text-purple-700 border border-purple-200/80 text-xs font-bold shadow-2xs">
                                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-black text-[10px] flex items-center justify-center shrink-0 overflow-hidden relative border border-purple-200/60">
                                    {assignee.avatarUrl ? (
                                      <img src={assignee.avatarUrl} alt={assignee.name} className="w-full h-full object-cover object-center" />
                                    ) : (
                                      assignee.initial || "N"
                                    )}
                                  </span>
                                  <span>{assignee.name || "Nu'man"}</span>
                                  <Flame size={12} className="text-purple-500 shrink-0" />
                                </span>
                              </div>

                              {/* Row 2 Badges: Prioritas & Deadline (seperti Foto 2) */}
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                {/* Prioritas (Tinggi / Normal / Rendah) */}
                                <span className="inline-flex items-center px-3 py-0.5 rounded-xl border border-slate-200 text-slate-700 bg-white text-xs font-medium shadow-2xs">
                                  {card.priority === "high" ? "Tinggi" : card.priority === "low" ? "Rendah" : "Normal"}
                                </span>

                                {/* Deadline (Tenggat Waktu) */}
                                {card.dueDate && (
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl border text-xs font-medium shadow-2xs ${
                                    isOverdue 
                                      ? "bg-rose-50 border-rose-200 text-rose-700" 
                                      : "bg-slate-50 border-slate-200 text-slate-600"
                                  }`}>
                                    <Calendar size={11} className={isOverdue ? "text-rose-500" : "text-slate-400"} />
                                    <span>{formatDueDate(card.dueDate)}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                      {provided.placeholder}
                      <button onClick={() => {
                        setDefaultColumnId(col.id);
                        setEditingCard(null);
                        setIsModalOpen(true);
                      }} className="w-full py-3 flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-colors border border-transparent hover:border-slate-200 border-dashed mt-2">
                        <Plus size={16} /> Tambah kartu
                      </button>
                    </div>
                  )}
                </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
      )}

      {view === "daftar" && (
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl overflow-y-auto p-2">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-slate-400 border-b border-slate-100">
                <th className="p-4">Tugas</th>
                <th className="p-4">Status</th>
                <th className="p-4">Prioritas</th>
                <th className="p-4">Tenggat Waktu</th>
                <th className="p-4">Anggota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.cards.map(card => {
                const col = data.columns.find(c => c.id === card.columnId);
                const assignee = getAssignee(card.assigneeId);
                return (
                  <tr key={card.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm font-bold text-slate-800">{card.title}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${col?.id === 'c_2' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{col?.title}</span>
                    </td>
                    <td className="p-4 text-xs font-bold capitalize text-slate-600">{card.priority}</td>
                    <td className="p-4 text-xs font-semibold text-slate-500">{card.dueDate || "-"}</td>
                    <td className="p-4">
                      {card.assigneeId ? (
                        <div className={`w-7 h-7 rounded-full ${assignee.color} text-white flex items-center justify-center text-[10px] font-bold overflow-hidden relative border border-slate-200/60`} title={assignee.name}>
                          {assignee.avatarUrl ? (
                            <img src={assignee.avatarUrl} alt={assignee.name} className="w-full h-full object-cover object-center" />
                          ) : (
                            assignee.initial || "N"
                          )}
                        </div>
                      ) : "-"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {view === "kalender" && (() => {
        const calendarCells = generateCalendarCells(calYear, calMonth);
        const hijriArabicTitle = getHijriArabicTitle(calYear, calMonth);
        const hijriRangeText = getHijriMonthRange(calYear, calMonth);
        const selectedDay = selectedCalendarDate || new Date().getDate();
        const selectedHijriFull = getHijriFullDate(calYear, calMonth, selectedDay);
        const selectedDateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
        const selectedDateObj = new Date(calYear, calMonth, selectedDay);
        const selectedDayName = DAYS_OF_WEEK[selectedDateObj.getDay()]?.full || "Hari";

        // Filter cards that have dueDates in this month
        const monthCards = data.cards.filter(c => {
          if (c.deleted || !c.dueDate) return false;
          if (memberFilter && memberFilter !== "me" && c.assigneeId !== memberFilter) return false;
          if (priorityFilter && c.priority !== priorityFilter) return false;
          const d = new Date(c.dueDate);
          return d.getMonth() === calMonth && d.getFullYear() === calYear;
        });

        const monthDoneCards = monthCards.filter(c => c.columnId === "c_2");
        const monthHighCards = monthCards.filter(c => c.priority === "high");

        // Tasks scheduled on the selected day
        const tasksOnSelectedDate = data.cards.filter(c => {
          if (c.deleted) return false;
          if (memberFilter && memberFilter !== "me" && c.assigneeId !== memberFilter) return false;
          if (priorityFilter && c.priority !== priorityFilter) return false;
          return c.dueDate === selectedDateStr;
        });

        return (
          <div className="w-full space-y-4 animate-in fade-in duration-300">
            {/* Top Bar Banner / Header: Premium Islamic Kemenag Theme */}
            <div className="bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#0f766e] text-white rounded-3xl p-4 sm:p-5 shadow-sm relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Background Islamic ambient glows */}
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Calendar size={22} className="stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-black text-white text-lg sm:text-xl leading-tight tracking-tight">
                      {MONTH_NAMES[calMonth]} {calYear}
                    </h3>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30 backdrop-blur-xs">
                      {monthCards.length} Agenda Tugas
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-100 mt-1">
                    <span className="font-serif font-bold text-sm tracking-wide">
                      {hijriArabicTitle}
                    </span>
                    <span className="text-emerald-300/60">•</span>
                    <span className="text-[11px] font-medium text-emerald-100">
                      {hijriRangeText}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Controls in Header */}
              <div className="relative z-10 flex items-center gap-2 shrink-0 self-start sm:self-auto">
                <button
                  onClick={handleResetToCurrentMonth}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-white/15 hover:bg-white/25 border border-white/25 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <Sparkles size={13} className="text-amber-300" />
                  <span>Hari Ini</span>
                </button>
                <div className="flex items-center gap-0.5 border border-white/25 rounded-xl p-0.5 bg-white/15 backdrop-blur-xs shadow-xs">
                  <button
                    onClick={handlePrevMonth}
                    title="Bulan Sebelumnya"
                    className="p-1.5 hover:bg-white/20 text-white rounded-lg transition-all cursor-pointer active:scale-95"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="h-4 w-px bg-white/25 mx-0.5" />
                  <button
                    onClick={handleNextMonth}
                    title="Bulan Berikutnya"
                    className="p-1.5 hover:bg-white/20 text-white rounded-lg transition-all cursor-pointer active:scale-95"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Main 2-Column Grid: Left (8 Cols) Calendar Grid | Right (4 Cols) Detail Agenda Hari Terpilih */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
              
              {/* ================= LEFT: CALENDAR GRID (8 Cols) ================= */}
              <div className="lg:col-span-8 bg-gradient-to-b from-[#f9fbfa] via-emerald-50/20 to-[#f1f8f5]/60 border border-emerald-900/10 rounded-3xl p-4 sm:p-5 shadow-xs relative">
                {/* Days of Week Header */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2">
                  {DAYS_OF_WEEK.map((d, i) => (
                    <div 
                      key={i} 
                      className={`text-center py-2 px-1 rounded-xl border transition-all ${
                        d.isSunday 
                          ? "text-rose-600 bg-rose-50/80 border-rose-200/70 shadow-2xs" 
                          : d.isFriday 
                          ? "text-emerald-800 bg-emerald-50/80 border-emerald-200/70 shadow-2xs font-extrabold" 
                          : "text-slate-600 bg-white/80 border-slate-200/70 shadow-2xs"
                      }`}
                    >
                      <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider">
                        {d.short}
                      </div>
                      <div className={`text-[9px] sm:text-[10px] font-serif mt-0.5 leading-none ${
                        d.isSunday ? "text-rose-400" : d.isFriday ? "text-emerald-600 font-bold" : "text-slate-400"
                      }`}>
                        {d.arabic}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {calendarCells.map((item, idx) => {
                    const now = new Date();
                    const isToday = item.current && item.day === now.getDate() && item.month === now.getMonth() && item.year === now.getFullYear();
                    const isSelected = selectedDay === item.day && item.current;
                    const hijriDayNumber = getHijriDayNumber(item.year, item.month, item.day);
                    const cellDate = new Date(item.year, item.month, item.day);
                    const isSunday = cellDate.getDay() === 0;
                    const isFriday = cellDate.getDay() === 5;

                    // Cards for this specific day
                    const dayCards = item.current ? data.cards.filter(c => {
                      if (c.deleted || !c.dueDate) return false;
                      if (memberFilter && memberFilter !== "me" && c.assigneeId !== memberFilter) return false;
                      if (priorityFilter && c.priority !== priorityFilter) return false;
                      const d = new Date(c.dueDate);
                      return (
                        d.getDate() === item.day && 
                        d.getMonth() === item.month && 
                        d.getFullYear() === item.year
                      );
                    }) : [];

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (item.current) setSelectedCalendarDate(item.day);
                        }}
                        className={`min-h-[85px] sm:min-h-[96px] p-1.5 sm:p-2 rounded-2xl flex flex-col justify-between transition-all duration-200 relative group border cursor-pointer ${
                          !item.current
                            ? "bg-slate-50/40 border-slate-200/40 opacity-40 cursor-default"
                            : isSelected
                            ? "bg-white border-2 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                            : isToday
                            ? "bg-gradient-to-b from-amber-50/95 via-amber-100/40 to-white border-2 border-amber-400 shadow-xs ring-1 ring-amber-300/40"
                            : dayCards.length > 0
                            ? "bg-white/95 border-emerald-200/80 hover:border-emerald-400 hover:shadow-xs"
                            : "bg-white/80 border-slate-200/70 hover:border-slate-300 hover:bg-white hover:shadow-2xs"
                        }`}
                      >
                        {/* Top Row: Date Masehi (Left) + Angka Hijriyah Arab (Right) */}
                        <div className="flex items-center justify-between gap-1 leading-none pb-1 border-b border-slate-100">
                          <div className="flex items-center gap-1">
                            <span className={`text-xs sm:text-sm font-black leading-none ${
                              !item.current
                                ? "text-slate-300"
                                : isToday
                                ? "text-amber-950 font-black"
                                : isSunday
                                ? "text-rose-600 font-extrabold"
                                : isFriday
                                ? "text-emerald-800 font-extrabold"
                                : "text-slate-800"
                            }`}>
                              {item.day}
                            </span>
                            {isToday && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Hari Ini" />
                            )}
                          </div>

                          <span className={`text-[10px] sm:text-[11px] font-bold font-serif leading-none ${
                            !item.current
                              ? "text-slate-300"
                              : isToday
                              ? "text-amber-800 font-black"
                              : isSunday
                              ? "text-rose-500"
                              : isFriday
                              ? "text-emerald-700 font-extrabold"
                              : "text-slate-400"
                          }`}>
                            {toArabicDigits(hijriDayNumber)}
                          </span>
                        </div>

                        {/* Middle: Scheduled Tasks Preview */}
                        <div className="flex-1 my-1 space-y-1 overflow-hidden">
                          {dayCards.slice(0, 2).map((c) => {
                            const isDone = c.columnId === "c_2";
                            return (
                              <div
                                key={c.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCard(c);
                                  setIsModalOpen(true);
                                }}
                                className={`px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-semibold flex items-center gap-1 truncate transition-transform hover:scale-[1.02] ${
                                  isDone
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200/70"
                                    : c.priority === "high"
                                    ? "bg-rose-50 text-rose-800 border border-rose-200/70"
                                    : "bg-indigo-50 text-indigo-800 border border-indigo-200/70"
                                }`}
                                title={c.title}
                              >
                                <span className={`w-1 h-1 rounded-full shrink-0 ${
                                  isDone ? "bg-emerald-500" : c.priority === "high" ? "bg-rose-500" : "bg-indigo-500"
                                }`} />
                                <span className="truncate">{c.title}</span>
                              </div>
                            );
                          })}
                          {dayCards.length > 2 && (
                            <span className="text-[9px] font-bold text-slate-400 block pl-1">
                              +{dayCards.length - 2} lagi
                            </span>
                          )}
                        </div>

                        {/* Bottom Footer of Day Cell */}
                        {item.current && (
                          <div className="pt-0.5 flex items-center justify-between text-[9px] text-slate-400">
                            <span>{dayCards.length > 0 ? `${dayCards.length} tugas` : "—"}</span>
                            {isSelected && (
                              <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded">Dipilih</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Legend Matching Kemenag Palette */}
                <div className="mt-4 pt-3 border-t border-emerald-950/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      <span>Hari Ahad (Libur)</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                      <span>Hari Jum&apos;at (Sayyidul Ayyam)</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-200"></span>
                      <span>Hari Ini</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span>Tanggal Dipilih</span>
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-emerald-800">
                    <span>Kalender Hijriyah Ummul Qura &amp; Masehi Kemenag</span>
                  </div>
                </div>
              </div>

              {/* ================= RIGHT: DETAIL AGENDA TANGGAL TERPILIH (4 Cols) ================= */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* 1. Card Detail Agenda Tanggal Terpilih (Exact Dashboard Style) */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-3.5 relative overflow-hidden">
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse"></span>
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base truncate">
                          {selectedDayName}, {selectedDay} {MONTH_NAMES[calMonth]}
                        </h4>
                      </div>
                      <p className="text-xs font-semibold text-emerald-700 mt-0.5 truncate pl-4.5">
                        {selectedHijriFull}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full shrink-0">
                      {tasksOnSelectedDate.length} Agenda
                    </span>
                  </div>

                  {/* Task list preview or clean empty state */}
                  {tasksOnSelectedDate.length > 0 ? (
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                      {tasksOnSelectedDate.map((task) => {
                        const assignee = getAssignee(task.assigneeId);
                        const isDone = task.columnId === "c_2";
                        return (
                          <div 
                            key={task.id}
                            onClick={() => {
                              setEditingCard(task);
                              setIsModalOpen(true);
                            }}
                            className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/60 border border-slate-200/70 hover:border-emerald-300 transition-all cursor-pointer group flex items-center justify-between gap-2 shadow-2xs"
                          >
                            <div className="min-w-0 flex-1">
                              <p className={`text-xs font-bold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-900 group-hover:text-emerald-800'}`}>
                                {task.title}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                                  task.priority === 'high' 
                                    ? 'bg-rose-100 text-rose-800' 
                                    : 'bg-sky-100 text-sky-800'
                                }`}>
                                  {task.priority === 'high' ? 'Tinggi' : 'Normal'}
                                </span>
                                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                  PJ: <strong className="text-slate-700">{assignee.name}</strong>
                                </span>
                                {isDone && (
                                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">Selesai</span>
                                )}
                              </div>
                            </div>

                            <span className="text-[10px] font-bold text-emerald-700 bg-white border border-slate-200 group-hover:border-emerald-300 px-2.5 py-1.5 rounded-xl shrink-0 flex items-center gap-1 shadow-2xs">
                              <span>Buka</span>
                              <ArrowRight size={11} />
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 text-center space-y-2">
                      <p className="text-xs text-slate-500">Tidak ada tenggat tugas di tanggal ini.</p>
                      <button
                        onClick={() => {
                          setEditingCard({
                            title: "",
                            dueDate: selectedDateStr,
                            priority: "normal",
                            checklist: [],
                            columnId: "c_0"
                          });
                          setIsModalOpen(true);
                        }}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={14} /> Tambah Tugas di Tanggal Ini
                      </button>
                    </div>
                  )}

                  {/* Quick Action Button */}
                  <button
                    onClick={() => {
                      setEditingCard({
                        title: "",
                        dueDate: selectedDateStr,
                        priority: "normal",
                        checklist: [],
                        columnId: "c_0"
                      });
                      setIsModalOpen(true);
                    }}
                    className="w-full py-2.5 px-4 bg-[#064e3b] hover:bg-[#047857] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <Plus size={15} /> Buat Tugas Baru
                  </button>
                </div>

                {/* 2. Monthly Summary Card */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-800 text-xs sm:text-sm">
                      Ringkasan {MONTH_NAMES[calMonth]} {calYear}
                    </h5>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200/70">
                      Bulan Berjalan
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                      <p className="text-lg font-black text-emerald-800">{monthDoneCards.length}</p>
                      <p className="text-[10px] font-bold text-emerald-600 mt-0.5">Selesai</p>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-amber-50/60 border border-amber-100">
                      <p className="text-lg font-black text-amber-800">{monthCards.length - monthDoneCards.length}</p>
                      <p className="text-[10px] font-bold text-amber-600 mt-0.5">Belum Selesai</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Prioritas Tinggi</span>
                    <span className="font-bold text-rose-600">{monthHighCards.length} Tugas</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        );
      })()}

      {isModalOpen && (
        <CardModal 
          card={editingCard} 
          defaultColumnId={defaultColumnId} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}

function KanbanIcon({size}: {size: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="9" y1="3" x2="9" y2="21"></line>
      <line x1="15" y1="3" x2="15" y2="21"></line>
    </svg>
  );
}
