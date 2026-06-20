import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "number" | "email";
  required?: boolean;
  placeholder?: string;
};

type AnyRecord = Record<string, unknown> & { _id?: string; id?: string };

export type ResourceManagerProps = {
  title: string;
  description?: string;
  basePath: string; // e.g. "/veh"
  queryKey: string;
  fields: FieldDef[];
  displayFields?: string[]; // override columns shown
  createPathBuilder?: (form: Record<string, string>) => string; // for non-body POSTs (orders)
  hideCreate?: boolean;
  customCreate?: React.ReactNode;
};

function getId(row: AnyRecord) {
  return String(row._id ?? row.id ?? "");
}

export function ResourceManager(props: ResourceManagerProps) {
  const qc = useQueryClient();
  const listKey = [props.queryKey, "list"];

  const list = useQuery({
    queryKey: listKey,
    queryFn: async () => {
      const res = await api<AnyRecord[] | { data?: AnyRecord[] }>(props.basePath);
      if (!res.ok) throw new Error(res.error ?? "Failed to load");
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === "object" && Array.isArray((data as { data?: unknown }).data))
        return (data as { data: AnyRecord[] }).data;
      return [] as AnyRecord[];
    },
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AnyRecord | null>(null);

  const createMut = useMutation({
    mutationFn: async (form: Record<string, string>) => {
      const path = props.createPathBuilder ? props.createPathBuilder(form) : props.basePath;
      const body = props.createPathBuilder ? undefined : coerce(form, props.fields);
      const res = await api(path, { method: "POST", body });
      if (!res.ok) throw new Error(res.error ?? "Create failed");
      return res.data;
    },
    onSuccess: () => {
      toast.success(`${props.title} created`);
      qc.invalidateQueries({ queryKey: listKey });
      setCreateOpen(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, form }: { id: string; form: Record<string, string> }) => {
      const res = await api(`${props.basePath}/${id}`, {
        method: "PUT",
        body: coerce(form, props.fields),
      });
      if (!res.ok) throw new Error(res.error ?? "Update failed");
      return res.data;
    },
    onSuccess: () => {
      toast.success(`${props.title} updated`);
      qc.invalidateQueries({ queryKey: listKey });
      setEditing(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await api(`${props.basePath}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(res.error ?? "Delete failed");
      return res.data;
    },
    onSuccess: () => {
      toast.success(`${props.title} deleted`);
      qc.invalidateQueries({ queryKey: listKey });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const rows = list.data ?? [];
  const columns =
    props.displayFields ?? props.fields.slice(0, 4).map((f) => f.name);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">{props.title}</h1>
          {props.description && (
            <p className="text-muted-foreground mt-1">{props.description}</p>
          )}
        </div>
        {!props.hideCreate && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="font-bold uppercase tracking-wider">
                <Plus className="h-4 w-4 mr-2" />
                New {props.title.replace(/s$/, "")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create {props.title.replace(/s$/, "")}</DialogTitle>
                <DialogDescription>Fill in the details below.</DialogDescription>
              </DialogHeader>
              {props.customCreate ?? (
                <ResourceForm
                  fields={props.fields}
                  submitting={createMut.isPending}
                  onSubmit={(form) => createMut.mutate(form)}
                  submitLabel="Create"
                />
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="overflow-hidden border-border bg-card">
        {list.isLoading ? (
          <div className="p-12 flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
          </div>
        ) : list.isError ? (
          <div className="p-12 text-center text-destructive">
            {(list.error as Error).message}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No {props.title.toLowerCase()} yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  {columns.map((c) => (
                    <th
                      key={c}
                      className="text-left px-4 py-3 font-bold uppercase tracking-wider text-xs text-muted-foreground"
                    >
                      {labelFor(c, props.fields)}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const id = getId(row);
                  return (
                    <tr key={id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      {columns.map((c) => (
                        <td key={c} className="px-4 py-3 align-top">
                          {renderCell(row[c])}
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
                                <AlertDialogTitle>Delete {props.title.replace(/s$/, "").toLowerCase()}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMut.mutate(id)}
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
            <DialogTitle>Edit {props.title.replace(/s$/, "")}</DialogTitle>
          </DialogHeader>
          {editing && (
            <ResourceForm
              fields={props.fields}
              initial={editing}
              submitting={updateMut.isPending}
              onSubmit={(form) => updateMut.mutate({ id: getId(editing), form })}
              submitLabel="Save"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function labelFor(name: string, fields: FieldDef[]) {
  return fields.find((f) => f.name === name)?.label ?? name;
}

function renderCell(v: unknown) {
  if (v === null || v === undefined) return <span className="text-muted-foreground">—</span>;
  if (typeof v === "object") return <span className="text-xs">{JSON.stringify(v)}</span>;
  return String(v);
}

function coerce(form: Record<string, string>, fields: FieldDef[]) {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const raw = form[f.name];
    if (raw === undefined || raw === "") continue;
    out[f.name] = f.type === "number" ? Number(raw) : raw;
  }
  return out;
}

export function ResourceForm({
  fields,
  initial,
  onSubmit,
  submitting,
  submitLabel,
}: {
  fields: FieldDef[];
  initial?: AnyRecord;
  onSubmit: (form: Record<string, string>) => void;
  submitting?: boolean;
  submitLabel: string;
}) {
  const [form, setForm] = useState<Record<string, string>>(() => {
    const f: Record<string, string> = {};
    for (const fd of fields) {
      const v = initial?.[fd.name];
      f[fd.name] = v === undefined || v === null ? "" : String(v);
    }
    return f;
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      {fields.map((f) => (
        <div key={f.name} className="space-y-2">
          <Label htmlFor={f.name}>{f.label}</Label>
          <Input
            id={f.name}
            type={f.type === "number" ? "number" : f.type === "email" ? "email" : "text"}
            required={f.required}
            placeholder={f.placeholder}
            value={form[f.name] ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
          />
        </div>
      ))}
      <DialogFooter>
        <Button type="submit" disabled={submitting} className="font-bold uppercase tracking-wider">
          {submitting ? "Saving…" : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}