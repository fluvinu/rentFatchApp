import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brand } from "@/components/brand";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register — Fleet Console" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await register(username.trim(), password, tenantName.trim() || undefined);
      toast.success("Tenant created");
      try {
        await login(username.trim(), password);
        navigate({ to: "/dashboard", replace: true });
      } catch {
        navigate({ to: "/login", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[image:var(--gradient-dark)] flex flex-col">
      <header className="px-6 py-6"><Brand /></header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-border/60 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-3xl font-black uppercase tracking-tight">Register tenant</CardTitle>
            <CardDescription>Provision a dedicated database for your fleet.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenantName">Tenant database (optional)</Label>
                <Input id="tenantName" value={tenantName} onChange={(e) => setTenantName(e.target.value)} placeholder="auto-generated if blank" />
              </div>
              <Button type="submit" disabled={loading} className="w-full font-bold uppercase tracking-wider">
                {loading ? "Creating…" : "Create tenant"}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Already have access?{" "}
                <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}