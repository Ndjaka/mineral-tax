import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation, useSearch } from "wouter";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AUTH_USER_QUERY_KEY } from "@/hooks/use-auth";

export default function RegisterPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Récupérer le secteur depuis l'URL (?sector=agriculture ou ?sector=btp)
  const urlParams = new URLSearchParams(search);
  const sectorFromUrl = urlParams.get("sector");
  const initialSector = (sectorFromUrl === "agriculture" || sectorFromUrl === "btp") ? sectorFromUrl : "";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    activitySector: initialSector as "agriculture" | "btp" | "",
    companyName: "",
  });

  const passwordChecks = {
    minLength: formData.password.length >= 12,
    hasLetter: /[a-zA-Z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
  };

  const passwordValid = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordValid) {
      toast({
        title: "Mot de passe invalide",
        description: "Le mot de passe doit contenir au moins 12 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (!passwordsMatch) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/auth/register", {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        activitySector: formData.activitySector || undefined,
        companyName: formData.companyName || undefined,
      });
      const data = await response.json();

      if (data.autoVerified) {
        toast({
          title: "Compte cree",
          description: "Vous etes maintenant connecte (mode developpement)",
        });
        window.location.href = "/dashboard";
        return;
      }

      setRegisteredEmail(formData.email);
      setRegistrationSuccess(true);
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/">
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">MT</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{t.common.appName}</span>
                    <span className="text-xs text-muted-foreground hidden sm:block">{t.common.tagline}</span>
                  </div>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <LanguageSelector />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center pt-16 pb-8 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Verifiez votre email</CardTitle>
              <CardDescription>
                Un email de verification a ete envoye
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Nous avons envoye un email de verification a <strong>{registeredEmail}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Cliquez sur le lien dans l'email pour activer votre compte. Le lien expire dans 24 heures.
              </p>
              <Alert className="text-left">
                <AlertDescription className="text-sm">
                  Vous ne trouvez pas l'email ? Verifiez votre dossier spam ou{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    retournez a la connexion
                  </Link>{" "}
                  pour renvoyer l'email.
                </AlertDescription>
              </Alert>
              <div className="pt-4">
                <Link href="/login">
                  <Button variant="outline" className="w-full" data-testid="button-back-to-login">
                    Retour a la connexion
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">MT</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{t.common.appName}</span>
                  <span className="text-xs text-muted-foreground hidden sm:block">{t.common.tagline}</span>
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center pt-16 pb-8 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t.auth?.register || "Créer un compte"}</CardTitle>
            <CardDescription>
              {t.auth?.registerDescription || "Commencez votre essai gratuit de 10 jours"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t.auth?.firstName || "Prénom"}</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Jean"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    data-testid="input-firstname"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t.auth?.lastName || "Nom"}</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Dupont"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    data-testid="input-lastname"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activitySector">Secteur d'activité</Label>
                <Select
                  value={formData.activitySector}
                  onValueChange={(value: "agriculture" | "btp") => setFormData({ ...formData, activitySector: value })}
                >
                  <SelectTrigger id="activitySector" data-testid="select-activity-sector">
                    <SelectValue placeholder="Sélectionnez votre secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agriculture">Agriculture</SelectItem>
                    <SelectItem value="btp">BTP (Bâtiment et Travaux Publics)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Le secteur d'activité permet d'appliquer les bons taux de remboursement
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Raison sociale (optionnel)</Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Nom de votre entreprise"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  data-testid="input-company-name"
                />
                <p className="text-xs text-muted-foreground">
                  Le nom légal de votre entreprise
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t.auth?.email || "Email"} *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@entreprise.ch"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t.auth?.password || "Mot de passe"} *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  data-testid="input-password"
                />
                {formData.password && (
                  <div className="space-y-1 text-xs">
                    <div className={`flex items-center gap-1 ${passwordChecks.minLength ? "text-green-600" : "text-muted-foreground"}`}>
                      {passwordChecks.minLength ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      <span>Au moins 12 caractères</span>
                    </div>
                    <div className={`flex items-center gap-1 ${passwordChecks.hasLetter ? "text-green-600" : "text-muted-foreground"}`}>
                      {passwordChecks.hasLetter ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      <span>Au moins une lettre</span>
                    </div>
                    <div className={`flex items-center gap-1 ${passwordChecks.hasNumber ? "text-green-600" : "text-muted-foreground"}`}>
                      {passwordChecks.hasNumber ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      <span>Au moins un chiffre</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.auth?.confirmPassword || "Confirmer le mot de passe"} *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  data-testid="input-confirm-password"
                />
                {formData.confirmPassword && (
                  <div className={`flex items-center gap-1 text-xs ${passwordsMatch ? "text-green-600" : "text-destructive"}`}>
                    {passwordsMatch ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    <span>{passwordsMatch ? "Les mots de passe correspondent" : "Les mots de passe ne correspondent pas"}</span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !passwordValid || !passwordsMatch}
                data-testid="button-register-submit"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.auth?.registerButton || "Créer mon compte"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                En créant un compte, vous acceptez nos{" "}
                <Link href="/terms" className="text-primary hover:underline">conditions d'utilisation</Link>
                {" "}et notre{" "}
                <Link href="/privacy" className="text-primary hover:underline">politique de confidentialité</Link>.
              </p>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t.auth?.hasAccount || "Déjà un compte ?"}{" "}
                <Link href="/login" className="text-primary hover:underline" data-testid="link-login">
                  {t.auth?.loginLink || "Se connecter"}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
