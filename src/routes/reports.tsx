import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout, PageHeader } from "@/components/AdminLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { useList, useInsert } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Plus } from "lucide-react";
import { useState, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

export const Route = createFileRoute("/reports")({
  component: () => <RequireAuth><AdminLayout><Reports /></AdminLayout></RequireAuth>,
});

function Reports() {
  const dist = useList<any>("distributions", "distributed_at");
  const camps = useList<any>("camps");
  const create = useInsert("distributions");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ camp_id: "", item_name: "", quantity: 0, recipient: "", notes: "" });
  const campMap = useMemo(() => Object.fromEntries((camps.data ?? []).map((c) => [c.id, c.name])), [camps.data]);

  const generatePDF = () => {
    const data = dist.data ?? [];
    if (!data.length) { toast.error("No distributions to report"); return; }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Aid Distribution Report", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total records: ${data.length}`, 14, 33);

    autoTable(doc, {
      startY: 42,
      head: [["Date", "Camp", "Item", "Quantity", "Recipient", "Notes"]],
      body: data.map((d) => [
        new Date(d.distributed_at).toLocaleDateString(),
        campMap[d.camp_id] ?? "—",
        d.item_name,
        String(d.quantity),
        d.recipient ?? "—",
        d.notes ?? "",
      ]),
      headStyles: { fillColor: [203, 60, 52] },
      styles: { fontSize: 9 },
    });

    doc.save(`aid-distribution-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("Report downloaded");
  };

  const totalDistributed = (dist.data ?? []).reduce((s, d) => s + (d.quantity ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Aid Distribution Reports"
        description="Track aid handed out and export PDF summaries"
        actions={
          <>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button variant="outline"><Plus className="h-4 w-4 mr-1" />Log distribution</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Record aid distribution</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>Camp</Label>
                    <Select value={form.camp_id} onValueChange={(v) => setForm({ ...form, camp_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select camp" /></SelectTrigger>
                      <SelectContent>{(camps.data ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Item</Label><Input value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} /></div>
                    <div><Label>Recipient</Label><Input value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} placeholder="Family / individual" /></div>
                  </div>
                  <div><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                </div>
                <DialogFooter>
                  <Button onClick={async () => {
                    if (!form.camp_id || !form.item_name) return;
                    await create.mutateAsync(form);
                    setForm({ camp_id: "", item_name: "", quantity: 0, recipient: "", notes: "" });
                    setOpen(false);
                  }}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={generatePDF}><Download className="h-4 w-4 mr-1" />Download PDF</Button>
          </>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-5"><div className="text-xs uppercase text-muted-foreground tracking-wider">Records</div><div className="text-2xl font-semibold mt-1">{dist.data?.length ?? 0}</div></Card>
        <Card className="p-5"><div className="text-xs uppercase text-muted-foreground tracking-wider">Total units distributed</div><div className="text-2xl font-semibold mt-1">{totalDistributed.toLocaleString()}</div></Card>
        <Card className="p-5"><div className="text-xs uppercase text-muted-foreground tracking-wider">Active camps</div><div className="text-2xl font-semibold mt-1">{camps.data?.length ?? 0}</div></Card>
      </div>

      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Camp</TableHead><TableHead>Item</TableHead><TableHead>Quantity</TableHead><TableHead>Recipient</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
          <TableBody>
            {(dist.data ?? []).map((d) => (
              <TableRow key={d.id}>
                <TableCell className="text-muted-foreground">{new Date(d.distributed_at).toLocaleDateString()}</TableCell>
                <TableCell>{campMap[d.camp_id] ?? "—"}</TableCell>
                <TableCell className="font-medium">{d.item_name}</TableCell>
                <TableCell>{d.quantity}</TableCell>
                <TableCell>{d.recipient ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{d.notes ?? ""}</TableCell>
              </TableRow>
            ))}
            {!dist.data?.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No distributions logged yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
