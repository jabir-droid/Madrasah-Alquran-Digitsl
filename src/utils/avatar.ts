/**
 * Centralized Avatar Helper for Madrasah Al-Qur'an Digital
 * Resolves avatar photo (Data URL or image path) for any member by ID or name
 * synchronizing across Dashboard Leaderboard, Cards, Members list, and Profile.
 */

export function getMemberAvatar(memberIdOrName?: string | null): string | null {
  if (!memberIdOrName || typeof window === "undefined") return null;

  try {
    const raw = memberIdOrName.trim();
    if (!raw) return null;
    const lower = raw.toLowerCase();
    
    // Normalize variants (e.g. "u_hammam", "hammam", "Hammam", "Hammam Mujahid")
    const idWithPrefix = lower.startsWith("u_") ? lower : `u_${lower}`;
    const cleanName = lower.startsWith("u_") ? lower.slice(2) : lower;
    const firstName = cleanName.split(/\s+/)[0];

    // 1. Check global map in localStorage
    const globalMapStr = localStorage.getItem("mqd_member_avatars");
    if (globalMapStr) {
      try {
        const map = JSON.parse(globalMapStr);
        if (map && typeof map === "object") {
          // Direct keys
          if (map[raw]) return map[raw];
          if (map[lower]) return map[lower];
          if (map[idWithPrefix]) return map[idWithPrefix];
          if (map[cleanName]) return map[cleanName];
          if (map[firstName]) return map[firstName];

          // Case-insensitive / substring search in keys
          for (const [k, v] of Object.entries(map)) {
            if (typeof v === "string" && v) {
              const kLower = k.toLowerCase();
              if (
                kLower === lower ||
                kLower === idWithPrefix ||
                kLower === cleanName ||
                kLower.includes(cleanName) ||
                cleanName.includes(kLower)
              ) {
                return v;
              }
            }
          }
        }
      } catch (e) {
        console.error("Error reading mqd_member_avatars:", e);
      }
    }

    // 2. Check individual user profile storage keys
    const profileKeys = [
      `mqd_user_profile_${raw}`,
      `mqd_user_profile_${lower}`,
      `mqd_user_profile_${idWithPrefix}`,
      `mqd_user_profile_${cleanName}`,
      `mqd_user_profile_${firstName}`,
    ];

    for (const key of profileKeys) {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.avatarUrl) {
            return parsed.avatarUrl;
          }
        } catch {}
      }
    }

    // 3. Scan all keys in localStorage starting with mqd_user_profile
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("mqd_user_profile")) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.avatarUrl) {
              const pName = (parsed.name || "").toLowerCase();
              const pFullName = (parsed.fullName || "").toLowerCase();
              const pId = (parsed.id || "").toLowerCase();
              if (
                pId === lower ||
                pId === idWithPrefix ||
                pName === lower ||
                pName === cleanName ||
                pName.includes(cleanName) ||
                cleanName.includes(pName) ||
                pFullName.includes(cleanName)
              ) {
                return parsed.avatarUrl;
              }
            }
          }
        } catch {}
      }
    }

    // 4. Check madrasahAppDB members if any have avatarUrl / avatar
    const appDbStr = localStorage.getItem("madrasahAppDB");
    if (appDbStr) {
      try {
        const appDb = JSON.parse(appDbStr);
        if (appDb && Array.isArray(appDb.members)) {
          const matched = appDb.members.find((m: any) => {
            if (!m) return false;
            const mId = (m.id || "").toLowerCase();
            const mName = (m.name || "").toLowerCase();
            return (
              mId === lower ||
              mId === idWithPrefix ||
              mName === lower ||
              mName === cleanName ||
              mName.includes(cleanName) ||
              cleanName.includes(mName)
            );
          });
          if (matched && (matched.avatarUrl || matched.avatar)) {
            return matched.avatarUrl || matched.avatar;
          }
        }
      } catch {}
    }
  } catch (err) {
    console.error("Error retrieving avatar:", err);
  }

  return null;
}

export function saveMemberAvatar(memberId: string, memberName: string, avatarUrl: string): void {
  if (typeof window === "undefined") return;

  try {
    const globalMap = JSON.parse(localStorage.getItem("mqd_member_avatars") || "{}");
    const rawId = memberId.trim();
    const rawName = memberName.trim();
    const lowerId = rawId.toLowerCase();
    const lowerName = rawName.toLowerCase();
    const idWithPrefix = lowerName.startsWith("u_") ? lowerName : `u_${lowerName}`;
    const cleanName = lowerName.startsWith("u_") ? lowerName.slice(2) : lowerName;
    const firstName = cleanName.split(/\s+/)[0];

    if (avatarUrl) {
      globalMap[rawId] = avatarUrl;
      globalMap[rawName] = avatarUrl;
      globalMap[lowerId] = avatarUrl;
      globalMap[lowerName] = avatarUrl;
      globalMap[idWithPrefix] = avatarUrl;
      globalMap[cleanName] = avatarUrl;
      globalMap[firstName] = avatarUrl;
    } else {
      delete globalMap[rawId];
      delete globalMap[rawName];
      delete globalMap[lowerId];
      delete globalMap[lowerName];
      delete globalMap[idWithPrefix];
      delete globalMap[cleanName];
      delete globalMap[firstName];
    }

    localStorage.setItem("mqd_member_avatars", JSON.stringify(globalMap));
    window.dispatchEvent(new Event("mqd_profile_updated"));
  } catch (err) {
    console.error("Error saving member avatar:", err);
  }
}
