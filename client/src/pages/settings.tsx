import { useI18n, languageNames, type Language } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
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
import { User, Globe, CreditCard, Shield, ExternalLink } from "lucide-react";

export default function SettingsPage() {
  const { t, language, setLanguage } = useI18n();
  const { user } = useAuth();

  const languages: Language[] = ["fr", "de", "it", "en"];

  const userInitials = user
    ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || "U"
    : "U";

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-settings-title">
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
            <Badge variant="secondary">{t.settings.inactive}</Badge>
          </div>

          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">250 CHF</p>
                <p className="text-sm text-muted-foreground">{t.landing.perYear}</p>
              </div>
              <Button data-testid="button-subscribe">
                {t.settings.subscribe}
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

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
