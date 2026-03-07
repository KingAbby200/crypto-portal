import { Link, useRoute } from "wouter";
import { Home, History, Coins } from "lucide-react";
import { motion } from "framer-motion";

export function ClientLayout({ children, clientId }: { children: React.ReactNode; clientId: string }) {
  const [isHome] = useRoute("/u/:id");
  const [isHistory] = useRoute("/u/:id/history");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative pb-24">
      {/* Cool subtle background accents */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[40vh] bg-primary/10 blur-[100px] pointer-events-none rounded-full" />
      
      <header className="p-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Coins className="w-6 h-6 text-black" />
          </div>
          <span className="font-display font-bold text-xl tracking-wide">Nexus<span className="text-primary">Pay</span></span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:hidden">
        <div className="glass-panel rounded-2xl flex items-center justify-around p-2 px-4 shadow-2xl shadow-black/80">
          <Link href={`/u/${clientId}`} className="flex-1">
            <div className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${isHome ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              <Home className={`w-6 h-6 ${isHome ? 'fill-primary/20' : ''}`} />
              <span className="text-[10px] font-medium mt-1">Home</span>
            </div>
          </Link>
          <div className="w-px h-8 bg-border/50 mx-2" />
          <Link href={`/u/${clientId}/history`} className="flex-1">
            <div className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${isHistory ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              <History className={`w-6 h-6 ${isHistory ? 'fill-primary/20' : ''}`} />
              <span className="text-[10px] font-medium mt-1">History</span>
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
}
