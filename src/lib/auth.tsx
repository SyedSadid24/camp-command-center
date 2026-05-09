import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const KEY = "admin_session";
const ADMIN_USER = "Admin";
const ADMIN_PASS = "Admin123!";

interface AuthCtx {
  isAuthed: boolean;
  login: (u: string, p: string) => boolean;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAuthed(localStorage.getItem(KEY) === "1");
    }
  }, []);

  const login = (u: string, p: string) => {
    const user = (u ?? "").trim();
    const pass = p ?? "";
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      try { localStorage.setItem(KEY, "1"); } catch {}
      setIsAuthed(true);
      return true;
    }
    return false;
  };
  const logout = () => {
    try { localStorage.removeItem(KEY); } catch {}
    setIsAuthed(false);
  };

  return <Ctx.Provider value={{ isAuthed, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = (): AuthCtx => {
  const ctx = useContext(Ctx);
  if (ctx) return ctx;
  // Fallback so the form still works even if provider isn't mounted yet
  return {
    isAuthed: false,
    login: (u, p) => {
      if ((u ?? "").trim() === ADMIN_USER && (p ?? "") === ADMIN_PASS) {
        try { localStorage.setItem(KEY, "1"); } catch {}
        return true;
      }
      return false;
    },
    logout: () => { try { localStorage.removeItem(KEY); } catch {} },
  };
};
