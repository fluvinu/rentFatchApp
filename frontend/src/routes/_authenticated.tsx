import { createFileRoute, Outlet, Link, useNavigate, useRouterState, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/brand";
import { LogOut, LayoutDashboard, Car, Users, ClipboardList, Database, Folder } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/vehicles", label: "Vehicles", Icon: Car },
  { to: "/customers", label: "Customers", Icon: Users },
  { to: "/orders", label: "Orders", Icon: ClipboardList },
] as const;

function AuthLayout() {
  const { token, ready, logout, user } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const datasetsQuery = useQuery({
    queryKey: ["datasets"],
    queryFn: async () => {
      const res = await api<any[]>("/dataset");
      return res.ok && Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!token,
  });

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">Loading…</div>;
  }
  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-[image:var(--gradient-dark)] p-6 gap-8">
        <Brand to="/dashboard" />
        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, label, Icon }) => {
            const active = pathname === to || pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold uppercase tracking-wider transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}

          <div className="my-2 border-t border-border/50" />

          <Link
            to="/datasets"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold uppercase tracking-wider transition-colors ${
              pathname === "/datasets" || pathname.startsWith("/datasets/")
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Database className="h-4 w-4" />
            Manage Datasets
          </Link>

          {datasetsQuery.data?.map((dataset) => {
            const to = `/d/${dataset.id}`;
            const active = pathname === to || pathname.startsWith(to + "/");
            return (
              <Link
                key={dataset.id}
                to={to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold uppercase tracking-wider transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Folder className="h-4 w-4" />
                {dataset.name}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3">
          <div className="text-xs text-muted-foreground">
            Signed in as
            <div className="text-foreground font-bold truncate">{user?.username}</div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { logout(); navigate({ to: "/login", replace: true }); }}
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden border-b border-border bg-card px-4 py-3 flex items-center justify-between">
          <Brand to="/dashboard" />
          <Button variant="ghost" size="sm" onClick={() => { logout(); navigate({ to: "/login", replace: true }); }}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        <nav className="md:hidden flex border-b border-border bg-card overflow-x-auto">
          {NAV.map(({ to, label, Icon }) => {
            const active = pathname === to || pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 ${
                  active ? "border-primary text-primary" : "border-transparent text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}

          <Link
            to="/datasets"
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 ${
              pathname === "/datasets" || pathname.startsWith("/datasets/")
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            <Database className="h-4 w-4" />
            Manage Datasets
          </Link>

          {datasetsQuery.data?.map((dataset) => {
            const to = `/d/${dataset.id}`;
            const active = pathname === to || pathname.startsWith(to + "/");
            return (
              <Link
                key={dataset.id}
                to={to}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 ${
                  active ? "border-primary text-primary" : "border-transparent text-muted-foreground"
                }`}
              >
                <Folder className="h-4 w-4" />
                {dataset.name}
              </Link>
            );
          })}
        </nav>
        <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}