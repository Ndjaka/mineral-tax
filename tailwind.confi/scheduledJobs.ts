import { storage } from "./storage";
import { sendRenewalReminderEmail } from "./emailService";

const RENEWAL_REMINDER_DAYS = [30, 7, 1];
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

async function checkAndSendRenewalReminders(): Promise<void> {
  console.log("[ScheduledJobs] Checking for expiring one-time licenses...");
  
  for (const days of RENEWAL_REMINDER_DAYS) {
    try {
      const expiringLicenses = await storage.getLicensesExpiringInDays(days);
      
      for (const license of expiringLicenses) {
        if (!license.user?.email) {
          console.log(`[ScheduledJobs] No email for user ${license.userId}, skipping`);
          continue;
        }
        
        if (storage.hasRenewalReminderBeenSent(license, days)) {
          console.log(`[ScheduledJobs] Already sent ${days}-day reminder to user ${license.userId} today, skipping`);
          continue;
        }
        
        const expirationDate = license.currentPeriodEnd 
          ? new Date(license.currentPeriodEnd).toLocaleDateString('fr-CH')
          : 'Bientot';
        
        const customerName = license.user.firstName || 'Client';
        
        const emailSent = await sendRenewalReminderEmail({
          to: license.user.email,
          customerName,
          expirationDate,
          renewalUrl: 'https://mineraltax.ch/settings',
          daysRemaining: days,
        });
        
        if (emailSent) {
          await storage.markRenewalReminderSent(license.userId, days);
          console.log(`[ScheduledJobs] Sent ${days}-day renewal reminder to ${license.user.email}`);
        } else {
          console.log(`[ScheduledJobs] Email not sent to ${license.user.email} (Resend not configured or failed)`);
        }
      }
    } catch (error) {
      console.error(`[ScheduledJobs] Error checking ${days}-day expiring licenses:`, error);
    }
  }
}

let intervalId: NodeJS.Timeout | null = null;

export function startScheduledJobs(): void {
  console.log("[ScheduledJobs] Starting scheduled jobs...");
  
  setTimeout(() => {
    checkAndSendRenewalReminders();
  }, 10000);
  
  intervalId = setInterval(() => {
    checkAndSendRenewalReminders();
  }, CHECK_INTERVAL_MS);
  
  console.log(`[ScheduledJobs] Will check for renewal reminders every 24 hours`);
}

export function stopScheduledJobs(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("[ScheduledJobs] Stopped scheduled jobs");
  }
}
