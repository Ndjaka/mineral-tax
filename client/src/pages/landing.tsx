import { useState, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Truck, Calculator, FileText, Shield, CheckCircle2, ScrollText, Camera, Lock, HelpCircle, Building2, ClipboardList, Banknote, ShieldCheck, ArrowRight, FileCheck } from "lucide-react";
import { Link } from "wouter";

const REIMBURSEMENT_RATE = 0.3405;

export default function LandingPage() {
  const { t, language } = useI18n();
  const [volumeLiters, setVolumeLiters] = useState(20000);
  
  const calculatedReimbursement = useMemo(() => {
    return volumeLiters * REIMBURSEMENT_RATE;
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
                  Taxe sur les huiles minérales en Suisse
                  <span className="block text-2xl md:text-3xl mt-2 text-muted-foreground font-normal">
                    (Taxe minéral Suisse)
                  </span>
                </h1>
                
                <p className="text-lg text-muted-foreground max-w-lg">
                  Simplifiez vos demandes de remboursement de l'impôt sur les huiles minérales. 
                  Plateforme professionnelle compatible avec Taxas et le formulaire 45.35.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild data-testid="button-cta-primary">
                    <a href="/api/login">{t.landing.cta}</a>
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {t.terms.bySigningIn}{" "}
                  <Link href="/terms" className="text-primary underline hover:no-underline" data-testid="link-terms-hero">
                    {t.terms.termsLink}
                  </Link>
                </p>

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

        <section className="py-20 bg-muted/30" id="quest-ce-que-la-taxe">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Qu'est-ce que la taxe sur les huiles minérales ?</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                La taxe sur les huiles minérales (Mineralölsteuer) est un impôt spécial prélevé sur les carburants, 
                huiles de chauffage et gaz en Suisse. Elle est perçue au niveau du commerce et répercutée sur le consommateur final.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover-elevate transition-all duration-200">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <HelpCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Produits concernés</h3>
                  <p className="text-muted-foreground text-sm">
                    Diesel, essence, huiles de chauffage, gaz naturel et autres combustibles fossiles utilisés en Suisse.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover-elevate transition-all duration-200">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Qui est concerné ?</h3>
                  <p className="text-muted-foreground text-sm">
                    Entreprises de construction, agriculteurs, exploitants de machines hors route et flottes professionnelles.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover-elevate transition-all duration-200">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ClipboardList className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Plateforme Taxas</h3>
                  <p className="text-muted-foreground text-sm">
                    La plateforme officielle Taxas de l'OFDF gère les déclarations et remboursements de la taxe minérale.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover-elevate transition-all duration-200">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Banknote className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Exemptions fiscales</h3>
                  <p className="text-muted-foreground text-sm">
                    Réductions et remboursements disponibles pour certains usages professionnels hors route.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20" id="comment-fonctionne">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Comment fonctionne l'impôt minéral en Suisse ?</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                L'impôt sur les huiles minérales Suisse est calculé selon le volume de carburant consommé. 
                Le taux actuel de remboursement est de <strong>0.3405 CHF par litre</strong> pour les machines hors route.
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
              <h2 className="text-3xl font-bold mb-4">Comment déposer une demande de remboursement ?</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                MineralTax simplifie la procédure de remboursement de la taxe minérale. 
                Générez des rapports compatibles avec le formulaire 45.35 et soumettez-les via Taxas.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold">Enregistrez vos machines</h3>
                <p className="text-muted-foreground">
                  Ajoutez vos machines hors route éligibles : pelles, chargeuses, bulldozers, grues et plus encore.
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold">Enregistrez le carburant</h3>
                <p className="text-muted-foreground">
                  Scannez vos tickets ou saisissez manuellement vos consommations de diesel et essence.
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold">Générez le rapport</h3>
                <p className="text-muted-foreground">
                  Exportez un rapport PDF conforme au formulaire 45.35 pour soumission à l'OFDF via Taxas.
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

        <section className="py-20" id="tarifs">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Card className="bg-primary text-primary-foreground overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold">Offre de Lancement Exclusive</h2>
                  
                  <div className="py-4">
                    <span className="text-5xl md:text-6xl font-bold">250</span>
                    <span className="text-2xl ml-2">CHF</span>
                    <p className="text-primary-foreground/80 mt-2">par an (HT)</p>
                  </div>
                  
                  <ul className="space-y-3 text-primary-foreground/90 text-left max-w-md mx-auto">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>10 jours d'essai gratuit (sans carte bancaire)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>Accès complet à toutes les fonctionnalités</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>Idéal pour toutes les flottes (Route & Hors-Route)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>Archivage sécurisé en Suisse</span>
                    </li>
                  </ul>
                  
                  <div className="pt-4">
                    <Button 
                      size="lg" 
                      variant="secondary"
                      asChild
                      data-testid="button-subscribe"
                    >
                      <a href="/api/login">Commencer l'essai gratuit</a>
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
              <h2 className="text-3xl font-bold mb-4">Questions fréquentes</h2>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Qu'est-ce que la taxe minéral Suisse ?</h3>
                  <p className="text-muted-foreground">
                    La taxe minéral Suisse, ou impôt sur les huiles minérales, est une taxe prélevée sur les carburants 
                    et combustibles. Les entreprises utilisant des machines hors route peuvent demander un remboursement 
                    partiel de cette taxe auprès de l'OFDF.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Comment obtenir un remboursement ?</h3>
                  <p className="text-muted-foreground">
                    Pour obtenir un remboursement de la taxe sur les huiles minérales, vous devez soumettre une demande 
                    via la plateforme Taxas de l'OFDF avec le formulaire 45.35. MineralTax génère automatiquement 
                    les rapports conformes à ces exigences.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Quels sont les taux de remboursement ?</h3>
                  <p className="text-muted-foreground">
                    Le taux de remboursement actuel est de 0.3405 CHF par litre de carburant utilisé 
                    dans des machines hors route. Ce taux est fixé par l'Office fédéral de la douane 
                    et de la sécurité des frontières (OFDF/BAZG).
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Quelles machines sont éligibles ?</h3>
                  <p className="text-muted-foreground">
                    Les machines éligibles incluent les pelles mécaniques, chargeuses, bulldozers, grues, 
                    compacteurs, foreuses, générateurs et autres équipements de construction qui ne circulent 
                    pas sur la voie publique.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>&copy; 2026 MineralTax Swiss. Plateforme de remboursement de la taxe minérale en Suisse.</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <Link 
                href="/ressources" 
                className="flex items-center gap-1 hover:text-foreground transition-colors"
                data-testid="link-ressources-footer"
              >
                <span>{language === "fr" ? "Ressources" : language === "de" ? "Ressourcen" : language === "it" ? "Risorse" : "Resources"}</span>
              </Link>
              <span className="text-muted-foreground/50">|</span>
              <Link 
                href="/terms" 
                className="flex items-center gap-1 hover:text-foreground transition-colors"
                data-testid="link-terms-footer"
              >
                <ScrollText className="h-4 w-4" />
                <span>{t.nav.terms}</span>
              </Link>
              <span className="text-muted-foreground/50">|</span>
              <Link 
                href="/privacy" 
                className="flex items-center gap-1 hover:text-foreground transition-colors"
                data-testid="link-privacy-footer"
              >
                <Lock className="h-4 w-4" />
                <span>{t.privacy?.title || "Confidentialité"}</span>
              </Link>
              <span className="text-muted-foreground/50">|</span>
              <a 
                href="https://www.bazg.admin.ch/bazg/fr/home.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
                data-testid="link-ofdf"
              >
                OFDF / BAZG / AFD / FOCBS
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
