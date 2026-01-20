import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import crypto from "crypto";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";
import { db } from "../../db";
import { sql } from "drizzle-orm";

function generateAuthToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function storeAuthToken(user: any): Promise<string> {
  const token = generateAuthToken();
  const expires = new Date(Date.now() + 60000); // 1 minute expiry
  const userData = JSON.stringify(user);
  
  await db.execute(sql`
    INSERT INTO auth_tokens (token, user_data, expires_at)
    VALUES (${token}, ${userData}, ${expires})
  `);
  
  return token;
}

async function consumeAuthToken(token: string): Promise<any | null> {
  const result = await db.execute(sql`
    DELETE FROM auth_tokens 
    WHERE token = ${token} AND expires_at > NOW()
    RETURNING user_data
  `);
  
  if (result.rows.length === 0) return null;
  return JSON.parse(result.rows[0].user_data as string);
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await authStorage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Get all allowed domains from REPLIT_DOMAINS (includes custom domains after publishing)
  const replitDomains = process.env.REPLIT_DOMAINS?.split(',') || [];
  const devDomain = process.env.REPLIT_DEV_DOMAIN;
  
  // Find the best domain for OAuth callback
  // Priority: 1. First domain from REPLIT_DOMAINS, 2. Dev domain, 3. Fallback
  const primaryDomain = replitDomains[0] || devDomain || `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
  const callbackURL = `https://${primaryDomain}/api/callback`;
  
  console.log("Auth setup - REPLIT_DOMAINS:", replitDomains, "Primary domain:", primaryDomain);
  
  const getHost = (req: any) => {
    return req.get('x-forwarded-host') || req.get('host') || req.hostname;
  };

  const strategy = new Strategy(
    {
      name: "replitauth",
      config,
      scope: "openid email profile offline_access",
      callbackURL,
    },
    verify
  );
  passport.use(strategy);

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    const currentHost = getHost(req);
    console.log("Login request from host:", currentHost, "primary domain:", primaryDomain);
    
    // Store the current host to redirect back after auth
    (req.session as any).returnHost = currentHost;
    
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
      }
      console.log("Session saved with returnHost:", currentHost, ", proceeding with OAuth");
      passport.authenticate("replitauth", {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    });
  });

  app.get("/api/callback", (req, res, next) => {
    const currentHost = getHost(req);
    console.log("Callback received on host:", currentHost, "session ID:", req.sessionID);
    const returnHost = (req.session as any).returnHost;
    console.log("Return host from session:", returnHost);
    
    passport.authenticate("replitauth", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Auth callback error:", err);
        return res.redirect("/api/login");
      }
      if (!user) {
        console.error("Auth callback no user, info:", info);
        return res.redirect("/api/login");
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error("Login error:", loginErr);
          return res.redirect("/api/login");
        }
        console.log("Login successful on host:", currentHost);
        
        // If return host differs from current host, use token-based redirect
        if (returnHost && returnHost !== currentHost) {
          console.log("Cross-domain auth: generating token for", returnHost);
          storeAuthToken(user).then((authToken) => {
            delete (req.session as any).returnHost;
            res.redirect(`https://${returnHost}/api/auth/token?token=${authToken}`);
          }).catch((tokenErr) => {
            console.error("Failed to store auth token:", tokenErr);
            res.redirect("/");
          });
          return;
        }
        
        return res.redirect("/");
      });
    })(req, res, next);
  });

  // Token-based session establishment for cross-domain auth
  app.get("/api/auth/token", async (req, res) => {
    const token = req.query.token as string;
    if (!token) {
      console.error("No auth token provided");
      return res.redirect("/");
    }
    
    try {
      const user = await consumeAuthToken(token);
      if (!user) {
        console.error("Invalid or expired auth token");
        return res.redirect("/");
      }
      
      console.log("Token auth successful, establishing session");
      req.logIn(user, (err) => {
        if (err) {
          console.error("Token login error:", err);
          return res.redirect("/");
        }
        return res.redirect("/");
      });
    } catch (error) {
      console.error("Token consumption error:", error);
      return res.redirect("/");
    }
  });

  app.get("/api/logout", (req, res) => {
    const currentHost = getHost(req);
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `https://${currentHost}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
