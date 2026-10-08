import { Plus, Search, User, Shield, Briefcase, Mail, Key, Edit3, X, Users, Check, Palette, ShieldCheck, Lock } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useState, useEffect } from "react";
import { getMemberAvatar } from "@/utils/avatar";

export default function MembersContent() {
  const { data, addMember, removeMember, saveMember, currentUser, switchUser } = useAppContext();
  const [search, setSearch] = useState("");
  const [newMember, setNewMember] = useState({ name: "", role: "Guru", password: "", color: "bg-brand-500" });
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "" });
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

  const isAdmin = currentUser.role === "admin";
  const members = data.members.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  const getInitials = (name: string) => name.charAt(0).toUpperCase();
  const colors = ["bg-brand-500", "bg-blue-500", "bg-pink-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-cyan-500"];

  const handleAddMember = () => {
    if (!isAdmin) {
      alert("Hanya Admin / Tim Inti yang memiliki hak menambah anggota baru.");
      return;
    }
    if (!newMember.name) return;
    addMember({ name: newMember.name, role: newMember.role, password: newMember.password, color: newMember.color });
    setNewMember({ name: "", role: "Guru", password: "", color: "bg-brand-500" });
  };

  const handleSaveEdit = (member: any) => {
    if (!isAdmin) return;
    if (editForm.name.trim()) {
       saveMember({ ...member, name: editForm.name.trim() });
    }
    setEditingMemberId(null);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
            <Users size={20} className="text-brand-600" /> Kelola Anggota & Status Tim
          </h3>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border inline-flex items-center gap-1.5 ${
            isAdmin 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            {isAdmin ? (
              <>
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>Akses Penuh Admin</span>
              </>
            ) : (
              <>
                <Lock size={12} className="text-slate-500" />
                <span>Mode Lihat ({currentUser.role === 'kreatif' ? 'Tim Kreatif' : 'Guru'})</span>
              </>
            )}
          </span>
        </div>

        {!isAdmin && (
          <div className="p-3.5 mx-6 mt-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Lock size={14} className="text-slate-500 shrink-0" />
              <span>
                Anda masuk sebagai <strong>{currentUser.name}</strong>. Hak mengubah, membuat, dan menghapus anggota dipegang oleh <strong>Admin / Tim Inti</strong>.
              </span>
            </div>
            <button 
              onClick={() => switchUser('admin')} 
              className="font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg shrink-0 cursor-pointer transition-colors flex items-center gap-1"
            >
              <span>🔑 Verifikasi PIN Admin</span>
            </button>
          </div>
        )}

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto bg-slate-50">
          {members.map((member: any, i) => {
            const color = member.color || colors[member.name.length % colors.length];
            const hasPassword = !!member.password;
            const isEditing = editingMemberId === member.id;
            
            const memberAvatar = getMemberAvatar(member.id) || getMemberAvatar(member.name);

            return (
              <div key={member.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${color} text-white flex items-center justify-center text-sm font-bold shadow-sm overflow-hidden relative border border-slate-200/60 shrink-0`}>
                      {memberAvatar ? (
                        <img src={memberAvatar} alt={member.name} className="w-full h-full object-cover object-center" />
                      ) : (
                        getInitials(member.name)
                      )}
                    </div>
                    <div className="flex-1">
                      {isEditing ? (
                        <input 
                          autoFocus
                          value={editForm.name} 
                          onChange={e => setEditForm({ name: e.target.value })}
                          onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(member); }}
                          onBlur={() => handleSaveEdit(member)}
                          className="border border-brand-300 rounded-lg px-3 py-1 outline-none text-sm font-semibold text-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all w-64"
                        />
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-slate-800 text-sm">{member.name}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 flex items-center gap-1">
                              <Shield size={10} /> {member.role}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-400">
                            {hasPassword ? "Password: ••••" : "Tanpa Password Personal"}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  {isAdmin ? (
                    <div className="flex items-center gap-1 text-slate-400">
                      <button onClick={() => {
                        const newPassword = Math.random().toString(36).substring(2, 8).toUpperCase();
                        saveMember({ ...member, password: newPassword });
                        alert(`Password baru untuk ${member.name} adalah: ${newPassword}`);
                      }} className="p-1.5 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors cursor-pointer" title="Generate Password Baru"><Key size={14}/></button>
                      <button onMouseDown={(e) => {
                        e.preventDefault();
                        if (isEditing) {
                          handleSaveEdit(member);
                        } else {
                          setEditingMemberId(member.id);
                          setEditForm({ name: member.name });
                        }
                      }} className={`p-1.5 rounded-md transition-colors cursor-pointer ${isEditing ? 'bg-emerald-50 text-emerald-600' : 'hover:text-brand-600 hover:bg-brand-50'}`} title="Edit Anggota"><Edit3 size={14}/></button>
                      <button onClick={() => {
                        if (window.confirm(`Yakin ingin menghapus anggota ${member.name}?`)) {
                          removeMember(member.id);
                        }
                      }} className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer" title="Hapus Anggota"><X size={14}/></button>
                    </div>
                  ) : (
                    <div className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <span>🔒 Terkunci</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span onClick={() => {
                      if (!isAdmin) {
                        alert("Hanya Admin / Tim Inti yang dapat mengubah role jabatan.");
                        return;
                      }
                      saveMember({ ...member, role: "Tim Inti" });
                    }} className={`text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 transition-colors ${isAdmin ? 'cursor-pointer' : 'cursor-default'} ${member.role === 'Tim Inti' ? 'bg-brand-100 text-brand-700 border border-brand-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><Shield size={10} /> Tim Inti</span>
                    <span onClick={() => {
                      if (!isAdmin) {
                        alert("Hanya Admin / Tim Inti yang dapat mengubah role jabatan.");
                        return;
                      }
                      saveMember({ ...member, role: "Guru" });
                    }} className={`text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 transition-colors ${isAdmin ? 'cursor-pointer' : 'cursor-default'} ${member.role === 'Guru' ? 'bg-brand-100 text-brand-700 border border-brand-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><Briefcase size={10} /> Guru</span>
                    <span onClick={() => {
                      if (!isAdmin) {
                        alert("Hanya Admin / Tim Inti yang dapat mengubah role jabatan.");
                        return;
                      }
                      saveMember({ ...member, role: "Tim Kreatif" });
                    }} className={`text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 transition-colors ${isAdmin ? 'cursor-pointer' : 'cursor-default'} ${member.role === 'Tim Kreatif' ? 'bg-brand-100 text-brand-700 border border-brand-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><Palette size={10} /> Tim Kreatif</span>
                  </div>
                  <div className="flex gap-1.5">
                    {colors.map((c, i) => (
                      <div onClick={() => {
                        if (!isAdmin) return;
                        saveMember({ ...member, color: c });
                      }} key={i} className={`w-4 h-4 rounded-full ${c} ${isAdmin ? 'cursor-pointer' : 'cursor-default'} ${color === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {isAdmin ? (
          <div className="p-6 bg-brand-50/50 border-t border-brand-100">
            <p className="text-sm font-bold text-brand-700 mb-3 flex items-center gap-1"><Plus size={16}/> Tambah Anggota Baru (Guru / Tim Kreatif / Tim Inti)</p>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="Nama anggota baru (mis. Ust. Ridwan / Kak Andi)..."
                  value={newMember.name}
                  onChange={e => setNewMember({...newMember, name: e.target.value})}
                  className="flex-1 border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-2.5 outline-none text-sm font-semibold text-slate-700 bg-white"
                />
                <select 
                  value={newMember.role}
                  onChange={e => setNewMember({...newMember, role: e.target.value})}
                  className="w-32 border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-2.5 outline-none text-sm font-bold text-slate-700 appearance-none bg-no-repeat bg-white cursor-pointer"
                  style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em'}}
                >
                  <option>Guru</option>
                  <option>Tim Inti</option>
                  <option>Tim Kreatif</option>
                </select>
              </div>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="Password personal (opsional)..."
                  value={newMember.password}
                  onChange={e => setNewMember({...newMember, password: e.target.value})}
                  className="flex-1 border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-2.5 outline-none text-sm font-semibold text-slate-700 bg-white"
                />
                <button 
                  onClick={() => setNewMember({...newMember, password: Math.random().toString(36).substring(2, 8).toUpperCase()})}
                  className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer">
                  <Search size={14}/> Generate
                </button>
                <button 
                  onClick={handleAddMember}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer">
                  Tambah
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 justify-center sm:justify-start">
                <Shield size={14} className="text-slate-400" /> Form Tambah Anggota Terkunci
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pendaftaran guru atau tim kreatif baru hanya dapat dilakukan oleh akun <strong>Admin / Tim Inti</strong>.
              </p>
            </div>
            <button
              onClick={() => switchUser('admin')}
              className="text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
            >
              <span>🔑 Verifikasi PIN Admin</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
