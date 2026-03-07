import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";
import passport from "passport";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  // auth routes
  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });
  
  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ success: true });
    });
  });
  
  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.status(200).json(req.user);
  });

  // clients
  app.get(api.clients.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const clients = await storage.getClients();
    res.json(clients);
  });

  app.get(api.clients.get.path, async (req, res) => {
    const client = await storage.getClient(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json(client);
  });

  app.post(api.clients.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.clients.create.input.parse(req.body);
      const client = await storage.createClient(input);
      res.status(201).json(client);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.put(api.clients.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.clients.update.input.parse(req.body);
      const client = await storage.updateClient(req.params.id, input);
      res.status(200).json(client);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      return res.status(404).json({ message: "Client not found" });
    }
  });

  app.delete(api.clients.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      await storage.deleteClient(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ message: "Client not found" });
    }
  });

  // transactions
  app.get(api.transactions.list.path, async (req, res) => {
    const clientId = req.query.clientId as string | undefined;
    if (!req.isAuthenticated() && !clientId) {
      return res.sendStatus(401);
    }
    
    const txs = await storage.getTransactions(clientId);
    res.json(txs);
  });

  app.post(api.transactions.create.path, async (req, res) => {
    try {
      const input = api.transactions.create.input.parse(req.body);
      const tx = await storage.createTransaction(input);
      res.status(201).json(tx);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.put(api.transactions.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.transactions.update.input.parse(req.body);
      const tx = await storage.updateTransaction(Number(req.params.id), input);
      res.status(200).json(tx);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      return res.status(404).json({ message: "Transaction not found" });
    }
  });

  app.delete(api.transactions.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      await storage.deleteTransaction(Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ message: "Transaction not found" });
    }
  });

  // Seed Admin on startup
  async function seedDatabase() {
    const admin = await storage.getAdminByUsername("admin");
    if (!admin) {
      await storage.createAdmin({
        username: "admin",
        password: "password123", // initial demo credentials
      });
    }
    const clientsList = await storage.getClients();
    if (clientsList.length === 0) {
      const c1 = await storage.createClient({
        id: "demo-client",
        name: "Satoshi Nakamoto",
        ethWallet: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
        eligibleAmount: "50.0",
        feeWallet: "0x1234567890123456789012345678901234567890",
        feeAmount: "0.5"
      });
      await storage.createTransaction({
        clientId: c1.id,
        amountPaid: "0.5",
        status: "confirmed"
      });
    }
  }

  seedDatabase().catch(console.error);

  return httpServer;
}
