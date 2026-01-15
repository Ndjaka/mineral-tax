import {
  machines,
  fuelEntries,
  reports,
  subscriptions,
  invoices,
  companyProfiles,
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
  REIMBURSEMENT_RATE_CHF_PER_LITER,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
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
  getActiveSubscriptionsForQuarterlyReminder(): Promise<Subscription[]>;
  markQuarterlyReminderSent(userId: string): Promise<void>;
  updateStripeCustomerId(userId: string, stripeCustomerId: string): Promise<void>;
  updateStripeSubscriptionId(userId: string, stripeSubscriptionId: string): Promise<void>;

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

    return {
      totalMachines: machineCount[0]?.count || 0,
      totalFuelEntries: entryStats[0]?.count || 0,
      totalVolume,
      eligibleVolume,
      estimatedReimbursement: eligibleVolume * REIMBURSEMENT_RATE_CHF_PER_LITER,
      pendingReports: pendingReportsCount[0]?.count || 0,
    };
  }

  async getFuelTrends(userId: string): Promise<{
    month: string;
    volume: number;
    reimbursement: number;
  }[]> {
    const result = await db
      .select({
        month: sql<string>`to_char(${fuelEntries.invoiceDate}, 'YYYY-MM')`,
        volume: sql<number>`coalesce(sum(${fuelEntries.volumeLiters}), 0)::real`,
      })
      .from(fuelEntries)
      .leftJoin(machines, eq(fuelEntries.machineId, machines.id))
      .where(
        and(
          eq(fuelEntries.userId, userId),
          eq(machines.isEligible, true)
        )
      )
      .groupBy(sql`to_char(${fuelEntries.invoiceDate}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${fuelEntries.invoiceDate}, 'YYYY-MM')`);

    return result.map((row) => ({
      month: row.month,
      volume: row.volume,
      reimbursement: row.volume * REIMBURSEMENT_RATE_CHF_PER_LITER,
    }));
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

    return {
      totalVolumeLiters,
      eligibleVolumeLiters,
      reimbursementAmount: eligibleVolumeLiters * REIMBURSEMENT_RATE_CHF_PER_LITER,
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
