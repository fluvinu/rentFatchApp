import { Link } from "@tanstack/react-router";

export function Brand({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 group">
      <div className="h-9 w-9 rounded-md bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)] flex items-center justify-center font-black text-primary-foreground">
        F
      </div>
      <div className="leading-tight">
        <div className="text-sm font-black tracking-widest uppercase">Fleet</div>
        <div className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase">Console</div>
      </div>
    </Link>
  );
}