import { MoreHorizontal, Calendar, CheckSquare, Plus, CheckCircle2, ChevronLeft, ChevronRight, ChevronDown, Archive, Check, FileText, Flame } from "lucide-react";
import db from "@/data/db.json";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useAppContext } from "@/context/AppContext";
import { useState, useEffect } from "react";
import CardModal from "./CardModal";
import { getMemberAvatar } from "@/utils/avatar";

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
      return { name: "Nukman", initial: "N", color: "bg-emerald-500", avatarUrl };
    }
    const member = members.find(m => m.id === id || m.name.toLowerCase() === id.toLowerCase());
    if (!member) {
      const cleanName = id.startsWith("u_") ? id.slice(2).charAt(0).toUpperCase() + id.slice(3) : id;
      const avatarUrl = getMemberAvatar(id) || getMemberAvatar(cleanName);
      return { 
        name: cleanName, 
        initial: cleanName.charAt(0).toUpperCase() || "N", 
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
    <div className="h-full flex flex-col p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setView("board")}
              className={`px-4 py-1.5 font-bold text-sm rounded flex items-center gap-2 transition-colors ${view === 'board' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              <KanbanIcon size={16} /> Board
            </button>
            <button 
              onClick={() => setView("daftar")}
              className={`px-4 py-1.5 font-bold text-sm rounded flex items-center gap-2 transition-colors ${view === 'daftar' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
               Daftar
            </button>
            <button 
              onClick={() => setView("kalender")}
              className={`px-4 py-1.5 font-bold text-sm rounded flex items-center gap-2 transition-colors ${view === 'kalender' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              <Calendar size={16} /> Kalender
            </button>
          </div>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 relative z-20 ml-2">
             <button className="p-1 text-slate-400 hover:bg-slate-50 rounded"><ChevronLeft size={16}/></button>
             <button onClick={() => setShowMonthSelect(!showMonthSelect)} className="px-3 py-1 text-sm font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50 rounded"><Calendar size={14}/> Okt 2026 <ChevronDown size={14}/></button>
             <button className="p-1 text-slate-400 hover:bg-slate-50 rounded"><ChevronRight size={16}/></button>
             
             {showMonthSelect && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-xl p-4 w-64 z-50">
                   <div className="flex justify-between items-center mb-4">
                      <button className="p-1 hover:bg-slate-50 rounded"><ChevronLeft size={16}/></button>
                      <span className="font-bold text-slate-800 text-sm">2026</span>
                      <button className="p-1 hover:bg-slate-50 rounded"><ChevronRight size={16}/></button>
                   </div>
                   <div className="grid grid-cols-3 gap-2 mb-4">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map(m => (
                         <button onClick={() => setShowMonthSelect(false)} key={m} className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${m === 'Okt' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>{m}</button>
                      ))}
                   </div>
                   <button onClick={() => setShowMonthSelect(false)} className="w-full py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors">Bulan ini</button>
                </div>
             )}
          </div>
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors"><Archive size={16}/> Arsip</button>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg px-3 py-2 outline-none focus:border-brand-500">
            <option value="">Semua Anggota Tim</option>
            <option value="me">Tugasku Saja (Admin)</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <select 
            value={dueDateFilter}
            onChange={(e) => setDueDateFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg px-3 py-2 outline-none focus:border-brand-500">
            <option value="">Semua Tenggat</option>
            <option value="today">Hari Ini</option>
            <option value="tomorrow">Besok</option>
            <option value="overdue">Terlambat</option>
          </select>
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg px-3 py-2 outline-none focus:border-brand-500">
            <option value="">Semua Prioritas</option>
            <option value="high">Prioritas Tinggi</option>
            <option value="normal">Prioritas Normal</option>
            <option value="low">Prioritas Rendah</option>
          </select>
        </div>
      </div>

      {view === "board" && (
        <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
          {columns.map((col) => (
            <div key={col.id} className="w-80 shrink-0 flex flex-col">
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
                      const isOverdue = card.dueDate && new Date(card.dueDate) < new Date("2026-10-01") && !col.isDone;

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
                                  <span>{assignee.name || "Nukman"}</span>
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

      {view === "kalender" && (
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col p-4">
          <div className="grid grid-cols-7 gap-2 mb-3 text-center">
            {['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'].map(d => (
              <div key={d} className="text-[10px] font-bold text-slate-400 tracking-widest">{d}</div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7 gap-2 auto-rows-fr">
            {Array.from({length: 35}).map((_, i) => { 
              const date = i - 3; 
              const isCurrentMonth = date > 0 && date <= 31;
              const isToday = date === 6; 
              
              const dayCards = isCurrentMonth ? data.cards.filter(c => {
                if (!c.dueDate) return false;
                const d = new Date(c.dueDate);
                return d.getDate() === date && d.getMonth() === 9 && d.getFullYear() === 2026;
              }) : [];

              return (
                <div key={i} className={`p-2 border rounded-xl flex flex-col gap-1 overflow-y-auto ${isToday ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white border-slate-100'} ${isCurrentMonth ? '' : 'opacity-40'}`}>
                  {isCurrentMonth && <span className={`text-xs font-bold text-right mb-1 ${isToday ? 'text-indigo-600' : 'text-slate-400'}`}>{date}</span>}
                  {dayCards.map(c => {
                    const isDone = c.columnId === 'c_2';
                    return (
                      <div key={c.id} onClick={() => {
                        setEditingCard(c);
                        setIsModalOpen(true);
                      }} className={`text-[10px] font-bold px-2 py-1 rounded-md truncate cursor-pointer transition-colors ${isDone ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-brand-50 text-brand-600 hover:bg-brand-100'}`} title={c.title}>
                        • {c.title}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      )}

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
