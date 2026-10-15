import { useState, useEffect } from "react";
import { X, Plus, Trash2, Lock } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

interface CardModalProps {
  card?: any;
  defaultColumnId?: string;
  onClose: () => void;
}

export default function CardModal({ card, defaultColumnId, onClose }: CardModalProps) {
  const { data, saveCard, removeCard, currentUser } = useAppContext();
  const isAdmin = currentUser.role === "admin";
  const isNewCard = !card || !card.id || !card.title;
  
  const [formData, setFormData] = useState<any>({
    id: card?.id || "card_" + Date.now(),
    title: card?.title || "",
    description: card?.description || "",
    columnId: card?.columnId || defaultColumnId || data.columns[0].id,
    priority: card?.priority || "normal",
    assigneeId: card?.assigneeId || "",
    dueDate: card?.dueDate || "",
    checklist: card?.checklist || [],
    report: card?.report || "",
    reportLink: card?.reportLink || "",
    order: card?.order || 0,
    createdAt: card?.createdAt || Date.now(),
    deleted: card?.deleted || false
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleAddChecklist = () => {
    setFormData((prev: any) => ({
      ...prev,
      checklist: [...prev.checklist, { id: "cl_" + Date.now(), text: "", done: false }]
    }));
  };

  const handleUpdateChecklistText = (id: string, text: string) => {
    setFormData((prev: any) => ({
      ...prev,
      checklist: prev.checklist.map((c: any) => c.id === id ? { ...c, text } : c)
    }));
  };

  const handleToggleChecklist = (id: string) => {
    setFormData((prev: any) => ({
      ...prev,
      checklist: prev.checklist.map((c: any) => c.id === id ? { ...c, done: !c.done } : c)
    }));
  };

  const handleRemoveChecklist = (id: string) => {
    setFormData((prev: any) => ({
      ...prev,
      checklist: prev.checklist.filter((c: any) => c.id !== id)
    }));
  };

  const handleSave = () => {
    if (isNewCard && !isAdmin) {
      alert("Hanya Admin yang memiliki wewenang untuk membuat tugas baru.");
      return;
    }
    if (!formData.title.trim()) {
      alert("Judul tidak boleh kosong");
      return;
    }
    saveCard(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-full animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Plus size={20} className="text-brand-600" /> 
            {card ? "Edit Kartu" : "Kartu baru"}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {isNewCard && !isAdmin && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <Lock size={15} className="text-amber-600 shrink-0" />
              <span>
                <strong>Mode Terbatas:</strong> Hanya <strong>Admin / Tim Inti</strong> yang berwenang membuat tugas baru.
              </span>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Judul *</label>
            <input 
              name="title" 
              value={formData.title} 
              onChange={handleChange}
              placeholder="Tugas apa ini?" 
              className="w-full border border-brand-200 focus:border-brand-500 rounded-lg px-4 py-2.5 outline-none transition-colors font-medium text-slate-800 focus:ring-4 focus:ring-brand-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Deskripsi</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange}
              placeholder="Detail opsional..." 
              rows={3}
              className="w-full border border-slate-200 focus:border-brand-500 rounded-lg px-4 py-2.5 outline-none transition-colors text-sm text-slate-600 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">Daftar kerja</label>
            {formData.checklist.length > 0 && (
              <div className="space-y-3 mb-4">
                {formData.checklist.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 border border-slate-200 rounded-xl p-3 bg-white hover:border-brand-300 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={item.done} 
                      onChange={() => handleToggleChecklist(item.id)}
                      className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={item.text}
                      onChange={(e) => handleUpdateChecklistText(item.id, e.target.value)}
                      className={`flex-1 outline-none text-sm font-medium bg-transparent ${item.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}
                      placeholder="Tugas..."
                    />
                    <button onClick={() => handleRemoveChecklist(item.id)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={16}/></button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={handleAddChecklist} className="text-brand-600 font-bold text-xs flex items-center gap-1 hover:text-brand-700">
              <Plus size={14} /> Tambah item
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Penanggung</label>
              <select name="assigneeId" value={formData.assigneeId} onChange={handleChange} className="w-full border border-slate-200 focus:border-brand-500 rounded-lg px-3 py-2.5 outline-none text-sm text-slate-700 appearance-none bg-no-repeat" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em'}}>
                <option value="">-- Tanpa --</option>
                {data.members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Prioritas</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="w-full border border-slate-200 focus:border-brand-500 rounded-lg px-3 py-2.5 outline-none text-sm text-slate-700 appearance-none bg-no-repeat" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em'}}>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Tenggat (opsional)</label>
            <input 
              type="date"
              name="dueDate" 
              value={formData.dueDate} 
              onChange={handleChange}
              className="w-full border border-slate-200 focus:border-brand-500 rounded-lg px-4 py-2 outline-none transition-colors text-sm text-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Kolom</label>
            <select name="columnId" value={formData.columnId} onChange={handleChange} className="w-full border border-slate-200 focus:border-brand-500 rounded-lg px-3 py-2.5 outline-none text-sm text-slate-700 appearance-none bg-no-repeat" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em'}}>
              {data.columns.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Hasil kerja (laporan)</label>
            <textarea 
              name="report" 
              value={formData.report} 
              onChange={handleChange}
              placeholder="Ringkasan hasil - diisi pas tugas selesai..." 
              rows={2}
              className="w-full border border-slate-200 focus:border-brand-500 rounded-lg px-4 py-2.5 outline-none transition-colors text-sm text-slate-600 resize-none"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Link bukti (Drive/Telegram)</label>
            <input 
              name="reportLink" 
              value={formData.reportLink} 
              onChange={handleChange}
              placeholder="https://..." 
              className="w-full border border-slate-200 focus:border-brand-500 rounded-lg px-4 py-2.5 outline-none transition-colors text-sm text-slate-600"
            />
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            {card && currentUser.role === "admin" && (
              <button onClick={() => {
                if (window.confirm("Yakin ingin menghapus tugas ini?")) {
                  removeCard(card.id);
                  onClose();
                }
              }} className="text-red-500 font-bold text-sm hover:text-red-600 px-2 py-2 transition-colors cursor-pointer flex items-center gap-1.5">
                <Trash2 size={15} />
                <span>Hapus Tugas</span>
              </button>
            )}
            {card && currentUser.role !== "admin" && (
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                🔒 Hanya Admin yang dapat menghapus tugas
              </span>
            )}
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
              {isNewCard && !isAdmin ? "Tutup" : "Batal"}
            </button>
            {(!isNewCard || isAdmin) && (
              <button onClick={handleSave} className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors cursor-pointer">
                Simpan
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
