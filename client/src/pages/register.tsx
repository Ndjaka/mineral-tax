import { useState } from "react";
import { useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function RegisterPage() {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
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
        description: "Le mot de passe doit contenir au moins 12 caractères",
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
      await apiRequest("POST", "/api/auth/local/register", {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Compte créé",
        description: "Bienvenue sur MineralTax ! Votre essai gratuit de 10 jours commence maintenant.",
      });
      setLocation("/dashboard");
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

            <div className="mt-6 text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">{t.auth?.or || "ou"}</span>
                </div>
              </div>

              <Button variant="outline" asChild className="w-full" data-testid="button-register-replit">
                <a href="/api/login">{t.auth?.loginWithReplit || "Continuer avec Replit"}</a>
              </Button>

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
