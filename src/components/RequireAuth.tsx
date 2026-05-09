import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthed } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("admin_session") !== "1") {
      navigate({ to: "/login" });
    }
  }, [isAuthed, navigate]);
  if (typeof window !== "undefined" && localStorage.getItem("admin_session") !== "1") return null;
  return <>{children}</>;
}
