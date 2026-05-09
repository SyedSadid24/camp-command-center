import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout, PageHeader } from "@/components/AdminLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { useList, useInsert, useRemove } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Trash2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/alerts")({
  component: () => <RequireAuth><AdminLayout><Alerts /></AdminLayout></RequireAuth>,
});

function Alerts() {
  const list = useList<any>("alerts");
  const create = useInsert("alerts");
  const remove = useRemove("alerts");
  const [form, setForm] = useState({ title: "", message: "", severity: "info", target_audience: "all" });

  const send = async () => {
    if (!form.title || !form.message) return;
    await create.mutateAsync(form);
    setForm({ title: "", message: "", severity: "info", target_audience: "all" });
  };

  return (
    <>
      <PageHeader title="Alerts & Announcements" description="Broadcast emergency messages to camps, volunteers and donors" />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Megaphone className="h-4 w-4" />Compose alert</h3>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Message</Label><Textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Severity</Label>
                <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem><SelectItem value="warning">Warning</SelectItem><SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Audience</Label>
                <Select value={form.target_audience} onValueChange={(v) => setForm({ ...form, target_audience: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="managers">Camp managers</SelectItem>
                    <SelectItem value="volunteers">Volunteers</SelectItem>
                    <SelectItem value="donors">Donors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full" onClick={send} disabled={create.isPending}>Broadcast alert</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Sent alerts</h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {(list.data ?? []).map((a) => (
              <div key={a.id} className="border border-border rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={a.severity === "critical" ? "destructive" : a.severity === "warning" ? "secondary" : "outline"} className="capitalize">{a.severity}</Badge>
                    <span className="font-medium text-sm">{a.title}</span>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => remove.mutate(a.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{a.message}</p>
                <div className="text-[11px] text-muted-foreground mt-2 capitalize">→ {a.target_audience} · {new Date(a.created_at).toLocaleString()}</div>
              </div>
            ))}
            {!list.data?.length && <p className="text-sm text-muted-foreground">No alerts sent yet.</p>}
          </div>
        </Card>
      </div>
    </>
  );
}
