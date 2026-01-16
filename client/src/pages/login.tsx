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
import { Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function LoginPage() {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiRequest("POST", "/api/auth/local/login", formData);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur MineralTax",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Email ou mot de passe incorrect",
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
            <CardTitle className="text-2xl">{t.auth?.login || "Connexion"}</CardTitle>
            <CardDescription>
              {t.auth?.loginDescription || "Connectez-vous à votre compte MineralTax"}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                <Label htmlFor="password">{t.auth?.password || "Mot de passe"}</Label>
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

            <div className="mt-6 text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">{t.auth?.or || "ou"}</span>
                </div>
              </div>

              <Button variant="outline" asChild className="w-full" data-testid="button-login-replit">
                <a href="/api/login">{t.auth?.loginWithReplit || "Continuer avec Replit"}</a>
              </Button>

              <p className="text-sm text-muted-foreground">
                {t.auth?.noAccount || "Pas encore de compte ?"}{" "}
                <Link href="/register" className="text-primary hover:underline" data-testid="link-register">
                  {t.auth?.createAccount || "Créer un compte"}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
