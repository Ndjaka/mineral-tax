import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useI18n, languageNames, type Language } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { User, Globe, CreditCard, Shield, ExternalLink, Loader2, RefreshCw, Smartphone } from "lucide-react";

export default function SettingsPage() {
  const { t, language, setLanguage } = useI18n();
  const { user } = useAuth();

  const languages: Language[] = ["fr", "de", "it", "en"];

  const { data: subscription } = useQuery<{
    status: string;
    trialDaysRemaining: number;
    canExport: boolean;
  }>({
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

  const handleSubscribe = () => {
    checkoutMutation.mutate();
  };

  const handleOnetimePayment = () => {
    onetimeMutation.mutate();
  };

  const userInitials = user
    ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || "U"
    : "U";
  
  const getStatusBadge = () => {
    if (!subscription) return <Badge variant="secondary">{t.settings.inactive}</Badge>;
    
    switch (subscription.status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">{t.settings.active}</Badge>;
      case "trial":
        return <Badge variant="secondary">{t.settings.trial} ({subscription.trialDaysRemaining}j)</Badge>;
      case "trial_expired":
        return <Badge variant="destructive">{t.settings.trialExpired}</Badge>;
      default:
        return <Badge variant="secondary">{t.settings.inactive}</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold" data-testid="text-settings-title">
          {t.settings.title}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {t.settings.profile}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold" data-testid="text-profile-name">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            {t.settings.language}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="language-select">{t.settings.language}</Label>
            <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
              <SelectTrigger id="language-select" className="w-full sm:w-64" data-testid="select-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    <span className="font-medium">{lang.toUpperCase()}</span>
                    <span className="ml-2 text-muted-foreground">{languageNames[lang]}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              OFDF (FR) / BAZG (DE) / AFD (IT) / FOCBS (EN)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            {t.settings.subscription}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t.settings.subscriptionStatus}</p>
              <p className="text-sm text-muted-foreground">
                {t.landing.annualSubscription}
              </p>
            </div>
            {getStatusBadge()}
          </div>

          {subscription?.status !== "active" && (
            <div className="space-y-4">
              <p className="text-sm font-medium">{t.settings.choosePaymentMethod}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border-2 border-primary/30 bg-primary/5 hover-elevate">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{t.settings.cardSubscription}</p>
                      <p className="text-sm text-muted-foreground">{t.settings.cardSubscriptionDesc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      {t.settings.autoRenewal}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-lg">250 CHF<span className="text-sm font-normal text-muted-foreground">/{t.landing.perYear}</span></p>
                    <Button 
                      onClick={handleSubscribe}
                      disabled={checkoutMutation.isPending}
                      data-testid="button-subscribe-card"
                    >
                      {checkoutMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          {t.settings.payWithCard}
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-lg border-2 border-orange-400/30 bg-orange-50/50 dark:bg-orange-950/20 hover-elevate">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-orange-400/20">
                      <Smartphone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{t.settings.twintPayment}</p>
                      <p className="text-sm text-muted-foreground">{t.settings.twintPaymentDesc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {t.settings.manualRenewal}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-lg">250 CHF<span className="text-sm font-normal text-muted-foreground">/{t.landing.perYear}</span></p>
                    <Button 
                      variant="outline"
                      onClick={handleOnetimePayment}
                      disabled={onetimeMutation.isPending}
                      data-testid="button-subscribe-twint"
                    >
                      {onetimeMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          {t.settings.payWithTwint}
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {t.reports.taxasInfo}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {t.reports.formReference}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">{t.reports.rate}</span>
            <span className="font-mono font-medium">0.3405 CHF/L</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Formulaire / Formular</span>
            <span className="font-medium">45.35</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Application</span>
            <span className="font-medium">Taxas</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
