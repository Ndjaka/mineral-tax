import { useQuery, useMutation } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import {
  CreditCard,
  Check,
  Clock,
  AlertCircle,
  Shield,
  Truck,
  FileText,
  Calculator,
  Download,
  Star,
} from "lucide-react";

interface SubscriptionData {
  status: string;
  trialDaysRemaining: number;
  trialEndsAt?: string;
  canExport: boolean;
}

export default function SubscriptionPage() {
  const { t } = useI18n();
  const { user } = useAuth();

  const { data: subscription, isLoading } = useQuery<SubscriptionData>({
    queryKey: ["/api/subscription"],
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/checkout");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  const isTrialExpired = subscription?.status === "trial_expired";
  const isActive = subscription?.status === "active";
  const isTrial = subscription?.status === "trial";

  const features = [
    { icon: Truck, text: t.landing.feature1Title },
    { icon: Calculator, text: t.landing.feature2Title },
    { icon: FileText, text: t.landing.feature3Title },
    { icon: Download, text: t.reports.downloadPdf },
  ];

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-subscription-title">
          {t.nav.subscription}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isActive
            ? t.subscription.subscriptionActiveMessage
            : isTrialExpired
            ? t.subscription.trialExpired
            : t.subscription.trialDaysRemaining.replace("{days}", String(subscription?.trialDaysRemaining || 0))}
        </p>
      </div>

      {isTrialExpired && (
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800" data-testid="alert-trial-expired">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <span className="font-semibold">{t.subscription.trialExpired}</span>
            <br />
            <span className="text-sm">
              {t.subscription.subscriptionRequired}
            </span>
          </AlertDescription>
        </Alert>
      )}

      {isActive && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" data-testid="alert-subscription-active">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <span className="font-semibold">{t.subscription.congratulations}</span>{" "}
            {t.subscription.subscriptionActiveMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wide">
                {t.landing.annualSubscription}
              </span>
            </div>
            <CardTitle className="text-4xl font-bold">
              250 <span className="text-lg font-normal text-muted-foreground">CHF</span>
            </CardTitle>
            <CardDescription>{t.landing.perYear}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="p-1 rounded-full bg-primary/10">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm">{feature.text}</span>
                </li>
              ))}
            </ul>

            {!isActive && (
              <div className="pt-4">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => checkoutMutation.mutate()}
                  disabled={checkoutMutation.isPending}
                  data-testid="button-subscribe"
                >
                  {checkoutMutation.isPending ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      {t.common.loading}
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      {t.subscription.subscribe}
                    </>
                  )}
                </Button>
                              </div>
            )}

            {isActive && (
              <div className="pt-4">
                <Button size="lg" className="w-full" variant="outline" disabled data-testid="button-subscribed">
                  <Check className="h-4 w-4 mr-2" />
                  {t.settings.active}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t.terms.section2Title.replace("2. ", "")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>{t.terms.section1Content}</p>
            <p>{t.terms.section4Content}</p>
            <p>{t.terms.section5Content}</p>
          </CardContent>
        </Card>
      </div>

      {isTrial && subscription?.trialDaysRemaining !== undefined && (
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  {t.subscription.trialDaysRemaining.replace("{days}", String(subscription.trialDaysRemaining))}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {t.terms.section4Content.split(".")[1]?.trim() || "Accès complet pendant l'essai"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
