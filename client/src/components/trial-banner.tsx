import { useQuery, useMutation } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, CreditCard, Loader2 } from "lucide-react";

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

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/checkout");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  const handleSubscribe = () => {
    checkoutMutation.mutate();
  };

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
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleSubscribe}
            disabled={checkoutMutation.isPending}
            data-testid="button-subscribe"
          >
            {checkoutMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                {t.subscription.subscribe}
              </>
            )}
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
          <Button 
            size="sm" 
            variant={isUrgent ? "default" : "outline"} 
            onClick={handleSubscribe}
            disabled={checkoutMutation.isPending}
            data-testid="button-subscribe"
          >
            {checkoutMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                {t.subscription.subscribe}
              </>
            )}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
