import type { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { db } from "./db";
import { users, registerUserSchema, loginUserSchema, companyProfiles } from "@shared/schema";
import { eq } from "drizzle-orm";

const BCRYPT_ROUNDS = 12;

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export function isLocalAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session?.userId) {
    return next();
  }
  return res.status(401).json({ message: "Authentication required" });
}

export async function getLocalUser(req: Request) {
  if (!req.session?.userId) {
    return null;
  }
  const [user] = await db.select().from(users).where(eq(users.id, req.session.userId));
  return user || null;
}

export function registerLocalAuthRoutes(app: Express): void {
  app.post("/api/auth/local/register", async (req: Request, res: Response) => {
    try {
      const validation = registerUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Données invalides",
          errors: validation.error.errors
        });
      }

      const { email, password, firstName, lastName, activitySector, companyName } = validation.data;

      const [existingUser] = await db.select().from(users).where(eq(users.email, email));
      if (existingUser) {
        return res.status(409).json({ message: "Un compte existe déjà avec cet email" });
      }

      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

      const [newUser] = await db.insert(users).values({
        email,
        passwordHash,
        authProvider: "local",
        passwordSet: true,
        firstName: firstName || null,
        lastName: lastName || null,
        activitySector: activitySector || null,
      }).returning();

      // Créer automatiquement un profil d'entreprise si la raison sociale est fournie
      if (companyName && companyName.trim().length > 0) {
        await db.insert(companyProfiles).values({
          userId: newUser.id,
          companyName: companyName.trim(),
        });
      }

      req.session.userId = newUser.id;

      const { passwordHash: _, passwordResetToken: __, passwordResetExpires: ___, ...safeUser } = newUser;
      res.status(201).json(safeUser);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Erreur lors de l'inscription" });
    }
  });

  app.post("/api/auth/local/login", async (req: Request, res: Response) => {
    try {
      const validation = loginUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Données invalides",
          errors: validation.error.errors
        });
      }

      const { email, password } = validation.data;

      const [user] = await db.select().from(users).where(eq(users.email, email));

      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      const passwordValid = await bcrypt.compare(password, user.passwordHash);
      if (!passwordValid) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      req.session.userId = user.id;

      const { passwordHash: _, passwordResetToken: __, passwordResetExpires: ___, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Erreur lors de la connexion" });
    }
  });

  app.post("/api/auth/local/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Erreur lors de la déconnexion" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Déconnecté avec succès" });
    });
  });

  app.get("/api/auth/local/user", async (req: Request, res: Response) => {
    try {
      const user = await getLocalUser(req);
      if (!user) {
        return res.status(401).json({ message: "Non authentifié" });
      }
      const { passwordHash: _, passwordResetToken: __, passwordResetExpires: ___, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur" });
    }
  });
}
