import { Link, useLocation } from "wouter";
import { LogOut, LayoutDashboard, ShieldAlert } from "lucide-react";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const logout = useLogout();

  // Protect route
  if (!isLoading && !user) {
    setLocation("/admin-login");
    return null;
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-card/30 backdrop-blur-md flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-border/50">
          <ShieldAlert className="w-8 h-8 text-accent" />
          <div>
            <h1 className="font-display font-bold text-lg">Admin Core</h1>
            <p className="text-xs text-muted-foreground font-mono">v2.0.1</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="mb-4 px-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Logged in as</p>
            <p className="font-mono text-sm mt-1">{user?.username}</p>
          </div>
          <Button 
            variant="destructive" 
            className="w-full justify-start gap-2"
            onClick={() => logout.mutate()}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
