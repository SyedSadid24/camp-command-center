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
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/supplies")({
  component: () => <RequireAuth><AdminLayout><Supplies /></AdminLayout></RequireAuth>,
});

function Supplies() {
  const list = useList<any>("supplies", "updated_at");
  const camps = useList<any>("camps");
  const create = useInsert("supplies");
  const remove = useRemove("supplies");
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState<any>({ camp_id: "", item_name: "", category: "food", quantity: 0, unit: "units", threshold: 10 });

  const campMap = useMemo(() => Object.fromEntries((camps.data ?? []).map((c) => [c.id, c.name])), [camps.data]);
  const filtered = (list.data ?? []).filter((s) => filter === "all" ? true : filter === "low" ? s.quantity <= s.threshold : s.camp_id === filter);

  return (
    <>
      <PageHeader
        title="Supplies Stock"
        description="Monitor inventory across all relief camps"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Add stock</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add supply item</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Camp</Label>
                  <Select value={form.camp_id} onValueChange={(v) => setForm({ ...form, camp_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select camp" /></SelectTrigger>
                    <SelectContent>{(camps.data ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Item</Label><Input value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })} placeholder="e.g. Bottled water" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food">Food</SelectItem><SelectItem value="water">Water</SelectItem>
                        <SelectItem value="medical">Medical</SelectItem><SelectItem value="shelter">Shelter</SelectItem>
                        <SelectItem value="hygiene">Hygiene</SelectItem><SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} /></div>
                  <div><Label>Low-stock threshold</Label><Input type="number" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: +e.target.value })} /></div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={async () => {
                  if (!form.camp_id || !form.item_name) return;
                  await create.mutateAsync(form);
                  setForm({ camp_id: "", item_name: "", category: "food", quantity: 0, unit: "units", threshold: 10 });
                  setOpen(false);
                }}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4 flex gap-2">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All camps</SelectItem>
            <SelectItem value="low">⚠ Low stock only</SelectItem>
            {(camps.data ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Camp</TableHead><TableHead>Category</TableHead><TableHead>Stock</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {filtered.map((s) => {
              const low = s.quantity <= s.threshold;
              return (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.item_name}</TableCell>
                  <TableCell className="text-muted-foreground">{campMap[s.camp_id] ?? "—"}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{s.category}</Badge></TableCell>
                  <TableCell>
                    <span className={low ? "text-destructive font-medium" : ""}>
                      {low && <AlertCircle className="h-3 w-3 inline mr-1" />}
                      {s.quantity} {s.unit}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">/ min {s.threshold}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => remove.mutate(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {!filtered.length && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No supplies match.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
