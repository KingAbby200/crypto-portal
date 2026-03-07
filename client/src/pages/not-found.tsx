import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Hexagon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute w-[600px] h-[600px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10 max-w-md"
      >
        <div className="w-24 h-24 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-2xl">
          <Hexagon className="w-12 h-12 text-primary" />
        </div>
        
        <h1 className="text-7xl font-display font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4 text-primary">Signal Lost</h2>
        <p className="text-muted-foreground mb-8">
          The node you are trying to reach does not exist on this network layer.
        </p>
        
        <Link href="/">
          <Button className="h-12 px-8 bg-white text-black hover:bg-gray-200 font-bold w-full sm:w-auto">
            Return to Root
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
