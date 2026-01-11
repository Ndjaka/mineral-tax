import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Calculator, FileText, Shield, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  const { t } = useI18n();

  const features = [
    {
      icon: Truck,
      title: t.landing.feature1Title,
      description: t.landing.feature1Desc,
    },
    {
      icon: Calculator,
      title: t.landing.feature2Title,
      description: t.landing.feature2Desc,
    },
    {
      icon: FileText,
      title: t.landing.feature3Title,
      description: t.landing.feature3Desc,
    },
  ];

  const benefits = [
    "OFDF / BAZG / AFD / FOCBS",
    "Formulaire 45.35",
    "Taxas",
    "4 Sprachen / 4 langues",
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">MT</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{t.common.appName}</span>
                <span className="text-xs text-muted-foreground hidden sm:block">{t.common.tagline}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <ThemeToggle />
              <Button asChild data-testid="button-login">
                <a href="/api/login">{t.common.login}</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  <span>Swiss Made Solution</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  {t.landing.heroTitle}
                </h1>
                
                <p className="text-lg text-muted-foreground max-w-lg">
                  {t.landing.heroSubtitle}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild data-testid="button-cta-primary">
                    <a href="/api/login">{t.landing.cta}</a>
                  </Button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {benefits.map((benefit) => (
                    <div
                      key={benefit}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative lg:pl-8">
                <div className="relative">
                  <Card className="bg-card/50 backdrop-blur border-2">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          {t.reports.rate}
                        </span>
                        <span className="text-2xl font-bold text-primary font-mono">
                          0.3405 CHF/L
                        </span>
                      </div>
                      <div className="h-px bg-border" />
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t.reports.totalVolume}</span>
                          <span className="font-mono">5,000 L</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t.reports.eligibleVolume}</span>
                          <span className="font-mono">4,500 L</span>
                        </div>
                        <div className="h-px bg-border" />
                        <div className="flex justify-between">
                          <span className="font-medium">{t.reports.reimbursementAmount}</span>
                          <span className="text-xl font-bold text-primary font-mono">
                            CHF 1,532.25
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="absolute -z-10 -top-4 -right-4 w-full h-full bg-primary/10 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t.landing.trustedBy}</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover-elevate transition-all duration-200">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-primary text-primary-foreground overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold">{t.landing.annualSubscription}</h2>
                    <p className="text-primary-foreground/80">
                      {t.landing.heroSubtitle}
                    </p>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="inline-block">
                      <span className="text-5xl md:text-6xl font-bold">250</span>
                      <span className="text-2xl ml-2">CHF</span>
                      <p className="text-primary-foreground/80 mt-2">{t.landing.perYear}</p>
                    </div>
                    <div className="mt-6">
                      <Button 
                        size="lg" 
                        variant="secondary"
                        asChild
                        data-testid="button-subscribe"
                      >
                        <a href="/api/login">{t.settings.subscribe}</a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>&copy; 2026 MineralTax Swiss.</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>OFDF / BAZG / AFD / FOCBS</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
