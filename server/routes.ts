import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated } from "./replit_integrations/auth";
import { insertMachineSchema, insertFuelEntrySchema, insertReportSchema, type Machine, type FuelEntry, REIMBURSEMENT_RATE_CHF_PER_LITER } from "@shared/schema";
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

const SUPPORTED_LANGUAGES = ["fr", "de", "it", "en"] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

const languageSchema = z.enum(SUPPORTED_LANGUAGES);

function getUserId(req: any): string {
  return req.user?.claims?.sub;
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
      const data = insertMachineSchema.parse({ ...req.body, userId });
      const machine = await storage.createMachine(data);
      res.status(201).json(machine);
    } catch (error) {
      if (error instanceof z.ZodError) {
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
      const user = (req as any).user;
      const email = user?.claims?.email || `user-${userId}@mineraltax.ch`;
      
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
        success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/settings`,
        metadata: { userId },
      });
      
      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
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
      const session = await stripe.checkout.sessions.retrieve(session_id);
      
      if (session.payment_status === "paid" && session.metadata?.userId) {
        await storage.updateSubscriptionStatus(session.metadata.userId, "active");
        
        if (session.subscription) {
          await storage.updateStripeSubscriptionId(
            session.metadata.userId, 
            session.subscription as string
          );
        }
      }
      
      res.json({ success: true, status: session.payment_status });
    } catch (error) {
      console.error("Error verifying checkout:", error);
      res.status(500).json({ message: "Failed to verify checkout" });
    }
  });

  async function checkExportAllowed(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const subscription = await storage.getOrCreateSubscription(userId);
    const now = new Date();
    
    if (subscription.status === "active") {
      return { allowed: true };
    }
    
    if (subscription.status === "trial" && subscription.trialEndsAt) {
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

      const csvContent = generateTaxasCsv(report, details.machines, details.fuelEntries);
      
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="mineraltax-data-${report.id}.csv"`);
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
  loader: "Lader / Chargeuse",
  crane: "Kran / Grue",
  generator: "Stromaggregat / Groupe électrogène",
  compressor: "Kompressor / Compresseur",
  forklift: "Gabelstapler / Chariot élévateur",
  dumper: "Dumper / Tombereau",
  roller: "Walze / Rouleau",
  other: "Andere / Autre",
};

function generateTaxasCsv(
  report: any,
  machines: Machine[],
  fuelEntries: (FuelEntry & { machine?: Machine })[]
): string {
  const lines: string[] = [];
  
  lines.push("Date;Invoice_Number;Machine_Name;Machine_Type;Volume_Liters;Fuel_Type;Eligible;Rate_CHF;Amount_CHF");
  
  for (const entry of fuelEntries) {
    const machine = entry.machine || machines.find(m => m.id === entry.machineId);
    const isEligible = machine?.isEligible ?? true;
    const volumeLiters = parseFloat(entry.volumeLiters.toString());
    const rate = REIMBURSEMENT_RATE_CHF_PER_LITER;
    const amount = isEligible ? volumeLiters * rate : 0;
    
    const invoiceDate = entry.invoiceDate ? new Date(entry.invoiceDate) : null;
    const dateStr = invoiceDate && !isNaN(invoiceDate.getTime()) 
      ? invoiceDate.toISOString().split('T')[0] 
      : "";
    
    const machineType = machine?.type 
      ? (OFDF_MACHINE_TYPES[machine.type] || OFDF_MACHINE_TYPES.other) 
      : OFDF_MACHINE_TYPES.other;
    
    lines.push([
      dateStr,
      entry.invoiceNumber || "",
      machine?.name || "",
      machineType,
      volumeLiters.toFixed(2),
      entry.fuelType || "diesel",
      isEligible ? "1" : "0",
      rate.toFixed(4),
      amount.toFixed(2)
    ].join(";"));
  }
  
  lines.push("");
  lines.push("Total_Volume_Liters;Eligible_Volume_Liters;Reimbursement_Amount_CHF");
  lines.push([
    parseFloat(report.totalVolumeLiters).toFixed(2),
    parseFloat(report.eligibleVolumeLiters).toFixed(2),
    parseFloat(report.reimbursementAmount).toFixed(2)
  ].join(";"));
  
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
        eligible: "Éligible",
        yes: "Oui",
        no: "Non",
        fuelDetails: "Détail des factures de carburant",
        invoiceDate: "Date facture",
        invoiceNumber: "N° facture",
        machine: "Machine",
        volume: "Volume (L)",
        fuelType: "Type",
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
        eligible: "Berechtigt",
        yes: "Ja",
        no: "Nein",
        fuelDetails: "Treibstoffrechnungsdetails",
        invoiceDate: "Rechnungsdatum",
        invoiceNumber: "Rechnungsnr.",
        machine: "Maschine",
        volume: "Volumen (L)",
        fuelType: "Typ",
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
        eligible: "Idoneo",
        yes: "Sì",
        no: "No",
        fuelDetails: "Dettagli fatture carburante",
        invoiceDate: "Data fattura",
        invoiceNumber: "N. fattura",
        machine: "Macchina",
        volume: "Volume (L)",
        fuelType: "Tipo",
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
        eligible: "Eligible",
        yes: "Yes",
        no: "No",
        fuelDetails: "Fuel Invoice Details",
        invoiceDate: "Invoice Date",
        invoiceNumber: "Invoice No.",
        machine: "Machine",
        volume: "Volume (L)",
        fuelType: "Type",
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

    doc.fontSize(10).fillColor("#666666").text(t.authority, 50, 50, { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(8).text(t.form, { align: "center" });

    doc.moveDown(1.5);
    doc.fontSize(16).fillColor("#DC2626").text(t.title, { align: "center" });

    doc.moveDown(1.5);
    doc.fontSize(11).fillColor("#333333").text(t.period, { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#000000");
    doc.text(`${t.from}: ${formatDate(report.periodStart)}  |  ${t.to}: ${formatDate(report.periodEnd)}`);

    doc.moveDown(1);
    doc.fontSize(11).fillColor("#333333").text(t.summary, { underline: true });
    doc.moveDown(0.3);

    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 350;

    doc.rect(col1, tableTop, 495, 20).fill("#f3f4f6");
    doc.fillColor("#000000").fontSize(9);
    doc.text(t.totalVolume, col1 + 8, tableTop + 6);
    doc.text(`${formatNumber(report.totalVolumeLiters)} L`, col2, tableTop + 6, { align: "right", width: 180 });

    doc.rect(col1, tableTop + 20, 495, 20).fill("#ffffff");
    doc.text(t.eligibleVolume, col1 + 8, tableTop + 26);
    doc.text(`${formatNumber(report.eligibleVolumeLiters)} L`, col2, tableTop + 26, { align: "right", width: 180 });

    doc.rect(col1, tableTop + 40, 495, 20).fill("#f3f4f6");
    doc.text(t.rate, col1 + 8, tableTop + 46);
    doc.text(`${REIMBURSEMENT_RATE_CHF_PER_LITER} CHF/L`, col2, tableTop + 46, { align: "right", width: 180 });

    doc.rect(col1, tableTop + 60, 495, 24).fill("#DC2626");
    doc.fillColor("#ffffff").fontSize(10).font("Helvetica-Bold");
    doc.text(t.amount, col1 + 8, tableTop + 68);
    doc.text(`CHF ${formatNumber(report.reimbursementAmount)}`, col2, tableTop + 68, { align: "right", width: 180 });

    doc.font("Helvetica").fillColor("#000000");
    doc.y = tableTop + 95;

    const pageHeight = 780;
    const machineRowHeight = 14;
    const fuelRowHeight = 12;
    const headerHeight = 16;
    const machineColWidths = [200, 120, 80];

    const checkPageBreak = (neededHeight: number) => {
      if (doc.y + neededHeight > pageHeight) {
        doc.addPage();
        doc.y = 50;
      }
    };

    if (machines.length > 0) {
      checkPageBreak(40);
      doc.fontSize(11).fillColor("#333333").text(t.machinesList + ` (${machines.length})`, { underline: true });
      doc.moveDown(0.3);
      
      let machineTableTop = doc.y;
      
      doc.rect(col1, machineTableTop, 495, headerHeight).fill("#e5e7eb");
      doc.fillColor("#000000").fontSize(8).font("Helvetica-Bold");
      doc.text(t.machineName, col1 + 5, machineTableTop + 4);
      doc.text(t.machineType, col1 + machineColWidths[0] + 5, machineTableTop + 4);
      doc.text(t.eligible, col1 + machineColWidths[0] + machineColWidths[1] + 5, machineTableTop + 4);
      doc.font("Helvetica");

      let machineY = machineTableTop + headerHeight;
      machines.forEach((machine, idx) => {
        if (machineY + machineRowHeight > pageHeight) {
          doc.addPage();
          machineY = 50;
          doc.rect(col1, machineY, 495, headerHeight).fill("#e5e7eb");
          doc.fillColor("#000000").fontSize(8).font("Helvetica-Bold");
          doc.text(t.machineName, col1 + 5, machineY + 4);
          doc.text(t.machineType, col1 + machineColWidths[0] + 5, machineY + 4);
          doc.text(t.eligible, col1 + machineColWidths[0] + machineColWidths[1] + 5, machineY + 4);
          doc.font("Helvetica");
          machineY += headerHeight;
        }
        
        const bgColor = idx % 2 === 0 ? "#ffffff" : "#f9fafb";
        doc.rect(col1, machineY, 495, machineRowHeight).fill(bgColor);
        doc.fillColor("#000000").fontSize(8);
        doc.text(machine.name.substring(0, 35), col1 + 5, machineY + 3);
        doc.text(machine.type, col1 + machineColWidths[0] + 5, machineY + 3);
        doc.text(machine.isEligible ? t.yes : t.no, col1 + machineColWidths[0] + machineColWidths[1] + 5, machineY + 3);
        machineY += machineRowHeight;
      });
      
      doc.y = machineY + 10;
    }

    if (fuelEntries.length > 0) {
      checkPageBreak(40);
      doc.fontSize(11).fillColor("#333333").text(t.fuelDetails + ` (${fuelEntries.length})`, { underline: true });
      doc.moveDown(0.3);
      
      let fuelTableTop = doc.y;
      
      doc.rect(col1, fuelTableTop, 495, headerHeight).fill("#e5e7eb");
      doc.fillColor("#000000").fontSize(7).font("Helvetica-Bold");
      doc.text(t.invoiceDate, col1 + 5, fuelTableTop + 4);
      doc.text(t.invoiceNumber, col1 + 70, fuelTableTop + 4);
      doc.text(t.machine, col1 + 140, fuelTableTop + 4);
      doc.text(t.volume, col1 + 280, fuelTableTop + 4);
      doc.text(t.fuelType, col1 + 350, fuelTableTop + 4);
      doc.font("Helvetica");

      let fuelY = fuelTableTop + headerHeight;
      fuelEntries.forEach((entry, idx) => {
        if (fuelY + fuelRowHeight > pageHeight) {
          doc.addPage();
          fuelY = 50;
          doc.rect(col1, fuelY, 495, headerHeight).fill("#e5e7eb");
          doc.fillColor("#000000").fontSize(7).font("Helvetica-Bold");
          doc.text(t.invoiceDate, col1 + 5, fuelY + 4);
          doc.text(t.invoiceNumber, col1 + 70, fuelY + 4);
          doc.text(t.machine, col1 + 140, fuelY + 4);
          doc.text(t.volume, col1 + 280, fuelY + 4);
          doc.text(t.fuelType, col1 + 350, fuelY + 4);
          doc.font("Helvetica");
          fuelY += headerHeight;
        }
        
        const bgColor = idx % 2 === 0 ? "#ffffff" : "#f9fafb";
        doc.rect(col1, fuelY, 495, fuelRowHeight).fill(bgColor);
        doc.fillColor("#000000").fontSize(7);
        doc.text(formatDate(entry.invoiceDate), col1 + 5, fuelY + 3);
        doc.text((entry.invoiceNumber || "-").substring(0, 15), col1 + 70, fuelY + 3);
        doc.text((entry.machine?.name || "-").substring(0, 22), col1 + 140, fuelY + 3);
        doc.text(formatNumber(entry.volumeLiters, 1), col1 + 280, fuelY + 3);
        doc.text(entry.fuelType || "diesel", col1 + 350, fuelY + 3);
        fuelY += fuelRowHeight;
      });
      
      doc.y = fuelY + 10;
    }

    doc.moveDown(0.5);
    doc.fontSize(9).fillColor("#333333").text(t.declaration, { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(8).fillColor("#666666").text(t.declarationText);

    doc.moveDown(1);
    doc.fillColor("#000000").text("_".repeat(35), col1);
    doc.fontSize(7).text("Signature / Date", col1);

    const footerY = 780;
    doc.fontSize(7).fillColor("#999999");
    doc.text(`${t.generated}: ${formatDate(new Date())}`, 50, footerY, { align: "center", width: 495 });
    doc.moveDown(0.2);
    doc.text(`${t.taxas} | MineralTax Swiss`, { align: "center", width: 495 });

    doc.end();
  });
}
