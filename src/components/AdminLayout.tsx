import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  AlertTriangle,
  Tent,
  Package,
  Megaphone,
  FileText,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/managers", label: "Camp Managers", icon: Users },
  { to: "/approvals", label: "Account Approvals", icon: UserCheck },
  { to: "/disasters", label: "Disaster Types", icon: AlertTriangle },
  { to: "/camps", label: "Camp Locations", icon: Tent },
  { to: "/supplies", label: "Supplies Stock", icon: Package },
  { to: "/alerts", label: "Alerts & Announcements", icon: Megaphone },
  { to: "/reports", label: "Reports", icon: FileText },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar flex flex-col">
        <div className="px-5 py-5 border-b border-sidebar-border flex items-center gap-2">
          <div className="h-9 w-9 rounded-md flex items-center justify-center" style={{ background: "var(--gradient-emergency)", boxShadow: "var(--shadow-glow)" }}>
            <ShieldAlert className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold text-sm leading-none text-sidebar-foreground">ReliefOps</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">Admin Console</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = path === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-primary font-medium border-l-2 border-sidebar-primary"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => { logout(); navigate({ to: "/login" }); }}
          className="m-3 flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <div className="px-8 py-6 max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
