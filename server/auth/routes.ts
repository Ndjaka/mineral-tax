import type { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { lucia } from "./lucia";
import { db } from "../db";
import { users, registerUserSchema, loginUserSchema, resetPasswordRequestSchema, resetPasswordSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import { createEmailVerificationToken, verifyEmailToken, createPasswordResetToken, verifyPasswordResetToken, getBaseUrl } from "./utils";
import { sendVerificationEmail, sendPasswordResetEmail } from "../emailService";

const BCRYPT_ROUNDS = 12;

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      email: string | null;
      emailVerified: boolean | null;
      firstName: string | null;
      lastName: string | null;
      profileImageUrl: string | null;
    };
    sessionId?: string;
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.cookies[lucia.sessionCookieName];
  
  if (!sessionId) {
    req.user = undefined;
    req.sessionId = undefined;
    return next();
  }

  const { session, user } = await lucia.validateSession(sessionId);
  
  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id);
    res.cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  }
  
  if (!session) {
    const blankCookie = lucia.createBlankSessionCookie();
    res.cookie(blankCookie.name, blankCookie.value, blankCookie.attributes);
  }

  req.user = user ?? undefined;
  req.sessionId = session?.id;
  return next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentification requise" });
  }
  return next();
}

export function requireVerifiedEmail(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentification requise" });
  }
  const skipVerification = process.env.SKIP_EMAIL_VERIFICATION === "true";
  if (!skipVerification && !req.user.emailVerified) {
    return res.status(403).json({ message: "Veuillez verifier votre email avant de continuer" });
  }
  return next();
}

export function registerAuthRoutes(app: Express): void {
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validation = registerUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Donnees invalides", 
          errors: validation.error.errors 
        });
      }

      const { email, password, firstName, lastName } = validation.data;

      const [existingUser] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      if (existingUser) {
        return res.status(409).json({ message: "Un compte existe deja avec cet email" });
      }

      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const skipVerification = process.env.SKIP_EMAIL_VERIFICATION === "true";

      const [newUser] = await db.insert(users).values({
        email: email.toLowerCase(),
        passwordHash,
        authProvider: "local",
        passwordSet: true,
        emailVerified: skipVerification ? true : false,
        emailVerifiedAt: skipVerification ? new Date() : null,
        firstName: firstName || null,
        lastName: lastName || null,
      }).returning();

      if (skipVerification) {
        console.log(`[Auth] SKIP_EMAIL_VERIFICATION enabled - account auto-verified for ${email}`);
        const session = await lucia.createSession(newUser.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        res.cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        return res.status(201).json({ 
          message: "Compte cree et verifie automatiquement (mode developpement).",
          emailSent: false,
          autoVerified: true
        });
      }

      const verificationToken = await createEmailVerificationToken(newUser.id);
      const verificationUrl = `${getBaseUrl()}/verify-email?token=${verificationToken}`;

      await sendVerificationEmail(email, firstName || "", verificationUrl);

      res.status(201).json({ 
        message: "Compte cree. Veuillez verifier votre email pour activer votre compte.",
        emailSent: true
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Erreur lors de l'inscription" });
    }
  });

  app.post("/api/auth/verify-email", async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      
      if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Token invalide" });
      }

      const userId = await verifyEmailToken(token);
      
      if (!userId) {
        return res.status(400).json({ message: "Le lien de verification est invalide ou a expire" });
      }

      await db.update(users)
        .set({ 
          emailVerified: true, 
          emailVerifiedAt: new Date() 
        })
        .where(eq(users.id, userId));

      const session = await lucia.createSession(userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      res.cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

      res.json({ message: "Email verifie avec succes", verified: true });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Erreur lors de la verification" });
    }
  });

  app.post("/api/auth/resend-verification", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email requis" });
      }

      const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      
      if (!user) {
        return res.json({ message: "Si un compte existe avec cet email, un nouveau lien a ete envoye" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: "Cet email est deja verifie" });
      }

      const verificationToken = await createEmailVerificationToken(user.id);
      const verificationUrl = `${getBaseUrl()}/verify-email?token=${verificationToken}`;

      console.log(`[Auth] Resending verification email to ${email}`);
      console.log(`[Auth] Verification URL: ${verificationUrl}`);
      
      const emailSent = await sendVerificationEmail(email, user.firstName || "", verificationUrl);
      console.log(`[Auth] Email sent result: ${emailSent}`);

      res.json({ message: "Un nouveau lien de verification a ete envoye", emailSent });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Erreur lors de l'envoi" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const validation = loginUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Donnees invalides", 
          errors: validation.error.errors 
        });
      }

      const { email, password } = validation.data;

      const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      const passwordValid = await bcrypt.compare(password, user.passwordHash);
      if (!passwordValid) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      if (!user.emailVerified) {
        return res.status(403).json({ 
          message: "Veuillez verifier votre email avant de vous connecter",
          emailNotVerified: true,
          email: user.email
        });
      }

      const session = await lucia.createSession(user.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      res.cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

      res.json({ 
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        emailVerified: user.emailVerified
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Erreur lors de la connexion" });
    }
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      if (req.sessionId) {
        await lucia.invalidateSession(req.sessionId);
      }
      
      const blankCookie = lucia.createBlankSessionCookie();
      res.cookie(blankCookie.name, blankCookie.value, blankCookie.attributes);
      
      res.json({ message: "Deconnecte avec succes" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Erreur lors de la deconnexion" });
    }
  });

  app.get("/api/auth/user", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Non authentifie" });
    }
    
    const [user] = await db.select().from(users).where(eq(users.id, req.user.id));
    
    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouve" });
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      emailVerified: user.emailVerified
    });
  });

  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const validation = resetPasswordRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Email invalide", 
          errors: validation.error.errors 
        });
      }

      const { email } = validation.data;

      const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      
      res.json({ message: "Si un compte existe avec cet email, un lien de reinitialisation a ete envoye" });

      if (user && user.passwordHash) {
        const resetToken = await createPasswordResetToken(user.id);
        const resetUrl = `${getBaseUrl()}/reset-password?token=${resetToken}`;
        await sendPasswordResetEmail(email, user.firstName || "", resetUrl);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Erreur lors de la demande" });
    }
  });

  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const validation = resetPasswordSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Donnees invalides", 
          errors: validation.error.errors 
        });
      }

      const { token, password } = validation.data;

      const userId = await verifyPasswordResetToken(token);
      
      if (!userId) {
        return res.status(400).json({ message: "Le lien de reinitialisation est invalide ou a expire" });
      }

      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

      await db.update(users)
        .set({ 
          passwordHash,
          passwordSet: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      res.json({ message: "Mot de passe reinitialise avec succes" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Erreur lors de la reinitialisation" });
    }
  });
}
