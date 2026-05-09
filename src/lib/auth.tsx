import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const KEY = "admin_session";
const ADMIN_USER = "Admin";
const ADMIN_PASS = "Admin123!";

interface AuthCtx {
  isAuthed: boolean;
  login: (u: string, p: string) => boolean;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>({ isAuthed: false, login: () => false, logout: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAuthed(localStorage.getItem(KEY) === "1");
    }
  }, []);

  const login = (u: string, p: string) => {
    if (u === ADMIN_USER && p === ADMIN_PASS) {
      localStorage.setItem(KEY, "1");
      setIsAuthed(true);
      return true;
    }
    return false;
  };
  const logout = () => {
    localStorage.removeItem(KEY);
    setIsAuthed(false);
  };

  return <Ctx.Provider value={{ isAuthed, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
