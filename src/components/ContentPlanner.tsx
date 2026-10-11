import { Search, Plus, List, KanbanSquare, ChevronRight, FileCode2, FileVideo2, Layers, Smartphone, ShieldCheck, Lock } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useState } from "react";

export default function ContentPlanner() {
  const { data, updateContentStatus, addContent, saveContent, removeContent, currentUser, switchUser } = useAppContext();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("Semua Tipe Konten");
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [view, setView] = useState("table");
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [formData, setFormData] = useState({ id: '', title: '', status: 'Todo', priority: 'normal', type: 'Carousel', pic: '', dueDate: '', assetUrl: '', content: '' });

  const isGuru = currentUser.role === "guru";
  const isKreatif = currentUser.role === "kreatif";
  const isAdmin = currentUser.role === "admin";

  const contents = data.contents
    .filter(c => !c.deleted)
    .filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
    .filter(c => filterType === "Semua Tipe Konten" ? true : c.type === filterType)
    .filter(c => {
      if (filterStatus === "Semua Status") return true;
      if (filterStatus === "Todo") return c.status.toLowerCase().includes("todo");
      if (filterStatus === "Doing") return c.status.toLowerCase().includes("doing");
      if (filterStatus === "Published") return c.status.toLowerCase().includes("published") || c.status.toLowerCase().includes("done");
      return true;
    })
    .sort((a, b) => a.order - b.order)
    .map(c => {
      let tColor = "text-slate-600 bg-slate-50";
      let icon = <Layers size={14}/>;
      if (c.type === "Carousel") { tColor = "text-blue-600 bg-blue-50"; icon = <Layers size={14}/>; }
      else if (c.type === "Single Post") { tColor = "text-emerald-600 bg-emerald-50"; icon = <FileCode2 size={14}/>; }
      else if (c.type === "Reels / Video") { tColor = "text-pink-600 bg-pink-50"; icon = <FileVideo2 size={14}/>; }
      else if (c.type === "Story") { tColor = "text-orange-600 bg-orange-50"; icon = <Smartphone size={14}/>; }

      let sColor = "text-slate-600 bg-slate-100 border-slate-200";
      if (c.status.toLowerCase().includes("doing")) sColor = "text-amber-600 bg-amber-50 border-amber-200";
      else if (c.status.toLowerCase().includes("published") || c.status.toLowerCase().includes("done")) sColor = "text-purple-600 bg-purple-50 border-purple-200";

      return { ...c, tColor, icon, sColor, pColor: c.priority === "high" ? "text-red-600" : "text-amber-500" };
    });

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Role Notice Banner */}
      {isGuru ? (
        <div className="mb-5 p-3.5 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <Lock size={16} className="text-slate-500 shrink-0" />
            <span>
              <strong>Mode Guru (Hanya Lihat):</strong> Anda dapat melihat kurikulum dan materi dakwah. Pembuatan, pengubahan, dan publikasi konten dikelola oleh Tim Kreatif & Admin.
            </span>
          </div>
          <span className="text-[11px] font-bold bg-white px-2.5 py-1 rounded-full border border-slate-200 text-slate-700 shrink-0">
            Guru: {currentUser.name}
          </span>
        </div>
      ) : isKreatif ? (
        <div className="mb-5 p-3.5 px-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🎨</span>
            <span>
              <strong>Ruang Kerja Tim Kreatif:</strong> Anda memegang wewenang penuh penyusunan ide konten, naskah narasi visual, dan alur rilis publikasi.
            </span>
          </div>
          <span className="text-[11px] font-bold bg-white px-2.5 py-1 rounded-full border border-purple-200 text-purple-700 shrink-0">
            Kreatif: {currentUser.name}
          </span>
        </div>
      ) : (
        <div className="mb-5 p-3.5 px-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
            <span>
              <strong>Mode Admin / Tim Inti:</strong> Akses penuh verifikasi kurikulum, manajemen tim kreatif, dan publikasi konten.
            </span>
          </div>
          <span className="text-[11px] font-bold bg-white px-2.5 py-1 rounded-full border border-emerald-200 text-emerald-700 shrink-0">
            Admin: {currentUser.name}
          </span>
        </div>
      )}

      {isAddingContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="p-1.5 bg-purple-50 text-brand-600 rounded-lg">✨</span> 
                {formData.id ? "Edit Materi Konten" : "Tambah Materi Konten"}
              </h2>
              <button onClick={() => setIsAddingContent(false)} className="text-slate-400 hover:text-slate-600 p-2"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-white flex-1 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Judul Materi Konten *</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Contoh: 5 Tips Menghadapi Ujian Semester Tanpa Stres..."
                  className="w-full border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-3 outline-none transition-colors text-sm font-semibold text-slate-800 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Layers size={12}/> Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-3 outline-none text-sm font-semibold text-slate-800 appearance-none bg-no-repeat bg-white" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em'}}
                  >
                    <option>Todo</option>
                    <option>Doing</option>
                    <option>Published</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1"><span className="text-amber-500 font-bold">⚑</span> Prioritas</label>
                  <select 
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                    className="w-full border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-3 outline-none text-sm font-semibold text-slate-800 appearance-none bg-no-repeat bg-white" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em'}}
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Jenis / Tipe Konten</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-3 outline-none text-sm font-semibold text-slate-800 appearance-none bg-no-repeat bg-white" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em'}}
                  >
                    <option>Carousel</option>
                    <option>Single Post</option>
                    <option>Reels / Video</option>
                    <option>Story</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1"><span className="text-emerald-500">👤</span> Pemateri</label>
                  <select 
                    value={formData.pic}
                    onChange={e => setFormData({...formData, pic: e.target.value})}
                    className="w-full border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-3 outline-none text-sm font-semibold text-slate-800 appearance-none bg-no-repeat bg-white" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em'}}
                  >
                    <option value="">Pilih Pemateri</option>
                    {data.members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1"><span className="text-red-400">📅</span> Deadline Penayangan</label>
                  <input 
                    type="date" 
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-3 outline-none text-sm font-semibold text-slate-800 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1"><span className="text-blue-500">🔗</span> Link Asset (Drive / Canva)</label>
                  <input 
                    type="text"
                    value={formData.assetUrl}
                    onChange={e => setFormData({...formData, assetUrl: e.target.value})}
                    placeholder="https://drive.google.com/..."
                    className="w-full border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-3 outline-none text-sm font-semibold text-slate-800 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Naskah / Isi Materi Konten</label>
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
                    rows={6}
                    placeholder="Ketik poin-poin materi, caption, naskah narasi video, atau draf postingan di sini..."
                    className="w-full p-4 outline-none resize-none text-slate-700 text-sm leading-relaxed bg-white"
                  ></textarea>
                </div>
              </div>

            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3">
               <button onClick={() => setIsAddingContent(false)} className="px-6 py-2.5 text-slate-600 font-bold text-sm bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs cursor-pointer">
                 {isGuru ? "Tutup" : "Batal"}
               </button>
               {!isGuru && (
                 <button onClick={() => {
                   if(!formData.title) { alert("Judul materi wajib diisi!"); return; }
                   saveContent(formData);
                   setIsAddingContent(false);
                 }} className="px-6 py-2.5 text-white font-bold text-sm bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors shadow-xs cursor-pointer">
                   Simpan Materi Konten
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col gap-4 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 w-full">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setView("table")}
                  className={`px-4 py-2 font-bold text-sm rounded-lg flex items-center gap-2 transition-all ${view === 'table' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                  <List size={16} /> Daftar Tabel
                </button>
                <button 
                  onClick={() => setView("kanban")}
                  className={`px-4 py-2 font-bold text-sm rounded-lg flex items-center gap-2 transition-all ${view === 'kanban' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                  <KanbanSquare size={16} /> Kanban
                </button>
              </div>
              
              <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2 shadow-sm text-sm font-bold text-slate-700">
                <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600">&lt;</button>
                <span className="px-3">Okt 2026</span>
                <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600">&gt;</button>
              </div>
            </div>

            <div className="flex flex-1 max-w-md items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus-within:border-brand-500 transition-colors shadow-sm">
              <Search size={16} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari materi..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-sm font-semibold text-slate-700 placeholder:text-slate-400" 
              />
            </div>
          </div>

          <div className="flex items-center gap-3 w-full">
            <select 
              value={filterType} 
              onChange={e => setFilterType(e.target.value)} 
              className="bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 shadow-sm appearance-none pr-8 bg-no-repeat cursor-pointer" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em'}}>
              <option>Semua Tipe Konten</option>
              <option>Carousel</option>
              <option>Single Post</option>
              <option>Reels / Video</option>
              <option>Story</option>
            </select>
            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)} 
              className="bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 shadow-sm appearance-none pr-8 bg-no-repeat cursor-pointer" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em'}}>
              <option>Semua Status</option>
              <option>Todo</option>
              <option>Doing</option>
              <option>Published</option>
            </select>
            {!isGuru ? (
              <button 
                onClick={() => {
                  setFormData({ id: '', title: '', status: 'Todo', priority: 'normal', type: 'Carousel', pic: '', dueDate: '', assetUrl: '', content: '' });
                  setIsAddingContent(true);
                }} 
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <Plus size={18} /> Tambah Materi
              </button>
            ) : (
              <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs">
                🔒 Mode Guru: Hanya Lihat
              </span>
            )}
          </div>
        </div>

        {view === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4 border-b border-slate-200 w-16">#</th>
                  <th className="px-6 py-4 border-b border-slate-200">Judul Materi Konten</th>
                  <th className="px-6 py-4 border-b border-slate-200">Jenis</th>
                  <th className="px-6 py-4 border-b border-slate-200">Prioritas</th>
                  <th className="px-6 py-4 border-b border-slate-200">Status</th>
                  <th className="px-6 py-4 border-b border-slate-200">Deadline</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contents.map((item, i) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-400">{i+1}</td>
                    <td className="px-6 py-4">
                      <p 
                        onClick={() => {
                          const cItem = item as any;
                          setFormData({
                            id: cItem.id,
                            title: cItem.title,
                            status: cItem.status,
                            priority: cItem.priority,
                            type: cItem.type,
                            pic: cItem.pic || "",
                            dueDate: cItem.dueDate || "",
                            assetUrl: cItem.assetUrl || "",
                            content: cItem.content || ""
                          });
                          setIsAddingContent(true);
                        }}
                        className="text-sm font-bold text-slate-800 flex items-center gap-2 cursor-pointer hover:text-brand-600 transition-colors">
                        {item.title} <span className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={16}/></span>
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${item.tColor}`}>
                        {item.icon} {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${item.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                        <span className={`text-xs font-bold capitalize ${item.pColor}`}>{item.priority}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={item.status} 
                        disabled={isGuru}
                        onChange={(e) => updateContentStatus(item.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border appearance-none pr-8 bg-no-repeat outline-none capitalize ${item.sColor} ${isGuru ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`} 
                        style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em'}}
                      >
                        <option value="Todo">Todo</option>
                        <option value="Doing">Doing</option>
                        <option value="Published 🚀">Published 🚀</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-semibold text-slate-600`}>{item.dueDate || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {!isGuru ? (
                        <button onClick={() => removeContent(item.id)} title="Hapus materi" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                          <TrashIcon size={16} />
                        </button>
                      ) : (
                        <span className="text-slate-400" title="Mode Guru: Tidak dapat menghapus">
                          <Lock size={14} className="inline" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {contents.length === 0 && (
                   <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-semibold">Tidak ada materi konten yang ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50">
            {["Todo", "Doing", "Published 🚀"].map(status => (
              <div key={status} className="flex flex-col gap-3">
                <h4 className="font-bold text-slate-700">{status}</h4>
                {contents.filter(c => c.status === status).map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                    <span className={`self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${item.tColor}`}>
                      {item.icon} {item.type}
                    </span>
                    <h5 
                      onClick={() => {
                        const cItem = item as any;
                        setFormData({
                          id: cItem.id,
                          title: cItem.title,
                          status: cItem.status,
                          priority: cItem.priority,
                          type: cItem.type,
                          pic: cItem.pic || "",
                          dueDate: cItem.dueDate || "",
                          assetUrl: cItem.assetUrl || "",
                          content: cItem.content || ""
                        });
                        setIsAddingContent(true);
                      }}
                      className="font-bold text-slate-800 text-sm cursor-pointer hover:text-brand-600 transition-colors">
                      {item.title}
                    </h5>
                    <div className="flex justify-between items-center mt-2">
                       <span className={`text-xs font-bold capitalize ${item.pColor}`}>{item.priority}</span>
                       <span className="text-xs text-slate-500">{item.dueDate || '-'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TrashIcon({size}: {size: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  );
}
