import { useState } from "react";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Calculator, TrendingUp, ArrowRight, ArrowLeft, HelpCircle } from "lucide-react";
import { calculateReimbursement } from "@shared/schema";

export default function TauxRemboursementPage() {
  const { language } = useI18n();
  const [volume, setVolume] = useState(10000);

  const reimbursement = calculateReimbursement(volume);

  const content = {
    fr: {
      title: "Taux de remboursement OFDF 2026 : 0.3405 CHF par litre",
      subtitle: "Historique des taux, calculateur interactif et questions fréquentes",
      intro: "Le taux de remboursement de la taxe sur les huiles minérales est fixé par l'Office fédéral de la douane et de la sécurité des frontières (OFDF). Ce taux s'applique au diesel utilisé dans les machines éligibles hors route.",
      currentRate: "Taux actuel",
      perLiter: "par litre",
      calculatorTitle: "Calculateur de remboursement",
      consumption: "Consommation annuelle",
      liters: "litres",
      estimatedReimbursement: "Remboursement estimé",
      historyTitle: "Historique des taux",
      history: [
        { year: "2026", rate: "0.3405 CHF/L", note: "Taux actuel" },
        { year: "2025", rate: "0.3405 CHF/L", note: "Stable" },
        { year: "2024", rate: "0.3405 CHF/L", note: "Stable" },
        { year: "2020-2023", rate: "0.3405 CHF/L", note: "Période stable" },
      ],
      faqTitle: "Questions fréquentes",
      faq: [
        { q: "Qui fixe le taux de remboursement ?", a: "Le taux est fixé par l'OFDF (Office fédéral de la douane et de la sécurité des frontières) et peut être ajusté annuellement." },
        { q: "Le taux est-il le même pour tous les carburants ?", a: "Le taux de 0.3405 CHF/L s'applique au diesel. D'autres taux peuvent s'appliquer à d'autres carburants." },
        { q: "Comment est calculé mon remboursement ?", a: "Remboursement = Volume éligible (litres) × 0.3405 CHF/L. Seul le carburant utilisé dans des machines hors route est éligible." },
        { q: "Quand vais-je recevoir mon remboursement ?", a: "Les délais de traitement varient selon l'OFDF. Généralement, comptez 4 à 8 semaines après soumission de votre demande complète via Taxas." },
      ],
      cta: "Calculer mon remboursement exact",
      back: "Retour aux ressources",
    },
    de: {
      title: "BAZG-Rückerstattungssatz 2026: 0.3405 CHF pro Liter",
      subtitle: "Tarifhistorie, interaktiver Rechner und häufig gestellte Fragen",
      intro: "Der Rückerstattungssatz für die Mineralölsteuer wird vom Bundesamt für Zoll und Grenzsicherheit (BAZG) festgelegt. Dieser Satz gilt für Diesel, der in berechtigten Offroad-Maschinen verwendet wird.",
      currentRate: "Aktueller Satz",
      perLiter: "pro Liter",
      calculatorTitle: "Rückerstattungsrechner",
      consumption: "Jahresverbrauch",
      liters: "Liter",
      estimatedReimbursement: "Geschätzte Rückerstattung",
      historyTitle: "Tarifhistorie",
      history: [
        { year: "2026", rate: "0.3405 CHF/L", note: "Aktueller Satz" },
        { year: "2025", rate: "0.3405 CHF/L", note: "Stabil" },
        { year: "2024", rate: "0.3405 CHF/L", note: "Stabil" },
        { year: "2020-2023", rate: "0.3405 CHF/L", note: "Stabile Periode" },
      ],
      faqTitle: "Häufig gestellte Fragen",
      faq: [
        { q: "Wer legt den Rückerstattungssatz fest?", a: "Der Satz wird vom BAZG (Bundesamt für Zoll und Grenzsicherheit) festgelegt und kann jährlich angepasst werden." },
        { q: "Ist der Satz für alle Kraftstoffe gleich?", a: "Der Satz von 0.3405 CHF/L gilt für Diesel. Für andere Kraftstoffe können andere Sätze gelten." },
        { q: "Wie wird meine Rückerstattung berechnet?", a: "Rückerstattung = Berechtigtes Volumen (Liter) × 0.3405 CHF/L. Nur Kraftstoff, der in Offroad-Maschinen verwendet wird, ist berechtigt." },
        { q: "Wann erhalte ich meine Rückerstattung?", a: "Die Bearbeitungszeiten variieren beim BAZG. Rechnen Sie im Allgemeinen mit 4 bis 8 Wochen nach Einreichung Ihres vollständigen Antrags über Taxas." },
      ],
      cta: "Meine genaue Rückerstattung berechnen",
      back: "Zurück zu den Ressourcen",
    },
    it: {
      title: "Tasso di rimborso AFD 2026: 0.3405 CHF al litro",
      subtitle: "Storico delle tariffe, calcolatore interattivo e domande frequenti",
      intro: "Il tasso di rimborso dell'imposta sugli oli minerali è fissato dall'Amministrazione federale delle dogane (AFD). Questo tasso si applica al diesel utilizzato in macchine fuori strada ammissibili.",
      currentRate: "Tasso attuale",
      perLiter: "al litro",
      calculatorTitle: "Calcolatore di rimborso",
      consumption: "Consumo annuale",
      liters: "litri",
      estimatedReimbursement: "Rimborso stimato",
      historyTitle: "Storico delle tariffe",
      history: [
        { year: "2026", rate: "0.3405 CHF/L", note: "Tasso attuale" },
        { year: "2025", rate: "0.3405 CHF/L", note: "Stabile" },
        { year: "2024", rate: "0.3405 CHF/L", note: "Stabile" },
        { year: "2020-2023", rate: "0.3405 CHF/L", note: "Periodo stabile" },
      ],
      faqTitle: "Domande frequenti",
      faq: [
        { q: "Chi fissa il tasso di rimborso?", a: "Il tasso è fissato dall'AFD (Amministrazione federale delle dogane) e può essere adeguato annualmente." },
        { q: "Il tasso è lo stesso per tutti i carburanti?", a: "Il tasso di 0.3405 CHF/L si applica al diesel. Altri tassi possono applicarsi ad altri carburanti." },
        { q: "Come viene calcolato il mio rimborso?", a: "Rimborso = Volume ammissibile (litri) × 0.3405 CHF/L. Solo il carburante utilizzato in macchine fuori strada è ammissibile." },
        { q: "Quando riceverò il mio rimborso?", a: "I tempi di elaborazione variano presso l'AFD. In generale, prevedi da 4 a 8 settimane dopo la presentazione della tua richiesta completa tramite Taxas." },
      ],
      cta: "Calcola il mio rimborso esatto",
      back: "Torna alle risorse",
    },
    en: {
      title: "FOCBS Reimbursement Rate 2026: 0.3405 CHF per liter",
      subtitle: "Rate history, interactive calculator and FAQ",
      intro: "The mineral oil tax reimbursement rate is set by the Federal Office for Customs and Border Security (FOCBS). This rate applies to diesel used in eligible off-road machines.",
      currentRate: "Current rate",
      perLiter: "per liter",
      calculatorTitle: "Reimbursement Calculator",
      consumption: "Annual consumption",
      liters: "liters",
      estimatedReimbursement: "Estimated reimbursement",
      historyTitle: "Rate History",
      history: [
        { year: "2026", rate: "0.3405 CHF/L", note: "Current rate" },
        { year: "2025", rate: "0.3405 CHF/L", note: "Stable" },
        { year: "2024", rate: "0.3405 CHF/L", note: "Stable" },
        { year: "2020-2023", rate: "0.3405 CHF/L", note: "Stable period" },
      ],
      faqTitle: "Frequently Asked Questions",
      faq: [
        { q: "Who sets the reimbursement rate?", a: "The rate is set by FOCBS (Federal Office for Customs and Border Security) and can be adjusted annually." },
        { q: "Is the rate the same for all fuels?", a: "The rate of 0.3405 CHF/L applies to diesel. Other rates may apply to other fuels." },
        { q: "How is my reimbursement calculated?", a: "Reimbursement = Eligible volume (liters) × 0.3405 CHF/L. Only fuel used in off-road machines is eligible." },
        { q: "When will I receive my reimbursement?", a: "Processing times vary at FOCBS. Generally, expect 4 to 8 weeks after submitting your complete application via Taxas." },
      ],
      cta: "Calculate my exact reimbursement",
      back: "Back to resources",
    },
  };

  const t = content[language] || content.fr;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("de-CH").format(num);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <Link href="/ressources">
          <span className="text-sm text-muted-foreground hover:text-primary inline-flex items-center mb-6 cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t.back}
          </span>
        </Link>

        <div className="mb-8">
          <Badge variant="outline" className="mb-4">
            <Calculator className="h-3 w-3 mr-1" />
            {language === "fr" ? "Taux 2026" : language === "de" ? "Satz 2026" : language === "it" ? "Tasso 2026" : "Rate 2026"}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t.title}</h1>
          <p className="text-lg text-muted-foreground">{t.subtitle}</p>
        </div>

        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <p className="text-lg">{t.intro}</p>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
          <CardContent className="p-6 sm:p-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">{t.currentRate}</p>
            <div className="text-5xl sm:text-6xl font-bold text-primary mb-2">0.3405</div>
            <p className="text-lg text-muted-foreground">CHF {t.perLiter}</p>
          </CardContent>
        </Card>

        <Card className="mb-10">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              {t.calculatorTitle}
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{t.consumption}</span>
                  <span className="font-mono font-bold">{formatNumber(volume)} {t.liters}</span>
                </div>
                <Slider
                  value={[volume]}
                  onValueChange={(v) => setVolume(v[0])}
                  min={1000}
                  max={100000}
                  step={1000}
                  className="my-4"
                  data-testid="slider-volume-seo"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1'000 L</span>
                  <span>100'000 L</span>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-500/30 text-center">
                <p className="text-sm text-muted-foreground mb-1">{t.estimatedReimbursement}</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(reimbursement)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatNumber(volume)} L × 0.3405 CHF/L
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t.historyTitle}
          </h2>
          <div className="space-y-2">
            {t.history.map((item, idx) => (
              <Card key={idx}>
                <CardContent className="p-4 flex items-center justify-between">
                  <span className="font-medium">{item.year}</span>
                  <span className="font-mono">{item.rate}</span>
                  <Badge variant="outline">{item.note}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            {t.faqTitle}
          </h2>
          <div className="space-y-4">
            {t.faq.map((item, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{item.q}</h3>
                  <p className="text-sm text-muted-foreground">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 sm:p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">
              {language === "fr" ? "Obtenez un calcul précis avec MineralTax" : language === "de" ? "Erhalten Sie eine genaue Berechnung mit MineralTax" : language === "it" ? "Ottieni un calcolo preciso con MineralTax" : "Get an accurate calculation with MineralTax"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === "fr" ? "Basé sur vos machines et consommations réelles." : language === "de" ? "Basierend auf Ihren tatsächlichen Maschinen und Verbrauch." : language === "it" ? "Basato sulle tue macchine e consumi reali." : "Based on your actual machines and consumption."}
            </p>
            <Button size="lg" asChild>
              <a href="/" data-testid="link-cta-calculator">
                {t.cta}
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
