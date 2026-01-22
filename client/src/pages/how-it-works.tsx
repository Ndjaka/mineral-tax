import { useI18n, type Language } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Truck, Fuel, Calculator, FileText, Building2 } from "lucide-react";
import { AppFooter } from "@/components/app-footer";

import fleetImage from "@assets/generated_images/fleet_registration_illustration.png";
import fuelImage from "@assets/generated_images/fuel_ticket_scanning_illustration.png";
import calculationImage from "@assets/generated_images/reimbursement_calculation_illustration.png";
import reportImage from "@assets/generated_images/pdf_report_generation_illustration.png";
import taxasImage from "@assets/generated_images/taxas_submission_illustration.png";

const translations = {
  fr: {
    title: "Comment ça marche",
    subtitle: "Récupérez votre remboursement de taxe sur les huiles minérales en 5 étapes simples",
    step1Title: "Enregistrez vos machines",
    step1Desc: "Ajoutez vos pelles mécaniques, chargeuses, grues, tracteurs et autres équipements hors route. Attribuez les catégories Taxas officielles (agriculture, sylviculture, construction, etc.) pour une conformité automatique.",
    step1Features: ["Catégories Taxas officielles", "Numéro de châssis", "Plaque d'immatriculation"],
    step2Title: "Saisissez vos consommations",
    step2Desc: "Entrez vos tickets de carburant manuellement ou scannez-les avec l'OCR intégré. Les données sont automatiquement extraites: date, volume, numéro de facture.",
    step2Features: ["Scan OCR intelligent", "Saisie manuelle rapide", "Association automatique aux machines"],
    step3Title: "Calcul automatique",
    step3Desc: "Le taux officiel OFDF varie selon le secteur : 60.05 CHF/L pour l'agriculture (plaques vertes, paiements directs) depuis janvier 2026 (+76%), et 34.06 CHF/L pour le BTP et autres secteurs. Visualisez en temps réel le montant de votre remboursement potentiel.",
    step3Features: ["Taux OFDF 60.05 CHF/L (Agriculture 2026)", "Taux OFDF 34.06 CHF/L (BTP/Autres)", "Calcul instantané", "Tableau de bord en temps réel"],
    step4Title: "Générez votre rapport",
    step4Desc: "Créez un rapport PDF conforme au formulaire officiel 45.35. Exportez également un fichier CSV compatible avec la plateforme Taxas (obligatoire dès mai 2026) incluant les codes Stat. 2710 et CI A1.",
    step4Features: ["PDF conforme 45.35", "Export CSV Taxas (mai 2026)", "Codes Stat. 2710 / CI A1", "Audit de conformité intégré"],
    step5Title: "Soumettez via Taxas",
    step5Desc: "Connectez-vous au portail ePortal/Agate de l'OFDF et importez votre fichier CSV. Votre demande de remboursement est prête pour soumission.",
    step5Features: ["Compatible Taxas OFDF", "Instructions pas à pas", "Support multilingue"],
    ctaTitle: "Prêt à commencer?",
    ctaSubtitle: "Essai gratuit de 10 jours, sans carte bancaire",
    ctaButton: "Commencer maintenant",
    ctaLogin: "J'ai déjà un compte",
    rate: "Taux de remboursement",
    rateValue: "34.06 - 60.05 CHF/L",
    eligible: "Éligible",
    eligibleDesc: "Machines hors route uniquement",
  },
  de: {
    title: "So funktioniert es",
    subtitle: "Erhalten Sie Ihre Mineralölsteuer-Rückerstattung in 5 einfachen Schritten",
    step1Title: "Registrieren Sie Ihre Maschinen",
    step1Desc: "Fügen Sie Ihre Bagger, Lader, Kräne, Traktoren und andere Offroad-Geräte hinzu. Weisen Sie offizielle Taxas-Kategorien zu (Landwirtschaft, Forstwirtschaft, Bau usw.).",
    step1Features: ["Offizielle Taxas-Kategorien", "Fahrgestellnummer", "Kennzeichen"],
    step2Title: "Erfassen Sie Ihren Verbrauch",
    step2Desc: "Geben Sie Ihre Tankbelege manuell ein oder scannen Sie sie mit integriertem OCR. Daten werden automatisch extrahiert: Datum, Menge, Rechnungsnummer.",
    step2Features: ["Intelligentes OCR-Scannen", "Schnelle manuelle Eingabe", "Automatische Maschinenzuordnung"],
    step3Title: "Automatische Berechnung",
    step3Desc: "Der offizielle BAZG-Satz variiert je nach Sektor : 60.05 CHF/L für die Landwirtschaft (grüne Kennzeichen, Direktzahlungen) seit Januar 2026 (+76%), und 34.06 CHF/L für Bau und andere Sektoren. Sehen Sie in Echtzeit Ihre potenzielle Rückerstattung.",
    step3Features: ["BAZG-Satz 60.05 CHF/L (Landwirtschaft 2026)", "BAZG-Satz 34.06 CHF/L (Bau/Andere)", "Sofortige Berechnung", "Echtzeit-Dashboard"],
    step4Title: "Generieren Sie Ihren Bericht",
    step4Desc: "Erstellen Sie einen PDF-Bericht konform mit dem offiziellen Formular 45.35. Exportieren Sie auch eine CSV-Datei für die Taxas-Plattform (obligatorisch ab Mai 2026) mit Stat. 2710 und CI A1 Codes.",
    step4Features: ["PDF konform 45.35", "CSV-Export Taxas (Mai 2026)", "Codes Stat. 2710 / CI A1", "Integrierte Konformitätsprüfung"],
    step5Title: "Einreichen über Taxas",
    step5Desc: "Melden Sie sich beim ePortal/Agate-Portal des BAZG an und importieren Sie Ihre CSV-Datei. Ihr Rückerstattungsantrag ist bereit.",
    step5Features: ["Kompatibel mit Taxas BAZG", "Schritt-für-Schritt-Anleitung", "Mehrsprachige Unterstützung"],
    ctaTitle: "Bereit anzufangen?",
    ctaSubtitle: "10 Tage kostenlose Testversion, keine Kreditkarte erforderlich",
    ctaButton: "Jetzt starten",
    ctaLogin: "Ich habe bereits ein Konto",
    rate: "Rückerstattungssatz",
    rateValue: "34.06 - 60.05 CHF/L",
    eligible: "Berechtigt",
    eligibleDesc: "Nur Offroad-Maschinen",
  },
  it: {
    title: "Come funziona",
    subtitle: "Ottieni il rimborso dell'imposta sugli oli minerali in 5 semplici passaggi",
    step1Title: "Registra le tue macchine",
    step1Desc: "Aggiungi escavatori, caricatori, gru, trattori e altre attrezzature fuoristrada. Assegna le categorie Taxas ufficiali (agricoltura, silvicoltura, costruzione, ecc.).",
    step1Features: ["Categorie Taxas ufficiali", "Numero di telaio", "Targa"],
    step2Title: "Inserisci i consumi",
    step2Desc: "Inserisci le tue ricevute carburante manualmente o scansionale con l'OCR integrato. I dati vengono estratti automaticamente: data, volume, numero fattura.",
    step2Features: ["Scansione OCR intelligente", "Inserimento manuale rapido", "Associazione automatica alle macchine"],
    step3Title: "Calcolo automatico",
    step3Desc: "L'aliquota ufficiale AFD varia secondo il settore: 60.05 CHF/L per l'agricoltura (targhe verdi, pagamenti diretti) da gennaio 2026 (+76%), e 34.06 CHF/L per l'edilizia e altri settori. Visualizza in tempo reale il tuo potenziale rimborso.",
    step3Features: ["Aliquota AFD 60.05 CHF/L (Agricoltura 2026)", "Aliquota AFD 34.06 CHF/L (Edilizia/Altri)", "Calcolo istantaneo", "Dashboard in tempo reale"],
    step4Title: "Genera il tuo rapporto",
    step4Desc: "Crea un rapporto PDF conforme al modulo ufficiale 45.35. Esporta anche un file CSV compatibile con la piattaforma Taxas (obbligatoria da maggio 2026) con codici Stat. 2710 e CI A1.",
    step4Features: ["PDF conforme 45.35", "Export CSV Taxas (maggio 2026)", "Codici Stat. 2710 / CI A1", "Audit di conformità integrato"],
    step5Title: "Invia tramite Taxas",
    step5Desc: "Accedi al portale ePortal/Agate dell'AFD e importa il tuo file CSV. La tua richiesta di rimborso è pronta per l'invio.",
    step5Features: ["Compatibile Taxas AFD", "Istruzioni passo passo", "Supporto multilingue"],
    ctaTitle: "Pronto per iniziare?",
    ctaSubtitle: "Prova gratuita di 10 giorni, senza carta di credito",
    ctaButton: "Inizia ora",
    ctaLogin: "Ho già un account",
    rate: "Tasso di rimborso",
    rateValue: "34.06 - 60.05 CHF/L",
    eligible: "Idoneo",
    eligibleDesc: "Solo macchine fuoristrada",
  },
  en: {
    title: "How it works",
    subtitle: "Get your mineral oil tax reimbursement in 5 simple steps",
    step1Title: "Register your machines",
    step1Desc: "Add your excavators, loaders, cranes, tractors and other off-road equipment. Assign official Taxas categories (agriculture, forestry, construction, etc.) for automatic compliance.",
    step1Features: ["Official Taxas categories", "Chassis number", "License plate"],
    step2Title: "Enter your fuel consumption",
    step2Desc: "Enter your fuel receipts manually or scan them with built-in OCR. Data is automatically extracted: date, volume, invoice number.",
    step2Features: ["Smart OCR scanning", "Quick manual entry", "Auto machine assignment"],
    step3Title: "Automatic calculation",
    step3Desc: "The official FOCBS rate varies by sector: 60.05 CHF/L for agriculture (green license plates, direct payments) since January 2026 (+76%), and 34.06 CHF/L for construction and other sectors. See your potential reimbursement in real-time.",
    step3Features: ["FOCBS rate 60.05 CHF/L (Agriculture 2026)", "FOCBS rate 34.06 CHF/L (Construction/Others)", "Instant calculation", "Real-time dashboard"],
    step4Title: "Generate your report",
    step4Desc: "Create a PDF report compliant with official form 45.35. Also export a CSV file compatible with the Taxas platform (mandatory from May 2026) with Stat. 2710 and CI A1 codes.",
    step4Features: ["PDF compliant 45.35", "CSV export Taxas (May 2026)", "Codes Stat. 2710 / CI A1", "Built-in compliance audit"],
    step5Title: "Submit via Taxas",
    step5Desc: "Log in to the FOCBS ePortal/Agate portal and import your CSV file. Your reimbursement request is ready for submission.",
    step5Features: ["Compatible with Taxas FOCBS", "Step-by-step instructions", "Multilingual support"],
    ctaTitle: "Ready to get started?",
    ctaSubtitle: "10-day free trial, no credit card required",
    ctaButton: "Start now",
    ctaLogin: "I already have an account",
    rate: "Reimbursement rate",
    rateValue: "34.06 - 60.05 CHF/L",
    eligible: "Eligible",
    eligibleDesc: "Off-road machines only",
  },
};

const steps = [
  { image: fleetImage, icon: Truck, color: "bg-primary" },
  { image: fuelImage, icon: Fuel, color: "bg-primary/80" },
  { image: calculationImage, icon: Calculator, color: "bg-accent-foreground" },
  { image: reportImage, icon: FileText, color: "bg-muted-foreground" },
  { image: taxasImage, icon: Building2, color: "bg-destructive" },
];

export default function HowItWorks() {
  const { language } = useI18n();
  const t = translations[language as Language];

  const stepKeys = ["step1", "step2", "step3", "step4", "step5"] as const;

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4" data-testid="badge-rate">
              {t.rate}: {t.rateValue}
            </Badge>
            <h1 className="text-3xl font-semibold mb-4" data-testid="text-how-it-works-title">
              {t.title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-how-it-works-subtitle">
              {t.subtitle}
            </p>
          </div>

          <div className="space-y-16">
            {stepKeys.map((stepKey, index) => {
              const step = steps[index];
              const Icon = step.icon;
              const titleKey = `${stepKey}Title` as keyof typeof t;
              const descKey = `${stepKey}Desc` as keyof typeof t;
              const featuresKey = `${stepKey}Features` as keyof typeof t;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={stepKey}
                  className={`flex flex-col flex-wrap ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} gap-8 items-center`}
                  data-testid={`section-${stepKey}`}
                >
                  <div className="w-full lg:w-1/2">
                    <Card className="overflow-hidden">
                      <img
                        src={step.image}
                        alt={t[titleKey] as string}
                        className="w-full h-auto object-cover"
                        loading="lazy"
                        width="800"
                        height="600"
                        data-testid={`img-${stepKey}`}
                      />
                    </Card>
                  </div>

                  <div className="w-full lg:w-1/2 space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className={`p-3 rounded-full ${step.color} text-primary-foreground`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <Badge variant="outline" className="text-lg px-3 py-1" data-testid={`badge-${stepKey}-number`}>
                        {index + 1}
                      </Badge>
                    </div>

                    <h2 className="text-xl font-medium" data-testid={`text-${stepKey}-title`}>
                      {t[titleKey] as string}
                    </h2>

                    <p className="text-muted-foreground text-base" data-testid={`text-${stepKey}-desc`}>
                      {t[descKey] as string}
                    </p>

                    <ul className="space-y-2">
                      {(t[featuresKey] as string[]).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2" data-testid={`feature-${stepKey}-${i}`}>
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          <Card className="mt-20 bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-medium mb-2" data-testid="text-cta-title">{t.ctaTitle}</h2>
              <p className="text-muted-foreground mb-6" data-testid="text-cta-subtitle">{t.ctaSubtitle}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="gap-2" data-testid="button-cta-register">
                    {t.ctaButton}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" data-testid="button-cta-login">
                    {t.ctaLogin}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legal Source Footer */}
        <div className="mt-16 pt-8 border-t">
          <p className="text-center text-sm text-muted-foreground">
            {language === 'fr' && (
              <>
                <strong>Source légale :</strong> Règlement 09 de l'OFDF (vigueur 01.01.2026) – Remboursement de l'impôt sur les huiles minérales pour l'agriculture
              </>
            )}
            {language === 'de' && (
              <>
                <strong>Rechtsgrundlage:</strong> Verordnung 09 des BAZG (in Kraft seit 01.01.2026) – Rückerstattung der Mineralölsteuer für die Landwirtschaft
              </>
            )}
            {language === 'it' && (
              <>
                <strong>Fonte legale:</strong> Regolamento 09 dell'AFD (in vigore dal 01.01.2026) – Rimborso dell'imposta sugli oli minerali per l'agricoltura
              </>
            )}
            {language === 'en' && (
              <>
                <strong>Legal source:</strong> Regulation 09 of FOCBS (effective 01.01.2026) – Mineral oil tax reimbursement for agriculture
              </>
            )}
          </p>
        </div>
      </div>

      {/* Main App Footer with LinkedIn */}
      <AppFooter />
    </>
  );
}
