import { pgTable, text, serial, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const clients = pgTable("clients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  ethWallet: text("eth_wallet").notNull(),
  eligibleAmount: numeric("eligible_amount").notNull(),
  feeWallet: text("fee_wallet").notNull(),
  feeAmount: numeric("fee_amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  clientId: text("client_id").notNull(),
  amountPaid: numeric("amount_paid").notNull(),
  status: text("status").notNull().default('pending'), // 'pending', 'confirmed'
  date: timestamp("date").defaultNow(),
});

export const clientsRelations = relations(clients, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  client: one(clients, {
    fields: [transactions.clientId],
    references: [clients.id],
  }),
}));

export const insertAdminSchema = createInsertSchema(admins).omit({ id: true });
export const insertClientSchema = createInsertSchema(clients).omit({ createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, date: true });

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
