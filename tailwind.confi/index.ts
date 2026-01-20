import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { authMiddleware, registerAuthRoutes } from "./auth/routes";
import { getStripeClient } from "./stripeClient";
import { storage } from "./storage";
import { sendWelcomeEmail } from "./emailService";
import { startScheduledJobs } from "./scheduledJobs";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];
    if (!signature) {
      return res.status(400).json({ error: "Missing stripe-signature" });
    }

    try {
      const stripe = await getStripeClient();
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      if (!webhookSecret) {
        console.log("STRIPE_WEBHOOK_SECRET not set, skipping webhook verification");
        return res.status(200).json({ received: true });
      }

      const sig = Array.isArray(signature) ? signature[0] : signature;
      const event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
      
      console.log(`Stripe webhook received: ${event.type}`);
      
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;
        const userId = session.metadata?.userId;
        
        if (userId) {
          console.log(`Activating subscription for user ${userId}`);
          await storage.updateSubscriptionStatus(userId, "active");
          if (session.customer) {
            await storage.updateStripeCustomerId(userId, session.customer);
          }
          if (session.subscription) {
            await storage.updateStripeSubscriptionId(userId, session.subscription);
            
            const subscription = await stripe.subscriptions.retrieve(session.subscription) as any;
            if (subscription.current_period_end) {
              await storage.updateSubscriptionPeriod(
                userId, 
                new Date(subscription.current_period_start * 1000),
                new Date(subscription.current_period_end * 1000)
              );
            }
          }
          
          const customerEmail = session.customer_details?.email || session.customer_email;
          const customerName = session.customer_details?.name || session.metadata?.customerName || "Client";
          
          if (customerEmail) {
            const baseUrl = process.env.REPLIT_DEV_DOMAIN 
              ? `https://${process.env.REPLIT_DEV_DOMAIN}`
              : process.env.BASE_URL || 'https://mineraltax.ch';
            
            await sendWelcomeEmail({
              to: customerEmail,
              customerName: customerName,
              dashboardUrl: `${baseUrl}/dashboard`
            });
          }
        }
      }
      
      if (event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription;
        
        if (subscriptionId && invoice.billing_reason === "subscription_cycle") {
          console.log(`Subscription renewed: ${subscriptionId}`);
          const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
          const user = await storage.findUserByStripeSubscriptionId(subscriptionId);
          
          if (user) {
            await storage.updateSubscriptionStatus(user.id, "active");
            await storage.updateSubscriptionPeriod(
              user.id,
              new Date(subscription.current_period_start * 1000),
              new Date(subscription.current_period_end * 1000)
            );
            console.log(`Renewed subscription for user ${user.id} until ${new Date(subscription.current_period_end * 1000)}`);
          }
        }
      }
      
      if (event.type === "invoice.payment_failed") {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription;
        
        if (subscriptionId) {
          console.log(`Payment failed for subscription: ${subscriptionId}`);
          const user = await storage.findUserByStripeSubscriptionId(subscriptionId);
          
          if (user) {
            await storage.updateSubscriptionStatus(user.id, "inactive");
            console.log(`Marked user ${user.id} as inactive due to payment failure`);
          }
        }
      }
      
      if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object as any;
        const subscriptionId = subscription.id;
        
        console.log(`Subscription cancelled: ${subscriptionId}`);
        const user = await storage.findUserByStripeSubscriptionId(subscriptionId);
        
        if (user) {
          await storage.updateSubscriptionStatus(user.id, "cancelled");
          console.log(`Marked user ${user.id} as cancelled`);
        }
      }
      
      if (event.type === "customer.subscription.updated") {
        const subscription = event.data.object as any;
        const subscriptionId = subscription.id;
        
        const user = await storage.findUserByStripeSubscriptionId(subscriptionId);
        if (user) {
          if (subscription.status === "active") {
            await storage.updateSubscriptionStatus(user.id, "active");
            await storage.updateSubscriptionPeriod(
              user.id,
              new Date(subscription.current_period_start * 1000),
              new Date(subscription.current_period_end * 1000)
            );
          } else if (subscription.status === "past_due") {
            await storage.updateSubscriptionStatus(user.id, "inactive");
          } else if (subscription.status === "canceled" || subscription.status === "unpaid") {
            await storage.updateSubscriptionStatus(user.id, "cancelled");
          }
          console.log(`Updated subscription status for user ${user.id}: ${subscription.status}`);
        }
      }
      
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error("Webhook error:", error.message);
      res.status(400).json({ error: "Webhook processing error" });
    }
  }
);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      // Skip logging 401 on auth check - expected when user is not logged in
      if (path === "/api/auth/user" && res.statusCode === 401) {
        return;
      }
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  app.set("trust proxy", 1);
  app.use(cookieParser());
  
  app.use(authMiddleware);
  
  registerAuthRoutes(app);
  
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
      startScheduledJobs();
    },
  );
})();
