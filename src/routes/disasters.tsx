import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout, PageHeader } from "@/components/AdminLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { useList, useInsert, useRemove } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/disasters")({
  component: () => <RequireAuth><AdminLayout><Disasters /></AdminLayout></RequireAuth>,
});

const sevColor: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  low: "outline", medium: "secondary", high: "default", critical: "destructive",
};

function Disasters() {
  const list = useList<any>("disaster_types");
  const create = useInsert("disaster_types");
  const remove = useRemove("disaster_types");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", severity: "medium" });

  return (
    <>
      <PageHeader
        title="Disaster Types"
        description="Catalog of disaster categories handled by the operation"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Add type</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New disaster type</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Earthquake, Flood" /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div>
                  <Label>Severity</Label>
                  <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button onClick={async () => { await create.mutateAsync(form); setForm({ name: "", description: "", severity: "medium" }); setOpen(false); }}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(list.data ?? []).map((d) => (
          <Card key={d.id} className="p-5">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{d.name}</h3>
              <Badge variant={sevColor[d.severity]} className="capitalize">{d.severity}</Badge>
            </div>
            <p className="text-sm text-muted-foreground min-h-[40px]">{d.description || "No description"}</p>
            <Button size="sm" variant="ghost" className="mt-3" onClick={() => remove.mutate(d.id)}>
              <Trash2 className="h-4 w-4 mr-1 text-destructive" />Remove
            </Button>
          </Card>
        ))}
        {!list.data?.length && <p className="text-muted-foreground col-span-full text-center py-8">No disaster types yet.</p>}
      </div>
    </>
  );
}
