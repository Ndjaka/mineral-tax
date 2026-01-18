import { useState, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Truck, Calculator, FileText, Shield, CheckCircle2, ScrollText, Camera, Lock, HelpCircle, Building2, ClipboardList, Banknote, ShieldCheck, ArrowRight, FileCheck } from "lucide-react";
import { Link } from "wouter";

import { calculateReimbursement } from "@shared/schema";

export default function LandingPage() {
  const { t, language } = useI18n();
  const [volumeLiters, setVolumeLiters] = useState(20000);
  
  const calculatedReimbursement = useMemo(() => {
    return calculateReimbursement(volumeLiters);
  }, [volumeLiters]);

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
      title: t.landing.feature4Title || "Scan OCR",
      description: t.landing.feature4Desc || "Scannez vos tickets de carburant avec votre smartphone pour extraire automatiquement les données.",
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
                <Link href="/login">{t.common.login}</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* Subtle Disclaimer Banner - integrated with site design */}
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
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild data-testid="button-cta-primary">
                    <Link href="/register">{t.landing.cta}</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild data-testid="button-cta-secondary">
                    <a href="#comment-ca-marche">{t.landing.ctaSecondary}</a>
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
                          {t.landing.sliderLabel || "Votre consommation annuelle de diesel"}
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
                          {t.landing.sliderResult || "Vous pouvez récupérer"}
                        </p>
                        <p className="text-4xl md:text-5xl font-bold text-primary font-mono" data-testid="text-calculated-reimbursement">
                          {formatCurrency(calculatedReimbursement)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.landing.sliderRate || "Taux OFDF: 0.3405 CHF/L"}
                        </p>
                      </div>
                      
                      <Button className="w-full" size="lg" asChild>
                        <a href="/api/login" data-testid="button-cta-calculator">
                          {t.landing.sliderCta || "Commencer gratuitement"}
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <div className="absolute -z-10 -top-4 -right-4 w-full h-full bg-primary/10 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-amber-50 dark:bg-amber-950/20" id="aide-agate">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2 text-amber-800 dark:text-amber-200">
                {(t.landing as any).seoHelpTitle || "Aide : Login CH Agate Taxas - Problèmes fréquents"}
              </h2>
              <p className="text-amber-700 dark:text-amber-300">
                {(t.landing as any).seoHelpSubtitle || "Vous n'arrivez pas à vous connecter au portail Agate ou à utiliser Taxas ? Vous n'êtes pas seul(e)."}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-background">
                <CardContent className="p-5 space-y-2">
                  <h3 className="font-semibold">{(t.landing as any).seoHelp1Title || "Problème de login Agate ?"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {(t.landing as any).seoHelp1Desc || "Le portail ePortal/Agate peut être complexe. MineralTax vous permet de préparer vos données hors ligne."}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-background">
                <CardContent className="p-5 space-y-2">
                  <h3 className="font-semibold">{(t.landing as any).seoHelp2Title || "Enregistrement Taxas bloqué ?"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {(t.landing as any).seoHelp2Desc || "L'inscription sur Taxas nécessite plusieurs étapes. Utilisez MineralTax pour préparer vos données."}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-background">
                <CardContent className="p-5 space-y-2">
                  <h3 className="font-semibold">{(t.landing as any).seoHelp3Title || "Formulaire 45.35 compliqué ?"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {(t.landing as any).seoHelp3Desc || "MineralTax génère automatiquement un PDF conforme au formulaire 45.35."}
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
              <Card className="hover-elevate transition-all duration-200">
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-lg font-semibold">{t.landing.forWho1Title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t.landing.forWho1Desc}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover-elevate transition-all duration-200">
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-lg font-semibold">{t.landing.forWho2Title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t.landing.forWho2Desc}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover-elevate transition-all duration-200">
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-lg font-semibold">{t.landing.forWho3Title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t.landing.forWho3Desc}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover-elevate transition-all duration-200">
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-lg font-semibold">{t.landing.forWho4Title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t.landing.forWho4Desc}
                  </p>
                </CardContent>
              </Card>
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
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold">{t.landing.claimStep1Title}</h3>
                <p className="text-muted-foreground">
                  {t.landing.claimStep1Desc}
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold">{t.landing.claimStep2Title}</h3>
                <p className="text-muted-foreground">
                  {t.landing.claimStep2Desc}
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold">{t.landing.claimStep3Title}</h3>
                <p className="text-muted-foreground">
                  {t.landing.claimStep3Desc}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20" id="conformite-ofdf">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-medium mb-6">
                <ShieldCheck className="h-5 w-5" />
                <span>{t.landing.ofdfBadge || "Génère des fichiers compatibles OFDF 2026"}</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">{t.landing.ofdfTitle || "Compatible avec l'administration suisse"}</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {t.landing.ofdfSubtitle || "MineralTax génère des fichiers conformes aux exigences de l'OFDF. Vos données transitent en toute sécurité vers ePortal et Taxas."}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="p-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <FileCheck className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{t.landing.ofdfStep1Title || "1. Préparez vos données"}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t.landing.ofdfStep1Desc || "Saisissez vos machines et consommations dans MineralTax. L'application vérifie automatiquement la conformité."}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <ArrowRight className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{t.landing.ofdfStep2Title || "2. Exportez le rapport"}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t.landing.ofdfStep2Desc || "Générez un PDF conforme au formulaire 45.35 et un CSV compatible Taxas pour votre déclaration."}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{t.landing.ofdfStep3Title || "3. Soumettez via ePortal"}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t.landing.ofdfStep3Desc || "Connectez-vous à ePortal.admin.ch avec votre CH-Login et importez vos fichiers dans Taxas."}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                {t.landing.ofdfNote || "MineralTax ne transmet pas directement vos données à l'administration. Vous gardez le contrôle total de vos soumissions."}
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
                  <span>{t.landing.auditBadge || "Tranquillité d'esprit"}</span>
                </div>
                <h2 className="text-3xl font-bold">{t.landing.auditTitle || "Nous vérifions vos erreurs"}</h2>
                <p className="text-lg text-muted-foreground">
                  {t.landing.auditSubtitle || "Avant chaque soumission, notre système analyse automatiquement vos données pour détecter les incohérences."}
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t.landing.auditCheck1 || "Détection des doublons de factures"}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t.landing.auditCheck2 || "Vérification des volumes anormaux"}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t.landing.auditCheck3 || "Validation des catégories Taxas"}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t.landing.auditCheck4 || "Contrôle des dates et périodes"}</span>
                  </li>
                </ul>
              </div>
              
              <Card className="bg-card border-2">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{t.landing.auditResultTitle || "Audit de conformité"}</p>
                      <p className="text-sm text-muted-foreground">{t.landing.auditResultSubtitle || "Aucune erreur détectée"}</p>
                    </div>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.landing.auditItemMachines || "Machines vérifiées"}</span>
                      <span className="font-mono text-green-600">12 / 12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.landing.auditItemEntries || "Entrées analysées"}</span>
                      <span className="font-mono text-green-600">156 / 156</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.landing.auditItemDuplicates || "Doublons détectés"}</span>
                      <span className="font-mono text-green-600">0</span>
                    </div>
                  </div>
                  <div className="h-px bg-border" />
                  <Button className="w-full" disabled>
                    {t.landing.auditReady || "Prêt pour soumission"}
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
              <Card className="hover-elevate">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                    <ShieldCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold">{t.landing.trust1Title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t.landing.trust1Desc}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover-elevate">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
                    <Lock className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">{t.landing.trust2Title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t.landing.trust2Desc}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover-elevate">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto">
                    <FileCheck className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">{t.landing.trust3Title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t.landing.trust3Desc}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover-elevate">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
                    <Building2 className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="font-semibold">{t.landing.trust4Title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t.landing.trust4Desc}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-10 p-6 bg-muted/50 rounded-lg border">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-semibold">{t.landing.officialLink}</p>
                    <p className="text-sm text-muted-foreground">{t.landing.officialLinkSubtitle}</p>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <a 
                    href="https://www.bazg.admin.ch/bazg/fr/home/actualites/forumd/fuer-fachleute/rueckerstattung-co2-abgabe-verbrauchssteuerplattform-taxas.html" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    data-testid="link-taxas-official"
                  >
                    {t.landing.accessTaxas} <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30" id="tarifs">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-8">{t.landing.pricingTitle}</h2>
            <Card className="bg-primary text-primary-foreground overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="space-y-6">
                  <p className="text-lg text-primary-foreground/80">{t.landing.pricingSubtitle}</p>
                  
                  <div className="py-4">
                    <span className="text-5xl md:text-6xl font-bold">250</span>
                    <span className="text-2xl ml-2">CHF</span>
                    <p className="text-primary-foreground/80 mt-2">{t.landing.pricingPeriod}</p>
                  </div>
                  
                  <ul className="space-y-3 text-primary-foreground/90 text-left max-w-md mx-auto">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>{t.landing.pricingFeature1}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>{t.landing.pricingFeature2}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>{t.landing.pricingFeature3}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>{t.landing.pricingFeature4}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>{t.landing.pricingFeature5}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>{t.landing.pricingFeature6}</span>
                    </li>
                  </ul>
                  
                  <p className="text-sm text-primary-foreground/70">{t.landing.pricingTrial}</p>
                  
                  <div className="pt-4">
                    <Button 
                      size="lg" 
                      variant="secondary"
                      asChild
                      data-testid="button-subscribe"
                    >
                      <Link href="/register">{t.landing.pricingCta}</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-20 bg-muted/30" id="faq">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t.landing.faqTitle}</h2>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{t.landing.faq1Question}</h3>
                  <p className="text-muted-foreground">
                    {t.landing.faq1Answer}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{t.landing.faq2Question}</h3>
                  <p className="text-muted-foreground">
                    {t.landing.faq2Answer}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{t.landing.faq3Question}</h3>
                  <p className="text-muted-foreground">
                    {t.landing.faq3Answer}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{t.landing.faq4Question}</h3>
                  <p className="text-muted-foreground">
                    {t.landing.faq4Answer}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
                {t.landing.sliderResult}
              </h2>
              <p className="text-primary-foreground/90 mb-6 max-w-xl mx-auto">
                {t.landing.trustedBy}
              </p>
              <Button size="lg" variant="secondary" asChild data-testid="button-cta-final">
                <Link href="/register">{t.landing.cta}</Link>
              </Button>
              <p className="text-primary-foreground/70 text-sm mt-4">
                {t.landing.ctaSubtext}
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">MT</span>
                </div>
                <span className="font-semibold">MineralTax Swiss</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t.landing.footerTagline}
              </p>
              <p className="text-xs text-muted-foreground/70">
                {t.landing.footerNotAffiliated}
              </p>
            </div>
            
            {/* Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">{t.landing.usefulLinks}</h4>
              <div className="flex flex-col gap-2 text-sm">
                <Link href="/ressources" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-ressources-footer">
                  {t.landing.resources}
                </Link>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-terms-footer">
                  {t.nav.terms}
                </Link>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-privacy-footer">
                  {t.landing.footerPrivacy}
                </Link>
              </div>
            </div>
            
            {/* Official Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">{t.landing.officialLinks}</h4>
              <div className="flex flex-col gap-2 text-sm">
                <a 
                  href="https://www.bazg.admin.ch/bazg/fr/home/actualites/forumd/fuer-fachleute/rueckerstattung-co2-abgabe-verbrauchssteuerplattform-taxas.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-taxas-footer"
                >
                  {t.landing.taxasPlatform}
                </a>
                <a 
                  href="https://www.bazg.admin.ch/bazg/fr/home.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-ofdf-footer"
                >
                  OFDF / BAZG / AFD / FOCBS
                </a>
                <a 
                  href="https://www.ch.ch" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-chch-footer"
                >
                  {t.landing.swissPortal}
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
              <span>&copy; 2026 {t.landing.footerCopyright}</span>
              <span>{t.landing.footerDisclaimer}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
