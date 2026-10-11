"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import dbData from "@/data/db.json";

export type UserRole = "admin" | "kreatif" | "guru";

export interface CurrentUser {
  id: string;
  name: string;
  fullName: string;
  role: UserRole;
  roleLabel: string;
  email: string;
  avatarBg: string;
  initials: string;
  bio: string;
}

export const PRESET_USERS: CurrentUser[] = [
  {
    id: "u_numan",
    name: "Nukman",
    fullName: "Nukman Al-Hafizh",
    role: "admin",
    roleLabel: "Admin / Tim Inti",
    email: "nukman@madrasahquran.id",
    avatarBg: "bg-emerald-500",
    initials: "NK",
    bio: "Koordinator utama ruang kerja digital, memiliki akses penuh ke seluruh manajemen tugas, konten, dan konfigurasi madrasah."
  },
  {
    id: "u_faruq",
    name: "Faruq",
    fullName: "Faruq Ar-Rasyid",
    role: "kreatif",
    roleLabel: "Tim Kreatif & Desain",
    email: "faruq@madrasahquran.id",
    avatarBg: "bg-purple-600",
    initials: "FQ",
    bio: "Spesialis produksi media dakwah, penulisan naskah, kurasi konten sosial media, dan aset visual madrasah."
  },
  {
    id: "u_hammam",
    name: "Hammam",
    fullName: "Hammam Mujahid",
    role: "guru",
    roleLabel: "Guru / Pengajar",
    email: "hammam@madrasahquran.id",
    avatarBg: "bg-blue-600",
    initials: "HM",
    bio: "Pendidik Al-Qur'an dan tahsin madrasah, fokus pada bimbingan santri, laporan kelas, dan silabus pembelajaran."
  }
];

export const DEFAULT_ROLE_PINS: Record<UserRole, string> = {
  admin: "123456",
  kreatif: "222222",
  guru: "333333"
};

export const ROLE_STORAGE_KEYS: Record<UserRole, string> = {
  admin: "mqd_admin_pin",
  kreatif: "mqd_kreatif_pin",
  guru: "mqd_guru_pin"
};

type AppState = typeof dbData;

interface AppContextType {
  data: AppState;
  currentUser: CurrentUser;
  isAdminVerified: boolean;
  isAdminModalOpen: boolean;
  authModalTargetRole: UserRole | null;
  syncStatus: "synced" | "syncing" | "error";
  syncNow: () => Promise<void>;
  switchUser: (role: UserRole) => void;
  openAdminModal: (onSuccess?: () => void) => void;
  closeAdminModal: () => void;
  openRoleModal: (role: UserRole, onSuccess?: () => void) => void;
  closeRoleModal: () => void;
  verifyRolePin: (role: UserRole, pin: string) => { success: boolean; message?: string };
  changeRolePin: (role: UserRole, oldPin: string, newPin: string) => { success: boolean; message?: string };
  verifyAdminPin: (pin: string) => { success: boolean; message?: string };
  changeAdminPin: (oldPin: string, newPin: string) => { success: boolean; message?: string };
  lockAdmin: () => void;
  moveCard: (cardId: string, newColumnId: string, newIndex: number) => void;
  toggleChecklist: (cardId: string, checklistId: string) => void;
  updateContentStatus: (contentId: string, status: string) => void;
  addCard: (title: string, columnId: string) => void;
  addContent: (title: string, type?: string) => void;
  saveContent: (content: any) => void;
  removeContent: (id: string) => void;
  addNote: (title: string, tab: string) => void;
  saveNote: (note: any, tab: string) => void;
  removeNote: (id: string, tab: string) => void;
  saveCard: (card: any) => void;
  removeCard: (id: string) => void;
  addMember: (member: any) => void;
  removeMember: (id: string) => void;
  saveMember: (member: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppState>(dbData);
  // Default to creative team Faruq on fresh unauthenticated load, or restore verified admin
  const [currentUser, setCurrentUser] = useState<CurrentUser>(PRESET_USERS[1]);
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [authModalTargetRole, setAuthModalTargetRole] = useState<UserRole | null>(null);
  const [adminSuccessCallback, setAdminSuccessCallback] = useState<(() => void) | null>(null);
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "error">("synced");

  useEffect(() => {
    // Restore User Role & Admin Auth State
    try {
      const savedAuth = localStorage.getItem("mqd_admin_verified");
      const isVerified = savedAuth === "true";
      setIsAdminVerified(isVerified);

      const savedUser = localStorage.getItem("mqd_current_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.role) {
          // If saved user was admin but not verified in this session, fallback to faruq
          if (parsed.role === "admin" && !isVerified) {
            setCurrentUser(PRESET_USERS[1]);
          } else {
            const match = PRESET_USERS.find(u => u.role === parsed.role);
            if (match) setCurrentUser(match);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const openAdminModal = (onSuccess?: () => void) => {
    openRoleModal("admin", onSuccess);
  };

  const closeAdminModal = () => {
    closeRoleModal();
  };

  const openRoleModal = (role: UserRole, onSuccess?: () => void) => {
    setAdminSuccessCallback(() => onSuccess || null);
    setAuthModalTargetRole(role);
    setIsAdminModalOpen(true);
  };

  const closeRoleModal = () => {
    setIsAdminModalOpen(false);
    setAuthModalTargetRole(null);
    setAdminSuccessCallback(null);
  };

  const verifyRolePin = (targetRole: UserRole, inputPin: string) => {
    try {
      const storageKey = ROLE_STORAGE_KEYS[targetRole];
      const storedPin = localStorage.getItem(storageKey) || DEFAULT_ROLE_PINS[targetRole];
      if (inputPin === storedPin) {
        if (targetRole === "admin") {
          setIsAdminVerified(true);
          localStorage.setItem("mqd_admin_verified", "true");
        } else {
          setIsAdminVerified(false);
          localStorage.removeItem("mqd_admin_verified");
        }

        performSwitch(targetRole);

        if (adminSuccessCallback) {
          adminSuccessCallback();
        }
        return { success: true };
      } else {
        const roleLabel = PRESET_USERS.find(u => u.role === targetRole)?.roleLabel || targetRole;
        return { 
          success: false, 
          message: `PIN untuk ${roleLabel} tidak sesuai. PIN bawaan: ${DEFAULT_ROLE_PINS[targetRole]}` 
        };
      }
    } catch (e) {
      return { success: false, message: "Terjadi kesalahan verifikasi." };
    }
  };

  const changeRolePin = (role: UserRole, oldPin: string, newPin: string) => {
    try {
      const storageKey = ROLE_STORAGE_KEYS[role];
      const storedPin = localStorage.getItem(storageKey) || DEFAULT_ROLE_PINS[role];
      if (oldPin !== storedPin) {
        return { success: false, message: "PIN lama tidak sesuai." };
      }
      if (!newPin || newPin.length < 4) {
        return { success: false, message: "PIN baru minimal 4 karakter/digit." };
      }
      localStorage.setItem(storageKey, newPin);
      const roleName = PRESET_USERS.find(u => u.role === role)?.roleLabel || role;
      return { success: true, message: `PIN untuk ${roleName} berhasil diperbarui!` };
    } catch (e) {
      return { success: false, message: "Gagal menyimpan PIN." };
    }
  };

  const verifyAdminPin = (inputPin: string) => {
    return verifyRolePin("admin", inputPin);
  };

  const changeAdminPin = (oldPin: string, newPin: string) => {
    return changeRolePin("admin", oldPin, newPin);
  };

  const lockAdmin = () => {
    setIsAdminVerified(false);
    try {
      localStorage.removeItem("mqd_admin_verified");
    } catch (e) {
      console.error(e);
    }
    // Switch to Faruq (Tim Kreatif)
    const fallbackUser = PRESET_USERS[1];
    setCurrentUser(fallbackUser);
    try {
      localStorage.setItem("mqd_current_user", JSON.stringify(fallbackUser));
    } catch (e) {
      console.error(e);
    }
  };

  const switchUser = (role: UserRole) => {
    if (role === currentUser.role) return;

    // Switching into any role requires PIN verification for that role
    openRoleModal(role, () => {
      performSwitch(role);
    });
  };

  const performSwitch = (role: UserRole) => {
    const matched = PRESET_USERS.find(u => u.role === role) || PRESET_USERS[1];
    setCurrentUser(matched);
    try {
      localStorage.setItem("mqd_current_user", JSON.stringify(matched));
      localStorage.setItem("mqd_user_profile", JSON.stringify({
        name: matched.name,
        fullName: matched.fullName,
        role: matched.roleLabel,
        email: matched.email,
        phone: "+62 812-8899-7721",
        location: "Jakarta, Indonesia",
        joinDate: "Januari 2024",
        bio: matched.bio,
        specializations: matched.role === "admin" 
          ? ["Manajemen Proyek Dakwah", "Pengaturan Sistem", "Evaluasi Kinerja"] 
          : matched.role === "kreatif"
          ? ["Kreator Konten & Naskah", "Editing Desain Grafis", "Sosial Media Dakwah"]
          : ["Pengajaran Al-Qur'an", "Tahsin & Tajwid", "Evaluasi Santri"]
      }));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("mqd_profile_updated"));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // BroadcastChannel for cross-tab realtime sync
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel("madrasah_workspace_channel");
        bc.onmessage = (event) => {
          if (event.data && event.data.cards) {
            setData(event.data);
            localStorage.setItem("madrasahAppDB", JSON.stringify(event.data));
          }
        };
      }
    } catch (e) {
      console.warn("BroadcastChannel not supported", e);
    }
    return () => {
      bc?.close();
    };
  }, []);

  const fetchRemote = async () => {
    try {
      const res = await fetch("/api/sync", { cache: "no-store" });
      if (!res.ok) throw new Error("Sync network error");
      const remoteData = await res.json();
      if (remoteData && Array.isArray(remoteData.cards) && Array.isArray(remoteData.members)) {
        // Compare with local storage to avoid clobbering unsaved local edits
        const saved = localStorage.getItem("madrasahAppDB");
        if (saved) {
          try {
            const localData = JSON.parse(saved);
            const localTime = Number(localData.updatedAt || 0);
            const remoteTime = Number(remoteData.updatedAt || 0);

            // If local data has newer modifications and has cards, sync local up to server
            if (localTime > remoteTime && Array.isArray(localData.cards) && localData.cards.length > 0) {
              fetch("/api/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(localData)
              }).catch(() => {});
              setData(localData);
              setSyncStatus("synced");
              return;
            }
          } catch (e) {}
        }

        setData(remoteData);
        localStorage.setItem("madrasahAppDB", JSON.stringify(remoteData));
        setSyncStatus("synced");
      }
    } catch (e) {
      console.warn("Remote sync fetch error:", e);
      setSyncStatus("error");
    }
  };

  // Initial fetch and auto-polling
  useEffect(() => {
    // 1. Initial local load
    const saved = localStorage.getItem("madrasahAppDB");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.cards)) {
          setData(parsed);
        }
      } catch (e) {}
    }

    // 2. Fetch fresh from server
    fetchRemote();

    // 3. Polling every 5 seconds for realtime multi-user updates
    const interval = setInterval(fetchRemote, 5000);
    return () => clearInterval(interval);
  }, []);

  const syncNow = async () => {
    setSyncStatus("syncing");
    await fetchRemote();
  };

  const saveData = (newData: AppState) => {
    const updated = {
      ...newData,
      updatedAt: Date.now()
    };
    setData(updated);
    try {
      localStorage.setItem("madrasahAppDB", JSON.stringify(updated));
    } catch (e) {}
    setSyncStatus("syncing");

    // Broadcast to other tabs immediately
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("madrasah_workspace_channel");
        bc.postMessage(updated);
        bc.close();
      }
    } catch (e) {}

    // POST to /api/sync
    fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    })
      .then(res => {
        if (res.ok) {
          setSyncStatus("synced");
        } else {
          setSyncStatus("error");
        }
      })
      .catch(e => {
        console.error("Sync save error:", e);
        setSyncStatus("error");
      });
  };

  const moveCard = (cardId: string, newColumnId: string, newIndex: number) => {
    const newCards = [...data.cards];
    const cardIndex = newCards.findIndex(c => c.id === cardId);
    if (cardIndex < 0) return;
    
    const [card] = newCards.splice(cardIndex, 1);
    card.columnId = newColumnId;
    
    const colCards = newCards.filter(c => c.columnId === newColumnId).sort((a,b) => a.order - b.order);
    colCards.splice(newIndex, 0, card);
    
    colCards.forEach((c, idx) => c.order = idx);
    
    saveData({ ...data, cards: newCards.concat(card) });
  };

  const toggleChecklist = (cardId: string, checklistId: string) => {
    const newCards = data.cards.map(card => {
      if (card.id !== cardId) return card;
      const newChecks = card.checklist?.map(cl => 
        cl.id === checklistId ? { ...cl, done: !cl.done } : cl
      );
      return { ...card, checklist: newChecks };
    });
    saveData({ ...data, cards: newCards });
  };

  const updateContentStatus = (contentId: string, status: string) => {
    const newContents = data.contents.map(c => 
      c.id === contentId ? { ...c, status } : c
    );
    saveData({ ...data, contents: newContents });
  };

  const addCard = (title: string, columnId: string) => {
    const newCard: any = {
      id: "card_" + Date.now(),
      title,
      columnId: columnId,
      priority: "normal",
      order: data.cards.filter(c => c.columnId === columnId).length,
      createdAt: Date.now()
    };
    saveData({ ...data, cards: [...data.cards, newCard] });
  };

  const addContent = (title: string, type: string = "Single Post") => {
    const newContent: any = {
      id: "content_" + Date.now(),
      title,
      type: type,
      priority: "normal",
      status: "Todo",
      order: data.contents.length
    };
    saveData({ ...data, contents: [...data.contents, newContent] });
  };

  const saveContent = (content: any) => {
    const newContent = { ...content, id: content.id || "content_" + Date.now(), order: data.contents.length };
    const newContents = [...data.contents];
    const index = newContents.findIndex(c => c.id === content.id);
    if (index >= 0) {
      newContents[index] = newContent;
    } else {
      newContents.push(newContent);
    }
    saveData({ ...data, contents: newContents });
  };

  const addNote = (title: string, tab: string) => {
    if (tab === "rapat") {
      const newNote: any = { id: "n_" + Date.now(), title, content: "", category: "General", createdAt: Date.now() };
      saveData({ ...data, notes: [newNote, ...data.notes] });
    } else if (tab === "sop") {
      const newSop: any = { id: "s_" + Date.now(), title, category: "General" };
      saveData({ ...data, sops: [newSop, ...data.sops] });
    } else if (tab === "link") {
      const newLink: any = { id: "l_" + Date.now(), title, url: "https://", category: "General" };
      saveData({ ...data, links: [newLink, ...data.links] });
    }
  };

  const saveNote = (note: any, tab: string) => {
    if (tab === "rapat") {
      const newNote = { ...note, id: note.id || "n_" + Date.now(), createdAt: note.createdAt || Date.now() };
      const newNotes = [...data.notes];
      const idx = newNotes.findIndex(n => n.id === newNote.id);
      if (idx >= 0) newNotes[idx] = newNote;
      else newNotes.unshift(newNote);
      saveData({ ...data, notes: newNotes });
    } else if (tab === "sop") {
      const newSop = { ...note, id: note.id || "s_" + Date.now(), createdAt: note.createdAt || Date.now() };
      const newSops = [...data.sops];
      const idx = newSops.findIndex(s => s.id === newSop.id);
      if (idx >= 0) newSops[idx] = newSop;
      else newSops.unshift(newSop);
      saveData({ ...data, sops: newSops });
    } else if (tab === "link") {
      const newLink = { ...note, id: note.id || "l_" + Date.now() };
      const newLinks = [...data.links];
      const idx = newLinks.findIndex(l => l.id === newLink.id);
      if (idx >= 0) newLinks[idx] = newLink;
      else newLinks.unshift(newLink);
      saveData({ ...data, links: newLinks });
    }
  };

  const removeNote = (id: string, tab: string) => {
    if (tab === "rapat") saveData({ ...data, notes: data.notes.filter(n => n.id !== id) });
    else if (tab === "sop") saveData({ ...data, sops: data.sops.filter(s => s.id !== id) });
    else if (tab === "link") saveData({ ...data, links: data.links.filter(l => l.id !== id) });
  };

  const removeContent = (id: string) => {
    saveData({ ...data, contents: data.contents.filter(c => c.id !== id) });
  };

  const saveCard = (card: any) => {
    const newCards = [...data.cards];
    const index = newCards.findIndex(c => c.id === card.id);
    if (index >= 0) {
      newCards[index] = card;
    } else {
      newCards.push(card);
    }
    saveData({ ...data, cards: newCards });
  };

  const removeCard = (id: string) => {
    saveData({ ...data, cards: data.cards.filter(c => c.id !== id) });
  };

  const addMember = (member: any) => {
    const newMember = { ...member, id: "u_" + Date.now() };
    saveData({ ...data, members: [...data.members, newMember] });
  };

  const removeMember = (id: string) => {
    saveData({ ...data, members: data.members.filter(m => m.id !== id) });
  };

  const saveMember = (member: any) => {
    const newMembers = [...data.members];
    const index = newMembers.findIndex(m => m.id === member.id);
    if (index >= 0) {
      newMembers[index] = member;
    } else {
      newMembers.push({ ...member, id: "u_" + Date.now() });
    }
    saveData({ ...data, members: newMembers });
  };

  return (
    <AppContext.Provider value={{ 
      data, 
      currentUser,
      isAdminVerified,
      isAdminModalOpen,
      authModalTargetRole,
      openAdminModal,
      closeAdminModal,
      openRoleModal,
      closeRoleModal,
      verifyRolePin,
      changeRolePin,
      verifyAdminPin,
      changeAdminPin,
      lockAdmin,
      syncStatus,
      syncNow,
      switchUser,
      moveCard, 
      toggleChecklist, 
      updateContentStatus, 
      addCard, 
      addContent, 
      saveContent, 
      removeContent, 
      addNote, 
      saveNote, 
      removeNote, 
      saveCard, 
      removeCard, 
      addMember, 
      removeMember, 
      saveMember 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}
