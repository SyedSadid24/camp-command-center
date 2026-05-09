import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    const authed = typeof window !== "undefined" && localStorage.getItem("admin_session") === "1";
    navigate({ to: authed ? "/dashboard" : "/login" });
  }, [navigate]);
  return null;
}
