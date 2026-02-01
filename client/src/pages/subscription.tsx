import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useSector } from "@/lib/sector-context";
import { useToast } from "@/hooks/use-toast";
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
  ExternalLink,
  RefreshCw,
  Smartphone,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SubscriptionData {
  status: string;
  trialDaysRemaining: number;
  trialEndsAt?: string;
  canExport: boolean;
}

export default function SubscriptionPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { sector } = useSector();
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState("");
  const [validatedPromo, setValidatedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState("");

  // Prix selon le secteur
  const sectorPrice = sector === "agriculture" ? 150 : 390;
  const sectorName = sector === "agriculture" ? "Agriculture" : "BTP";

  const { data: subscription, isLoading } = useQuery<SubscriptionData>({
    queryKey: ["/api/subscription"],
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/checkout", { sector });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  const onetimeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/checkout/onetime", { sector });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  const validatePromoMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", "/api/promo-codes/validate", { code });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.valid) {
        setValidatedPromo(data.promoCode);
        setPromoError("");
        toast({ title: "✅ Code valide ! Accès gratuit 1 an" });
      } else {
        setPromoError(data.error);
        setValidatedPromo(null);
      }
    },
    onError: () => {
      setPromoError("Erreur lors de la validation du code");
      setValidatedPromo(null);
    },
  });

  const redeemPromoMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", "/api/promo-codes/redeem", { code });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "🎉 Accès gratuit activé ! Rechargement..." });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast({ title: data.error, variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "Erreur lors de l'activation", variant: "destructive" });
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
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4 md:space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-subscription-title">
          {t.nav.subscription}
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          {isActive
            ? t.subscription.subscriptionActiveMessage
            : isTrialExpired
              ? t.subscription.trialExpired
              : t.subscription.trialDaysRemaining.replace("{days}", String(subscription?.trialDaysRemaining || 0))}
        </p>
      </div>

      {/* Alerts */}
      {isTrialExpired && (
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800 max-w-2xl mx-auto" data-testid="alert-trial-expired">
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
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800 max-w-2xl mx-auto" data-testid="alert-subscription-active">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <span className="font-semibold">{t.subscription.congratulations}</span>{" "}
            {t.subscription.subscriptionActiveMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Pricing Card - Centered */}
      <div className="max-w-md mx-auto">
        <Card className="border-2 border-primary/30 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Star className="h-6 w-6 text-primary fill-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                {t.landing.annualSubscription}
              </span>
            </div>
            <CardTitle className="text-5xl font-bold mb-2">
              {sectorPrice} <span className="text-2xl font-normal text-muted-foreground">CHF</span>
            </CardTitle>
            <CardDescription className="text-base">{t.landing.perYear}</CardDescription>
            <p className="text-xs text-primary/70 mt-2">Offre {sectorName}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="p-1 rounded-full bg-primary/10 shrink-0">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm">{feature.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Promo Code Card */}
      {!isActive && (
        <div className="max-w-3xl mx-auto mb-8">
          <Card className="border-2 border-green-500/30 bg-green-50/30 dark:bg-green-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="h-5 w-5 text-green-600 fill-green-600" />
                Accès partenaire
              </CardTitle>
              <CardDescription>
                Code réservé aux partenaires du programme de lancement MineralTax.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="VOTRE-CODE-PROMO"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={validatePromoMutation.isPending || !!validatedPromo}
                  />
                  <Button
                    onClick={() => validatePromoMutation.mutate(promoCode)}
                    disabled={!promoCode || validatePromoMutation.isPending || !!validatedPromo}
                    className="flex-shrink-0"
                  >
                    {validatePromoMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Valider"
                    )}
                  </Button>
                </div>

                {promoError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{promoError}</AlertDescription>
                  </Alert>
                )}

                {validatedPromo && (
                  <>
                    <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                      <Check className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800 dark:text-green-200">
                        <span className="font-semibold">✅ Code valide !</span>
                        <br />
                        Accès gratuit {validatedPromo.durationMonths} mois pour jusqu'à {validatedPromo.maxUses} utilisateurs.
                      </AlertDescription>
                    </Alert>

                    <Button
                      size="lg"
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => redeemPromoMutation.mutate(promoCode)}
                      disabled={redeemPromoMutation.isPending}
                    >
                      {redeemPromoMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-5 w-5 mr-2" />
                          Activer mon accès gratuit
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Options - Full Width */}
      {!isActive && !validatedPromo && (
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">{t.settings.choosePaymentMethod}</h2>
            <p className="text-muted-foreground">Choisissez la méthode qui vous convient le mieux</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card Payment - Recommended */}
            <Card className="relative border-2 border-primary/40 bg-primary/5 hover-elevate transition-all">
              {/* Recommended Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground shadow-lg px-4 py-1">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  {t.settings.recommended}
                </Badge>
              </div>

              <CardHeader className="pt-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-xl bg-primary/20">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{t.settings.cardSubscription}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-base mt-2">
                  {t.settings.cardSubscriptionDesc}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    {t.settings.autoRenewal}
                  </Badge>
                </div>

                <div className="pt-2">
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => checkoutMutation.mutate()}
                    disabled={checkoutMutation.isPending || onetimeMutation.isPending}
                    data-testid="button-subscribe-card"
                  >
                    {checkoutMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        {t.settings.payWithCard}
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Twint Payment */}
            <Card className="border-2 border-orange-400/30 bg-orange-50/30 dark:bg-orange-950/10 hover-elevate transition-all">
              <CardHeader className="pt-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-xl bg-orange-400/20">
                    <Smartphone className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{t.settings.twintPayment}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-base mt-2">
                  {t.settings.twintPaymentDesc}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {t.settings.manualRenewal}
                  </Badge>
                </div>

                <div className="pt-2">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-orange-400/50 hover:bg-orange-50/50"
                    onClick={() => onetimeMutation.mutate()}
                    disabled={onetimeMutation.isPending || checkoutMutation.isPending}
                    data-testid="button-subscribe-twint"
                  >
                    {onetimeMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        {t.settings.payWithTwint}
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Active Subscription State */}
      {isActive && (
        <div className="max-w-md mx-auto">
          <Card className="border-2 border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-green-100 dark:bg-green-900">
                  <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t.settings.active}</h3>
              <p className="text-muted-foreground">
                Votre abonnement est actif et vous donne accès à toutes les fonctionnalités.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Features & Benefits */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              {t.terms.section2Title.replace("2. ", "")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>{t.terms.section1Content}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <RefreshCw className="h-5 w-5" />
              Résiliation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>{t.terms.section4Content}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5" />
              Paiement sécurisé
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>{t.terms.section5Content}</p>
          </CardContent>
        </Card>
      </div>

      {/* Trial Info */}
      {isTrial && subscription?.trialDaysRemaining !== undefined && (
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800 max-w-2xl mx-auto">
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
