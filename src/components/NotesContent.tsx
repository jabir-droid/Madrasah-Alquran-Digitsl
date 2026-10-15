import { Edit3, Eye, Trash2, CalendarDays, BookOpen, Link as LinkIcon, Plus, Book, Lock } from "lucide-react";
import { useState } from "react";
import db from "@/data/db.json";
import { useAppContext } from "@/context/AppContext";

export default function NotesContent() {
  const [tab, setTab] = useState("rapat");
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ id: "", title: "", date: "", category: "", content: "", pic: "", url: "" });
  const { data, addNote, saveNote, removeNote, currentUser } = useAppContext();

  const isAdmin = currentUser.role === "admin";
  const notes = (data.notes || []).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const links = data.links;
  const sops = data.sops;

  const handleAdd = () => {
    if (tab === "link") {
      setFormData({ id: "", title: "", date: "", category: "", content: "", pic: "", url: "" });
      setIsAdding(true);
    } else {
      setFormData({ id: "", title: "", date: new Date().toISOString().split('T')[0], category: "", content: "", pic: "", url: "" });
      setIsAdding(true);
    }
  };


  const handleSave = () => {
    if (!formData.title) {
      alert("Judul wajib diisi");
      return;
    }
    saveNote(formData, tab);
    setIsAdding(false);
  };

  if (isAdding && tab !== 'link') {
    const isRapat = tab === "rapat";
    return (
      <div className="p-3.5 sm:p-5 lg:p-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setIsAdding(false)} className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-brand-600 transition-colors">
            <span className="text-base">←</span> Kembali ke daftar {isRapat ? "" : "SOP"}
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live Sync | Tersimpan
            </div>
            <button className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors">
              ⛶ Layar Penuh
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Edit3 size={18} className="text-brand-600" /> {isRapat ? "Catatan rapat baru" : "Buat SOP Baru"}
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Judul {isRapat ? "rapat" : "SOP"} *</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder={isRapat ? "Mis. Rapat evaluasi pekan 3" : "Mis. SOP Pengolahan Berkas & Dokumen Kampus"}
                className="w-full border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-3 outline-none transition-colors font-semibold text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isRapat ? (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal rapat</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-3 outline-none transition-colors text-slate-700"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">PIC / Penanggung Jawab *</label>
                  <select 
                    value={formData.pic}
                    onChange={e => setFormData({...formData, pic: e.target.value})}
                    className="w-full border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-3 outline-none transition-colors text-slate-700 appearance-none bg-no-repeat"
                    style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em'}}
                  >
                    <option value="">Pilih Anggota</option>
                    {data.members.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Kategori / {isRapat ? "Label Rapat" : "Bidang SOP"}</label>
                <input 
                  type="text" 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  placeholder={isRapat ? "Mis. Evaluasi, Strategi, Operasional..." : "Mis. Operasional, Keuangan..."}
                  className="w-full border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-3 outline-none transition-colors text-slate-700 mb-2"
                />
                <div className="flex flex-wrap gap-2">
                  {(isRapat ? ["Evaluasi", "Strategi", "Operasional", "Kurikulum", "Pemasaran", "Keuangan", "Lainnya"] : ["Operasional", "Akademik", "Keuangan", "Pemasaran", "IT & Media", "Lainnya"]).map(cat => (
                    <button key={cat} onClick={() => setFormData({...formData, category: cat})} className="text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors">
                      + {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Isi / {isRapat ? "ringkasan rapat" : "Prosedur SOP"} (Rich Text)</label>
              <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-brand-500 transition-colors">
                <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap gap-1">
                  {['B', 'I', 'U', 'S', 'T', 'H1', 'H2', 'H3', 'list', 'quote', 'code'].map((tool, i) => (
                    <button key={i} className={`p-2 rounded-lg text-sm font-bold ${tool === 'T' ? 'bg-brand-100 text-brand-600' : 'text-slate-500 hover:bg-slate-200 transition-colors'} w-8 h-8 flex items-center justify-center`}>
                      {tool === 'list' ? '≡' : tool === 'quote' ? '”' : tool === 'code' ? '<>' : tool}
                    </button>
                  ))}
                </div>
                <textarea 
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  rows={8}
                  placeholder={isRapat ? "Point-point penting, hasil diskusi, catatan bebas..." : "Langkah-langkah prosedur, aturan kerja, standar operasional lengkap..."}
                  className="w-full p-4 outline-none resize-none text-slate-700 text-sm leading-relaxed"
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
               <button onClick={handleSave} className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-8 rounded-xl shadow-sm transition-colors">
                 Simpan {isRapat ? "Catatan" : "SOP"}
               </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3.5 sm:p-5 lg:p-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-100 p-1 rounded-xl flex items-center mb-4">
        <button onClick={() => setTab("rapat")} className={`flex-1 py-1.5 font-bold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-1.5 transition-all ${tab === 'rapat' ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>
          <Edit3 size={15} /> Rapat ({notes.length})
        </button>
        <button onClick={() => setTab("sop")} className={`flex-1 py-1.5 font-bold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-1.5 transition-all ${tab === 'sop' ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>
          <BookOpen size={15} /> SOP Tim ({sops.length})
        </button>
        <button onClick={() => setTab("link")} className={`flex-1 py-1.5 font-bold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-1.5 transition-all ${tab === 'link' ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>
          <LinkIcon size={15} /> Link penting ({links.length})
        </button>
      </div>

      {tab === "sop" && !isAdmin ? (
        <div className="w-full py-2.5 px-3.5 border border-slate-200 bg-slate-50 rounded-xl flex items-center justify-center gap-2 text-slate-600 text-xs font-bold mb-4">
          <Lock size={13} className="text-slate-500" />
          <span>SOP Operasional dikelola resmi oleh Admin (Mode Baca untuk Anggota & Guru)</span>
        </div>
      ) : (
        <button onClick={handleAdd} className="w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-brand-400 hover:bg-brand-50 rounded-xl flex items-center justify-center gap-2 text-brand-600 text-xs sm:text-sm font-bold mb-4 transition-colors bg-white cursor-pointer">
          <Plus size={16} /> Tambah Data Baru
        </button>
      )}

      {tab === "rapat" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {notes.map((note) => (
            <div key={note.id} className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-brand-300 transition-all group flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-2 truncate">
                    {note.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                      <CalendarDays size={14} /> {note.date || (note.createdAt ? new Date(note.createdAt).toLocaleDateString() : "-")}
                    </p>
                    {note.category && (
                      <span className="text-[10px] bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full border border-brand-200 font-bold">
                        {note.category}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-white rounded-lg shadow-sm border border-slate-100 p-1">
                  <button onClick={() => {
                    const cNote = note as any;
                    setFormData({
                      id: cNote.id,
                      title: cNote.title,
                      date: cNote.date || new Date(cNote.createdAt).toISOString().split('T')[0],
                      category: cNote.category || "",
                      content: cNote.content || "",
                      pic: cNote.pic || "",
                      url: ""
                    });
                    setIsAdding(true);
                  }} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors cursor-pointer"><Edit3 size={14}/></button>
                  {isAdmin && (
                    <button onClick={() => removeNote(note.id, tab)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"><Trash2 size={14}/></button>
                  )}
                </div>
              </div>
              <div className="text-sm text-slate-600 leading-relaxed line-clamp-3 mt-auto" dangerouslySetInnerHTML={{__html: note.content || '<em>Tidak ada isi catatan</em>'}} />
            </div>
          ))}
        </div>
      )}

      {tab === "sop" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sops.map(sop => (
             <div key={sop.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-brand-300 hover:shadow-md transition-all cursor-pointer flex justify-between items-center group">
               <div className="flex items-center gap-4">
                 <div className="p-3 bg-brand-50 rounded-xl text-brand-600 shadow-sm"><Book size={20} /></div>
                 <div>
                   <h4 className="font-bold text-slate-800 leading-tight text-lg mb-1">{sop.title}</h4>
                   <p className="text-xs text-slate-500 font-bold bg-slate-100 inline-block px-2 py-0.5 rounded-full">{sop.category || "General"}</p>
                 </div>
               </div>
               <div className="flex items-center gap-1">
                 {isAdmin ? (
                   <>
                     <button onClick={() => {
                       const cSop = sop as any;
                       setFormData({
                         id: cSop.id,
                         title: cSop.title,
                         date: "",
                         category: cSop.category || "",
                         content: cSop.content || "",
                         pic: cSop.pic || "",
                         url: ""
                       });
                       setIsAdding(true);
                     }} className="text-slate-400 hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg hover:bg-brand-50"><Edit3 size={16}/></button>
                     <button onClick={() => removeNote(sop.id, tab)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={16}/></button>
                   </>
                 ) : (
                   <span className="text-xs font-semibold text-slate-400 px-2 py-1">Baca SOP</span>
                 )}
               </div>
             </div>
          ))}
        </div>
      )}

      {tab === "link" && (
        <div className="space-y-3">
          {isAdding && (
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm mb-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
              <input type="text" placeholder="Judul (mis. Link Zoom Pekanan)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-3 outline-none font-semibold text-slate-800" />
              <input type="text" placeholder="https://..." value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-3 outline-none text-slate-700" />
              <input type="text" placeholder="Kategori (mis. Zoom, Desain) — opsional" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-3 outline-none text-slate-700" />
              <div className="flex justify-end gap-3 mt-2">
                <button onClick={() => setIsAdding(false)} className="px-6 py-2.5 text-slate-600 font-bold bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition-colors">Batal</button>
                <button onClick={() => {
                  if (!formData.title) return alert('Judul wajib diisi');
                  if (!formData.url) return alert('URL wajib diisi');
                  saveNote(formData, 'link');
                  setIsAdding(false);
                }} className="px-6 py-2.5 text-white font-bold bg-brand-400 hover:bg-brand-500 rounded-xl shadow-sm transition-colors text-sm">Simpan</button>
              </div>
            </div>
          )}
          {links.map(link => (
             <div key={link.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-brand-300 hover:shadow-md transition-all group">
               <div className="flex items-center gap-4 flex-1">
                 <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl shadow-sm"><LinkIcon size={18} /></div>
                 <div className="flex-1">
                   <a href={link.url} target="_blank" rel="noreferrer" className="font-bold text-slate-800 hover:text-brand-600 transition-colors text-base flex items-center gap-2">
                     {link.title} <span className="opacity-0 group-hover:opacity-100 transition-opacity"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></span>
                   </a>
                   <p className="text-xs text-slate-400 font-medium mt-0.5 truncate max-w-lg">{link.url}</p>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 {link.category && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{link.category}</span>}
                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => {
                     const cLink = link as any;
                     setFormData({
                       id: cLink.id,
                       title: cLink.title,
                       date: "",
                       category: cLink.category || "",
                       content: "",
                       pic: "",
                       url: cLink.url || ""
                     });
                     setIsAdding(true);
                   }} className="p-1.5 text-slate-400 hover:text-brand-600 rounded-md transition-colors"><Edit3 size={16}/></button>
                   <button onClick={() => removeNote(link.id, 'link')} className="p-1.5 text-slate-400 hover:text-red-500 rounded-md transition-colors"><Trash2 size={16}/></button>
                 </div>
               </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TagIcon({size}: {size: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
      <line x1="7" y1="7" x2="7.01" y2="7"></line>
    </svg>
  );
}
