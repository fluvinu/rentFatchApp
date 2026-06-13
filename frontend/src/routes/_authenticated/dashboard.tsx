import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Card } from "@/components/ui/card";
import { Car, Users, ClipboardList, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Fleet Console" }] }),
  component: Dashboard,
});

function useCount(path: string, key: string) {
  return useQuery({
    queryKey: [key, "count"],
    queryFn: async () => {
      const res = await api<unknown[]>(path);
      if (!res.ok) return 0;
      const d = res.data;
      if (Array.isArray(d)) return d.length;
      if (d && typeof d === "object" && Array.isArray((d as { data?: unknown }).data))
        return ((d as { data: unknown[] }).data).length;
      return 0;
    },
  });
}

const STATS = [
  { to: "/vehicles", label: "Vehicles", path: "/veh/", key: "vehicles", Icon: Car },
  { to: "/customers", label: "Customers", path: "/cus/", key: "customers", Icon: Users },
  { to: "/orders", label: "Orders", path: "/ord/", key: "orders", Icon: ClipboardList },
] as const;

function Dashboard() {
  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Overview</p>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mt-2">
          Command your fleet.
        </h1>
        <p className="text-muted-foreground mt-3 max-w-xl">
          Manage rental vehicles, customers, and live orders from one bold control deck.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATS.map((s) => (
          <StatCard key={s.key} to={s.to} label={s.label} path={s.path} statKey={s.key} Icon={s.Icon} />
        ))}
      </div>
    </div>
  );
}

function StatCard({
  to,
  label,
  path,
  statKey,
  Icon,
}: {
  to: string;
  label: string;
  path: string;
  statKey: string;
  Icon: typeof Car;
}) {
  const q = useCount(path, statKey);
  return (
    <Link to={to}>
      <Card className="p-6 bg-card border-border hover:border-primary/60 transition-all group relative overflow-hidden">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-colors" />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="text-5xl font-black mt-2 tabular-nums">
              {q.isLoading ? "…" : q.data ?? 0}
            </p>
          </div>
          <div className="h-12 w-12 rounded-md bg-[image:var(--gradient-primary)] flex items-center justify-center text-primary-foreground shadow-[var(--shadow-glow)]">
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className="relative mt-6 flex items-center text-xs font-bold uppercase tracking-wider text-primary">
          Manage <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </Card>
    </Link>
  );
}