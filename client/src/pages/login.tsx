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
import { Loader2, Mail } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setEmailNotVerified(false);

    try {
      await apiRequest("POST", "/api/auth/login", formData);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Connexion reussie",
        description: "Bienvenue sur MineralTax",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      if (error.emailNotVerified) {
        setEmailNotVerified(true);
        setUnverifiedEmail(error.email || formData.email);
      } else {
        toast({
          title: "Erreur de connexion",
          description: error.message || "Email ou mot de passe incorrect",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await apiRequest("POST", "/api/auth/resend-verification", { email: unverifiedEmail });
      toast({
        title: "Email envoye",
        description: "Un nouveau lien de verification a ete envoye a votre adresse email",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer l'email",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
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
            <CardTitle className="text-2xl">{t.auth?.login || "Connexion"}</CardTitle>
            <CardDescription>
              {t.auth?.loginDescription || "Connectez-vous à votre compte MineralTax"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailNotVerified && (
              <Alert className="mb-4 border-amber-500 bg-amber-50 dark:bg-amber-950">
                <Mail className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  <p className="font-medium mb-2">Email non verifie</p>
                  <p className="text-sm mb-3">Veuillez verifier votre email avant de vous connecter. Consultez votre boite de reception.</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleResendVerification}
                    disabled={isResending}
                    data-testid="button-resend-verification"
                  >
                    {isResending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    Renvoyer l'email de verification
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t.auth?.email || "Email"}</Label>
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t.auth?.password || "Mot de passe"}</Label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline" data-testid="link-forgot-password">
                    Mot de passe oublie ?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  data-testid="input-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-login-submit">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.auth?.loginButton || "Se connecter"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t.auth?.noAccount || "Pas encore de compte ?"}{" "}
                <Link href="/register" className="text-primary hover:underline" data-testid="link-register">
                  {t.auth?.createAccount || "Creer un compte"}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
