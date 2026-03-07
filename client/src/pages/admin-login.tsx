import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useLogin, useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, LockKeyhole } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: user } = useAuth();
  const login = useLogin();

  // Redirect if already logged in
  if (user) {
    setLocation("/admin");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { username, password },
      {
        onSuccess: () => {
          toast({ title: "Access Granted", description: "Welcome to the admin dashboard." });
          setLocation("/admin");
        },
        onError: () => {
          toast({ variant: "destructive", title: "Access Denied", description: "Invalid credentials provided." });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="glass-panel p-8 md:p-12 rounded-3xl relative z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
          
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-secondary border border-white/10 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-display font-bold mb-2">System Access</h1>
            <p className="text-muted-foreground text-sm">Secure administrative portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Admin ID</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="bg-black/50 border-white/10 focus-visible:ring-primary h-12 px-4 font-mono text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Passcode</Label>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-black/50 border-white/10 focus-visible:ring-primary h-12 pl-12 pr-4 font-mono"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-black font-bold text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all mt-4"
              disabled={login.isPending}
            >
              {login.isPending ? "Authenticating..." : "Initialize Session"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
