import { useState, useMemo, useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Truck, Calculator, FileText, Shield, CheckCircle2, Camera, Lock, HelpCircle, Building2, ClipboardList, Banknote, ShieldCheck, ArrowRight, FileCheck } from "lucide-react";
import { Link } from "wouter";

import { calculateReimbursement } from "@shared/schema";

// Custom hook for debouncing values
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function LandingPage() {
  const { t } = useI18n();
  const [volumeLiters, setVolumeLiters] = useState(20000);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  // Debounce volume for better performance
  const debouncedVolume = useDebouncedValue(volumeLiters, 150);

  const calculatedReimbursement = useMemo(() => {
    return calculateReimbursement(debouncedVolume);
  }, [debouncedVolume]);


  // Handle sticky CTA on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCTA(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle hash navigation on page load or hash change
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          setTimeout(() => {
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }, 100);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CH", {
      style: "currency",
      currency: "CHF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fr-CH").format(num);
  };

  const features = [
    {
      icon: Truck,
      title: t.landing.feature1Title,
      description: t.landing.feature1Desc,
    },
    {
      icon: Camera,
      title: t.landing.feature4Title,
      description: t.landing.feature4Desc,
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


  return (
    <div className="min-h-screen bg-background text-foreground">
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
                <Link href="/auth">{t.common.login}</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Sticky CTA - appears after scrolling */}
      {showStickyCTA && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b shadow-sm animate-in slide-in-from-top duration-300">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row justify-between items-center gap-2 text-foreground">
            <p className="text-sm font-medium">{t.landing.readyQuestion}</p>
            <Button asChild size="sm">
              <Link href="/auth">{t.landing.startFree}</Link>
            </Button>
          </div>
        </div>
      )}

      <main className="pt-16">
        {/* Subtle Disclaimer Banner */}
        <div className="bg-muted/50 border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <p className="text-xs text-muted-foreground text-center">
              <span className="opacity-70">{t.landing.disclaimerTool}</span>
              {" • "}
              <a
                href="https://www.bazg.admin.ch/bazg/fr/home.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {t.landing.disclaimerOfficial}
              </a>
            </p>
          </div>
        </div>

        <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  {t.landing.heroTitle}
                </h1>

                <p className="text-xl text-muted-foreground max-w-lg">
                  {t.landing.heroSubtitle}
                </p>

                <p className="text-sm font-medium text-primary bg-primary/10 px-3 py-2 rounded-md inline-block">
                  {t.landing.exclusiveClaim}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild data-testid="button-cta-primary">
                    <Link href="/auth">{t.landing.cta}</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild data-testid="button-cta-secondary">
                    <Link href="/how-it-works">{t.landing.ctaSecondary}</Link>
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  {t.landing.ctaSubtext}
                </p>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{t.landing.badge1}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{t.landing.badge2}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{t.landing.badge3}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{t.landing.badge4}</span>
                  </div>
                </div>
              </div>

              <div className="relative lg:pl-8">
                <div className="relative">
                  <Card className="bg-card/50 backdrop-blur border-2">
                    <CardContent className="p-6 space-y-5">
                      <div className="text-center">
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          {t.landing.sliderLabel}
                        </p>
                        <p className="text-3xl font-bold font-mono text-foreground">
                          {formatNumber(volumeLiters)} L
                        </p>
                      </div>

                      <Slider
                        value={[volumeLiters]}
                        onValueChange={(value) => setVolumeLiters(value[0])}
                        min={1000}
                        max={100000}
                        step={1000}
                        className="py-4"
                        data-testid="slider-volume"
                      />

                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1'000 L</span>
                        <span>100'000 L</span>
                      </div>

                      <div className="h-px bg-border" />

                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {t.landing.sliderResult}
                        </p>
                        <p className="text-4xl md:text-5xl font-bold text-primary font-mono" data-testid="text-calculated-reimbursement">
                          {formatCurrency(calculatedReimbursement)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.landing.sliderRate}
                        </p>
                      </div>

                      <Button className="w-full" size="lg" asChild>
                        <Link href="/auth" data-testid="button-cta-calculator">
                          {t.landing.sliderCta}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <div className="absolute -z-10 -top-4 -right-4 w-full h-full bg-primary/10 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t.landing.statsTitle}</h2>
              <p className="text-lg text-muted-foreground">
                {t.landing.statsSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="text-center hover-elevate transition-all duration-200">
                <CardContent className="p-6">
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-primary">6'810</span>
                    <span className="text-2xl font-semibold text-primary ml-1">CHF</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{t.landing.statsReimbursement}</p>
                </CardContent>
              </Card>

              <Card className="text-center hover-elevate transition-all duration-200">
                <CardContent className="p-6">
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-green-600 dark:text-green-500">95</span>
                    <span className="text-2xl font-semibold text-green-600 dark:text-green-500 ml-1">%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{t.landing.statsConformity}</p>
                </CardContent>
              </Card>

              <Card className="text-center hover-elevate transition-all duration-200">
                <CardContent className="p-6">
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-blue-600 dark:text-blue-500">3</span>
                    <span className="text-2xl font-semibold text-blue-600 dark:text-blue-500 ml-1">h</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{t.landing.statsTimeSaved}</p>
                </CardContent>
              </Card>

              <Card className="text-center hover-elevate transition-all duration-200">
                <CardContent className="p-6">
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-amber-600 dark:text-amber-500">50+</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{t.landing.statsCompanies}</p>
                </CardContent>
              </Card>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-6">
              {t.landing.statsNote}
            </p>
          </div>
        </section>

        <section className="py-12 bg-amber-50 dark:bg-amber-950/20" id="aide-agate">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2 text-amber-800 dark:text-amber-200">
                {t.landing.seoHelpTitle}
              </h2>
              <p className="text-amber-700 dark:text-amber-300">
                {t.landing.seoHelpSubtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-background">
                <CardContent className="p-5 space-y-2">
                  <h3 className="font-semibold">{t.landing.seoHelp1Title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t.landing.seoHelp1Desc}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-background">
                <CardContent className="p-5 space-y-2">
                  <h3 className="font-semibold">{t.landing.seoHelp2Title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t.landing.seoHelp2Desc}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-background">
                <CardContent className="p-5 space-y-2">
                  <h3 className="font-semibold">{t.landing.seoHelp3Title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t.landing.seoHelp3Desc}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30" id="comment-ca-marche">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t.landing.howItWorksTitle}</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {t.landing.howItWorksSubtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold">{t.landing.step1Title}</h3>
                <p className="text-muted-foreground">
                  {t.landing.step1Desc}
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold">{t.landing.step2Title}</h3>
                <p className="text-muted-foreground">
                  {t.landing.step2Desc}
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold">{t.landing.step3Title}</h3>
                <p className="text-muted-foreground">
                  {t.landing.step3Desc}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20" id="pour-qui">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t.landing.forWhoTitle}</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {t.landing.forWhoSubtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="hover-elevate transition-all duration-200">
                  <CardContent className="p-6 space-y-3">
                    <h3 className="text-lg font-semibold">{t.landing[`forWho${i}Title` as keyof typeof t.landing]}</h3>
                    <p className="text-muted-foreground text-sm">
                      {t.landing[`forWho${i}Desc` as keyof typeof t.landing]}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30" id="quest-ce-que-la-taxe">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t.landing.whatIsTaxTitle}</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {t.landing.whatIsTaxSubtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover-elevate transition-all duration-200">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <HelpCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{t.landing.whatIsTax1Title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t.landing.whatIsTax1Desc}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate transition-all duration-200">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{t.landing.whatIsTax2Title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t.landing.whatIsTax2Desc}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate transition-all duration-200">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ClipboardList className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{t.landing.whatIsTax3Title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t.landing.whatIsTax3Desc}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate transition-all duration-200">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Banknote className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{t.landing.whatIsTax4Title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t.landing.whatIsTax4Desc}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20" id="comment-fonctionne">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t.landing.howTaxWorksTitle}</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {t.landing.howTaxWorksSubtitle}
              </p>
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

        <section className="py-20 bg-muted/30" id="demande-remboursement">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t.landing.howToClaimTitle}</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {t.landing.howToClaimSubtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-2xl font-bold">
                    {i}
                  </div>
                  <h3 className="text-xl font-semibold">{t.landing[`claimStep${i}Title` as keyof typeof t.landing]}</h3>
                  <p className="text-muted-foreground">
                    {t.landing[`claimStep${i}Desc` as keyof typeof t.landing]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20" id="conformite-ofdf">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-medium mb-6">
                <ShieldCheck className="h-5 w-5" />
                <span>{t.landing.ofdfBadge}</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">{t.landing.ofdfTitle}</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {t.landing.ofdfSubtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="p-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <FileCheck className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{t.landing.ofdfStep1Title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t.landing.ofdfStep1Desc}
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <ArrowRight className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{t.landing.ofdfStep2Title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t.landing.ofdfStep2Desc}
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{t.landing.ofdfStep3Title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t.landing.ofdfStep3Desc}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                {t.landing.ofdfNote}
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30" id="audit-conformite">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{t.landing.auditBadge}</span>
                </div>
                <h2 className="text-3xl font-bold">{t.landing.auditTitle}</h2>
                <p className="text-lg text-muted-foreground">
                  {t.landing.auditSubtitle}
                </p>
                <ul className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t.landing[`auditCheck${i}` as keyof typeof t.landing]}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Card className="bg-card border-2">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{t.landing.auditResultTitle}</p>
                      <p className="text-sm text-muted-foreground">{t.landing.auditResultSubtitle}</p>
                    </div>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.landing.auditItemMachines}</span>
                      <span className="font-mono text-green-600">12 / 12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.landing.auditItemEntries}</span>
                      <span className="font-mono text-green-600">156 / 156</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.landing.auditItemDuplicates}</span>
                      <span className="font-mono text-green-600">0</span>
                    </div>
                  </div>
                  <div className="h-px bg-border" />
                  <Button className="w-full" disabled>
                    {t.landing.auditReady}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Trust & Security Section */}
        <section className="py-20" id="confiance">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t.landing.trustTitle}</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {t.landing.trustSubtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="hover-elevate">
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      {i === 1 ? <ShieldCheck className="h-6 w-6 text-primary" /> : i === 2 ? <Lock className="h-6 w-6 text-primary" /> : i === 3 ? <FileCheck className="h-6 w-6 text-primary" /> : <HelpCircle className="h-6 w-6 text-primary" />}
                    </div>
                    <h3 className="font-semibold">{t.landing[`trust${i}Title` as keyof typeof t.landing]}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t.landing[`trust${i}Desc` as keyof typeof t.landing]}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* LinkedIn Follow Section */}
        <section className="py-12 bg-primary/5 border-y border-primary/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center space-y-6">
            <h2 className="text-2xl font-bold">{t.landing.linkedinFollow}</h2>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <a href="https://www.linkedin.com/company/mineraltax" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                LinkedIn
              </a>
            </Button>
          </div>
        </section>

        {/* Pricing Section Link */}
        <section className="py-24 bg-gradient-to-t from-background to-muted/20 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">{t.landing.pricingTitle}</h2>
            <p className="text-xl text-muted-foreground mb-10">
              {t.landing.pricingSubtitle}
            </p>
            <div className="inline-block p-1 rounded-2xl bg-muted">
              <Card className="border-0 shadow-lg px-12 py-10 rounded-xl">
                <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">{t.landing.annualSubscription}</p>
                <div className="flex items-baseline justify-center gap-1 mb-6">
                  <span className="text-5xl font-extrabold tracking-tight">CHF 250</span>
                  <span className="text-muted-foreground">/{t.landing.perYear}</span>
                </div>
                <ul className="space-y-4 text-left max-w-xs mx-auto mb-10">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span>{t.landing.pricingFeature1}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span>{t.landing.pricingFeature3}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span>{t.landing.pricingFeature4}</span>
                  </li>
                </ul>
                <Button size="lg" className="w-full rounded-full" asChild>
                  <Link href="/auth">{t.landing.pricingCta}</Link>
                </Button>
                <p className="text-xs text-muted-foreground mt-4">{t.landing.pricingTrial}</p>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-muted py-12 border-t">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8 text-foreground">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">MT</span>
                </div>
                <span className="font-bold">{t.common.appName}</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs italic">
                {t.landing.footerTagline}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.landing.footerNotAffiliated}
              </p>
            </div>

            <div className="space-y-4 text-foreground">
              <h4 className="font-bold text-sm uppercase tracking-wider">{t.landing.resources}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/how-it-works" className="hover:text-primary transition-colors">{t.nav.howItWorks}</Link></li>
                <li><Link href="/auth" className="hover:text-primary transition-colors">{t.common.login}</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">{t.landing.footerTerms}</Link></li>
              </ul>
            </div>

            <div className="space-y-4 text-foreground">
              <h4 className="font-bold text-sm uppercase tracking-wider">{t.landing.officialLinks}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://www.bazg.admin.ch/bazg/fr/home.html" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{t.landing.officialLink}</a></li>
                <li><a href="https://www.agate.ch" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Agate.ch</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-foreground">
            <p className="text-xs text-muted-foreground">
              {t.landing.footerCopyright}
            </p>
            <div className="flex gap-6 text-xs text-muted-foreground">
              <Link href="/privacy" className="hover:text-primary transition-colors">{t.landing.footerPrivacy}</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">{t.landing.footerTerms}</Link>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">
              {t.landing.legalSource}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
