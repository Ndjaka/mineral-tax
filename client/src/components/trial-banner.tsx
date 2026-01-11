import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, CreditCard } from "lucide-react";

interface SubscriptionData {
  status: string;
  trialDaysRemaining: number;
  canExport: boolean;
  trialEndsAt: string | null;
}

export function TrialBanner() {
  const { t } = useI18n();

  const { data: subscription, isLoading } = useQuery<SubscriptionData>({
    queryKey: ["/api/subscription"],
  });

  if (isLoading || !subscription) {
    return null;
  }

  if (subscription.status === "active") {
    return null;
  }

  if (subscription.status === "trial_expired") {
    return (
      <Alert variant="destructive" className="mb-4" data-testid="alert-trial-expired">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
          <span>{t.subscription.trialExpired}</span>
          <Button size="sm" variant="outline" data-testid="button-subscribe">
            <CreditCard className="h-4 w-4 mr-2" />
            {t.subscription.subscribe}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (subscription.status === "trial") {
    const daysRemaining = subscription.trialDaysRemaining;
    const isUrgent = daysRemaining <= 3;

    return (
      <Alert 
        variant={isUrgent ? "destructive" : "default"} 
        className="mb-4"
        data-testid="alert-trial-status"
      >
        <Clock className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
          <span>
            {t.subscription.trialDaysRemaining.replace("{days}", String(daysRemaining))}
          </span>
          <Button size="sm" variant={isUrgent ? "default" : "outline"} data-testid="button-subscribe">
            <CreditCard className="h-4 w-4 mr-2" />
            {t.subscription.subscribe}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
