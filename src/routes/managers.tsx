import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout, PageHeader } from "@/components/AdminLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { useList, useInsert, useRemove } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/managers")({
  component: () => <RequireAuth><AdminLayout><Managers /></AdminLayout></RequireAuth>,
});

function Managers() {
  const list = useList<any>("camp_managers");
  const create = useInsert("camp_managers");
  const remove = useRemove("camp_managers");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", assigned_camp: "" });

  const submit = async () => {
    if (!form.name || !form.email) return;
    await create.mutateAsync(form);
    setForm({ name: "", email: "", phone: "", assigned_camp: "" });
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Camp Managers"
        description="Add or remove managers responsible for relief camps"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Add Manager</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Camp Manager</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Full name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>Assigned camp</Label><Input value={form.assigned_camp} onChange={(e) => setForm({ ...form, assigned_camp: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={submit} disabled={create.isPending}>Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Assigned Camp</TableHead><TableHead></TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {(list.data ?? []).map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell className="text-muted-foreground">{m.email}</TableCell>
                <TableCell>{m.phone ?? "—"}</TableCell>
                <TableCell>{m.assigned_camp ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => remove.mutate(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {!list.data?.length && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No managers yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
