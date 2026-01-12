import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Calculator, FileText, Shield, CheckCircle2, ScrollText, Camera, Lock, HelpCircle, Building2, ClipboardList, Banknote } from "lucide-react";
import { Link } from "wouter";

export default function LandingPage() {
  const { t } = useI18n();

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
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          Taux de remboursement OFDF
                        </span>
                        <span className="text-2xl font-bold text-primary font-mono">
                          0.3405 CHF/L
                        </span>
                      </div>
                      <div className="h-px bg-border" />
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Volume total</span>
                          <span className="font-mono">5,000 L</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Volume éligible</span>
                          <span className="font-mono">4,500 L</span>
                        </div>
                        <div className="h-px bg-border" />
                        <div className="flex justify-between gap-2">
                          <span className="font-medium">Remboursement</span>
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

        <section className="py-20" id="pourquoi-mineraltax">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-primary text-primary-foreground overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold">Pourquoi utiliser MineralTax ?</h2>
                    <ul className="space-y-3 text-primary-foreground/90">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <span>Conforme aux exigences de l'OFDF / BAZG / AFD</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <span>Rapports PDF compatibles formulaire 45.35</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <span>Calcul automatique au taux officiel 0.3405 CHF/L</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <span>Interface en 4 langues (FR, DE, IT, EN)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <span>Scan OCR des tickets de carburant</span>
                      </li>
                    </ul>
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
                        <a href="/api/login">Commencer l'essai gratuit</a>
                      </Button>
                      <p className="text-sm text-primary-foreground/70 mt-2">
                        10 jours d'essai gratuit
                      </p>
                    </div>
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
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
              <span>OFDF / BAZG / AFD / FOCBS</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
