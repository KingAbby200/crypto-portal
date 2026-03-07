import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useClients, useCreateClient, useDeleteClient } from "@/hooks/use-clients";
import { useTransactions, useUpdateTransactionStatus } from "@/hooks/use-transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { truncateAddress } from "@/lib/helpers";
import { Plus, Users, CornerRightUp, Trash2, CheckCircle2, Clock, Copy } from "lucide-react";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { data: clients, isLoading: clientsLoading } = useClients();
  const { data: transactions, isLoading: txLoading } = useTransactions();
  const createClient = useCreateClient();
  const deleteClient = useDeleteClient();
  const updateTx = useUpdateTransactionStatus();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    ethWallet: "",
    eligibleAmount: "",
    feeWallet: "",
    feeAmount: ""
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    createClient.mutate(
      {
        ...formData,
        // Send exactly what the form captures, schema coerce will handle it if mapped, otherwise it passes as string which fits pg numeric
      },
      {
        onSuccess: () => {
          toast({ title: "Client Created", description: `Unique link: /u/${formData.id}` });
          setIsDialogOpen(false);
          setFormData({ id: "", name: "", ethWallet: "", eligibleAmount: "", feeWallet: "", feeAmount: "" });
        },
        onError: (err) => {
          toast({ variant: "destructive", title: "Error", description: err.message });
        }
      }
    );
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/u/${id}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link Copied", description: "Client portal URL copied to clipboard." });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Command Center</h2>
          <p className="text-muted-foreground mt-1">Manage clients, fees, and review transactions.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-black font-semibold shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Plus className="w-4 h-4 mr-2" />
              New Client Link
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display">Create Client Link</DialogTitle>
              <DialogDescription>Generate a custom portal for a user to claim their ETH.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateClient} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Link Slug (ID)</Label>
                  <Input 
                    placeholder="e.g. john-doe" 
                    value={formData.id}
                    onChange={(e) => setFormData({...formData, id: e.target.value})}
                    required 
                    className="bg-black/50 font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Name</Label>
                  <Input 
                    placeholder="John Doe" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                    className="bg-black/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client's ETH Wallet</Label>
                  <Input 
                    placeholder="0x..." 
                    value={formData.ethWallet}
                    onChange={(e) => setFormData({...formData, ethWallet: e.target.value})}
                    required 
                    className="bg-black/50 font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Eligible Amount (ETH)</Label>
                  <Input 
                    type="number" step="any"
                    placeholder="10.5" 
                    value={formData.eligibleAmount}
                    onChange={(e) => setFormData({...formData, eligibleAmount: e.target.value})}
                    required 
                    className="bg-black/50"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-2">
                <h4 className="text-sm font-semibold mb-4 text-accent">Fee Requirements</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Admin Fee Wallet</Label>
                    <Input 
                      placeholder="0x..." 
                      value={formData.feeWallet}
                      onChange={(e) => setFormData({...formData, feeWallet: e.target.value})}
                      required 
                      className="bg-black/50 font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fee Amount (ETH)</Label>
                    <Input 
                      type="number" step="any"
                      placeholder="0.15" 
                      value={formData.feeAmount}
                      onChange={(e) => setFormData({...formData, feeAmount: e.target.value})}
                      required 
                      className="bg-black/50"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={createClient.isPending} className="bg-primary text-black w-full">
                  {createClient.isPending ? "Generating..." : "Generate Custom Link"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="clients" className="w-full">
        <TabsList className="bg-card border border-border w-full justify-start p-1 h-auto mb-6">
          <TabsTrigger value="clients" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary py-2 px-6">
            <Users className="w-4 h-4 mr-2" /> Clients
          </TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary py-2 px-6">
            <CornerRightUp className="w-4 h-4 mr-2" /> Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="mt-0">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-black/20">
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Link ID</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead className="text-right">Eligible (ETH)</TableHead>
                  <TableHead className="text-right">Fee (ETH)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientsLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading clients...</TableCell></TableRow>
                ) : clients?.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No clients generated yet.</TableCell></TableRow>
                ) : (
                  clients?.map((client) => (
                    <TableRow key={client.id} className="hover:bg-white/5">
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs cursor-pointer hover:bg-secondary/80" onClick={() => copyLink(client.id)}>
                          /u/{client.id} <Copy className="w-3 h-3 ml-1 inline" />
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{truncateAddress(client.ethWallet)}</TableCell>
                      <TableCell className="text-right text-primary font-mono">{client.eligibleAmount}</TableCell>
                      <TableCell className="text-right font-mono">{client.feeAmount}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            if (confirm("Delete this client?")) deleteClient.mutate(client.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-0">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-black/20">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Client ID</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading transactions...</TableCell></TableRow>
                ) : transactions?.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No transactions found.</TableCell></TableRow>
                ) : (
                  transactions?.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-white/5">
                      <TableCell className="text-sm text-muted-foreground">
                        {tx.date ? format(new Date(tx.date), "MMM d, yyyy HH:mm") : "Unknown"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{tx.clientId}</TableCell>
                      <TableCell className="font-mono text-primary">{tx.amountPaid} ETH</TableCell>
                      <TableCell>
                        {tx.status === 'confirmed' ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3 mr-1" /> Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {tx.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400"
                            onClick={() => updateTx.mutate({ id: tx.id, status: 'confirmed' })}
                            disabled={updateTx.isPending}
                          >
                            Mark Confirmed
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
