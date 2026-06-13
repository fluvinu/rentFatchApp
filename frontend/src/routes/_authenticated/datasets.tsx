import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/datasets")({
  head: () => ({ meta: [{ title: "Manage Datasets" }] }),
  component: DatasetsPage,
});

type DatasetField = { name: string; label: string; type: string; required?: boolean };
type Dataset = { id: string; name: string; description: string; fields: DatasetField[] };

function DatasetsPage() {
  const qc = useQueryClient();
  const datasets = useQuery({
    queryKey: ["datasets"],
    queryFn: async () => {
      const res = await api<Dataset[]>("/dataset");
      return res.ok ? res.data : [];
    },
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Dataset | null>(null);

  const createMut = useMutation({
    mutationFn: async (dataset: Partial<Dataset>) => {
      const res = await api("/dataset", { method: "POST", body: dataset });
      if (!res.ok) throw new Error(res.error ?? "Failed to create dataset");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Dataset created");
      qc.invalidateQueries({ queryKey: ["datasets"] });
      setCreateOpen(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const updateMut = useMutation({
    mutationFn: async (dataset: Dataset) => {
      const res = await api(`/dataset/${dataset.id}`, { method: "PUT", body: dataset });
      if (!res.ok) throw new Error(res.error ?? "Failed to update dataset");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Dataset updated");
      qc.invalidateQueries({ queryKey: ["datasets"] });
      setEditing(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await api(`/dataset/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(res.error ?? "Failed to delete dataset");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Dataset deleted");
      qc.invalidateQueries({ queryKey: ["datasets"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Datasets</h1>
          <p className="text-muted-foreground mt-1">Manage dynamic collections for your application.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="font-bold uppercase tracking-wider">
              <Plus className="h-4 w-4 mr-2" /> New Dataset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Dataset</DialogTitle>
            </DialogHeader>
            <DatasetForm
              submitting={createMut.isPending}
              onSubmit={(d) => createMut.mutate(d)}
              submitLabel="Create"
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {datasets.isLoading ? (
          <div>Loading...</div>
        ) : datasets.data?.length === 0 ? (
          <div className="text-muted-foreground">No datasets created yet.</div>
        ) : (
          datasets.data?.map((d) => (
            <Card key={d.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">{d.name}</h3>
                <p className="text-muted-foreground">{d.description}</p>
                <div className="text-sm mt-2 flex flex-wrap gap-2">
                  {d.fields?.map(f => (
                    <span key={f.name} className="px-2 py-1 bg-secondary rounded text-xs font-mono">
                      {f.name} ({f.type})
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(d)}>
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => { if(confirm("Are you sure?")) deleteMut.mutate(d.id); }}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Dataset</DialogTitle>
          </DialogHeader>
          {editing && (
            <DatasetForm
              initial={editing}
              submitting={updateMut.isPending}
              onSubmit={(d) => updateMut.mutate(d as Dataset)}
              submitLabel="Save"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DatasetForm({
  initial,
  onSubmit,
  submitting,
  submitLabel,
}: {
  initial?: Partial<Dataset>;
  onSubmit: (dataset: Partial<Dataset>) => void;
  submitting: boolean;
  submitLabel: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [fields, setFields] = useState<DatasetField[]>(initial?.fields ?? []);

  const addField = () => setFields([...fields, { name: "", label: "", type: "text" }]);
  const updateField = (idx: number, updates: Partial<DatasetField>) => {
    const newFields = [...fields];
    newFields[idx] = { ...newFields[idx], ...updates };
    setFields(newFields);
  };
  const removeField = (idx: number) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ id: initial?.id, name, description, fields });
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label>Dataset Name</Label>
        <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Properties" />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. List of all properties" />
      </div>

      <div className="space-y-2 border-t pt-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg">Fields</Label>
          <Button type="button" variant="outline" size="sm" onClick={addField}>
            <Plus className="h-4 w-4 mr-2" /> Add Field
          </Button>
        </div>

        {fields.map((field, idx) => (
          <div key={idx} className="flex gap-2 items-start border p-3 rounded bg-secondary/10">
            <div className="grid grid-cols-2 gap-2 flex-1">
              <Input
                required
                placeholder="Field Name (e.g. price)"
                value={field.name}
                onChange={(e) => updateField(idx, { name: e.target.value })}
              />
              <Input
                required
                placeholder="Field Label (e.g. Price)"
                value={field.label}
                onChange={(e) => updateField(idx, { label: e.target.value })}
              />
              <Select value={field.type} onValueChange={(v) => updateField(idx, { type: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Field Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeField(idx)} className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <DialogFooter>
        <Button type="submit" disabled={submitting} className="font-bold uppercase tracking-wider">
          {submitting ? "Saving..." : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
