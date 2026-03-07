import { useRoute } from "wouter";
import { motion } from "framer-motion";
import { useClient } from "@/hooks/use-clients";
import { useTransactions } from "@/hooks/use-transactions";
import { ClientLayout } from "@/components/ClientLayout";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, ArrowRightLeft } from "lucide-react";
import { format } from "date-fns";

export default function ClientHistory() {
  const [, params] = useRoute("/u/:id/history");
  const id = params?.id || "";
  
  const { data: client, isLoading: clientLoading } = useClient(id);
  const { data: transactions, isLoading: txLoading } = useTransactions(id);

  const isLoading = clientLoading || txLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-2xl font-display font-bold">Client Not Found</h1>
      </div>
    );
  }

  return (
    <ClientLayout clientId={client.id}>
      <div className="pt-8 pb-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2">Commission History</h1>
          <p className="text-muted-foreground mb-8">Track your payment statuses and settlement records.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.1, duration: 0.5 }}
          className="space-y-4"
        >
          {!transactions || transactions.length === 0 ? (
            <div className="glass-panel rounded-2xl p-10 text-center border-dashed border-white/10">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRightLeft className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No Transactions Yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Once you initiate a withdrawal and pay the fee, your history will appear here.
              </p>
            </div>
          ) : (
            transactions.map((tx, index) => (
              <motion.div 
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + (index * 0.05) }}
                className="glass-panel rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl mt-1 ${tx.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {tx.status === 'confirmed' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Fee Payment Report</h4>
                    <p className="text-sm text-muted-foreground mb-1">
                      {tx.date ? format(new Date(tx.date), "MMM d, yyyy • HH:mm a") : "Date Unknown"}
                    </p>
                    <div className="inline-flex mt-1">
                      {tx.status === 'confirmed' ? (
                         <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/5 text-[10px]">VERIFIED</Badge>
                      ) : (
                         <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/5 text-[10px]">AWAITING ADMIN CONFIRMATION</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="sm:text-right pl-14 sm:pl-0">
                  <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Amount</p>
                  <p className="font-mono text-xl text-primary font-bold">{tx.amountPaid} ETH</p>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </ClientLayout>
  );
}
