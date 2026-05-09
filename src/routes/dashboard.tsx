import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout, PageHeader } from "@/components/AdminLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { useList } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Tent, Users, AlertTriangle, Package, UserCheck, Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard")({
  component: () => <RequireAuth><AdminLayout><Dashboard /></AdminLayout></RequireAuth>,
});

function Stat({ label, value, icon: Icon, accent }: { label: string; value: number | string; icon: any; accent?: string }) {
  return (
    <Card className="p-5 border-border bg-card">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="text-3xl font-semibold mt-2">{value}</div>
        </div>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${accent ?? "bg-accent"}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function Dashboard() {
  const camps = useList<any>("camps");
  const managers = useList<any>("camp_managers");
  const accounts = useList<any>("accounts");
  const supplies = useList<any>("supplies");
  const disasters = useList<any>("disaster_types");
  const alerts = useList<any>("alerts");

  const pending = (accounts.data ?? []).filter((a) => a.status === "pending").length;
  const lowStock = (supplies.data ?? []).filter((s) => s.quantity <= s.threshold).length;
  const totalOccupancy = (camps.data ?? []).reduce((sum, c) => sum + (c.current_occupancy ?? 0), 0);
  const totalCapacity = (camps.data ?? []).reduce((sum, c) => sum + (c.capacity ?? 0), 0);

  return (
    <>
      <PageHeader title="Emergency Dashboard" description="Live overview of relief operations" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Stat label="Active Camps" value={camps.data?.length ?? 0} icon={Tent} />
        <Stat label="Camp Managers" value={managers.data?.length ?? 0} icon={Users} />
        <Stat label="Disaster Types" value={disasters.data?.length ?? 0} icon={AlertTriangle} />
        <Stat label="Pending Approvals" value={pending} icon={UserCheck} accent="bg-warning/20" />
        <Stat label="Low Stock Items" value={lowStock} icon={Package} accent="bg-destructive/20" />
        <Stat label="Alerts Sent" value={alerts.data?.length ?? 0} icon={Megaphone} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Camp Capacity</h3>
          <div className="text-sm text-muted-foreground mb-2">{totalOccupancy.toLocaleString()} of {totalCapacity.toLocaleString()} beds occupied</div>
          <div className="h-3 rounded-full bg-secondary overflow-hidden">
            <div className="h-full" style={{
              width: `${totalCapacity ? Math.min(100, (totalOccupancy / totalCapacity) * 100) : 0}%`,
              background: "var(--gradient-emergency)",
            }} />
          </div>
          <div className="mt-5 space-y-2">
            {(camps.data ?? []).slice(0, 5).map((c) => (
              <div key={c.id} className="flex justify-between text-sm">
                <span className="text-foreground">{c.name}</span>
                <span className="text-muted-foreground">{c.current_occupancy}/{c.capacity}</span>
              </div>
            ))}
            {!camps.data?.length && <p className="text-sm text-muted-foreground">No camps yet.</p>}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {(alerts.data ?? []).slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                <Badge variant={a.severity === "critical" ? "destructive" : a.severity === "warning" ? "secondary" : "outline"}>
                  {a.severity}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{a.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{a.message}</div>
                </div>
              </div>
            ))}
            {!alerts.data?.length && <p className="text-sm text-muted-foreground">No alerts yet.</p>}
          </div>
        </Card>
      </div>
    </>
  );
}
