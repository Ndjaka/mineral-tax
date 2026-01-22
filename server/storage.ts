import {
  machines,
  fuelEntries,
  reports,
  subscriptions,
  invoices,
  companyProfiles,
  users,
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
  REIMBURSEMENT_RATE_CHF_PER_LITER,
  calculateReimbursement,
  calculateReimbursementBySectorAndDate,
  getApplicableRate,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
