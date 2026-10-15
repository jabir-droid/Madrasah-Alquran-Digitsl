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
    name: "Nu'man",
    fullName: "Nu'man Al-Hafizh",
    role: "admin",
    roleLabel: "Admin / Tim Inti",
    email: "numan@madrasahquran.id",
    avatarBg: "bg-emerald-500",
    initials: "NM",
    bio: "Koordinator utama ruang kerja digital, memiliki akses penuh ke seluruh manajemen tugas, konten, dan konfigurasi madrasah."
  },
  {
    id: "u_jabir",
    name: "Jabir",
    fullName: "Jabir Ahmad",
    role: "kreatif",
    roleLabel: "Tim Kreatif & Desain",
    email: "jabir@madrasahquran.id",
    avatarBg: "bg-purple-600",
    initials: "JB",
    bio: "Spesialis produksi media dakwah, penulisan naskah, kurasi konten sosial media, dan aset visual madrasah."
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

export function getMemberRoleCategory(roleOrMember: any): UserRole {
  const roleStr = typeof roleOrMember === "string" 
    ? roleOrMember 
    : (roleOrMember?.role || "");
  const r = roleStr.toLowerCase();
  if (r.includes("admin") || r.includes("inti") || r.includes("koordinator") || r.includes("pimpinan")) {
    return "admin";
  }
  if (r.includes("kreatif") || r.includes("desain") || r.includes("media") || r.includes("editor")) {
    return "kreatif";
  }
  return "guru";
}

export function memberToCurrentUser(m: any): CurrentUser {
  const role: UserRole = getMemberRoleCategory(m);

  const roleLabel = role === "admin" 
    ? "Admin / Tim Inti" 
    : role === "kreatif" 
    ? "Tim Kreatif & Desain" 
    : "Guru / Pengajar";

  const initials = m.name ? m.name.slice(0, 2).toUpperCase() : "AG";
  const avatarBg = m.color || (role === "admin" ? "bg-emerald-500" : role === "kreatif" ? "bg-purple-600" : "bg-blue-600");

  return {
    id: m.id,
    name: m.name,
    fullName: m.fullName || `${m.name} Al-Hafizh`,
    role: role,
    roleLabel: roleLabel,
    email: m.email || `${m.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@madrasahquran.id`,
    avatarBg: avatarBg,
    initials: initials,
    bio: m.bio || (role === "admin" 
      ? "Koordinator utama ruang kerja digital madrasah."
      : role === "kreatif"
      ? "Spesialis produksi media dakwah dan konten madrasah."
      : "Pendidik Al-Qur'an dan tahsin madrasah.")
  };
}

export function getMemberPin(m: any): string {
  if (m.pin) return String(m.pin);
  if (m.password) return String(m.password);
  
  if (typeof window !== "undefined") {
    const localSaved = localStorage.getItem(`mqd_pin_${m.id}`);
    if (localSaved) return localSaved;
  }

  const role = getMemberRoleCategory(m);
  return DEFAULT_ROLE_PINS[role];
}

export interface Member {
  id: string;
  name: string;
  role: string;
  color?: string;
  pin?: string;
  password?: string;
  fullName?: string;
  email?: string;
  bio?: string;
  [key: string]: any;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  updatedAt?: number;
  isDone?: boolean;
  [key: string]: any;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  priority?: string;
  assigneeId?: string;
  dueDate?: string;
  month?: string;
  checklist?: { id: string; text: string; done: boolean }[];
  report?: string;
  reportLink?: string;
  order: number;
  createdAt?: number;
  updatedAt?: number;
  deleted?: boolean;
  [key: string]: any;
}

export interface Note {
  id: string;
  title: string;
  category?: string;
  content?: string;
  date?: string;
  createdAt?: number;
  updatedAt?: number;
  [key: string]: any;
}

export interface SopItem {
  id: string;
  title: string;
  category?: string;
  content?: string;
  createdAt?: number;
  updatedAt?: number;
  [key: string]: any;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  category?: string;
  createdAt?: number;
  updatedAt?: number;
  [key: string]: any;
}

export interface ContentItem {
  id: string;
  title: string;
  type: string;
  status: string;
  date?: string;
  dueDate?: string;
  pillar?: string;
  priority?: string;
  assigneeId?: string;
  content?: string;
  order?: number;
  deleted?: boolean;
  notes?: string;
  link?: string;
  createdAt?: number;
  updatedAt?: number;
  [key: string]: any;
}

export interface AppState {
  members: Member[];
  columns: Column[];
  cards: Card[];
  notes: Note[];
  links: LinkItem[];
  sops: SopItem[];
  contents: ContentItem[];
  updatedAt?: number;
  [key: string]: any;
}

interface AppContextType {
  data: AppState;
  currentUser: CurrentUser;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (name: string, password: string) => { success: boolean; message?: string; user?: CurrentUser };
  logout: () => void;
  isAdminVerified: boolean;
  isAdminModalOpen: boolean;
  authModalTargetRole: UserRole | null;
  authModalTargetMemberId: string | null;
  syncStatus: "synced" | "syncing" | "error";
  syncNow: () => Promise<void>;
  switchUser: (roleOrMemberId: string) => void;
  openAdminModal: (onSuccess?: () => void) => void;
  closeAdminModal: () => void;
  openRoleModal: (role: UserRole, onSuccess?: () => void) => void;
  closeRoleModal: () => void;
  openMemberModal: (memberId: string, onSuccess?: () => void) => void;
  closeMemberModal: () => void;
  verifyRolePin: (role: UserRole, pin: string) => { success: boolean; message?: string };
  changeRolePin: (role: UserRole, oldPin: string, newPin: string) => { success: boolean; message?: string };
  verifyMemberPin: (memberId: string, pin: string) => { success: boolean; message?: string };
  changeMemberPin: (memberId: string, newPin: string, oldPin?: string) => { success: boolean; message?: string };
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
  const [data, setData] = useState<AppState>(dbData as unknown as AppState);
  // Default user
  const [currentUser, setCurrentUser] = useState<CurrentUser>(PRESET_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [authModalTargetRole, setAuthModalTargetRole] = useState<UserRole | null>(null);
  const [authModalTargetMemberId, setAuthModalTargetMemberId] = useState<string | null>(null);
  const [adminSuccessCallback, setAdminSuccessCallback] = useState<(() => void) | null>(null);
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "error">("synced");

  useEffect(() => {
    // Restore User Role & Auth State
    try {
      // 1. Purge any stale Faruq cache completely
      const rawUser = localStorage.getItem("mqd_current_user");
      if (rawUser && (rawUser.toLowerCase().includes("faruq") || rawUser.includes("u_faruq"))) {
        localStorage.removeItem("mqd_current_user");
      }
      localStorage.removeItem("mqd_user_profile_u_faruq");
      localStorage.removeItem("mqd_pin_u_faruq");

      // Check auth session
      const authSessionRaw = localStorage.getItem("mqd_auth_session");
      if (authSessionRaw) {
        const session = JSON.parse(authSessionRaw);
        if (session && (session.id || session.name)) {
          const memberMatch = data.members.find(
            m => m.id === session.id || (session.name && m.name.toLowerCase() === session.name.toLowerCase())
          );
          if (memberMatch) {
            const u = memberToCurrentUser(memberMatch);
            setCurrentUser(u);
            setIsAuthenticated(true);
            if (u.role === "admin") {
              setIsAdminVerified(true);
              localStorage.setItem("mqd_admin_verified", "true");
            } else {
              setIsAdminVerified(false);
              localStorage.removeItem("mqd_admin_verified");
            }
            setIsAuthLoading(false);
            return;
          }
        }
      }

      // No active session found - must login first
      setIsAuthenticated(false);
      setIsAdminVerified(false);
    } catch (e) {
      console.error(e);
      setIsAuthenticated(false);
    } finally {
      setIsAuthLoading(false);
    }
  }, [data.members]);

  const openAdminModal = (onSuccess?: () => void) => {
    openRoleModal("admin", onSuccess);
  };

  const closeAdminModal = () => {
    closeMemberModal();
  };

  const openRoleModal = (role: UserRole, onSuccess?: () => void) => {
    setAdminSuccessCallback(() => onSuccess || null);
    setAuthModalTargetRole(role);
    // Find representative member
    const m = data.members.find(x => {
      const r = (x.role || "").toLowerCase();
      if (role === "admin") return r.includes("admin") || r.includes("inti");
      if (role === "kreatif") return r.includes("kreatif");
      return !r.includes("admin") && !r.includes("kreatif");
    });
    setAuthModalTargetMemberId(m ? m.id : null);
    setIsAdminModalOpen(true);
  };

  const closeRoleModal = () => {
    closeMemberModal();
  };

  const openMemberModal = (memberId: string, onSuccess?: () => void) => {
    setAdminSuccessCallback(() => onSuccess || null);
    setAuthModalTargetMemberId(memberId);
    const m = data.members.find(x => x.id === memberId);
    if (m) {
      const u = memberToCurrentUser(m);
      setAuthModalTargetRole(u.role);
    }
    setIsAdminModalOpen(true);
  };

  const closeMemberModal = () => {
    setIsAdminModalOpen(false);
    setAuthModalTargetMemberId(null);
    setAuthModalTargetRole(null);
    setAdminSuccessCallback(null);
  };

  const verifyMemberPin = (memberId: string, inputPin: string): { success: boolean; message?: string } => {
    const member = data.members.find(m => m.id === memberId);
    if (!member) {
      return verifyRolePin(memberId as UserRole, inputPin);
    }

    const expectedPin = getMemberPin(member);
    if (inputPin === expectedPin) {
      const u = memberToCurrentUser(member);
      if (u.role === "admin") {
        setIsAdminVerified(true);
        localStorage.setItem("mqd_admin_verified", "true");
      } else {
        setIsAdminVerified(false);
        localStorage.removeItem("mqd_admin_verified");
      }

      setCurrentUser(u);
      localStorage.setItem("mqd_current_user", JSON.stringify(u));
      localStorage.setItem("mqd_user_profile", JSON.stringify({
        name: u.name,
        fullName: u.fullName,
        role: u.roleLabel,
        email: u.email,
        phone: "+62 812-8899-7721",
        location: "Jakarta, Indonesia",
        joinDate: "Januari 2024",
        bio: u.bio,
        specializations: u.role === "admin" 
          ? ["Manajemen Proyek Dakwah", "Pengaturan Sistem", "Evaluasi Kinerja"] 
          : u.role === "kreatif"
          ? ["Kreator Konten & Naskah", "Editing Desain Grafis", "Sosial Media Dakwah"]
          : ["Pengajaran Al-Qur'an", "Tahsin & Tajwid", "Evaluasi Santri"]
      }));

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("mqd_profile_updated"));
      }

      if (adminSuccessCallback) {
        adminSuccessCallback();
      }
      return { success: true };
    } else {
      return { 
        success: false, 
        message: `PIN untuk ${member.name} (${member.role}) tidak sesuai.` 
      };
    }
  };

  const changeMemberPin = (memberId: string, newPin: string, oldPin?: string) => {
    const member = data.members.find(m => m.id === memberId);
    if (!member) return { success: false, message: "Anggota tidak ditemukan." };

    if (!isAdminVerified && oldPin) {
      const currentPin = getMemberPin(member);
      if (oldPin !== currentPin) {
        return { success: false, message: "PIN lama tidak sesuai." };
      }
    }

    if (!newPin || newPin.length < 4) {
      return { success: false, message: "PIN baru minimal 4 digit." };
    }

    const updatedMembers = data.members.map(m => 
      m.id === memberId ? { ...m, pin: newPin } : m
    );
    saveData({ ...data, members: updatedMembers });

    try {
      localStorage.setItem(`mqd_pin_${memberId}`, newPin);
    } catch {}

    return { success: true, message: `PIN untuk ${member.name} (${member.role}) berhasil diperbarui!` };
  };

  const verifyRolePin = (targetRole: UserRole, inputPin: string): { success: boolean; message?: string } => {
    const member = data.members.find(x => {
      const r = (x.role || "").toLowerCase();
      if (targetRole === "admin") return r.includes("admin") || r.includes("inti");
      if (targetRole === "kreatif") return r.includes("kreatif");
      return !r.includes("admin") && !r.includes("kreatif");
    });

    if (member) {
      return verifyMemberPin(member.id, inputPin);
    }

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
      localStorage.setItem("mqd_admin_verified", "false");
    } catch (e) {
      console.error(e);
    }
    const nonAdmin = data.members.find(m => m.id !== "u_numan");
    if (nonAdmin) {
      const fallbackUser = memberToCurrentUser(nonAdmin);
      setCurrentUser(fallbackUser);
      try {
        localStorage.setItem("mqd_current_user", JSON.stringify(fallbackUser));
      } catch (e) {}
    }
  };

  const login = (name: string, password: string): { success: boolean; message?: string; user?: CurrentUser } => {
    const trimmedName = name.trim();
    const trimmedPass = password.trim();

    if (!trimmedName) {
      return { success: false, message: "Silakan masukkan nama pengguna Anda." };
    }
    if (!trimmedPass) {
      return { success: false, message: "Silakan masukkan kata sandi Anda." };
    }

    // Match member in data.members
    const memberMatch = data.members.find(
      m => m.name.toLowerCase() === trimmedName.toLowerCase() || 
           m.id.toLowerCase() === trimmedName.toLowerCase() ||
           (m.fullName && m.fullName.toLowerCase() === trimmedName.toLowerCase())
    );

    if (!memberMatch) {
      return { 
        success: false, 
        message: `Nama "${trimmedName}" belum terdaftar. Akun dibuatkan langsung oleh Admin Madrasah. Silakan hubungi Admin untuk dibuatkan akun dan role peran Anda.` 
      };
    }

    // Check credentials
    const roleCat = getMemberRoleCategory(memberMatch);
    const validPinsOrPasswords = [
      memberMatch.password ? String(memberMatch.password) : null,
      memberMatch.pin ? String(memberMatch.pin) : null,
      typeof window !== "undefined" ? localStorage.getItem(`mqd_pin_${memberMatch.id}`) : null,
      DEFAULT_ROLE_PINS[roleCat],
      roleCat === "admin" ? "123456" : null,
      roleCat === "admin" ? "Numan.99" : null,
    ].filter(Boolean) as string[];

    const isMatch = validPinsOrPasswords.some(
      valid => valid.toLowerCase() === trimmedPass.toLowerCase()
    );

    if (!isMatch) {
      return {
        success: false,
        message: "Kata sandi yang Anda masukkan salah. Silakan periksa kembali atau minta bantuan Admin untuk reset sandi."
      };
    }

    const u = memberToCurrentUser(memberMatch);
    setCurrentUser(u);
    setIsAuthenticated(true);
    const isAdmin = u.role === "admin";
    setIsAdminVerified(isAdmin);

    try {
      localStorage.setItem("mqd_auth_session", JSON.stringify({
        id: memberMatch.id,
        name: memberMatch.name,
        role: memberMatch.role,
        timestamp: Date.now()
      }));
      localStorage.setItem("mqd_current_user", JSON.stringify(u));
      if (isAdmin) {
        localStorage.setItem("mqd_admin_verified", "true");
      } else {
        localStorage.removeItem("mqd_admin_verified");
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("mqd_profile_updated"));
      }
    } catch (e) {
      console.error(e);
    }

    return { success: true, user: u };
  };

  const logout = () => {
    try {
      localStorage.removeItem("mqd_auth_session");
      localStorage.removeItem("mqd_current_user");
      localStorage.removeItem("mqd_admin_verified");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("mqd_profile_updated"));
      }
    } catch (e) {
      console.error(e);
    }
    setIsAuthenticated(false);
    setIsAdminVerified(false);
  };

  const switchUser = (roleOrMemberId: string) => {
    // If switching to admin or Nu'man, switch immediately without PIN block
    if (roleOrMemberId === "admin" || roleOrMemberId === "u_numan") {
      const numanMember = data.members.find(m => m.id === "u_numan");
      const uAdmin = numanMember ? memberToCurrentUser(numanMember) : PRESET_USERS[0];
      setCurrentUser(uAdmin);
      setIsAdminVerified(true);
      try {
        localStorage.setItem("mqd_current_user", JSON.stringify(uAdmin));
        localStorage.setItem("mqd_admin_verified", "true");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("mqd_profile_updated"));
        }
      } catch (e) {}
      return;
    }

    // Check if it's a memberId
    const member = data.members.find(m => m.id === roleOrMemberId);
    if (member) {
      if (member.id === currentUser.id) return;
      openMemberModal(member.id);
      return;
    }

    // Otherwise it's a role
    const role = roleOrMemberId as UserRole;
    if (role === currentUser.role) return;
    openRoleModal(role);
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

  const sanitizeData = (raw: any): AppState => {
    if (!raw) return raw;
    let clean = { ...raw };
    if (Array.isArray(clean.members)) {
      clean.members = clean.members.filter((m: any) => m.id !== "u_faruq" && !m.name?.toLowerCase().includes("faruq"));
    }
    const memberIds = new Set((clean.members || []).map((m: any) => m.id));
    if (Array.isArray(clean.cards)) {
      clean.cards = clean.cards.map((c: any) => {
        if (c.assigneeId === "u_faruq") {
          return { ...c, assigneeId: "u_numan" };
        }
        if (c.assigneeId && !memberIds.has(c.assigneeId)) {
          return { ...c, assigneeId: "u_numan" };
        }
        return c;
      });
    }
    return clean;
  };

  const fetchRemote = async () => {
    try {
      const res = await fetch("/api/sync", { cache: "no-store" });
      if (!res.ok) throw new Error("Sync network error");
      let remoteData = await res.json();
      if (remoteData && Array.isArray(remoteData.cards) && Array.isArray(remoteData.members)) {
        remoteData = sanitizeData(remoteData);
        setData(remoteData);
        try {
          localStorage.setItem("madrasahAppDB", JSON.stringify(remoteData));
        } catch (e) {}
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
        let parsed = sanitizeData(JSON.parse(saved));
        if (parsed && Array.isArray(parsed.cards)) {
          setData(parsed);
          localStorage.setItem("madrasahAppDB", JSON.stringify(parsed));
        }
      } catch (e) {}
    }

    // 2. Fetch fresh from server
    fetchRemote();

    // 3. Polling every 3 seconds for realtime multi-user updates
    const interval = setInterval(fetchRemote, 3000);
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
    const updatedMembers = data.members.filter(m => m.id !== id);
    const updatedCards = data.cards.map(c => 
      c.assigneeId === id ? { ...c, assigneeId: "u_numan" } : c
    );
    try {
      localStorage.removeItem(`mqd_pin_${id}`);
    } catch {}
    saveData({ ...data, members: updatedMembers, cards: updatedCards });
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
    if (member.id === currentUser.id) {
      const updated = memberToCurrentUser(member);
      setCurrentUser(updated);
      try {
        localStorage.setItem("mqd_current_user", JSON.stringify(updated));
      } catch (e) {}
    }
  };

  return (
    <AppContext.Provider value={{ 
      data, 
      currentUser,
      isAuthenticated,
      isAuthLoading,
      login,
      logout,
      isAdminVerified,
      isAdminModalOpen,
      authModalTargetRole,
      authModalTargetMemberId,
      openAdminModal,
      closeAdminModal,
      openRoleModal,
      closeRoleModal,
      openMemberModal,
      closeMemberModal,
      verifyRolePin,
      changeRolePin,
      verifyMemberPin,
      changeMemberPin,
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
