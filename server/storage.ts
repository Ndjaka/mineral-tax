import {
  machines,
  fuelEntries,
  reports,
  subscriptions,
  invoices,
  companyProfiles,
  users,
  agriculturalSurfaces,
  constructionSites,
  machineSiteAssignments,
  type Machine,
  type InsertMachine,
  type FuelEntry,
  type InsertFuelEntry,
  type Report,
  type InsertReport,
  type Subscription,
  type InsertSubscription,
  type Invoice,
  type InsertInvoice,
  type CompanyProfile,
  type InsertCompanyProfile,
  type User,
  type AgriculturalSurface,
  type InsertAgriculturalSurface,
  type ConstructionSite,
  type InsertConstructionSite,
  type MachineSiteAssignment,
  type InsertMachineSiteAssignment,
  REIMBURSEMENT_RATE_CHF_PER_LITER,
  calculateReimbursement,
  calculateReimbursementBySectorAndDate,
  getApplicableRate,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql, or, lt, gt, inArray } from "drizzle-orm";

export interface IStorage {
  getUser(userId: string): Promise<User | undefined>;
  getMachines(userId: string): Promise<Machine[]>;
  getMachine(id: string, userId: string): Promise<Machine | undefined>;
  createMachine(data: InsertMachine): Promise<Machine>;
  updateMachine(id: string, userId: string, data: Partial<InsertMachine>): Promise<Machine | undefined>;
  deleteMachine(id: string, userId: string): Promise<boolean>;

  getFuelEntries(userId: string): Promise<(FuelEntry & { machine?: Machine })[]>;
  getFuelEntry(id: string, userId: string): Promise<FuelEntry | undefined>;
  createFuelEntry(data: InsertFuelEntry): Promise<FuelEntry>;
  updateFuelEntry(id: string, userId: string, data: Partial<InsertFuelEntry>): Promise<FuelEntry | undefined>;
  deleteFuelEntry(id: string, userId: string): Promise<boolean>;

  getReports(userId: string): Promise<Report[]>;
  getReport(id: string, userId: string): Promise<Report | undefined>;
  createReport(data: InsertReport): Promise<Report>;

  getSubscription(userId: string): Promise<Subscription | undefined>;
  getOrCreateSubscription(userId: string): Promise<Subscription>;
  createOrUpdateSubscription(data: InsertSubscription): Promise<Subscription>;
  updateSubscriptionStatus(userId: string, status: string): Promise<Subscription | undefined>;
  markTrialReminderSent(userId: string): Promise<void>;
  getTrialExpiringTomorrow(): Promise<Subscription[]>;
  getLicensesExpiringInDays(days: number): Promise<(Subscription & { user?: User })[]>;
  getActiveSubscriptionsForQuarterlyReminder(): Promise<Subscription[]>;
  markQuarterlyReminderSent(userId: string): Promise<void>;
  markRenewalReminderSent(userId: string, days: number): Promise<void>;
  hasRenewalReminderBeenSent(subscription: Subscription, days: number): boolean;
  updateStripeCustomerId(userId: string, stripeCustomerId: string): Promise<void>;
  updateStripeSubscriptionId(userId: string, stripeSubscriptionId: string): Promise<void>;
  updateSubscriptionPeriod(userId: string, periodStart: Date, periodEnd: Date): Promise<void>;
  findUserByStripeSubscriptionId(stripeSubscriptionId: string): Promise<User | undefined>;

  getDashboardStats(userId: string): Promise<{
    totalMachines: number;
    totalFuelEntries: number;
    totalVolume: number;
    eligibleVolume: number;
    estimatedReimbursement: number;
    pendingReports: number;
  }>;

  getFuelTrends(userId: string): Promise<{
    month: string;
    volume: number;
    reimbursement: number;
  }[]>;

  calculateReportData(userId: string, periodStart: Date, periodEnd: Date): Promise<{
    totalVolumeLiters: number;
    eligibleVolumeLiters: number;
    reimbursementAmount: number;
  }>;

  getReportDetails(userId: string, periodStart: Date, periodEnd: Date): Promise<{
    machines: Machine[];
    fuelEntries: (FuelEntry & { machine?: Machine })[];
  }>;

  getInvoices(userId: string): Promise<Invoice[]>;
  getInvoice(id: string, userId: string): Promise<Invoice | undefined>;
  createInvoice(data: InsertInvoice): Promise<Invoice>;
  getNextInvoiceNumber(): Promise<string>;

  getCompanyProfile(userId: string): Promise<CompanyProfile | undefined>;
  createOrUpdateCompanyProfile(data: InsertCompanyProfile): Promise<CompanyProfile>;

  // Surfaces Agricoles (données déclaratives uniquement)
  getAgriculturalSurfaces(userId: string): Promise<AgriculturalSurface[]>;
  getAgriculturalSurface(id: string, userId: string): Promise<AgriculturalSurface | undefined>;
  createAgriculturalSurface(data: InsertAgriculturalSurface): Promise<AgriculturalSurface>;
  updateAgriculturalSurface(id: string, userId: string, data: Partial<InsertAgriculturalSurface>): Promise<AgriculturalSurface | undefined>;
  deleteAgriculturalSurface(id: string, userId: string): Promise<boolean>;

  // Chantiers BTP (traçabilité uniquement)
  getConstructionSites(userId: string): Promise<ConstructionSite[]>;
  getConstructionSite(id: string, userId: string): Promise<ConstructionSite | undefined>;
  createConstructionSite(data: InsertConstructionSite): Promise<ConstructionSite>;
  updateConstructionSite(id: string, userId: string, data: Partial<InsertConstructionSite>): Promise<ConstructionSite | undefined>;
  deleteConstructionSite(id: string, userId: string): Promise<boolean>;

  // Affectations Machine ↔ Chantier
  getMachineSiteAssignments(userId: string): Promise<(MachineSiteAssignment & { machine?: Machine; site?: ConstructionSite })[]>;
  getMachineSiteAssignmentsBySite(siteId: string): Promise<(MachineSiteAssignment & { machine?: Machine })[]>;
  createMachineSiteAssignment(data: InsertMachineSiteAssignment): Promise<MachineSiteAssignment>;
  deleteMachineSiteAssignment(id: string): Promise<boolean>;
  checkAssignmentOverlap(machineId: string, startDate: Date, endDate: Date | null, excludeId?: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(userId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user;
  }

  async getMachines(userId: string): Promise<Machine[]> {
    return db.select().from(machines).where(eq(machines.userId, userId)).orderBy(desc(machines.createdAt));
  }

  async getMachine(id: string, userId: string): Promise<Machine | undefined> {
    const [machine] = await db.select().from(machines).where(and(eq(machines.id, id), eq(machines.userId, userId)));
    return machine;
  }

  async createMachine(data: InsertMachine): Promise<Machine> {
    const [machine] = await db.insert(machines).values(data).returning();
    return machine;
  }

  async updateMachine(id: string, userId: string, data: Partial<InsertMachine>): Promise<Machine | undefined> {
    const [machine] = await db
      .update(machines)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(machines.id, id), eq(machines.userId, userId)))
      .returning();
    return machine;
  }

  async deleteMachine(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(machines).where(and(eq(machines.id, id), eq(machines.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async getFuelEntries(userId: string): Promise<(FuelEntry & { machine?: Machine })[]> {
    const entries = await db
      .select()
      .from(fuelEntries)
      .leftJoin(machines, eq(fuelEntries.machineId, machines.id))
      .where(eq(fuelEntries.userId, userId))
      .orderBy(desc(fuelEntries.createdAt));

    return entries.map((row) => ({
      ...row.fuel_entries,
      machine: row.machines || undefined,
    }));
  }

  async getFuelEntry(id: string, userId: string): Promise<FuelEntry | undefined> {
    const [entry] = await db.select().from(fuelEntries).where(and(eq(fuelEntries.id, id), eq(fuelEntries.userId, userId)));
    return entry;
  }

  async createFuelEntry(data: InsertFuelEntry): Promise<FuelEntry> {
    const [entry] = await db.insert(fuelEntries).values(data).returning();
    return entry;
  }

  async updateFuelEntry(id: string, userId: string, data: Partial<InsertFuelEntry>): Promise<FuelEntry | undefined> {
    const [entry] = await db
      .update(fuelEntries)
      .set(data)
      .where(and(eq(fuelEntries.id, id), eq(fuelEntries.userId, userId)))
      .returning();
    return entry;
  }

  async deleteFuelEntry(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(fuelEntries).where(and(eq(fuelEntries.id, id), eq(fuelEntries.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async getReports(userId: string): Promise<Report[]> {
    return db.select().from(reports).where(eq(reports.userId, userId)).orderBy(desc(reports.createdAt));
  }

  async getReport(id: string, userId: string): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(and(eq(reports.id, id), eq(reports.userId, userId)));
    return report;
  }

  async createReport(data: InsertReport): Promise<Report> {
    const [report] = await db.insert(reports).values(data).returning();
    return report;
  }

  async getSubscription(userId: string): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
    return subscription;
  }

  async getOrCreateSubscription(userId: string): Promise<Subscription> {
    let subscription = await this.getSubscription(userId);
    if (!subscription) {
      const now = new Date();
      const trialEnds = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
      [subscription] = await db
        .insert(subscriptions)
        .values({
          userId,
          status: "trial",
          trialStartAt: now,
          trialEndsAt: trialEnds,
        })
        .returning();
    }
    return subscription;
  }

  async createOrUpdateSubscription(data: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db
      .insert(subscriptions)
      .values(data)
      .onConflictDoUpdate({
        target: subscriptions.userId,
        set: { ...data, updatedAt: new Date() },
      })
      .returning();
    return subscription;
  }

  async updateSubscriptionStatus(userId: string, status: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .update(subscriptions)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(subscriptions.userId, userId))
      .returning();
    return subscription;
  }

  async markTrialReminderSent(userId: string): Promise<void> {
    await db
      .update(subscriptions)
      .set({ trialReminderSent: true, updatedAt: new Date() })
      .where(eq(subscriptions.userId, userId));
  }

  async getTrialExpiringTomorrow(): Promise<Subscription[]> {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    return db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.status, "trial"),
          eq(subscriptions.trialReminderSent, false),
          gte(subscriptions.trialEndsAt, tomorrow),
          lte(subscriptions.trialEndsAt, dayAfter)
        )
      );
  }

  async getLicensesExpiringInDays(days: number): Promise<(Subscription & { user?: User })[]> {
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);
    const targetDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const nextDay = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);

    const expiringSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.status, "active"),
          sql`${subscriptions.stripeSubscriptionId} IS NULL`,
          gte(subscriptions.currentPeriodEnd, targetDate),
          lte(subscriptions.currentPeriodEnd, nextDay)
        )
      );

    const results: (Subscription & { user?: User })[] = [];
    for (const sub of expiringSubscriptions) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, sub.userId));
      results.push({ ...sub, user });
    }

    return results;
  }

  async getActiveSubscriptionsForQuarterlyReminder(): Promise<Subscription[]> {
    const now = new Date();
    const currentMonth = now.getMonth();
    const quarterEndMonths = [2, 5, 8, 11];

    if (!quarterEndMonths.includes(currentMonth)) {
      return [];
    }

    const quarterStart = new Date(now.getFullYear(), currentMonth, 1);

    return db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.status, "active"),
          sql`(${subscriptions.quarterlyReminderLastSent} IS NULL OR ${subscriptions.quarterlyReminderLastSent} < ${quarterStart})`
        )
      );
  }

  async markQuarterlyReminderSent(userId: string): Promise<void> {
    await db
      .update(subscriptions)
      .set({ quarterlyReminderLastSent: new Date(), updatedAt: new Date() })
      .where(eq(subscriptions.userId, userId));
  }

  async markRenewalReminderSent(userId: string, days: number): Promise<void> {
    const fieldMap: Record<number, any> = {
      30: { renewalReminder30DaysSent: new Date() },
      7: { renewalReminder7DaysSent: new Date() },
      1: { renewalReminder1DaySent: new Date() },
    };
    const updateFields = fieldMap[days];
    if (updateFields) {
      await db
        .update(subscriptions)
        .set({ ...updateFields, updatedAt: new Date() })
        .where(eq(subscriptions.userId, userId));
    }
  }

  hasRenewalReminderBeenSent(subscription: Subscription, days: number): boolean {
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    let sentDate: Date | null = null;
    if (days === 30) sentDate = subscription.renewalReminder30DaysSent;
    else if (days === 7) sentDate = subscription.renewalReminder7DaysSent;
    else if (days === 1) sentDate = subscription.renewalReminder1DaySent;

    if (!sentDate) return false;

    const sentDateNormalized = new Date(sentDate);
    sentDateNormalized.setUTCHours(0, 0, 0, 0);

    return sentDateNormalized.getTime() === now.getTime();
  }

  async updateStripeCustomerId(userId: string, stripeCustomerId: string): Promise<void> {
    await db
      .update(subscriptions)
      .set({ stripeCustomerId, updatedAt: new Date() })
      .where(eq(subscriptions.userId, userId));
  }

  async updateStripeSubscriptionId(userId: string, stripeSubscriptionId: string): Promise<void> {
    await db
      .update(subscriptions)
      .set({ stripeSubscriptionId, updatedAt: new Date() })
      .where(eq(subscriptions.userId, userId));
  }

  async updateSubscriptionPeriod(userId: string, periodStart: Date, periodEnd: Date): Promise<void> {
    await db
      .update(subscriptions)
      .set({
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.userId, userId));
  }

  async findUserByStripeSubscriptionId(stripeSubscriptionId: string): Promise<User | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));

    if (!subscription) return undefined;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, subscription.userId));

    return user;
  }

  async getDashboardStats(userId: string): Promise<{
    totalMachines: number;
    totalFuelEntries: number;
    totalVolume: number;
    eligibleVolume: number;
    estimatedReimbursement: number;
    pendingReports: number;
  }> {
    const machineCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(machines)
      .where(eq(machines.userId, userId));

    const entryStats = await db
      .select({
        count: sql<number>`count(*)::int`,
        totalVolume: sql<number>`coalesce(sum(${fuelEntries.volumeLiters}), 0)::real`,
      })
      .from(fuelEntries)
      .where(eq(fuelEntries.userId, userId));

    const eligibleStats = await db
      .select({
        eligibleVolume: sql<number>`coalesce(sum(${fuelEntries.volumeLiters}), 0)::real`,
      })
      .from(fuelEntries)
      .leftJoin(machines, eq(fuelEntries.machineId, machines.id))
      .where(and(eq(fuelEntries.userId, userId), eq(machines.isEligible, true)));

    const pendingReportsCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(reports)
      .where(and(eq(reports.userId, userId), eq(reports.status, "draft")));

    const totalVolume = entryStats[0]?.totalVolume || 0;
    const eligibleVolume = eligibleStats[0]?.eligibleVolume || 0;

    // Calcul du remboursement avec le nouveau système bi-secteur
    // On récupère toutes les entrées éligibles avec leurs machines pour calculer précisément
    const eligibleEntries = await db
      .select()
      .from(fuelEntries)
      .leftJoin(machines, eq(fuelEntries.machineId, machines.id))
      .where(and(eq(fuelEntries.userId, userId), eq(machines.isEligible, true)));

    let estimatedReimbursement = 0;
    for (const row of eligibleEntries) {
      if (row.fuel_entries && row.machines) {
        estimatedReimbursement += calculateReimbursementBySectorAndDate(
          row.fuel_entries.volumeLiters,
          row.fuel_entries.invoiceDate,
          row.machines.taxasActivity
        );
      }
    }

    return {
      totalMachines: machineCount[0]?.count || 0,
      totalFuelEntries: entryStats[0]?.count || 0,
      totalVolume,
      eligibleVolume,
      estimatedReimbursement,
      pendingReports: pendingReportsCount[0]?.count || 0,
    };
  }

  async getFuelTrends(userId: string): Promise<{
    month: string;
    volume: number;
    reimbursement: number;
  }[]> {
    // Récupérer toutes les entrées éligibles avec leurs machines
    const entries = await db
      .select()
      .from(fuelEntries)
      .leftJoin(machines, eq(fuelEntries.machineId, machines.id))
      .where(
        and(
          eq(fuelEntries.userId, userId),
          eq(machines.isEligible, true)
        )
      )
      .orderBy(fuelEntries.invoiceDate);

    // Grouper par mois et calculer le remboursement avec les taux appropriés
    const monthlyData = new Map<string, { volume: number; reimbursement: number }>();

    for (const row of entries) {
      if (row.fuel_entries && row.machines) {
        const monthKey = new Date(row.fuel_entries.invoiceDate).toISOString().substring(0, 7); // YYYY-MM
        const existing = monthlyData.get(monthKey) || { volume: 0, reimbursement: 0 };

        existing.volume += row.fuel_entries.volumeLiters;
        existing.reimbursement += calculateReimbursementBySectorAndDate(
          row.fuel_entries.volumeLiters,
          row.fuel_entries.invoiceDate,
          row.machines.taxasActivity
        );

        monthlyData.set(monthKey, existing);
      }
    }

    // Convertir en tableau et trier
    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        volume: data.volume,
        reimbursement: data.reimbursement,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  async calculateReportData(userId: string, periodStart: Date, periodEnd: Date): Promise<{
    totalVolumeLiters: number;
    eligibleVolumeLiters: number;
    reimbursementAmount: number;
  }> {
    const totalStats = await db
      .select({
        totalVolume: sql<number>`coalesce(sum(${fuelEntries.volumeLiters}), 0)::real`,
      })
      .from(fuelEntries)
      .where(
        and(
          eq(fuelEntries.userId, userId),
          gte(fuelEntries.invoiceDate, periodStart),
          lte(fuelEntries.invoiceDate, periodEnd)
        )
      );

    const eligibleStats = await db
      .select({
        eligibleVolume: sql<number>`coalesce(sum(${fuelEntries.volumeLiters}), 0)::real`,
      })
      .from(fuelEntries)
      .leftJoin(machines, eq(fuelEntries.machineId, machines.id))
      .where(
        and(
          eq(fuelEntries.userId, userId),
          eq(machines.isEligible, true),
          gte(fuelEntries.invoiceDate, periodStart),
          lte(fuelEntries.invoiceDate, periodEnd)
        )
      );

    const totalVolumeLiters = totalStats[0]?.totalVolume || 0;
    const eligibleVolumeLiters = eligibleStats[0]?.eligibleVolume || 0;

    // Calcul du remboursement avec le système bi-secteur
    const eligibleEntries = await db
      .select()
      .from(fuelEntries)
      .leftJoin(machines, eq(fuelEntries.machineId, machines.id))
      .where(
        and(
          eq(fuelEntries.userId, userId),
          eq(machines.isEligible, true),
          gte(fuelEntries.invoiceDate, periodStart),
          lte(fuelEntries.invoiceDate, periodEnd)
        )
      );

    let reimbursementAmount = 0;
    for (const row of eligibleEntries) {
      if (row.fuel_entries && row.machines) {
        reimbursementAmount += calculateReimbursementBySectorAndDate(
          row.fuel_entries.volumeLiters,
          row.fuel_entries.invoiceDate,
          row.machines.taxasActivity
        );
      }
    }

    return {
      totalVolumeLiters,
      eligibleVolumeLiters,
      reimbursementAmount,
    };
  }

  async getReportDetails(userId: string, periodStart: Date, periodEnd: Date): Promise<{
    machines: Machine[];
    fuelEntries: (FuelEntry & { machine?: Machine })[];
  }> {
    const userMachines = await db
      .select()
      .from(machines)
      .where(eq(machines.userId, userId))
      .orderBy(machines.name);

    const entries = await db
      .select()
      .from(fuelEntries)
      .leftJoin(machines, eq(fuelEntries.machineId, machines.id))
      .where(
        and(
          eq(fuelEntries.userId, userId),
          gte(fuelEntries.invoiceDate, periodStart),
          lte(fuelEntries.invoiceDate, periodEnd)
        )
      )
      .orderBy(fuelEntries.invoiceDate);

    return {
      machines: userMachines,
      fuelEntries: entries.map((row) => ({
        ...row.fuel_entries,
        machine: row.machines || undefined,
      })),
    };
  }

  async getInvoices(userId: string): Promise<Invoice[]> {
    return db.select().from(invoices).where(eq(invoices.userId, userId)).orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: string, userId: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(and(eq(invoices.id, id), eq(invoices.userId, userId)));
    return invoice;
  }

  async createInvoice(data: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db.insert(invoices).values(data).returning();
    return invoice;
  }

  async getNextInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;

    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(invoices)
      .where(sql`${invoices.invoiceNumber} LIKE ${prefix + '%'}`);

    const nextNumber = (result?.count || 0) + 1;
    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  async getCompanyProfile(userId: string): Promise<CompanyProfile | undefined> {
    const [profile] = await db.select().from(companyProfiles).where(eq(companyProfiles.userId, userId));
    return profile;
  }

  async createOrUpdateCompanyProfile(data: InsertCompanyProfile): Promise<CompanyProfile> {
    const existing = await this.getCompanyProfile(data.userId);
    if (existing) {
      const [profile] = await db
        .update(companyProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(companyProfiles.userId, data.userId))
        .returning();
      return profile;
    }
    const [profile] = await db.insert(companyProfiles).values(data).returning();
    return profile;
  }

  // ========================================
  // SURFACES AGRICOLES (données déclaratives)
  // ========================================

  async getAgriculturalSurfaces(userId: string): Promise<AgriculturalSurface[]> {
    return db.select().from(agriculturalSurfaces)
      .where(eq(agriculturalSurfaces.userId, userId))
      .orderBy(desc(agriculturalSurfaces.declarationYear));
  }

  async getAgriculturalSurface(id: string, userId: string): Promise<AgriculturalSurface | undefined> {
    const [surface] = await db.select().from(agriculturalSurfaces)
      .where(and(eq(agriculturalSurfaces.id, id), eq(agriculturalSurfaces.userId, userId)));
    return surface;
  }

  async createAgriculturalSurface(data: InsertAgriculturalSurface): Promise<AgriculturalSurface> {
    const [surface] = await db.insert(agriculturalSurfaces).values(data).returning();
    return surface;
  }

  async updateAgriculturalSurface(id: string, userId: string, data: Partial<InsertAgriculturalSurface>): Promise<AgriculturalSurface | undefined> {
    const [surface] = await db.update(agriculturalSurfaces)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(agriculturalSurfaces.id, id), eq(agriculturalSurfaces.userId, userId)))
      .returning();
    return surface;
  }

  async deleteAgriculturalSurface(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(agriculturalSurfaces)
      .where(and(eq(agriculturalSurfaces.id, id), eq(agriculturalSurfaces.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // === Chantiers BTP (traçabilité uniquement) ===

  async getConstructionSites(userId: string): Promise<ConstructionSite[]> {
    return await db.select()
      .from(constructionSites)
      .where(eq(constructionSites.userId, userId))
      .orderBy(desc(constructionSites.createdAt));
  }

  async getConstructionSite(id: string, userId: string): Promise<ConstructionSite | undefined> {
    const [site] = await db.select()
      .from(constructionSites)
      .where(and(eq(constructionSites.id, id), eq(constructionSites.userId, userId)));
    return site;
  }

  async createConstructionSite(data: InsertConstructionSite): Promise<ConstructionSite> {
    const [site] = await db.insert(constructionSites).values(data).returning();
    return site;
  }

  async updateConstructionSite(id: string, userId: string, data: Partial<InsertConstructionSite>): Promise<ConstructionSite | undefined> {
    const [site] = await db.update(constructionSites)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(constructionSites.id, id), eq(constructionSites.userId, userId)))
      .returning();
    return site;
  }

  async deleteConstructionSite(id: string, userId: string): Promise<boolean> {
    // Supprimer d'abord les affectations liées
    await db.delete(machineSiteAssignments).where(eq(machineSiteAssignments.siteId, id));
    const result = await db.delete(constructionSites)
      .where(and(eq(constructionSites.id, id), eq(constructionSites.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // === Affectations Machine ↔ Chantier ===

  async getMachineSiteAssignments(userId: string): Promise<(MachineSiteAssignment & { machine?: Machine; site?: ConstructionSite })[]> {
    const assignments = await db.select()
      .from(machineSiteAssignments)
      .orderBy(desc(machineSiteAssignments.createdAt));

    // Enrichir avec machine et site
    const enriched = await Promise.all(assignments.map(async (a) => {
      const [machine] = await db.select().from(machines).where(eq(machines.id, a.machineId));
      const [site] = await db.select().from(constructionSites).where(eq(constructionSites.id, a.siteId));
      // Filtrer par userId via la machine
      if (machine?.userId !== userId) return null;
      return { ...a, machine, site };
    }));

    return enriched.filter(Boolean) as (MachineSiteAssignment & { machine?: Machine; site?: ConstructionSite })[];
  }

  async getMachineSiteAssignmentsBySite(siteId: string): Promise<(MachineSiteAssignment & { machine?: Machine })[]> {
    const assignments = await db.select()
      .from(machineSiteAssignments)
      .where(eq(machineSiteAssignments.siteId, siteId))
      .orderBy(desc(machineSiteAssignments.startDate));

    // Enrichir avec machine
    const enriched = await Promise.all(assignments.map(async (a) => {
      const [machine] = await db.select().from(machines).where(eq(machines.id, a.machineId));
      return { ...a, machine };
    }));

    return enriched;
  }

  async createMachineSiteAssignment(data: InsertMachineSiteAssignment): Promise<MachineSiteAssignment> {
    const [assignment] = await db.insert(machineSiteAssignments).values(data).returning();
    return assignment;
  }

  async deleteMachineSiteAssignment(id: string): Promise<boolean> {
    const result = await db.delete(machineSiteAssignments)
      .where(eq(machineSiteAssignments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async checkAssignmentOverlap(machineId: string, startDate: Date, endDate: Date | null, excludeId?: string): Promise<boolean> {
    // Vérifier si une affectation existe pour cette machine avec des dates qui se chevauchent
    const existingAssignments = await db.select()
      .from(machineSiteAssignments)
      .where(eq(machineSiteAssignments.machineId, machineId));

    for (const existing of existingAssignments) {
      // Ignorer l'affectation en cours d'édition
      if (excludeId && existing.id === excludeId) continue;

      const existingStart = new Date(existing.startDate);
      const existingEnd = existing.endDate ? new Date(existing.endDate) : null;

      // Logique de chevauchement :
      // Deux périodes se chevauchent si : start1 <= end2 ET start2 <= end1
      // Avec gestion des dates nulles (période ouverte = infini)
      const newStart = startDate;
      const newEnd = endDate;

      // Si existant n'a pas de fin → toujours en cours
      // Si nouveau n'a pas de fin → toujours en cours
      const overlaps = (
        (existingEnd === null || newStart <= existingEnd) &&
        (newEnd === null || existingStart <= newEnd)
      );

      if (overlaps) return true;
    }

    return false;
  }

  // Récupérer les affectations actives pour une machine à une date donnée
  // Une affectation est active si : startDate <= targetDate ET (endDate is null OR endDate >= targetDate)
  async getActiveAssignmentsForMachine(machineId: string, targetDate: Date): Promise<(MachineSiteAssignment & { site?: ConstructionSite })[]> {
    const assignments = await db.select()
      .from(machineSiteAssignments)
      .where(eq(machineSiteAssignments.machineId, machineId));

    const activeAssignments: (MachineSiteAssignment & { site?: ConstructionSite })[] = [];

    for (const assignment of assignments) {
      const startDate = new Date(assignment.startDate);
      const endDate = assignment.endDate ? new Date(assignment.endDate) : null;

      // Vérifier si l'affectation est active à la date cible
      const isActive = startDate <= targetDate && (endDate === null || endDate >= targetDate);

      if (isActive) {
        // Récupérer le chantier associé et vérifier qu'il est actif
        const [site] = await db.select().from(constructionSites).where(eq(constructionSites.id, assignment.siteId));

        if (site && site.status === "active") {
          activeAssignments.push({ ...assignment, site });
        }
      }
    }

    return activeAssignments;
  }

  // Dashboard Chantier BTP - Statistiques et cohérence
  async getConstructionSiteDashboard(siteId: string, userId: string): Promise<{
    site: ConstructionSite;
    summary: {
      totalMachines: number;
      totalFuelEntries: number;
      totalLiters: number;
    };
    machineDetails: {
      machine: Machine;
      assignmentPeriod: { start: Date; end: Date | null };
      fuelEntriesCount: number;
      totalLiters: number;
    }[];
    coherenceMessages: { type: 'info' | 'warning'; message: string }[];
  } | null> {
    // Récupérer le chantier
    const site = await this.getConstructionSite(siteId, userId);
    if (!site) return null;

    // Récupérer les affectations du chantier
    const assignments = await db.select()
      .from(machineSiteAssignments)
      .where(eq(machineSiteAssignments.siteId, siteId));

    // Récupérer toutes les machines affectées
    const machineIds = assignments.map(a => a.machineId);
    const machinesData = machineIds.length > 0
      ? await db.select().from(machines).where(inArray(machines.id, machineIds))
      : [];

    // Récupérer les entrées carburant liées au chantier
    const fuelEntriesData = await db.select()
      .from(fuelEntries)
      .where(eq(fuelEntries.siteId, siteId));

    // Calculer les statistiques par machine
    const machineDetails = [];
    const coherenceMessages: { type: 'info' | 'warning'; message: string }[] = [];

    for (const assignment of assignments) {
      const machine = machinesData.find(m => m.id === assignment.machineId);
      if (!machine) continue;

      // Entrées carburant pour cette machine sur ce chantier
      const machineFuelEntries = fuelEntriesData.filter(e => e.machineId === machine.id);
      const totalLiters = machineFuelEntries.reduce((sum, e) => sum + Number(e.volumeLiters || 0), 0);

      machineDetails.push({
        machine,
        assignmentPeriod: {
          start: assignment.startDate,
          end: assignment.endDate,
        },
        fuelEntriesCount: machineFuelEntries.length,
        totalLiters,
      });

      // Message si machine sans carburant
      if (machineFuelEntries.length === 0) {
        coherenceMessages.push({
          type: 'info',
          message: `Machine "${machine.name}" affectée sans carburant saisi`,
        });
      }
    }

    // Message si chantier sans machine
    if (assignments.length === 0) {
      coherenceMessages.push({
        type: 'warning',
        message: 'Aucune machine affectée à ce chantier',
      });
    }

    // Carburant saisi sans affectation (entrées liées au chantier mais machine non affectée)
    for (const entry of fuelEntriesData) {
      const hasAssignment = assignments.some(a => a.machineId === entry.machineId);
      if (!hasAssignment) {
        const machine = await db.select().from(machines).where(eq(machines.id, entry.machineId)).limit(1);
        if (machine[0]) {
          coherenceMessages.push({
            type: 'warning',
            message: `Carburant saisi pour "${machine[0].name}" sans affectation active`,
          });
        }
      }
    }

    return {
      site,
      summary: {
        totalMachines: machineDetails.length,
        totalFuelEntries: fuelEntriesData.length,
        totalLiters: fuelEntriesData.reduce((sum, e) => sum + Number(e.volumeLiters || 0), 0),
      },
      machineDetails,
      coherenceMessages,
    };
  }

  /**
   * Calcule le score de conformité BTP (traçabilité uniquement - AUCUN CHF)
   * Score sur 100 points :
   * - Machines affectées à un chantier actif : 30 pts
   * - Entrées carburant liées à une affectation valide : 40 pts
   * - Cohérence des périodes (pas de carburant hors dates) : 20 pts
   * - Complétude des données : 10 pts
   */
  async calculateBtpComplianceScore(userId: string): Promise<{
    score: number;
    level: 'conforme' | 'a_corriger' | 'non_conforme';
    breakdown: {
      machineAssignment: { score: number; max: number; details: string };
      fuelTraceability: { score: number; max: number; details: string };
      periodCoherence: { score: number; max: number; details: string };
      dataCompleteness: { score: number; max: number; details: string };
    };
    alerts: { type: 'info' | 'warning' | 'error'; message: string; action?: string }[];
    summary: {
      totalMachines: number;
      assignedMachines: number;
      totalFuelEntries: number;
      trackedFuelEntries: number;
      activeSites: number;
    };
  }> {
    const alerts: { type: 'info' | 'warning' | 'error'; message: string; action?: string }[] = [];

    // Récupérer toutes les données BTP
    const allMachines = await this.getMachines(userId);
    const allSites = await this.getConstructionSites(userId);
    const activeSites = allSites.filter(s => s.status === 'active');
    const allAssignments = await this.getMachineSiteAssignments(userId);
    const allFuelEntries = await this.getFuelEntries(userId);
    const btpFuelEntries = allFuelEntries.filter(e => e.siteId != null);

    // Machines BTP = machines qui ont au moins une affectation à un chantier (actuelle ou passée)
    const machineIdsWithAnyAssignment = new Set(allAssignments.map(a => a.machineId));
    const btpMachines = allMachines.filter(m => machineIdsWithAnyAssignment.has(m.id));

    // === 1. Machines affectées à un chantier actif (30 pts) ===
    const machineIdsWithActiveAssignment = new Set(
      allAssignments
        .filter(a => {
          const site = allSites.find(s => s.id === a.siteId);
          return site?.status === 'active';
        })
        .map(a => a.machineId)
    );
    const assignedMachines = btpMachines.filter(m => machineIdsWithActiveAssignment.has(m.id));
    const machineScore = btpMachines.length > 0
      ? Math.round((assignedMachines.length / btpMachines.length) * 30)
      : (activeSites.length > 0 ? 0 : 30); // Si pas de machines BTP et pas de chantiers actifs, score neutre

    if (btpMachines.length > 0 && assignedMachines.length < btpMachines.length) {
      const unassignedCount = btpMachines.length - assignedMachines.length;
      alerts.push({
        type: 'warning',
        message: `${unassignedCount} machine(s) BTP sans affectation à un chantier actif`,
        action: 'Affecter les machines à un chantier',
      });
    }

    // === 2. Entrées carburant liées à une affectation valide (40 pts) ===
    let trackedFuelEntries = 0;
    for (const entry of btpFuelEntries) {
      const assignment = allAssignments.find(a =>
        a.machineId === entry.machineId &&
        a.siteId === entry.siteId
      );
      if (assignment) {
        trackedFuelEntries++;
      }
    }
    const fuelScore = btpFuelEntries.length > 0
      ? Math.round((trackedFuelEntries / btpFuelEntries.length) * 40)
      : 40; // Pas d'entrées = score neutre

    const orphanFuel = btpFuelEntries.length - trackedFuelEntries;
    if (orphanFuel > 0) {
      alerts.push({
        type: 'error',
        message: `${orphanFuel} entrée(s) carburant sans affectation machine valide`,
        action: 'Vérifier les affectations des machines concernées',
      });
    }

    // === 3. Cohérence des périodes (20 pts) ===
    let coherentEntries = 0;
    let incoherentEntries = 0;
    for (const entry of btpFuelEntries) {
      const assignment = allAssignments.find(a =>
        a.machineId === entry.machineId &&
        a.siteId === entry.siteId
      );
      if (assignment) {
        const entryDate = new Date(entry.invoiceDate);
        const startOk = entryDate >= new Date(assignment.startDate);
        const endOk = !assignment.endDate || entryDate <= new Date(assignment.endDate);
        if (startOk && endOk) {
          coherentEntries++;
        } else {
          incoherentEntries++;
        }
      }
    }
    const periodScore = trackedFuelEntries > 0
      ? Math.round((coherentEntries / trackedFuelEntries) * 20)
      : 20;

    if (incoherentEntries > 0) {
      alerts.push({
        type: 'warning',
        message: `${incoherentEntries} entrée(s) carburant hors période d'affectation`,
        action: 'Vérifier les dates des entrées carburant',
      });
    }

    // === 4. Complétude des données (10 pts) ===
    let completenessScore = 10;
    if (activeSites.length === 0 && btpMachines.length > 0) {
      completenessScore -= 5;
      alerts.push({
        type: 'info',
        message: 'Aucun chantier actif déclaré',
        action: 'Créer ou activer un chantier',
      });
    }
    if (btpMachines.length === 0 && activeSites.length > 0) {
      completenessScore -= 5;
      alerts.push({
        type: 'info',
        message: 'Aucune machine BTP enregistrée',
        action: 'Enregistrer vos machines BTP',
      });
    }
    // Vérifier les chantiers sans dates
    const sitesWithoutDates = allSites.filter(s => !s.startDate);
    if (sitesWithoutDates.length > 0) {
      completenessScore = Math.max(0, completenessScore - 2);
    }

    // === Calcul du score total ===
    const totalScore = machineScore + fuelScore + periodScore + completenessScore;

    // Déterminer le niveau
    let level: 'conforme' | 'a_corriger' | 'non_conforme';
    if (totalScore >= 80) {
      level = 'conforme';
    } else if (totalScore >= 50) {
      level = 'a_corriger';
    } else {
      level = 'non_conforme';
    }

    return {
      score: totalScore,
      level,
      breakdown: {
        machineAssignment: {
          score: machineScore,
          max: 30,
          details: `${assignedMachines.length}/${btpMachines.length} machines affectées`,
        },
        fuelTraceability: {
          score: fuelScore,
          max: 40,
          details: `${trackedFuelEntries}/${btpFuelEntries.length} entrées tracées`,
        },
        periodCoherence: {
          score: periodScore,
          max: 20,
          details: `${coherentEntries}/${trackedFuelEntries || 0} entrées cohérentes`,
        },
        dataCompleteness: {
          score: completenessScore,
          max: 10,
          details: `${activeSites.length} chantiers, ${btpMachines.length} machines`,
        },
      },
      alerts,
      summary: {
        totalMachines: btpMachines.length,
        assignedMachines: assignedMachines.length,
        totalFuelEntries: btpFuelEntries.length,
        trackedFuelEntries,
        activeSites: activeSites.length,
      },
    };
  }

  /**
   * Calcule le score de cohérence Agriculture (données déclaratives uniquement)
   * Score sur 100 points - AUCUN calcul financier, CHF ou litres
   * Conforme Art. 18 LMin : outil de vérification interne uniquement
   * 
   * - Surfaces agricoles saisies : 40 pts
   * - Types de cultures renseignés : 30 pts
   * - Machines agricoles présentes : 20 pts
   * - Complétude globale : 10 pts
   */
  async calculateAgricultureCoherenceScore(userId: string): Promise<{
    score: number;
    level: 'bon' | 'a_completer' | 'incomplet';
    breakdown: {
      surfaces: { score: number; max: number; details: string };
      cultures: { score: number; max: number; details: string };
      machines: { score: number; max: number; details: string };
      completeness: { score: number; max: number; details: string };
    };
    alerts: { type: 'info' | 'warning'; message: string; action?: string }[];
    summary: {
      totalSurfaces: number;
      totalHectares: number;
      cultureTypes: number;
      totalMachines: number;
    };
  }> {
    const alerts: { type: 'info' | 'warning'; message: string; action?: string }[] = [];

    // Récupérer les données Agriculture (AUCUNE donnée financière)
    const surfaces = await this.getAgriculturalSurfaces(userId);
    const machines = await this.getMachines(userId);

    // Calculs déclaratifs uniquement
    const totalHectares = surfaces.reduce((sum, s) => sum + Number(s.totalHectares || 0), 0);
    const cultureTypes = new Set(surfaces.map(s => s.cultureType).filter(Boolean)).size;
    const currentYear = new Date().getFullYear();
    const currentYearSurfaces = surfaces.filter(s => s.declarationYear === currentYear);

    // === 1. Surfaces agricoles saisies (40 pts) ===
    let surfaceScore = 0;
    if (surfaces.length === 0) {
      surfaceScore = 0;
      alerts.push({
        type: 'warning',
        message: 'Aucune surface agricole déclarée',
        action: 'Ajouter vos parcelles',
      });
    } else if (currentYearSurfaces.length === 0) {
      surfaceScore = 20; // Des surfaces existent mais pas pour l'année en cours
      alerts.push({
        type: 'info',
        message: `Aucune surface déclarée pour ${currentYear}`,
        action: `Mettre à jour les déclarations ${currentYear}`,
      });
    } else if (totalHectares > 0) {
      // Score proportionnel : au moins 1 surface avec hectares = 40 pts
      surfaceScore = 40;
    } else {
      surfaceScore = 25;
      alerts.push({
        type: 'info',
        message: 'Surfaces déclarées sans superficie renseignée',
        action: 'Compléter les hectares',
      });
    }

    // === 2. Types de cultures renseignés (30 pts) ===
    let cultureScore = 0;
    if (cultureTypes === 0) {
      cultureScore = 0;
      if (surfaces.length > 0) {
        alerts.push({
          type: 'warning',
          message: 'Aucun type de culture renseigné',
          action: 'Préciser les types de cultures',
        });
      }
    } else if (cultureTypes === 1) {
      cultureScore = 15;
    } else if (cultureTypes >= 2) {
      cultureScore = 30;
    }

    // === 3. Machines agricoles présentes (20 pts) ===
    let machineScore = 0;
    if (machines.length === 0) {
      machineScore = 0;
      alerts.push({
        type: 'warning',
        message: 'Aucune machine agricole enregistrée',
        action: 'Enregistrer vos machines',
      });
    } else if (machines.length >= 3) {
      machineScore = 20;
    } else {
      machineScore = Math.round((machines.length / 3) * 20);
    }

    // === 4. Complétude globale (10 pts) ===
    let completenessScore = 10;

    // Vérifier les champs manquants critiques
    const surfacesWithoutHectares = surfaces.filter(s => !s.totalHectares || s.totalHectares === 0);
    const surfacesWithoutYear = surfaces.filter(s => !s.declarationYear);

    if (surfacesWithoutHectares.length > 0) {
      completenessScore -= 3;
    }
    if (surfacesWithoutYear.length > 0) {
      completenessScore -= 3;
    }
    if (surfaces.length > 0 && cultureTypes === 0) {
      completenessScore -= 2;
    }
    if (machines.length === 0 && surfaces.length > 0) {
      completenessScore -= 2;
    }

    completenessScore = Math.max(0, completenessScore);

    // === Calcul du score total ===
    const totalScore = surfaceScore + cultureScore + machineScore + completenessScore;

    // Déterminer le niveau
    let level: 'bon' | 'a_completer' | 'incomplet';
    if (totalScore >= 80) {
      level = 'bon';
    } else if (totalScore >= 50) {
      level = 'a_completer';
    } else {
      level = 'incomplet';
    }

    return {
      score: totalScore,
      level,
      breakdown: {
        surfaces: {
          score: surfaceScore,
          max: 40,
          details: `${surfaces.length} surface(s), ${totalHectares.toFixed(1)} ha`,
        },
        cultures: {
          score: cultureScore,
          max: 30,
          details: `${cultureTypes} type(s) de culture`,
        },
        machines: {
          score: machineScore,
          max: 20,
          details: `${machines.length} machine(s)`,
        },
        completeness: {
          score: completenessScore,
          max: 10,
          details: completenessScore === 10 ? 'Données complètes' : 'Champs à compléter',
        },
      },
      alerts,
      summary: {
        totalSurfaces: surfaces.length,
        totalHectares,
        cultureTypes,
        totalMachines: machines.length,
      },
    };
  }

  /**
   * Génère le Journal de Préparation MineralTax
   * Document attestant la structuration des données avant saisie Taxas
   * Aucun calcul financier - uniquement traçabilité et cohérence
   */
  async generatePreparationJournal(userId: string, fiscalYear: number): Promise<{
    journalId: string;
    generatedAt: Date;
    company: {
      name: string;
      sector: 'agriculture' | 'btp';
      ide?: string;
    };
    fiscalYear: number;
    agriculture?: {
      surfaces: { count: number; totalHectares: number; years: number[] };
      cultures: { count: number; types: string[] };
      machines: { count: number };
      mention: string;
    };
    btp?: {
      activeSites: { count: number; names: string[] };
      machineAssignments: { count: number };
      fuelEntries: { count: number; totalLiters: number };
      periods: { earliest: Date | null; latest: Date | null };
      mention: string;
    };
    scores: {
      agriculture?: { score: number; level: string; incomplete: string[] };
      btp?: { score: number; level: string; incomplete: string[] };
    };
    chronology: {
      dataEntryPeriod: { start: Date | null; end: Date | null };
      mention: string;
    };
    disclaimer: string;
  }> {
    // Générer UUID v4
    const journalId = crypto.randomUUID();
    const generatedAt = new Date();

    // Récupérer les données utilisateur
    const user = await this.getUser(userId);
    const company = await this.getCompanyProfile(userId);
    const sector = user?.activitySector || 'btp';

    // Données Agriculture
    const surfaces = await this.getAgriculturalSurfaces(userId);
    const agriMachines = await this.getMachines(userId);

    // Données BTP
    const allSites = await this.getConstructionSites(userId);
    const activeSites = allSites.filter(s => s.status === 'active');
    const assignments = await this.getMachineSiteAssignments(userId);
    const fuelEntries = await this.getFuelEntries(userId);
    const btpFuelEntries = fuelEntries.filter(e => e.siteId != null);

    // Calcul des scores
    const agriScore = sector === 'agriculture' ? await this.calculateAgricultureCoherenceScore(userId) : null;
    const btpScore = sector === 'btp' ? await this.calculateBtpComplianceScore(userId) : null;

    // Chronologie des données
    const allDates: Date[] = [];
    surfaces.forEach(s => s.createdAt && allDates.push(new Date(s.createdAt)));
    fuelEntries.forEach(e => e.createdAt && allDates.push(new Date(e.createdAt)));
    allSites.forEach(s => s.createdAt && allDates.push(new Date(s.createdAt)));

    const sortedDates = allDates.sort((a, b) => a.getTime() - b.getTime());
    const earliestEntry = sortedDates[0] || null;
    const latestEntry = sortedDates[sortedDates.length - 1] || null;

    // Construire les sections
    const agricultureData = sector === 'agriculture' ? {
      surfaces: {
        count: surfaces.length,
        totalHectares: surfaces.reduce((sum, s) => sum + Number(s.totalHectares || 0), 0),
        years: Array.from(new Set(surfaces.map(s => s.declarationYear).filter(Boolean))) as number[],
      },
      cultures: {
        count: new Set(surfaces.map(s => s.cultureType).filter(Boolean)).size,
        types: Array.from(new Set(surfaces.map(s => s.cultureType).filter(Boolean))) as string[],
      },
      machines: { count: agriMachines.length },
      mention: "Données déclaratives – Art. 18 LMin",
    } : undefined;

    const btpData = sector === 'btp' ? {
      activeSites: {
        count: activeSites.length,
        names: activeSites.map(s => s.name),
      },
      machineAssignments: { count: assignments.length },
      fuelEntries: {
        count: btpFuelEntries.length,
        totalLiters: btpFuelEntries.reduce((sum, e) => sum + Number(e.volumeLiters || 0), 0),
      },
      periods: {
        earliest: btpFuelEntries.length > 0
          ? new Date(Math.min(...btpFuelEntries.map(e => new Date(e.invoiceDate).getTime())))
          : null,
        latest: btpFuelEntries.length > 0
          ? new Date(Math.max(...btpFuelEntries.map(e => new Date(e.invoiceDate).getTime())))
          : null,
      },
      mention: "Traçabilité hors-route – préparation OFDF",
    } : undefined;

    // Éléments incomplets
    const agriIncomplete: string[] = [];
    if (agriScore) {
      if (agriScore.breakdown.surfaces.score < agriScore.breakdown.surfaces.max) {
        agriIncomplete.push("Surfaces agricoles à compléter");
      }
      if (agriScore.breakdown.cultures.score < agriScore.breakdown.cultures.max) {
        agriIncomplete.push("Types de cultures à renseigner");
      }
      if (agriScore.breakdown.machines.score < agriScore.breakdown.machines.max) {
        agriIncomplete.push("Machines agricoles à enregistrer");
      }
    }

    const btpIncomplete: string[] = [];
    if (btpScore) {
      if (btpScore.breakdown.machineAssignment.score < btpScore.breakdown.machineAssignment.max) {
        btpIncomplete.push("Machines sans affectation chantier");
      }
      if (btpScore.breakdown.fuelTraceability.score < btpScore.breakdown.fuelTraceability.max) {
        btpIncomplete.push("Entrées carburant non liées");
      }
      if (btpScore.breakdown.periodCoherence.score < btpScore.breakdown.periodCoherence.max) {
        btpIncomplete.push("Incohérences de périodes");
      }
    }

    return {
      journalId,
      generatedAt,
      company: {
        name: company?.companyName || user?.firstName || "Non renseigné",
        sector: sector as 'agriculture' | 'btp',
        ide: company?.ideNumber || undefined,
      },
      fiscalYear,
      agriculture: agricultureData,
      btp: btpData,
      scores: {
        agriculture: agriScore ? {
          score: agriScore.score,
          level: agriScore.level === 'bon' ? 'Bon' : agriScore.level === 'a_completer' ? 'À compléter' : 'Incomplet',
          incomplete: agriIncomplete,
        } : undefined,
        btp: btpScore ? {
          score: btpScore.score,
          level: btpScore.level === 'conforme' ? 'Conforme' : btpScore.level === 'a_corriger' ? 'À corriger' : 'Non conforme',
          incomplete: btpIncomplete,
        } : undefined,
      },
      chronology: {
        dataEntryPeriod: { start: earliestEntry, end: latestEntry },
        mention: "Données saisies progressivement sur l'année",
      },
      disclaimer: `Ce document ne constitue pas une déclaration fiscale, ni une validation par l'OFDF. Il s'agit d'un outil interne de préparation destiné à structurer les données avant saisie manuelle sur la plateforme officielle Taxas. La responsabilité des données déclarées incombe exclusivement à l'entreprise.`,
    };
  }

  /**
   * Calcule la progression de l'utilisateur vers la génération du Journal de Préparation
   * Parcours pédagogique - aucun calcul financier
   */
  async getPreparationProgress(userId: string): Promise<{
    sector: 'agriculture' | 'btp';
    overallProgress: number;
    stepsCompleted: number;
    stepsTotal: number;
    isJournalReady: boolean;
    steps: {
      agriculture?: {
        surface: { completed: boolean; count: number; message: string; link: string };
        cultures: { completed: boolean; count: number; total: number; message: string; link: string };
        fiscalYear: { completed: boolean; year: number | null; message: string; link: string };
        machines: { completed: boolean; count: number; message: string; link: string; optional: boolean };
      };
      btp?: {
        sites: { completed: boolean; count: number; message: string; link: string };
        machines: { completed: boolean; count: number; message: string; link: string };
        assignments: { completed: boolean; count: number; message: string; link: string };
        fuelEntries: { completed: boolean; count: number; message: string; link: string };
      };
    };
    completionMessage: string;
  }> {
    const user = await this.getUser(userId);
    const sector = (user?.activitySector || 'btp') as 'agriculture' | 'btp';

    if (sector === 'agriculture') {
      // === AGRICULTURE ===
      const surfaces = await this.getAgriculturalSurfaces(userId);
      const machines = await this.getMachines(userId);

      const surfaceCount = surfaces.length;
      const surfaceCompleted = surfaceCount > 0;

      const surfacesWithCulture = surfaces.filter(s => s.cultureType != null).length;
      const culturesCompleted = surfaceCount > 0 && surfacesWithCulture === surfaceCount;

      const surfacesWithYear = surfaces.filter(s => s.declarationYear != null);
      const fiscalYearCompleted = surfacesWithYear.length > 0;
      const fiscalYear = surfacesWithYear.length > 0 ? surfacesWithYear[0].declarationYear : null;

      const machineCount = machines.length;
      const machinesCompleted = machineCount > 0;

      // 3 étapes obligatoires + 1 optionnelle
      const obligatoryCompleted = [surfaceCompleted, culturesCompleted, fiscalYearCompleted].filter(Boolean).length;
      const stepsTotal = 4;
      const stepsCompleted = obligatoryCompleted + (machinesCompleted ? 1 : 0);

      // Journal prêt si les 3 obligatoires sont OK
      const isJournalReady = obligatoryCompleted === 3;
      const overallProgress = Math.round((stepsCompleted / stepsTotal) * 100);

      return {
        sector,
        overallProgress,
        stepsCompleted,
        stepsTotal,
        isJournalReady,
        steps: {
          agriculture: {
            surface: {
              completed: surfaceCompleted,
              count: surfaceCount,
              message: surfaceCompleted ? `${surfaceCount} surface(s) déclarée(s)` : "Ajoutez au moins une surface agricole",
              link: "/agricultural-surfaces",
            },
            cultures: {
              completed: culturesCompleted,
              count: surfacesWithCulture,
              total: surfaceCount,
              message: culturesCompleted
                ? "Toutes les surfaces ont un type de culture"
                : `${surfaceCount - surfacesWithCulture} surface(s) sans type de culture`,
              link: "/agricultural-surfaces",
            },
            fiscalYear: {
              completed: fiscalYearCompleted,
              year: fiscalYear,
              message: fiscalYearCompleted ? `Année ${fiscalYear} sélectionnée` : "Sélectionnez une année fiscale",
              link: "/agricultural-surfaces",
            },
            machines: {
              completed: machinesCompleted,
              count: machineCount,
              message: machinesCompleted ? `${machineCount} machine(s) enregistrée(s)` : "Ajoutez vos machines agricoles (optionnel)",
              link: "/fleet",
              optional: true,
            },
          },
        },
        completionMessage: isJournalReady
          ? "Votre dossier est prêt à être structuré dans un Journal de Préparation."
          : "Complétez les étapes ci-dessus pour générer votre Journal.",
      };
    } else {
      // === BTP ===
      const sites = await this.getConstructionSites(userId);
      const machines = await this.getMachines(userId);
      const assignments = await this.getMachineSiteAssignments(userId);
      const fuelEntries = await this.getFuelEntries(userId);

      const siteCount = sites.length;
      const sitesCompleted = siteCount > 0;

      const machineCount = machines.length;
      const machinesCompleted = machineCount > 0;

      const assignmentCount = assignments.length;
      const assignmentsCompleted = assignmentCount > 0;

      const fuelCount = fuelEntries.length;
      const fuelCompleted = fuelCount > 0;

      const stepsTotal = 4;
      const stepsCompleted = [sitesCompleted, machinesCompleted, assignmentsCompleted, fuelCompleted].filter(Boolean).length;

      const isJournalReady = stepsCompleted === stepsTotal;
      const overallProgress = Math.round((stepsCompleted / stepsTotal) * 100);

      return {
        sector,
        overallProgress,
        stepsCompleted,
        stepsTotal,
        isJournalReady,
        steps: {
          btp: {
            sites: {
              completed: sitesCompleted,
              count: siteCount,
              message: sitesCompleted ? `${siteCount} chantier(s) créé(s)` : "Créez au moins un chantier",
              link: "/construction-sites",
            },
            machines: {
              completed: machinesCompleted,
              count: machineCount,
              message: machinesCompleted ? `${machineCount} machine(s) enregistrée(s)` : "Ajoutez au moins une machine BTP",
              link: "/fleet",
            },
            assignments: {
              completed: assignmentsCompleted,
              count: assignmentCount,
              message: assignmentsCompleted ? `${assignmentCount} affectation(s) machine ↔ chantier` : "Affectez une machine à un chantier",
              link: "/construction-sites",
            },
            fuelEntries: {
              completed: fuelCompleted,
              count: fuelCount,
              message: fuelCompleted ? `${fuelCount} entrée(s) carburant` : "Saisissez au moins une entrée carburant",
              link: "/fuel",
            },
          },
        },
        completionMessage: isJournalReady
          ? "Votre dossier est prêt à être structuré dans un Journal de Préparation."
          : "Complétez les étapes ci-dessus pour générer votre Journal.",
      };
    }
  }
}

export const storage = new DatabaseStorage();

