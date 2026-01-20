import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function VerifyEmailPage() {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setErrorMessage("Token de verification manquant");
      return;
    }

    const verifyEmail = async () => {
      try {
        await apiRequest("POST", "/api/auth/verify-email", { token });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        setStatus("success");
        setTimeout(() => {
          setLocation("/dashboard");
        }, 3000);
      } catch (error: any) {
        setStatus("error");
        setErrorMessage(error.message || "Le lien de verification est invalide ou a expire");
      }
    };

    verifyEmail();
  }, [search, setLocation]);

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
          {status === "loading" && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <Loader2 className="w-16 h-16 text-primary animate-spin" />
                </div>
                <CardTitle className="text-2xl">Verification en cours...</CardTitle>
                <CardDescription>
                  Veuillez patienter pendant que nous verifions votre email
                </CardDescription>
              </CardHeader>
            </>
          )}

          {status === "success" && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl">Email verifie</CardTitle>
                <CardDescription>
                  Votre compte est maintenant actif
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Vous allez etre redirige vers le tableau de bord dans quelques secondes...
                </p>
                <Link href="/dashboard">
                  <Button className="w-full" data-testid="button-go-to-dashboard">
                    Acceder au tableau de bord
                  </Button>
                </Link>
              </CardContent>
            </>
          )}

          {status === "error" && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-2xl">Erreur de verification</CardTitle>
                <CardDescription>
                  {errorMessage}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Le lien de verification peut etre expire ou deja utilise. Vous pouvez demander un nouveau lien depuis la page de connexion.
                </p>
                <Link href="/login">
                  <Button variant="outline" className="w-full" data-testid="button-back-to-login">
                    Retour a la connexion
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
