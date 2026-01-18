import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// DÉSACTIVÉ POUR INFOMANIAK - Utiliser auth locale
// import { isAuthenticated } from "./replit_integrations/auth";
import { isLocalAuthenticated as isAuthenticated } from "./localAuth";
import { insertMachineSchema, insertFuelEntrySchema, insertReportSchema, insertCompanyProfileSchema, type Machine, type FuelEntry, type Invoice, type CompanyProfile, REIMBURSEMENT_RATE_CHF_PER_LITER, calculateReimbursement } from "@shared/schema";
import { z } from "zod";
import PDFDocument from "pdfkit";
import { getUncachableStripeClient } from "./stripeClient";
import { streamChatResponse } from "./chatAssistant";

async function getOrCreateStripePrice(stripe: any): Promise<string> {
  const productName = "MineralTax Swiss - Abonnement Annuel";
  
  const existingProducts = await stripe.products.search({
    query: `name:'${productName}'`,
  });
  
  let productId: string;
  
  if (existingProducts.data.length > 0) {
    productId = existingProducts.data[0].id;
  } else {
    const product = await stripe.products.create({
      name: productName,
      description: "Abonnement annuel MineralTax Swiss - Gestion des remboursements de l'impôt sur les huiles minérales",
    });
    productId = product.id;
  }
  
  const existingPrices = await stripe.prices.list({
    product: productId,
    active: true,
  });
  
  const matchingPrice = existingPrices.data.find(
    (p: any) => p.unit_amount === 25000 && p.currency === "chf" && p.recurring?.interval === "year"
  );
  
  if (matchingPrice) {
    return matchingPrice.id;
  }
  
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: 25000,
    currency: "chf",
    recurring: { interval: "year" },
  });
  
  return price.id;
}

async function getOrCreateOneTimePrice(stripe: any): Promise<string> {
  const productName = "MineralTax Swiss - Licence Annuelle";
  
  const existingProducts = await stripe.products.search({
    query: `name:'${productName}'`,
  });
  
  let productId: string;
  
  if (existingProducts.data.length > 0) {
    productId = existingProducts.data[0].id;
  } else {
    const product = await stripe.products.create({
      name: productName,
      description: "Licence annuelle MineralTax Swiss - Paiement unique (Twint, carte, virement)",
    });
    productId = product.id;
  }
  
  const existingPrices = await stripe.prices.list({
    product: productId,
    active: true,
  });
  
  const matchingPrice = existingPrices.data.find(
    (p: any) => p.unit_amount === 25000 && p.currency === "chf" && !p.recurring
  );
  
  if (matchingPrice) {
    return matchingPrice.id;
  }
  
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: 25000,
    currency: "chf",
  });
  
  return price.id;
}

const SUPPORTED_LANGUAGES = ["fr", "de", "it", "en"] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

async function generateInvoicePdf(invoice: Invoice): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = 545;
    const leftMargin = 50;
    const lineColor = "#cccccc";

    const formatDate = (date: Date | string) => {
      const d = new Date(date);
      return d.toLocaleDateString("fr-CH");
    };

    const formatNumber = (num: number) => {
      return new Intl.NumberFormat("fr-CH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
    };

    // Header box with title
    doc.rect(leftMargin, 40, pageWidth, 70).stroke(lineColor);
    doc.fontSize(20).fillColor("#000000").font("Helvetica-Bold");
    doc.text("FACTURE", leftMargin, 55, { align: "center", width: pageWidth });
    doc.fontSize(10).fillColor("#666666").font("Helvetica");
    doc.text("MineralTax Suisse", leftMargin, 85, { align: "center", width: pageWidth });

    // Invoice info
    doc.y = 140;
    doc.fontSize(10).fillColor("#333333");
    
    // Invoice number and date box
    doc.rect(leftMargin, 130, 250, 60).stroke(lineColor);
    doc.font("Helvetica-Bold").text("Numéro de facture:", leftMargin + 10, 140);
    doc.font("Helvetica").text(invoice.invoiceNumber, leftMargin + 130, 140);
    doc.font("Helvetica-Bold").text("Date:", leftMargin + 10, 160);
    doc.font("Helvetica").text(formatDate(invoice.createdAt || new Date()), leftMargin + 130, 160);

    // Issuer info
    doc.y = 220;
    doc.font("Helvetica-Bold").fontSize(11).text("Émetteur:", leftMargin);
    doc.font("Helvetica").fontSize(10);
    doc.text("MineralTax Suisse", leftMargin, doc.y + 5);
    doc.text("Service de gestion des remboursements", leftMargin);
    doc.text("d'impôt sur les huiles minérales", leftMargin);

    // Description table
    doc.y = 320;
    const tableY = doc.y;
    const colWidths = [350, 145];
    const rowHeight = 25;

    // Header row
    doc.rect(leftMargin, tableY, pageWidth, rowHeight).fill("#f0f0f0");
    doc.rect(leftMargin, tableY, pageWidth, rowHeight).stroke(lineColor);
    doc.rect(leftMargin, tableY, colWidths[0], rowHeight).stroke(lineColor);
    
    doc.fillColor("#000000").font("Helvetica-Bold").fontSize(10);
    doc.text("Description", leftMargin + 10, tableY + 8);
    doc.text("Montant", leftMargin + colWidths[0] + 10, tableY + 8, { width: colWidths[1] - 20, align: "right" });

    // Content row
    const contentY = tableY + rowHeight;
    doc.rect(leftMargin, contentY, pageWidth, rowHeight).stroke(lineColor);
    doc.rect(leftMargin, contentY, colWidths[0], rowHeight).stroke(lineColor);
    
    doc.font("Helvetica").fillColor("#000000");
    doc.text("Abonnement annuel MineralTax - Accès illimité", leftMargin + 10, contentY + 8);
    doc.text(`CHF ${formatNumber(invoice.amountPaid)}`, leftMargin + colWidths[0] + 10, contentY + 8, { width: colWidths[1] - 20, align: "right" });

    // Promo code if used
    if (invoice.promoCodeUsed) {
      const promoY = contentY + rowHeight;
      doc.rect(leftMargin, promoY, pageWidth, rowHeight).stroke(lineColor);
      doc.rect(leftMargin, promoY, colWidths[0], rowHeight).stroke(lineColor);
      
      doc.fillColor("#16a34a").font("Helvetica-Oblique");
      doc.text(`Code promo appliqué: ${invoice.promoCodeUsed}`, leftMargin + 10, promoY + 8);
      doc.fillColor("#000000").font("Helvetica");
    }

    // Total row
    const totalY = invoice.promoCodeUsed ? contentY + rowHeight * 2 : contentY + rowHeight;
    doc.rect(leftMargin, totalY, pageWidth, rowHeight + 5).fill("#003366");
    doc.rect(leftMargin, totalY, pageWidth, rowHeight + 5).stroke(lineColor);
    
    doc.font("Helvetica-Bold").fillColor("#ffffff").fontSize(11);
    doc.text("TOTAL", leftMargin + 10, totalY + 9);
    doc.text(`CHF ${formatNumber(invoice.amountPaid)}`, leftMargin + colWidths[0] + 10, totalY + 9, { width: colWidths[1] - 20, align: "right" });

    // Footer
    doc.font("Helvetica").fillColor("#666666").fontSize(8);
    doc.text("Merci pour votre confiance.", leftMargin, 700, { align: "center", width: pageWidth });
    doc.text(`Facture générée automatiquement le ${formatDate(new Date())}`, leftMargin, 715, { align: "center", width: pageWidth });

    doc.end();
  });
}

const languageSchema = z.enum(SUPPORTED_LANGUAGES);

function getUserId(req: any): string {
  // Pour auth locale (Infomaniak) - utiliser la session
  return req.session?.userId;
}

async function checkAndUpdateTrialStatus(subscription: any, userId: string): Promise<string> {
  if (subscription.status === "trial" && subscription.trialEndsAt) {
    const now = new Date();
    const trialEnd = new Date(subscription.trialEndsAt);
    if (now > trialEnd) {
      await storage.updateSubscriptionStatus(userId, "trial_expired");
      return "trial_expired";
    }
  }
  return subscription.status;
}

async function checkSubscriptionAccess(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const subscription = await storage.getOrCreateSubscription(userId);
  const now = new Date();
  
  const effectiveStatus = await checkAndUpdateTrialStatus(subscription, userId);
  
  if (effectiveStatus === "active") {
    return { allowed: true };
  }
  
  if (effectiveStatus === "trial" && subscription.trialEndsAt) {
    const trialEnd = new Date(subscription.trialEndsAt);
    if (now <= trialEnd) {
      return { allowed: true };
    }
  }
  
  return { allowed: false, reason: "subscription_required" };
}

function parseDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }
  return date;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/trends", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const trends = await storage.getFuelTrends(userId);
      res.json(trends);
    } catch (error) {
      console.error("Error fetching fuel trends:", error);
      res.status(500).json({ message: "Failed to fetch fuel trends" });
    }
  });

  app.get("/api/machines", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const machines = await storage.getMachines(userId);
      res.json(machines);
    } catch (error) {
      console.error("Error fetching machines:", error);
      res.status(500).json({ message: "Failed to fetch machines" });
    }
  });

  app.get("/api/machines/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const machine = await storage.getMachine(req.params.id, userId);
      if (!machine) {
        return res.status(404).json({ message: "Machine not found" });
      }
      res.json(machine);
    } catch (error) {
      console.error("Error fetching machine:", error);
      res.status(500).json({ message: "Failed to fetch machine" });
    }
  });

  app.post("/api/machines", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      console.log("Creating machine for user:", userId);
      console.log("Request body:", req.body);
      
      const accessCheck = await checkSubscriptionAccess(userId);
      console.log("Subscription access check:", accessCheck);
      if (!accessCheck.allowed) {
        return res.status(403).json({ 
          message: "Subscription required to add machines",
          code: accessCheck.reason 
        });
      }
      
      const data = insertMachineSchema.parse({ ...req.body, userId });
      console.log("Parsed machine data:", data);
      const machine = await storage.createMachine(data);
      console.log("Machine created:", machine);
      res.status(201).json(machine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating machine:", error);
      res.status(500).json({ message: "Failed to create machine" });
    }
  });

  app.patch("/api/machines/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const updateData = {
        ...req.body,
        year: req.body.year ? parseInt(req.body.year, 10) : undefined,
      };
      const machine = await storage.updateMachine(req.params.id, userId, updateData);
      if (!machine) {
        return res.status(404).json({ message: "Machine not found" });
      }
      res.json(machine);
    } catch (error) {
      console.error("Error updating machine:", error);
      res.status(500).json({ message: "Failed to update machine" });
    }
  });

  app.delete("/api/machines/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const deleted = await storage.deleteMachine(req.params.id, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Machine not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting machine:", error);
      res.status(500).json({ message: "Failed to delete machine" });
    }
  });

  app.get("/api/fuel-entries", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const entries = await storage.getFuelEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching fuel entries:", error);
      res.status(500).json({ message: "Failed to fetch fuel entries" });
    }
  });

  app.get("/api/fuel-entries/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const entry = await storage.getFuelEntry(req.params.id, userId);
      if (!entry) {
        return res.status(404).json({ message: "Fuel entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error fetching fuel entry:", error);
      res.status(500).json({ message: "Failed to fetch fuel entry" });
    }
  });

  app.post("/api/fuel-entries", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      
      const accessCheck = await checkSubscriptionAccess(userId);
      if (!accessCheck.allowed) {
        return res.status(403).json({ 
          message: "Subscription required to add fuel entries",
          code: accessCheck.reason 
        });
      }
      
      let invoiceDate: Date;
      try {
        invoiceDate = parseDate(req.body.invoiceDate);
      } catch (err) {
        return res.status(400).json({ message: "Invalid date format. Use ISO 8601 format." });
      }
      
      const data = insertFuelEntrySchema.parse({
        ...req.body,
        userId,
        invoiceDate,
        volumeLiters: parseFloat(req.body.volumeLiters),
        engineHours: req.body.engineHours ? parseFloat(req.body.engineHours) : null,
      });
      const entry = await storage.createFuelEntry(data);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating fuel entry:", error);
      res.status(500).json({ message: "Failed to create fuel entry" });
    }
  });

  app.patch("/api/fuel-entries/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      
      let invoiceDate: Date | undefined;
      if (req.body.invoiceDate) {
        try {
          invoiceDate = parseDate(req.body.invoiceDate);
        } catch (err) {
          return res.status(400).json({ message: "Invalid date format. Use ISO 8601 format." });
        }
      }
      
      const updateData = {
        ...req.body,
        invoiceDate,
        volumeLiters: req.body.volumeLiters ? parseFloat(req.body.volumeLiters) : undefined,
        engineHours: req.body.engineHours ? parseFloat(req.body.engineHours) : undefined,
      };
      const entry = await storage.updateFuelEntry(req.params.id, userId, updateData);
      if (!entry) {
        return res.status(404).json({ message: "Fuel entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error updating fuel entry:", error);
      res.status(500).json({ message: "Failed to update fuel entry" });
    }
  });

  app.delete("/api/fuel-entries/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const deleted = await storage.deleteFuelEntry(req.params.id, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Fuel entry not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting fuel entry:", error);
      res.status(500).json({ message: "Failed to delete fuel entry" });
    }
  });

  app.get("/api/reports", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const reports = await storage.getReports(userId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post("/api/reports", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      
      const accessCheck = await checkSubscriptionAccess(userId);
      if (!accessCheck.allowed) {
        return res.status(403).json({ 
          message: "Subscription required to generate reports",
          code: accessCheck.reason 
        });
      }
      
      const { periodStart, periodEnd, language } = req.body;

      const validatedLanguage = languageSchema.safeParse(language);
      if (!validatedLanguage.success) {
        return res.status(400).json({ message: "Invalid language. Supported: fr, de, it, en" });
      }

      let startDate: Date;
      let endDate: Date;
      try {
        startDate = parseDate(periodStart);
        endDate = parseDate(periodEnd);
      } catch (err) {
        return res.status(400).json({ message: "Invalid date format. Use ISO 8601 format." });
      }

      const reportData = await storage.calculateReportData(userId, startDate, endDate);

      const data = insertReportSchema.parse({
        userId,
        periodStart: startDate,
        periodEnd: endDate,
        totalVolumeLiters: reportData.totalVolumeLiters,
        eligibleVolumeLiters: reportData.eligibleVolumeLiters,
        reimbursementAmount: reportData.reimbursementAmount,
        status: "draft",
        language: validatedLanguage.data,
      });

      const report = await storage.createReport(data);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  app.post("/api/reports/audit", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { periodStart, periodEnd } = req.body;
      
      let startDate: Date;
      let endDate: Date;
      try {
        startDate = parseDate(periodStart);
        endDate = parseDate(periodEnd);
      } catch (err) {
        return res.status(400).json({ message: "Invalid date format. Use ISO 8601 format." });
      }
      
      const fuelEntries = await storage.getFuelEntries(userId);
      const machines = await storage.getMachines(userId);
      
      const entriesInPeriod = fuelEntries.filter(entry => {
        const entryDate = new Date(entry.invoiceDate);
        return entryDate >= startDate && entryDate <= endDate;
      });
      
      const findings: { type: "error" | "warning"; code: string; message: string; details?: any }[] = [];
      
      const invoiceGroups = new Map<string, typeof entriesInPeriod>();
      entriesInPeriod.forEach(entry => {
        if (entry.invoiceNumber) {
          const key = `${entry.machineId}-${entry.invoiceNumber}`;
          const group = invoiceGroups.get(key) || [];
          group.push(entry);
          invoiceGroups.set(key, group);
        }
      });
      
      invoiceGroups.forEach((entries, key) => {
        if (entries.length > 1) {
          const machine = machines.find(m => m.id === entries[0].machineId);
          findings.push({
            type: "error",
            code: "DUPLICATE_INVOICE",
            message: `Facture en double détectée: ${entries[0].invoiceNumber}`,
            details: {
              invoiceNumber: entries[0].invoiceNumber,
              machineName: machine?.name || "Unknown",
              count: entries.length,
            },
          });
        }
      });
      
      const machineVolumes = new Map<string, number>();
      entriesInPeriod.forEach(entry => {
        const current = machineVolumes.get(entry.machineId) || 0;
        machineVolumes.set(entry.machineId, current + Number(entry.volumeLiters));
      });
      
      machineVolumes.forEach((totalVolume, machineId) => {
        const machine = machines.find(m => m.id === machineId);
        if (totalVolume > 50000) {
          findings.push({
            type: "warning",
            code: "HIGH_VOLUME",
            message: `Volume élevé pour ${machine?.name || "Unknown"}: ${totalVolume.toLocaleString()} L`,
            details: {
              machineName: machine?.name || "Unknown",
              volume: totalVolume,
            },
          });
        }
      });
      
      entriesInPeriod.forEach(entry => {
        if (Number(entry.volumeLiters) <= 0) {
          findings.push({
            type: "error",
            code: "INVALID_VOLUME",
            message: `Volume invalide: ${entry.volumeLiters} L`,
            details: {
              entryId: entry.id,
              volume: entry.volumeLiters,
            },
          });
        }
      });
      
      const machinesWithoutTaxas = machines.filter(m => 
        m.isEligible && !m.taxasActivity
      );
      machinesWithoutTaxas.forEach(machine => {
        findings.push({
          type: "warning",
          code: "MISSING_TAXAS_CATEGORY",
          message: `Catégorie Taxas manquante: ${machine.name}`,
          details: {
            machineId: machine.id,
            machineName: machine.name,
          },
        });
      });
      
      const auditResult = {
        periodStart: startDate.toISOString(),
        periodEnd: endDate.toISOString(),
        summary: {
          machinesChecked: machines.length,
          entriesAnalyzed: entriesInPeriod.length,
          errors: findings.filter(f => f.type === "error").length,
          warnings: findings.filter(f => f.type === "warning").length,
        },
        findings,
        isValid: findings.filter(f => f.type === "error").length === 0,
      };
      
      res.json(auditResult);
    } catch (error) {
      console.error("Error running audit:", error);
      res.status(500).json({ message: "Failed to run audit" });
    }
  });

  app.get("/api/subscription", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const subscription = await storage.getOrCreateSubscription(userId);
      
      const now = new Date();
      let effectiveStatus = subscription.status;
      let trialDaysRemaining = 0;
      
      if (subscription.status === "trial" && subscription.trialEndsAt) {
        const trialEnd = new Date(subscription.trialEndsAt);
        if (now > trialEnd) {
          effectiveStatus = "trial_expired";
          await storage.updateSubscriptionStatus(userId, "trial_expired");
        } else {
          trialDaysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
        }
      }
      
      res.json({
        ...subscription,
        status: effectiveStatus,
        trialDaysRemaining,
        canExport: effectiveStatus === "trial" || effectiveStatus === "active",
      });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  app.post("/api/checkout", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      // Récupérer l'email depuis la base de données (auth locale)
      const dbUser = await storage.getUser(userId);
      const email = dbUser?.email || `user-${userId}@mineraltax.ch`;
      
      const stripe = await getUncachableStripeClient();
      const subscription = await storage.getOrCreateSubscription(userId);
      
      let customerId = subscription.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email,
          metadata: { userId },
        });
        customerId = customer.id;
        await storage.updateStripeCustomerId(userId, customerId);
      }
      
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      
      const priceId = await getOrCreateStripePrice(stripe);
      
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/settings`,
        metadata: { userId },
        allow_promotion_codes: true,
      });
      
      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.post("/api/checkout/onetime", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const dbUser = await storage.getUser(userId);
      const email = dbUser?.email || `user-${userId}@mineraltax.ch`;
      
      const stripe = await getUncachableStripeClient();
      const subscription = await storage.getOrCreateSubscription(userId);
      
      let customerId = subscription.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email,
          metadata: { userId },
        });
        customerId = customer.id;
        await storage.updateStripeCustomerId(userId, customerId);
      }
      
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      
      const priceId = await getOrCreateOneTimePrice(stripe);
      
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "payment",
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&type=onetime`,
        cancel_url: `${baseUrl}/settings`,
        metadata: { userId, paymentType: "onetime" },
        allow_promotion_codes: true,
      });
      
      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating one-time checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.get("/api/checkout/success", isAuthenticated, async (req, res) => {
    try {
      const { session_id } = req.query;
      if (!session_id || typeof session_id !== "string") {
        return res.status(400).json({ message: "Missing session_id" });
      }
      
      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ['total_details.breakdown']
      });
      
      if (session.payment_status === "paid" && session.metadata?.userId) {
        const userId = session.metadata.userId;
        await storage.updateSubscriptionStatus(userId, "active");
        
        if (session.subscription) {
          await storage.updateStripeSubscriptionId(userId, session.subscription as string);
        }
        
        // Set license period for one-time payments only (1 year from payment)
        // Only apply to one-time payments, not subscriptions
        if (session.mode === "payment" && !session.subscription) {
          const paymentTimestamp = session.created ? session.created * 1000 : Date.now();
          const periodStart = new Date(paymentTimestamp);
          const periodEnd = new Date(paymentTimestamp);
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
          await storage.updateSubscriptionPeriod(userId, periodStart, periodEnd);
          console.log(`[License] One-time payment: Set expiration to ${periodEnd.toISOString()} for user ${userId}`);
        }
        
        // Create invoice if not already created for this session
        const existingInvoices = await storage.getInvoices(userId);
        const alreadyCreated = existingInvoices.some(inv => inv.stripeSessionId === session_id);
        
        if (!alreadyCreated) {
          const invoiceNumber = await storage.getNextInvoiceNumber();
          const amountPaid = (session.amount_total || 25000) / 100; // Convert from cents
          
          // Check if promo code was used
          let promoCodeUsed: string | undefined;
          if (session.total_details?.breakdown?.discounts?.length) {
            const discount = session.total_details.breakdown.discounts[0];
            if (discount.discount?.promotion_code) {
              try {
                const promoCode = await stripe.promotionCodes.retrieve(discount.discount.promotion_code as string);
                promoCodeUsed = promoCode.code;
              } catch (e) {
                // Ignore if can't retrieve promo code
              }
            }
          }
          
          await storage.createInvoice({
            userId,
            invoiceNumber,
            amountPaid,
            currency: "CHF",
            promoCodeUsed,
            stripeSessionId: session_id,
          });
          console.log(`[Invoice] Created ${invoiceNumber} for user ${userId}`);
        }
      }
      
      res.json({ success: true, status: session.payment_status });
    } catch (error) {
      console.error("Error verifying checkout:", error);
      res.status(500).json({ message: "Failed to verify checkout" });
    }
  });

  // Company profile endpoints
  app.get("/api/company-profile", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const profile = await storage.getCompanyProfile(userId);
      res.json(profile || null);
    } catch (error) {
      console.error("Error fetching company profile:", error);
      res.status(500).json({ message: "Failed to fetch company profile" });
    }
  });

  app.post("/api/company-profile", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const data = insertCompanyProfileSchema.parse({ ...req.body, userId });
      const profile = await storage.createOrUpdateCompanyProfile(data);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error saving company profile:", error);
      res.status(500).json({ message: "Failed to save company profile" });
    }
  });

  // Invoice endpoints
  app.get("/api/invoices", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const invoices = await storage.getInvoices(userId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id/pdf", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const invoice = await storage.getInvoice(req.params.id, userId);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      const pdfBuffer = await generateInvoicePdf(invoice);
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${invoice.invoiceNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating invoice PDF:", error);
      res.status(500).json({ message: "Failed to generate invoice PDF" });
    }
  });

  async function checkExportAllowed(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const subscription = await storage.getOrCreateSubscription(userId);
    const now = new Date();
    
    const effectiveStatus = await checkAndUpdateTrialStatus(subscription, userId);
    
    if (effectiveStatus === "active") {
      return { allowed: true };
    }
    
    if (effectiveStatus === "trial" && subscription.trialEndsAt) {
      const trialEnd = new Date(subscription.trialEndsAt);
      if (now <= trialEnd) {
        return { allowed: true };
      }
    }
    
    return { allowed: false, reason: "subscription_required" };
  }

  app.get("/api/reports/:id/pdf", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      
      const exportCheck = await checkExportAllowed(userId);
      if (!exportCheck.allowed) {
        return res.status(403).json({ 
          message: "Subscription required to export reports",
          code: exportCheck.reason 
        });
      }
      
      const report = await storage.getReport(req.params.id, userId);
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      const details = await storage.getReportDetails(
        userId, 
        new Date(report.periodStart), 
        new Date(report.periodEnd)
      );

      const pdfBuffer = await generatePdf(report, details.machines, details.fuelEntries);
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="mineraltax-report-${report.id}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  app.get("/api/reports/:id/csv", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      
      const exportCheck = await checkExportAllowed(userId);
      if (!exportCheck.allowed) {
        return res.status(403).json({ 
          message: "Subscription required to export reports",
          code: exportCheck.reason 
        });
      }
      
      const report = await storage.getReport(req.params.id, userId);
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      const details = await storage.getReportDetails(
        userId, 
        new Date(report.periodStart), 
        new Date(report.periodEnd)
      );

      const companyProfile = await storage.getCompanyProfile(userId);
      
      const missingFields: string[] = [];
      if (!companyProfile?.rcNumber) {
        missingFields.push("N° RC (Registre du Commerce)");
      }
      
      const entriesWithMissingFields = details.fuelEntries.filter((entry: any) => {
        return !entry.articleNumber || !entry.warehouseNumber;
      });
      
      if (entriesWithMissingFields.length > 0) {
        missingFields.push(`${entriesWithMissingFields.length} entrée(s) sans N° article ou N° entrepôt`);
      }
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          message: "Champs Taxas manquants pour l'export",
          code: "TAXAS_FIELDS_MISSING",
          missingFields
        });
      }
      
      const csvContent = generateTaxasCsv(report, details.machines, details.fuelEntries, companyProfile);
      
      const fiscalYear = new Date().getFullYear() - 1;
      const filename = `MineralTax_Export_${fiscalYear}_${report.id}.csv`;
      
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(csvContent);
    } catch (error) {
      console.error("Error generating CSV:", error);
      res.status(500).json({ message: "Failed to generate CSV" });
    }
  });

  app.post("/api/chat", async (req: any, res: any) => {
    try {
      const { message, history = [] } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      await streamChatResponse(
        message,
        history,
        (chunk: string) => {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }
      );

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Chat error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Erreur de chat" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Erreur de chat" });
      }
    }
  });

  return httpServer;
}

const OFDF_MACHINE_TYPES: Record<string, string> = {
  excavator: "Bagger / Excavatrice",
  spider_excavator: "Schreitbagger / Pelle araignée",
  loader: "Lader / Chargeuse",
  crane: "Kran / Grue",
  drill: "Bohrgerät / Foreuse",
  finisher: "Fertiger / Finisseur",
  milling_machine: "Fräsmaschine / Fraiseuse",
  roller: "Walze / Rouleau",
  generator: "Stromaggregat / Groupe électrogène",
  compressor: "Kompressor / Compresseur",
  forklift: "Gabelstapler / Chariot élévateur",
  dumper: "Dumper / Tombereau",
  crusher: "Brecher / Concasseur",
  concrete_pump: "Betonpumpe / Pompe à béton",
  other: "Andere / Autre",
};

const TAXAS_ACTIVITY_CODES: Record<string, string> = {
  agriculture_with_direct: "AGRI_DIRECT",
  agriculture_without_direct: "AGRI_NO_DIRECT",
  forestry: "SYLV",
  rinsing: "RINC",
  concession_transport: "TRANSP_CONC",
  natural_stone: "PIERRE_NAT",
  snow_groomer: "DAMEUSE",
  professional_fishing: "PECHE",
  stationary_generator: "STAT_GEN",
  stationary_cleaning: "STAT_NETT",
  stationary_combustion: "STAT_COMB",
  construction: "CONSTRUCT",
  other_taxas: "AUTRE",
};

function formatSwissDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function generateTaxasCsv(
  report: any,
  machines: Machine[],
  fuelEntries: (FuelEntry & { machine?: Machine })[],
  companyProfile?: any
): string {
  const lines: string[] = [];
  
  lines.push("RC;N° matricule;N° châssis;N° article;N° entrepôt;Date mouvement;N° mouvement;Quantité de litres / kg;BD;Stat.;CI;Montant de l'impôt CHF");
  
  const companyRcNumber = companyProfile?.rcNumber || "";
  
  for (const entry of fuelEntries) {
    const machine = entry.machine || machines.find(m => m.id === entry.machineId);
    const machineData = machine as any;
    const isEligible = machine?.isEligible ?? true;
    const volumeLiters = parseFloat(entry.volumeLiters.toString());
    const amount = isEligible ? calculateReimbursement(volumeLiters) : 0;
    
    const invoiceDate = entry.invoiceDate ? new Date(entry.invoiceDate) : null;
    const dateStr = invoiceDate && !isNaN(invoiceDate.getTime()) 
      ? formatSwissDate(invoiceDate)
      : "";
    
    const entryData = entry as any;
    
    const rcNumber = machineData?.rcNumber || companyRcNumber;
    const registrationNumber = machineData?.registrationNumber || "";
    const chassisNumber = machineData?.chassisNumber || "";
    
    lines.push([
      rcNumber,
      registrationNumber,
      chassisNumber,
      entryData.articleNumber || "",
      entryData.warehouseNumber || "",
      dateStr,
      entryData.movementNumber || entry.invoiceNumber || "",
      volumeLiters.toFixed(2),
      entryData.bd || "",
      entryData.stat || "",
      entryData.ci || "",
      amount.toFixed(2)
    ].join(";"));
  }
  
  return lines.join("\n");
}

async function generatePdf(
  report: any, 
  machines: Machine[], 
  fuelEntries: (FuelEntry & { machine?: Machine })[]
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const lang = (report.language || "fr") as SupportedLanguage;
    
    const translations: Record<SupportedLanguage, Record<string, string>> = {
      fr: {
        title: "Demande de remboursement de l'impôt sur les huiles minérales",
        authority: "Office fédéral de la douane et de la sécurité des frontières (OFDF)",
        form: "Référence: Formulaire 45.35",
        period: "Période de remboursement",
        from: "Du",
        to: "Au",
        summary: "Récapitulatif",
        totalVolume: "Volume total de carburant",
        eligibleVolume: "Volume éligible au remboursement",
        rate: "Taux de remboursement OFDF",
        amount: "Montant du remboursement demandé",
        generated: "Document généré le",
        footer: "Ce document a été généré par MineralTax Swiss et sert de justificatif pour le formulaire officiel 45.35 de l'administration fédérale suisse.",
        taxas: "Compatible avec l'application Taxas",
        declaration: "Déclaration de conformité",
        declarationText: "Je certifie que les données ci-dessus sont exactes et que le carburant déclaré a été utilisé exclusivement pour des machines hors route éligibles au remboursement de l'impôt sur les huiles minérales conformément à la législation suisse en vigueur.",
        machinesList: "Liste des machines",
        machineName: "Nom",
        machineType: "Type",
        machineVin: "N° châssis (VIN)",
        machineYear: "Année",
        eligible: "Éligible",
        yes: "Oui",
        no: "Non",
        fuelDetails: "Détail des factures de carburant",
        invoiceDate: "Date facture",
        invoiceNumber: "N° facture",
        machine: "Machine",
        volume: "Volume (L)",
        fuelType: "Type",
        reportTitle: "RAPPORT DE REMBOURSEMENT DES HUILES MINÉRALES",
        generatedBy: "Généré par MineralTax Suisse",
        litersConsumed: "Litres consommés",
        reimbursementChf: "Remboursement (CHF)",
        total: "TOTAL",
      },
      de: {
        title: "Antrag auf Rückerstattung der Mineralölsteuer",
        authority: "Bundesamt für Zoll und Grenzsicherheit (BAZG)",
        form: "Referenz: Formular 45.35",
        period: "Rückerstattungsperiode",
        from: "Von",
        to: "Bis",
        summary: "Zusammenfassung",
        totalVolume: "Gesamtvolumen Treibstoff",
        eligibleVolume: "Rückerstattungsberechtigtes Volumen",
        rate: "BAZG-Rückerstattungssatz",
        amount: "Beantragter Rückerstattungsbetrag",
        generated: "Dokument erstellt am",
        footer: "Dieses Dokument wurde von MineralTax Swiss erstellt und dient als Nachweis für das offizielle Formular 45.35 der schweizerischen Bundesverwaltung.",
        taxas: "Kompatibel mit der Taxas-Anwendung",
        declaration: "Konformitätserklärung",
        declarationText: "Ich bestätige, dass die oben genannten Angaben korrekt sind und der deklarierte Treibstoff ausschliesslich für Offroad-Maschinen verwendet wurde, die gemäss der geltenden schweizerischen Gesetzgebung zur Rückerstattung der Mineralölsteuer berechtigt sind.",
        machinesList: "Maschinenliste",
        machineName: "Name",
        machineType: "Typ",
        machineVin: "Fahrgestellnr. (VIN)",
        machineYear: "Baujahr",
        eligible: "Berechtigt",
        yes: "Ja",
        no: "Nein",
        fuelDetails: "Treibstoffrechnungsdetails",
        invoiceDate: "Rechnungsdatum",
        invoiceNumber: "Rechnungsnr.",
        machine: "Maschine",
        volume: "Volumen (L)",
        fuelType: "Typ",
        reportTitle: "MINERALÖLSTEUER-RÜCKERSTATTUNGSBERICHT",
        generatedBy: "Erstellt von MineralTax Schweiz",
        litersConsumed: "Verbrauchte Liter",
        reimbursementChf: "Rückerstattung (CHF)",
        total: "TOTAL",
      },
      it: {
        title: "Richiesta di rimborso dell'imposta sugli oli minerali",
        authority: "Amministrazione federale delle dogane e della sicurezza dei confini (AFD)",
        form: "Riferimento: Modulo 45.35",
        period: "Periodo di rimborso",
        from: "Dal",
        to: "Al",
        summary: "Riepilogo",
        totalVolume: "Volume totale di carburante",
        eligibleVolume: "Volume idoneo al rimborso",
        rate: "Tasso di rimborso AFD",
        amount: "Importo del rimborso richiesto",
        generated: "Documento generato il",
        footer: "Questo documento è stato generato da MineralTax Swiss e serve come giustificativo per il modulo ufficiale 45.35 dell'amministrazione federale svizzera.",
        taxas: "Compatibile con l'applicazione Taxas",
        declaration: "Dichiarazione di conformità",
        declarationText: "Certifico che i dati sopra riportati sono esatti e che il carburante dichiarato è stato utilizzato esclusivamente per macchine fuoristrada idonee al rimborso dell'imposta sugli oli minerali ai sensi della legislazione svizzera vigente.",
        machinesList: "Elenco delle macchine",
        machineName: "Nome",
        machineType: "Tipo",
        machineVin: "N. telaio (VIN)",
        machineYear: "Anno",
        eligible: "Idoneo",
        yes: "Sì",
        no: "No",
        fuelDetails: "Dettagli fatture carburante",
        invoiceDate: "Data fattura",
        invoiceNumber: "N. fattura",
        machine: "Macchina",
        volume: "Volume (L)",
        fuelType: "Tipo",
        reportTitle: "RAPPORTO DI RIMBORSO DELL'IMPOSTA SUGLI OLI MINERALI",
        generatedBy: "Generato da MineralTax Svizzera",
        litersConsumed: "Litri consumati",
        reimbursementChf: "Rimborso (CHF)",
        total: "TOTALE",
      },
      en: {
        title: "Mineral Oil Tax Reimbursement Request",
        authority: "Federal Office for Customs and Border Security (FOCBS)",
        form: "Reference: Form 45.35",
        period: "Reimbursement Period",
        from: "From",
        to: "To",
        summary: "Summary",
        totalVolume: "Total Fuel Volume",
        eligibleVolume: "Eligible Volume for Reimbursement",
        rate: "FOCBS Reimbursement Rate",
        amount: "Requested Reimbursement Amount",
        generated: "Document generated on",
        footer: "This document was generated by MineralTax Swiss and serves as supporting documentation for the official Form 45.35 of the Swiss federal administration.",
        taxas: "Compatible with Taxas application",
        declaration: "Declaration of Compliance",
        declarationText: "I certify that the above data is accurate and that the declared fuel was used exclusively for off-road machines eligible for mineral oil tax reimbursement in accordance with current Swiss legislation.",
        machinesList: "Machines List",
        machineName: "Name",
        machineType: "Type",
        machineVin: "Chassis No. (VIN)",
        machineYear: "Year",
        eligible: "Eligible",
        yes: "Yes",
        no: "No",
        fuelDetails: "Fuel Invoice Details",
        invoiceDate: "Invoice Date",
        invoiceNumber: "Invoice No.",
        machine: "Machine",
        volume: "Volume (L)",
        fuelType: "Type",
        reportTitle: "MINERAL OIL TAX REIMBURSEMENT REPORT",
        generatedBy: "Generated by MineralTax Switzerland",
        litersConsumed: "Liters consumed",
        reimbursementChf: "Reimbursement (CHF)",
        total: "TOTAL",
      },
    };

    const t = translations[lang] || translations.fr;
    const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const formatDate = (date: Date | string) => {
      const d = new Date(date);
      return d.toLocaleDateString(lang === "en" ? "en-GB" : lang === "de" ? "de-CH" : lang === "it" ? "it-CH" : "fr-CH");
    };

    const formatNumber = (num: number, decimals = 2) => {
      return new Intl.NumberFormat(lang === "en" ? "en-CH" : lang === "de" ? "de-CH" : lang === "it" ? "it-CH" : "fr-CH", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(num);
    };

    const pageWidth = 545;
    const leftMargin = 50;
    const lineColor = "#cccccc";
    const headerBg = "#f0f0f0";

    doc.rect(leftMargin, 40, pageWidth, 70).stroke(lineColor);
    doc.fontSize(16).fillColor("#000000").font("Helvetica-Bold");
    doc.text(t.reportTitle, leftMargin, 55, { align: "center", width: pageWidth });
    doc.fontSize(10).fillColor("#666666").font("Helvetica");
    doc.text(t.generatedBy, leftMargin, 80, { align: "center", width: pageWidth });
    
    doc.moveDown(2);
    doc.y = 130;

    doc.fontSize(9).fillColor("#333333");
    doc.text(`${t.authority}`, leftMargin);
    doc.text(`${t.form}`, leftMargin);
    doc.moveDown(0.5);
    doc.text(`${t.period}: ${formatDate(report.periodStart)} - ${formatDate(report.periodEnd)}`, leftMargin);
    doc.moveDown(1);

    const machineVolumes: Map<string, number> = new Map();
    fuelEntries.forEach((entry) => {
      if (entry.machine?.isEligible) {
        const machineId = entry.machineId;
        const current = machineVolumes.get(machineId) || 0;
        machineVolumes.set(machineId, current + entry.volumeLiters);
      }
    });

    const colWidths = [120, 130, 50, 90, 100];
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);
    const rowHeight = 18;
    let tableY = doc.y;

    const drawTableRow = (y: number, cols: string[], isHeader = false, isBold = false) => {
      if (isHeader) {
        doc.rect(leftMargin, y, tableWidth, rowHeight).fill(headerBg);
      }
      doc.rect(leftMargin, y, tableWidth, rowHeight).stroke(lineColor);
      
      let x = leftMargin;
      cols.forEach((text, i) => {
        doc.rect(x, y, colWidths[i], rowHeight).stroke(lineColor);
        
        if (isHeader || isBold) {
          doc.font("Helvetica-Bold");
        } else {
          doc.font("Helvetica");
        }
        
        const align = i >= 3 ? "right" : "left";
        const padding = align === "right" ? 5 : 5;
        doc.fillColor("#000000").fontSize(8);
        doc.text(text, x + padding, y + 5, { 
          width: colWidths[i] - 10, 
          align,
          lineBreak: false 
        });
        x += colWidths[i];
      });
    };

    drawTableRow(tableY, [t.machineName, t.machineVin, t.machineYear, t.litersConsumed, t.reimbursementChf], true);
    tableY += rowHeight;

    let totalLiters = 0;
    let totalReimbursement = 0;

    machines.filter(m => m.isEligible).forEach((machine) => {
      const liters = machineVolumes.get(machine.id) || 0;
      if (liters > 0) {
        const reimbursement = calculateReimbursement(liters);
        totalLiters += liters;
        totalReimbursement += reimbursement;
        
        drawTableRow(tableY, [
          machine.name.substring(0, 20),
          (machine.chassisNumber || "-").substring(0, 22),
          machine.year?.toString() || "-",
          formatNumber(liters, 1),
          formatNumber(reimbursement)
        ]);
        tableY += rowHeight;
      }
    });

    doc.rect(leftMargin, tableY, tableWidth, rowHeight + 4).fill("#003366");
    doc.rect(leftMargin, tableY, tableWidth, rowHeight + 4).stroke(lineColor);
    
    let x = leftMargin;
    doc.font("Helvetica-Bold").fillColor("#ffffff").fontSize(9);
    doc.text(t.total, x + 5, tableY + 6, { width: colWidths[0] + colWidths[1] + colWidths[2] - 10 });
    x += colWidths[0] + colWidths[1] + colWidths[2];
    doc.text(formatNumber(totalLiters, 1), x + 5, tableY + 6, { width: colWidths[3] - 10, align: "right" });
    x += colWidths[3];
    doc.text(`CHF ${formatNumber(totalReimbursement)}`, x + 5, tableY + 6, { width: colWidths[4] - 10, align: "right" });

    doc.font("Helvetica").fillColor("#000000");
    doc.y = tableY + rowHeight + 30;

    doc.fontSize(9).fillColor("#333333").text(t.declaration, { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(8).fillColor("#666666").text(t.declarationText);

    doc.moveDown(1.5);
    doc.fillColor("#000000").text("_".repeat(40), leftMargin);
    doc.fontSize(7).text("Signature / Date", leftMargin);

    const footerY = 780;
    doc.fontSize(7).fillColor("#999999");
    doc.text(`${t.generated}: ${formatDate(new Date())}`, 50, footerY, { align: "center", width: 495 });
    doc.moveDown(0.2);
    doc.text(`${t.taxas} | MineralTax Swiss`, { align: "center", width: 495 });

    doc.end();
  });
}
