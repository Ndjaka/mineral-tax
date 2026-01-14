import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calculator, Truck, FileText, ArrowRight, CheckCircle } from "lucide-react";

export default function RessourcesPage() {
  const { t, language } = useI18n();

  const articles = [
    {
      slug: "guide-remboursement",
      icon: FileText,
      title: {
        fr: "Guide complet du remboursement de la taxe sur les huiles minérales",
        de: "Vollständiger Leitfaden zur Rückerstattung der Mineralölsteuer",
        it: "Guida completa al rimborso dell'imposta sugli oli minerali",
        en: "Complete Guide to Mineral Oil Tax Reimbursement",
      },
      description: {
        fr: "Tout savoir sur le formulaire 45.35, les délais et la procédure OFDF/Taxas",
        de: "Alles über Formular 45.35, Fristen und das BAZG/Taxas-Verfahren",
        it: "Tutto sul modulo 45.35, le scadenze e la procedura AFD/Taxas",
        en: "Everything about Form 45.35, deadlines and the FOCBS/Taxas procedure",
      },
      badge: { fr: "Populaire", de: "Beliebt", it: "Popolare", en: "Popular" },
    },
    {
      slug: "machines-eligibles",
      icon: Truck,
      title: {
        fr: "Machines et véhicules éligibles au remboursement",
        de: "Rückerstattungsberechtigte Maschinen und Fahrzeuge",
        it: "Macchine e veicoli ammissibili al rimborso",
        en: "Machines and Vehicles Eligible for Reimbursement",
      },
      description: {
        fr: "Catégories officielles Taxas, plaques d'immatriculation et exceptions",
        de: "Offizielle Taxas-Kategorien, Nummernschilder und Ausnahmen",
        it: "Categorie ufficiali Taxas, targhe e eccezioni",
        en: "Official Taxas categories, license plates and exceptions",
      },
      badge: null,
    },
    {
      slug: "taux-remboursement",
      icon: Calculator,
      title: {
        fr: "Taux de remboursement OFDF 2026 : 0.3405 CHF/L",
        de: "BAZG Rückerstattungssatz 2026: 0.3405 CHF/L",
        it: "Tasso di rimborso AFD 2026: 0.3405 CHF/L",
        en: "FOCBS Reimbursement Rate 2026: 0.3405 CHF/L",
      },
      description: {
        fr: "Historique des taux, calculateur interactif et FAQ",
        de: "Tarifhistorie, interaktiver Rechner und FAQ",
        it: "Storico delle tariffe, calcolatore interattivo e FAQ",
        en: "Rate history, interactive calculator and FAQ",
      },
      badge: { fr: "Mise à jour 2026", de: "Update 2026", it: "Aggiornamento 2026", en: "2026 Update" },
    },
  ];

  const getText = (obj: Record<string, string>) => obj[language] || obj.fr;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <BookOpen className="h-3 w-3 mr-1" />
            {language === "fr" ? "Centre de ressources" : language === "de" ? "Ressourcenzentrum" : language === "it" ? "Centro risorse" : "Resource Center"}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            {language === "fr" && "Guides et ressources sur la taxe minérale suisse"}
            {language === "de" && "Leitfäden und Ressourcen zur Schweizer Mineralölsteuer"}
            {language === "it" && "Guide e risorse sull'imposta minerale svizzera"}
            {language === "en" && "Guides and Resources on Swiss Mineral Tax"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === "fr" && "Informations officielles sur le remboursement de l'impôt sur les huiles minérales en Suisse, conformément aux directives de l'OFDF."}
            {language === "de" && "Offizielle Informationen zur Rückerstattung der Mineralölsteuer in der Schweiz gemäß den BAZG-Richtlinien."}
            {language === "it" && "Informazioni ufficiali sul rimborso dell'imposta sugli oli minerali in Svizzera, secondo le direttive dell'AFD."}
            {language === "en" && "Official information on mineral oil tax reimbursement in Switzerland, according to FOCBS guidelines."}
          </p>
        </div>

        <div className="grid gap-6">
          {articles.map((article) => (
            <Link key={article.slug} href={`/ressources/${article.slug}`}>
              <Card className="hover-elevate cursor-pointer transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 h-fit shrink-0">
                      <article.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2 flex-wrap">
                        <h2 className="text-xl font-semibold">{getText(article.title)}</h2>
                        {article.badge && (
                          <Badge variant="secondary" className="shrink-0">
                            {getText(article.badge)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{getText(article.description)}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 hidden sm:block" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="mt-12 bg-primary/5 border-primary/20">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-semibold mb-2">
                  {language === "fr" && "Prêt à récupérer votre remboursement ?"}
                  {language === "de" && "Bereit, Ihre Rückerstattung zu erhalten?"}
                  {language === "it" && "Pronto a ottenere il tuo rimborso?"}
                  {language === "en" && "Ready to get your reimbursement?"}
                </h3>
                <p className="text-muted-foreground">
                  {language === "fr" && "Essai gratuit de 10 jours, sans engagement."}
                  {language === "de" && "10 Tage kostenlos testen, ohne Verpflichtung."}
                  {language === "it" && "Prova gratuita di 10 giorni, senza impegno."}
                  {language === "en" && "10-day free trial, no commitment."}
                </p>
              </div>
              <Button size="lg" asChild>
                <a href="/" data-testid="link-cta-trial">
                  {language === "fr" && "Commencer l'essai gratuit"}
                  {language === "de" && "Kostenlose Testversion starten"}
                  {language === "it" && "Inizia la prova gratuita"}
                  {language === "en" && "Start Free Trial"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <a href="/" className="text-sm text-muted-foreground hover:text-primary">
            &larr; {language === "fr" ? "Retour à l'accueil" : language === "de" ? "Zurück zur Startseite" : language === "it" ? "Torna alla home" : "Back to home"}
          </a>
        </div>
      </div>
    </div>
  );
}
