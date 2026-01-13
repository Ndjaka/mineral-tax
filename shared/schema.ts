import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";
export * from "./models/chat";

export const machineTypeEnum = pgEnum("machine_type", [
  "excavator",
  "spider_excavator",
  "loader",
  "crane",
  "drill",
  "finisher",
  "milling_machine",
  "roller",
  "dumper",
  "forklift",
  "crusher",
  "generator",
  "compressor",
  "concrete_pump",
  "other"
]);

export const plateColorEnum = pgEnum("plate_color", [
  "white",
  "green", 
  "yellow",
  "blue",
  "none"
]);

export const taxasActivityEnum = pgEnum("taxas_activity", [
  "agriculture_with_direct",
  "agriculture_without_direct",
  "forestry",
  "rinsing",
  "concession_transport",
  "natural_stone",
  "snow_groomer",
  "professional_fishing",
  "stationary_generator",
  "stationary_cleaning",
  "stationary_combustion",
  "construction",
  "other_taxas"
]);

export const taxasStatusEnum = pgEnum("taxas_status", [
  "draft",
  "ready_for_taxas",
  "submitted_to_taxas",
  "approved"
]);

export const fuelTypeEnum = pgEnum("fuel_type", [
  "diesel",
  "gasoline",
  "biodiesel"
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trial",
  "trial_expired",
  "active",
  "cancelled",
  "inactive"
]);

export const machines = pgTable("machines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  type: machineTypeEnum("type").notNull(),
  taxasActivity: taxasActivityEnum("taxas_activity").default("construction"),
  licensePlate: text("license_plate"),
  plateColor: plateColorEnum("plate_color").default("none"),
  chassisNumber: text("chassis_number"),
  year: integer("year"),
  power: text("power"),
  isEligible: boolean("is_eligible").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const fuelEntries = pgTable("fuel_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  machineId: varchar("machine_id").notNull(),
  invoiceDate: timestamp("invoice_date").notNull(),
  invoiceNumber: text("invoice_number"),
  volumeLiters: real("volume_liters").notNull(),
  engineHours: real("engine_hours"),
  fuelType: fuelTypeEnum("fuel_type").notNull().default("diesel"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  totalVolumeLiters: real("total_volume_liters").notNull(),
  eligibleVolumeLiters: real("eligible_volume_liters").notNull(),
  reimbursementAmount: real("reimbursement_amount").notNull(),
  status: text("status").notNull().default("draft"),
  taxasStatus: taxasStatusEnum("taxas_status").default("draft"),
  taxasSubmissionRef: text("taxas_submission_ref"),
  taxasSubmittedAt: timestamp("taxas_submitted_at"),
  language: text("language").notNull().default("fr"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  status: subscriptionStatusEnum("status").notNull().default("trial"),
  trialStartAt: timestamp("trial_start_at").defaultNow(),
  trialEndsAt: timestamp("trial_ends_at"),
  trialReminderSent: boolean("trial_reminder_sent").default(false),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  quarterlyReminderLastSent: timestamp("quarterly_reminder_last_sent"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  amountPaid: real("amount_paid").notNull(),
  currency: text("currency").notNull().default("CHF"),
  promoCodeUsed: text("promo_code_used"),
  stripeSessionId: text("stripe_session_id"),
  stripeInvoiceId: text("stripe_invoice_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const companyProfiles = pgTable("company_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  companyName: text("company_name").notNull(),
  ideNumber: text("ide_number"),
  street: text("street"),
  postalCode: text("postal_code"),
  city: text("city"),
  canton: text("canton"),
  country: text("country").default("Suisse"),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  bankName: text("bank_name"),
  iban: text("iban"),
  bic: text("bic"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const machinesRelations = relations(machines, ({ many }) => ({
  fuelEntries: many(fuelEntries),
}));

export const fuelEntriesRelations = relations(fuelEntries, ({ one }) => ({
  machine: one(machines, {
    fields: [fuelEntries.machineId],
    references: [machines.id],
  }),
}));

export const insertMachineSchema = createInsertSchema(machines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFuelEntrySchema = createInsertSchema(fuelEntries).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMachine = z.infer<typeof insertMachineSchema>;
export type Machine = typeof machines.$inferSelect;

export type InsertFuelEntry = z.infer<typeof insertFuelEntrySchema>;
export type FuelEntry = typeof fuelEntries.$inferSelect;

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

export const insertCompanyProfileSchema = createInsertSchema(companyProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

export type InsertCompanyProfile = z.infer<typeof insertCompanyProfileSchema>;
export type CompanyProfile = typeof companyProfiles.$inferSelect;

export const REIMBURSEMENT_RATE_CHF_PER_LITER = 0.3405;
