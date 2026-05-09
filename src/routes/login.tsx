import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [u, setU] = useState("");
  const [p, setP] = useState("");

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (login(u, p)) {
      toast.success("Welcome back, Admin");
      // Use full reload so dashboard sees the localStorage flag immediately
      window.location.href = "/dashboard";
    } else {
      toast.error("Invalid credentials", {
        description: `Use Admin / Admin123!`,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none"
        style={{ background: "radial-gradient(circle at 30% 20%, oklch(0.68 0.21 28 / 0.4), transparent 60%), radial-gradient(circle at 80% 80%, oklch(0.65 0.18 230 / 0.25), transparent 60%)" }} />

      <div className="relative w-full max-w-md mx-4">
        <div className="rounded-xl border border-border bg-card p-8" style={{ boxShadow: "var(--shadow-panel)" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center"
              style={{ background: "var(--gradient-emergency)", boxShadow: "var(--shadow-glow)" }}>
              <ShieldAlert className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">ReliefOps Admin</h1>
              <p className="text-xs text-muted-foreground">Disaster Relief Command Center</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="u">Username</Label>
              <Input id="u" value={u} onChange={(e) => setU(e.target.value)} placeholder="Admin" autoFocus />
            </div>
            <div>
              <Label htmlFor="p">Password</Label>
              <Input id="p" type="password" value={p} onChange={(e) => setP(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full" size="lg" onClick={() => submit()}>Sign in</Button>
          </form>

          <p className="text-[11px] text-muted-foreground mt-6 text-center">
            Authorized personnel only. All access is logged.
          </p>
        </div>
      </div>
    </div>
  );
}
