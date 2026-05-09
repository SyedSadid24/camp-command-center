import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout, PageHeader } from "@/components/AdminLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { useList, useInsert, useRemove } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, MapPin } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/camps")({
  component: () => <RequireAuth><AdminLayout><Camps /></AdminLayout></RequireAuth>,
});

function Camps() {
  const list = useList<any>("camps");
  const disasters = useList<any>("disaster_types");
  const managers = useList<any>("camp_managers");
  const create = useInsert("camps");
  const remove = useRemove("camps");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ name: "", location: "", capacity: 100, current_occupancy: 0, disaster_type: "", manager_id: "", status: "active" });

  return (
    <>
      <PageHeader
        title="Camp Locations"
        description="Manage relief camps and their assignments"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Add camp</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New relief camp</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Camp name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, region" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: +e.target.value })} /></div>
                  <div><Label>Current occupancy</Label><Input type="number" value={form.current_occupancy} onChange={(e) => setForm({ ...form, current_occupancy: +e.target.value })} /></div>
                </div>
                <div>
                  <Label>Disaster type</Label>
                  <Select value={form.disaster_type} onValueChange={(v) => setForm({ ...form, disaster_type: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{(disasters.data ?? []).map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Manager</Label>
                  <Select value={form.manager_id} onValueChange={(v) => setForm({ ...form, manager_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Assign manager" /></SelectTrigger>
                    <SelectContent>{(managers.data ?? []).map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={async () => {
                  const payload = { ...form };
                  if (!payload.disaster_type) delete payload.disaster_type;
                  if (!payload.manager_id) delete payload.manager_id;
                  await create.mutateAsync(payload);
                  setForm({ name: "", location: "", capacity: 100, current_occupancy: 0, disaster_type: "", manager_id: "", status: "active" });
                  setOpen(false);
                }}>Create camp</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Camp</TableHead><TableHead>Location</TableHead><TableHead>Disaster</TableHead><TableHead>Capacity</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {(list.data ?? []).map((c) => {
              const pct = c.capacity ? (c.current_occupancy / c.capacity) * 100 : 0;
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground"><MapPin className="h-3 w-3 inline mr-1" />{c.location}</TableCell>
                  <TableCell>{c.disaster_type ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[140px]">
                      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full" style={{ width: `${Math.min(100, pct)}%`, background: pct > 90 ? "var(--color-destructive)" : pct > 70 ? "var(--color-warning)" : "var(--color-success)" }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{c.current_occupancy}/{c.capacity}</span>
                    </div>
                  </TableCell>
                  <TableCell><span className="capitalize text-sm">{c.status}</span></TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => remove.mutate(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {!list.data?.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No camps yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
