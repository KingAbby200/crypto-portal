import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import { storage, setupSession } from "./storage";
import { Admin } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends Admin {}
  }
}

export function setupAuth(app: Express) {
  setupSession(app);

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const admin = await storage.getAdminByUsername(username);
        if (!admin || admin.password !== password) {
          // Note: In a real production app, use hashed passwords (e.g. bcrypt)
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, admin);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getAdmin(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());
}
