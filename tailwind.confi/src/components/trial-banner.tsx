import { useQuery, useMutation } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Clock,
  AlertTriangle,
  CreditCard,
  Loader2,
  Smartphone,
  ChevronDown,
  ExternalLink
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const onetimeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/checkout/onetime");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  const isPending = checkoutMutation.isPending || onetimeMutation.isPending;

  if (isLoading || !subscription) {
    return null;
  }

  if (subscription.status === "active") {
    return null;
  }

  const SubscribeButton = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant={subscription.status === "trial_expired" || (subscription.trialDaysRemaining <= 3) ? "default" : "outline"}
          disabled={isPending}
          className="gap-2"
          data-testid="button-subscribe-dropdown"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="h-4 w-4" />
          )}
          {t.subscription.subscribe}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={() => checkoutMutation.mutate()}
          className="flex items-center justify-between cursor-pointer py-2"
        >
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <span>{t.settings.cardSubscription}</span>
          </div>
          <ExternalLink className="h-3 w-3 opacity-50" />
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onetimeMutation.mutate()}
          className="flex items-center justify-between cursor-pointer py-2"
        >
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span>{t.settings.twintPayment}</span>
          </div>
          <ExternalLink className="h-3 w-3 opacity-50" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (subscription.status === "trial_expired") {
    return (
      <Alert variant="destructive" className="mb-4" data-testid="alert-trial-expired">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
          <span>{t.subscription.trialExpired}</span>
          <SubscribeButton />
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
          <SubscribeButton />
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
