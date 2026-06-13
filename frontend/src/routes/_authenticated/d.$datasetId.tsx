import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { ResourceManager, FieldDef, ResourceForm } from "@/components/resource-manager";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/d/$datasetId")({
  component: DynamicDatasetRoute,
});

function DynamicDatasetRoute() {
  const { datasetId } = Route.useParams();
  const qc = useQueryClient();

  const datasetQuery = useQuery({
    queryKey: ["dataset", datasetId],
    queryFn: async () => {
      const res = await api<any>(`/dataset/${datasetId}`);
      if (!res.ok) throw new Error(res.error ?? "Failed to fetch dataset");
      return res.data;
    },
  });

  const recordsQuery = useQuery({
    queryKey: ["records", datasetId],
    queryFn: async () => {
      const res = await api<any[]>(`/record?datasetId=${datasetId}`);
      if (!res.ok) throw new Error(res.error ?? "Failed to fetch records");
      return res.data;
    },
    enabled: !!datasetQuery.data,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const createMut = useMutation({
    mutationFn: async (form: Record<string, string>) => {
      const payload = {
        datasetId,
        data: form,
      };
      const res = await api(`/record`, { method: "POST", body: payload });
      if (!res.ok) throw new Error(res.error ?? "Failed to create record");
      return res.data;
    },
    onSuccess: () => {
      toast.success(`Record created`);
      qc.invalidateQueries({ queryKey: ["records", datasetId] });
      setCreateOpen(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, form }: { id: string; form: Record<string, string> }) => {
      const payload = {
        datasetId,
        data: form,
      };
      const res = await api(`/record/${id}`, { method: "PUT", body: payload });
      if (!res.ok) throw new Error(res.error ?? "Failed to update record");
      return res.data;
    },
    onSuccess: () => {
      toast.success(`Record updated`);
      qc.invalidateQueries({ queryKey: ["records", datasetId] });
      setEditing(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await api(`/record/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(res.error ?? "Failed to delete record");
      return res.data;
    },
    onSuccess: () => {
      toast.success(`Record deleted`);
      qc.invalidateQueries({ queryKey: ["records", datasetId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  if (datasetQuery.isLoading) return <div className="p-12 flex items-center justify-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading dataset...</div>;
  if (datasetQuery.isError) return <div className="p-12 text-center text-destructive">Error loading dataset</div>;
  if (!datasetQuery.data) return <div className="p-12 text-center text-muted-foreground">Dataset not found</div>;

  const dataset = datasetQuery.data;
  const fields = (dataset.fields as FieldDef[]) || [];
  const rows = recordsQuery.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">{dataset.name}</h1>
          {dataset.description && (
            <p className="text-muted-foreground mt-1">{dataset.description}</p>
          )}
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="font-bold uppercase tracking-wider">
              <Plus className="h-4 w-4 mr-2" />
              New Record
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Record</DialogTitle>
              <DialogDescription>Fill in the details below.</DialogDescription>
            </DialogHeader>
            <ResourceForm
              fields={fields}
              submitting={createMut.isPending}
              onSubmit={(form) => createMut.mutate(form)}
              submitLabel="Create"
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden border-border bg-card">
        {recordsQuery.isLoading ? (
          <div className="p-12 flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading records...
          </div>
        ) : recordsQuery.isError ? (
          <div className="p-12 text-center text-destructive">
            {(recordsQuery.error as Error).message}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No records yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  {fields.map((c) => (
                    <th
                      key={c.name}
                      className="text-left px-4 py-3 font-bold uppercase tracking-wider text-xs text-muted-foreground"
                    >
                      {c.label || c.name}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  return (
                    <tr key={row.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      {fields.map((c) => (
                        <td key={c.name} className="px-4 py-3 align-top">
                          {renderCell(row.data?.[c.name])}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditing(row)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete record?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMut.mutate(row.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
          </DialogHeader>
          {editing && (
            <ResourceForm
              fields={fields}
              initial={editing.data || {}}
              submitting={updateMut.isPending}
              onSubmit={(form) => updateMut.mutate({ id: editing.id, form })}
              submitLabel="Save"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function renderCell(v: unknown) {
  if (v === null || v === undefined) return <span className="text-muted-foreground">—</span>;
  if (typeof v === "object") return <span className="text-xs">{JSON.stringify(v)}</span>;
  return String(v);
}
