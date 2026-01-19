import { useState } from "react";
import { useLocation, useSearch } from "wouter";
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
import { apiRequest } from "@/lib/queryClient";

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const params = new URLSearchParams(search);
  const token = params.get("token");

  const passwordChecks = {
    minLength: password.length >= 12,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const passwordValid = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast({
        title: "Erreur",
        description: "Token de reinitialisation manquant",
        variant: "destructive",
      });
      return;
    }

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
      await apiRequest("POST", "/api/auth/reset-password", { token, password });
      setResetSuccess(true);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Le lien de reinitialisation est invalide ou a expire",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
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
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl">Lien invalide</CardTitle>
              <CardDescription>
                Le lien de reinitialisation est invalide ou a expire
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/forgot-password">
                <Button variant="outline" className="w-full">
                  Demander un nouveau lien
                </Button>
              </Link>
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
          {!resetSuccess ? (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Nouveau mot de passe</CardTitle>
                <CardDescription>
                  Choisissez un nouveau mot de passe securise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nouveau mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      data-testid="input-password"
                    />
                    {password && (
                      <div className="space-y-1 text-xs">
                        <div className={`flex items-center gap-1 ${passwordChecks.minLength ? "text-green-600" : "text-muted-foreground"}`}>
                          {passwordChecks.minLength ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          <span>Au moins 12 caracteres</span>
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
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      data-testid="input-confirm-password"
                    />
                    {confirmPassword && (
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
                    data-testid="button-reset-submit"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Reinitialiser le mot de passe
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl">Mot de passe reinitialise</CardTitle>
                <CardDescription>
                  Votre mot de passe a ete modifie avec succes
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link href="/login">
                  <Button className="w-full" data-testid="button-go-to-login">
                    Se connecter
                  </Button>
                </Link>
              </CardContent>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
