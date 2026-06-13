import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { ResourceManager } from "@/components/resource-manager";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "Orders — Fleet Console" }] }),
  component: OrdersPage,
});

type Row = Record<string, unknown> & { _id?: string; id?: string };

function OrdersPage() {
  return (
    <ResourceManager
      title="Orders"
      description="Active and historical rentals."
      basePath="/ord"
      queryKey="orders"
      fields={[
        { name: "vehicleId", label: "Vehicle ID" },
        { name: "customerId", label: "Customer ID" },
        { name: "status", label: "Status" },
        { name: "returnedAt", label: "Returned at" },
      ]}
      displayFields={["vehicleId", "customerId", "status", "returnedAt"]}
      customCreate={<CreateOrderForm />}
    />
  );
}

function CreateOrderForm() {
  const qc = useQueryClient();
  const [vehicleId, setVehicleId] = useState("");
  const [customerId, setCustomerId] = useState("");

  const vehicles = useQuery({
    queryKey: ["vehicles", "list"],
    queryFn: async () => {
      const r = await api<Row[]>("/veh/");
      return Array.isArray(r.data) ? r.data : [];
    },
  });
  const customers = useQuery({
    queryKey: ["customers", "list"],
    queryFn: async () => {
      const r = await api<Row[]>("/cus/");
      return Array.isArray(r.data) ? r.data : [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const res = await api(`/ord/${vehicleId}/${customerId}`, { method: "POST" });
      if (!res.ok) throw new Error(res.error ?? "Create failed");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Order created");
      qc.invalidateQueries({ queryKey: ["orders", "list"] });
      qc.invalidateQueries({ queryKey: ["orders", "count"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  function rowId(r: Row) {
    return String(r._id ?? r.id ?? "");
  }
  function rowLabel(r: Row, ...keys: string[]) {
    for (const k of keys) {
      const v = r[k];
      if (typeof v === "string" && v) return v;
    }
    return rowId(r);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!vehicleId || !customerId) return;
        create.mutate();
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label>Vehicle</Label>
        <Select value={vehicleId} onValueChange={setVehicleId}>
          <SelectTrigger><SelectValue placeholder="Select a vehicle" /></SelectTrigger>
          <SelectContent>
            {(vehicles.data ?? []).map((v) => (
              <SelectItem key={rowId(v)} value={rowId(v)}>
                {rowLabel(v, "make", "model", "plate")} — {rowId(v).slice(-6)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Customer</Label>
        <Select value={customerId} onValueChange={setCustomerId}>
          <SelectTrigger><SelectValue placeholder="Select a customer" /></SelectTrigger>
          <SelectContent>
            {(customers.data ?? []).map((c) => (
              <SelectItem key={rowId(c)} value={rowId(c)}>
                {rowLabel(c, "name", "email")} — {rowId(c).slice(-6)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button
          type="submit"
          disabled={create.isPending || !vehicleId || !customerId}
          className="font-bold uppercase tracking-wider"
        >
          {create.isPending ? "Creating…" : "Create order"}
        </Button>
      </DialogFooter>
    </form>
  );
}