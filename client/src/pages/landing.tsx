import { useState, useMemo, useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Truck, Calculator, FileText, Shield, CheckCircle2, ScrollText, Camera, Lock, HelpCircle, Building2, ClipboardList, Banknote, ShieldCheck, ArrowRight, FileCheck, Star, Check } from "lucide-react";
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

// Custom hook for scroll animations
function useScrollAnimation() {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

export default function LandingPage() {
  const { t, language } = useI18n();
  const [volumeLiters, setVolumeLiters] = useState(20000);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [selectedSector, setSelectedSector] = useState<"agriculture" | "btp">("agriculture");

  // Debounce volume for better performance
  const debouncedVolume = useDebouncedValue(volumeLiters, 150);

  const calculatedReimbursement = useMemo(() => {
    // Taux uniforme pour tous les secteurs (impôt sur les huiles minérales uniquement)
    const rate = 0.3405;
    return debouncedVolume * rate;
  }, [debouncedVolume, selectedSector]);


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
        // Remove the # and find the element
        const id = hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          // Small delay to ensure page is fully rendered
          setTimeout(() => {
            // Scroll with offset to account for fixed header
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

    // Check hash on mount
    handleHashChange();

    // Listen for hash changes
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

      {/* Sticky CTA - appears after scrolling */}
      {showStickyCTA && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b shadow-sm animate-in slide-in-from-top duration-300">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-sm font-medium">Prêt à simplifier vos déclarations ?</p>
            <Button asChild size="sm">
              <Link href="/register">Commencer gratuitement</Link>
            </Button>
          </div>
        </div>
      )}

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
            <div className="max-w-3xl mx-auto text-center space-y-8">
              {/* H1 SEO optimisé */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Préparez votre dossier Taxas sans erreurs ni stress
              </h1>

              {/* Sous-titre */}
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                MineralTax est un assistant suisse qui structure et vérifie vos données
                avant la saisie manuelle sur la plateforme officielle Taxas.
              </p>

              {/* CTA principal */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild data-testid="button-cta-primary">
                  <Link href="/register">Commencer gratuitement</Link>
                </Button>
                <Button size="lg" variant="outline" asChild data-testid="button-cta-secondary">
                  <a href="#comment-ca-marche">Comment ça marche ?</a>
                </Button>
              </div>

              {/* Micro-rassurance compacte */}
              <div className="flex flex-wrap justify-center gap-4 pt-4 text-sm text-muted-foreground">
                <span>✔ Aucun calcul fiscal</span>
                <span>✔ Aucune transmission automatique</span>
                <span>✔ Données hébergées en Suisse</span>
              </div>
            </div>
          </div>
        </section>

        {/* === SECTION 2 : PROBLÈME (COURT, FACTUEL) === */}
        <section className="py-16 bg-gradient-to-b from-background to-muted/20" id="probleme">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Chaque année, des milliers de dossiers sont incomplets ou abandonnés
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Par manque de temps ou par peur de faire une erreur,
              de nombreuses entreprises renoncent à déposer leur demande
              ou risquent un refus lors d'un contrôle.
            </p>
          </div>
        </section>

        {/* === SECTION 3 : LA SOLUTION MINERALTAX (3 BÉNÉFICES) === */}
        <section className="py-16 bg-muted/30" id="solution">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                La solution MineralTax
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="hover-elevate transition-all duration-200 border-2 border-green-200 dark:border-green-800">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-4">🗂️</div>
                  <h3 className="text-xl font-semibold mb-3">Données structurées</h3>
                  <p className="text-muted-foreground">
                    Vos surfaces, machines et affectations sont organisées de manière cohérente.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate transition-all duration-200 border-2 border-blue-200 dark:border-blue-800">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-3">Préparation vérifiée</h3>
                  <p className="text-muted-foreground">
                    MineralTax met en évidence les données manquantes ou incohérentes.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate transition-all duration-200 border-2 border-purple-200 dark:border-purple-800">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-4">📄</div>
                  <h3 className="text-xl font-semibold mb-3">Journal de préparation</h3>
                  <p className="text-muted-foreground">
                    Un document horodaté attestant que votre dossier a été préparé sérieusement avant la saisie sur Taxas.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* === SECTION 4 : DIFFÉRENCIATION LÉGALE === */}
        <section className="py-12 bg-background" id="positionnement">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Un assistant, pas un calculateur fiscal</h2>
            </div>
            <Card className="border-2 border-primary/30 bg-muted/10">
              <CardContent className="p-8">
                <p className="text-muted-foreground mb-6">
                  MineralTax :
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <span className="text-red-500 font-bold">•</span>
                    <span>ne calcule aucun remboursement</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <span className="text-red-500 font-bold">•</span>
                    <span>ne transmet aucune donnée à l'administration</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <span className="text-red-500 font-bold">•</span>
                    <span>ne valide aucune conformité légale</span>
                  </li>
                </ul>
                <p className="text-muted-foreground font-medium">
                  Il vous aide uniquement à préparer vos données avant la saisie manuelle sur Taxas.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>


        {/* === SECTION 5 : COMMENT ÇA MARCHE (4 ÉTAPES) === */}
        <section className="py-20 bg-muted/30" id="comment-ca-marche">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Comment ça marche ?</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold">Saisissez vos données</h3>
                <p className="text-muted-foreground text-sm">
                  Surfaces, machines, chantiers ou consommations (selon votre activité).
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold">Suivez le parcours</h3>
                <p className="text-muted-foreground text-sm">
                  Une checklist guidée vous indique ce qu'il reste à compléter.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold">Générez le Journal</h3>
                <p className="text-muted-foreground text-sm">
                  Document interne, explicable à une fiduciaire ou en cas de contrôle.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl font-bold">
                  4
                </div>
                <h3 className="text-xl font-semibold">Exportez et saisissez</h3>
                <p className="text-muted-foreground text-sm">
                  Vous restez seul responsable de la déclaration officielle sur Taxas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* === SECTION 6 : POUR QUI ? === */}
        <section className="py-16" id="pour-qui">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Pour qui ?</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover-elevate transition-all duration-200 text-center">
                <CardContent className="p-6 space-y-3">
                  <div className="text-4xl">🌾</div>
                  <h3 className="text-lg font-semibold">Exploitations agricoles</h3>
                </CardContent>
              </Card>

              <Card className="hover-elevate transition-all duration-200 text-center">
                <CardContent className="p-6 space-y-3">
                  <div className="text-4xl">🏗️</div>
                  <h3 className="text-lg font-semibold">Entreprises de construction (BTP)</h3>
                </CardContent>
              </Card>

              <Card className="hover-elevate transition-all duration-200 text-center">
                <CardContent className="p-6 space-y-3">
                  <div className="text-4xl">🚜</div>
                  <h3 className="text-lg font-semibold">Machines hors route</h3>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* === SECTION 7 : PREUVE & CONFIANCE === */}
        <section className="py-16 bg-muted/30" id="confiance-v1">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Preuve & Confiance</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center hover-elevate">
                <CardContent className="p-6 space-y-3">
                  <div className="text-3xl">🇨🇭</div>
                  <h3 className="font-semibold">Données hébergées en Suisse</h3>
                </CardContent>
              </Card>

              <Card className="text-center hover-elevate">
                <CardContent className="p-6 space-y-3">
                  <div className="text-3xl">🔒</div>
                  <h3 className="font-semibold">Aucune transmission automatique</h3>
                </CardContent>
              </Card>

              <Card className="text-center hover-elevate">
                <CardContent className="p-6 space-y-3">
                  <div className="text-3xl">✅</div>
                  <h3 className="font-semibold">Compatible avec Taxas</h3>
                </CardContent>
              </Card>

              <Card className="text-center hover-elevate">
                <CardContent className="p-6 space-y-3">
                  <div className="text-3xl">🔐</div>
                  <h3 className="font-semibold">Outil privé, non officiel</h3>
                </CardContent>
              </Card>
            </div>

            {/* Lien officiel Taxas/OFDF */}
            <div className="mt-10 p-6 bg-muted/50 rounded-lg border">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-semibold">Portail officiel OFDF</p>
                    <p className="text-sm text-muted-foreground">Accédez à la plateforme Taxas</p>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <a
                    href="https://www.bazg.admin.ch/bazg/fr/home/actualites/forumd/fuer-fachleute/rueckerstattung-co2-abgabe-verbrauchssteuerplattform-taxas.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="link-taxas-official"
                  >
                    Accéder à Taxas <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* === SECTION 7 : URGENCE RÉGLEMENTAIRE === */}
        <section className="py-12 bg-amber-50 dark:bg-amber-950/20" id="urgence-2026">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-sm font-medium mb-6">
              <span className="text-lg">⚠️</span>
              <span>Changement réglementaire</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-amber-900 dark:text-amber-200">
              Taxas devient obligatoire dès 2026
            </h2>
            <p className="text-lg text-amber-700 dark:text-amber-300 max-w-2xl mx-auto">
              Préparer ses données à l'avance évite les erreurs et le stress de dernière minute.
            </p>
            <div className="mt-6">
              <Button size="lg" asChild>
                <Link href="/register">Préparer mon dossier maintenant</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* === SECTION PRICING === */}
        <section className="py-20 bg-background" id="pricing">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Tarifs simples et transparents</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Un abonnement annuel par entreprise. Pas de frais cachés, pas de calcul fiscal.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Offre Agriculture */}
              <Card className="border-2 border-green-500/30 hover-elevate transition-all duration-200">
                <CardHeader className="text-center pb-4">
                  <div className="text-4xl mb-3">🌾</div>
                  <CardTitle className="text-xl mb-2">Agriculture</CardTitle>
                  <div className="text-4xl font-bold text-green-600">
                    150 <span className="text-lg font-normal text-muted-foreground">CHF/an</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Gestion des surfaces agricoles</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Gestion des machines agricoles</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Score de cohérence (Art. 18 LMin)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Parcours guidé de préparation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Journal de préparation PDF</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Export CSV compatible Taxas</span>
                    </li>
                  </ul>
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      Le remboursement agricole est calculé par l'OFDF selon des normes forfaitaires.
                      MineralTax ne calcule aucun montant.
                    </p>
                  </div>
                  <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                    <Link href="/register?sector=agriculture">Commencer</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Offre BTP */}
              <Card className="border-2 border-blue-500/30 hover-elevate transition-all duration-200">
                <CardHeader className="text-center pb-4">
                  <div className="text-4xl mb-3">🏗️</div>
                  <CardTitle className="text-xl mb-2">BTP / Construction</CardTitle>
                  <div className="text-4xl font-bold text-blue-600">
                    390 <span className="text-lg font-normal text-muted-foreground">CHF/an</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span>Gestion des machines BTP</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span>Gestion des chantiers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span>Affectations machines ↔ chantiers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span>Traçabilité carburant</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span>Score de conformité BTP</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span>Journal renforcé + Export CSV</span>
                    </li>
                  </ul>
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      MineralTax structure et trace les données.
                      La validation finale appartient à l'OFDF.
                    </p>
                  </div>
                  <Button asChild className="w-full">
                    <Link href="/register?sector=btp">Commencer</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Positionnement légal */}
            <div className="mt-12 max-w-2xl mx-auto text-center">
              <div className="inline-flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">✗ Pas de calcul fiscal</span>
                <span className="flex items-center gap-1">✗ Pas de simulation</span>
                <span className="flex items-center gap-1">✗ Pas de déclaration</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Outil de préparation défendable en cas de contrôle
              </p>
            </div>
          </div>
        </section>

        {/* === SECTION 8 : FAQ (OBJECTIONS) === */}
        <section className="py-20 bg-muted/30" id="faq">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Questions fréquentes</h2>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">MineralTax calcule-t-il le remboursement ?</h3>
                  <p className="text-muted-foreground">
                    <strong>Non.</strong> MineralTax structure et vérifie vos données, mais ne calcule pas de montant de remboursement.
                    Le calcul officiel est effectué par l'OFDF via la plateforme Taxas.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Est-ce reconnu par l'OFDF ?</h3>
                  <p className="text-muted-foreground">
                    MineralTax est un <strong>outil de préparation indépendant</strong>. Il n'est pas validé ni certifié par l'OFDF.
                    La demande officielle doit être effectuée via le portail Taxas.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Puis-je travailler avec ma fiduciaire ?</h3>
                  <p className="text-muted-foreground">
                    <strong>Oui.</strong> Vous pouvez partager votre Journal de Préparation (PDF) avec votre fiduciaire ou comptable
                    pour faciliter la saisie dans Taxas.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Mes données sont-elles sécurisées ?</h3>
                  <p className="text-muted-foreground">
                    <strong>Oui.</strong> Vos données sont hébergées en Suisse, protégées par chiffrement.
                    Aucune donnée n'est transmise à des tiers ni à l'administration sans votre action.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* === SECTION 10 : CTA FINAL === */}
        <section className="py-20 bg-gradient-to-b from-background to-primary/5">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Prêt à préparer votre dossier sereinement ?
            </h2>

            <Button size="lg" asChild data-testid="button-cta-final">
              <Link href="/register">Commencer gratuitement</Link>
            </Button>
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
              <div className="flex items-center gap-4">
                <a
                  href="https://www.linkedin.com/company/mineraltax/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  data-testid="link-linkedin-footer"
                  aria-label="Suivez-nous sur LinkedIn"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span className="hidden sm:inline">LinkedIn</span>
                </a>
                <span>{t.landing.footerDisclaimer}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
