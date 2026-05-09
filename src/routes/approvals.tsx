import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout, PageHeader } from "@/components/AdminLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { useList, useUpdate, useInsert } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/approvals")({
  component: () => <RequireAuth><AdminLayout><Approvals /></AdminLayout></RequireAuth>,
});

function Approvals() {
  const list = useList<any>("accounts");
  const update = useUpdate("accounts");
  const create = useInsert("accounts");
  const [tab, setTab] = useState("pending");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "volunteer" });

  const filtered = (list.data ?? []).filter((a) => a.status === tab);

  return (
    <>
      <PageHeader
        title="Account Approvals"
        description="Review and approve volunteer & donor registrations"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button variant="outline"><Plus className="h-4 w-4 mr-1" />Add applicant</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Register applicant</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div>
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                      <SelectItem value="donor">Donor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button onClick={async () => { await create.mutateAsync(form); setOpen(false); setForm({ name: "", email: "", role: "volunteer" }); }}>Submit</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({(list.data ?? []).filter(a => a.status === "pending").length})</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell className="text-muted-foreground">{a.email}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{a.role}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={a.status === "approved" ? "default" : a.status === "rejected" ? "destructive" : "secondary"} className="capitalize">{a.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {a.status !== "approved" && <Button size="sm" onClick={() => update.mutate({ id: a.id, status: "approved" })}><Check className="h-4 w-4 mr-1" />Approve</Button>}
                      {a.status !== "rejected" && <Button size="sm" variant="outline" onClick={() => update.mutate({ id: a.id, status: "rejected" })}><X className="h-4 w-4 mr-1" />Reject</Button>}
                    </TableCell>
                  </TableRow>
                ))}
                {!filtered.length && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No {tab} accounts.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
