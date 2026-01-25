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
    step3Desc: "Taux uniforme de 0.3405 CHF/L pour l'impôt sur les huiles minérales (OFDF), applicable à tous les secteurs. Les exploitations agricoles bénéficient en plus de la redistribution de la taxe CO2 via leur caisse AVS. Visualisez instantanément votre remboursement potentiel.",
    step3Features: ["Taux OFDF uniforme: 0.3405 CHF/L", "Information redistribution CO2 pour agriculture", "Calcul instantané", "Tableau de bord en temps réel"],
    step4Title: "Générez votre rapport",
    step4Desc: "Créez un rapport PDF conforme au formulaire officiel 45.35. Exportez un fichier CSV compatible avec la plateforme Taxas incluant les données réglementaires. Un disclaimer obligatoire garantit la responsabilité des données avant export.",
    step4Features: ["PDF conforme 45.35", "Export CSV Taxas avec disclaimer", "Clause de responsabilité intégrée", "Audit de conformité intégré"],
    step5Title: "Soumettez via Taxas",
    step5Desc: "Connectez-vous au portail ePortal/Agate de l'OFDF et importez votre fichier CSV. Votre demande de remboursement est prête pour soumission.",
    step5Features: ["Compatible Taxas OFDF", "Instructions pas à pas", "Support multilingue"],
    ctaTitle: "Prêt à commencer?",
    ctaSubtitle: "Essai gratuit de 10 jours, sans carte bancaire",
    ctaButton: "Commencer maintenant",
    ctaLogin: "J'ai déjà un compte",
    rate: "Taux de remboursement",
    rateValue: "0.3405 CHF/L",
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
    step3Desc: "Einheitlicher Satz von 0.3405 CHF/L für die Mineralölsteuer (BAZG), anwendbar auf alle Sektoren. Landwirtschaftsbetriebe profitieren zusätzlich von der CO2-Abgabenumverteilung über ihre AHV-Ausgleichskasse. Sehen Sie sofort Ihre potenzielle Rückerstattung.",
    step3Features: ["Einheitlicher BAZG-Satz: 0.3405 CHF/L", "CO2-Umverteilungsinfo für Landwirtschaft", "Sofortige Berechnung", "Echtzeit-Dashboard"],
    step4Title: "Generieren Sie Ihren Bericht",
    step4Desc: "Erstellen Sie einen PDF-Bericht konform mit dem offiziellen Formular 45.35. Exportieren Sie eine CSV-Datei kompatibel mit der Taxas-Plattform mit regulatorischen Daten. Ein obligatorischer Disclaimer garantiert die Datenverantwortung vor dem Export.",
    step4Features: ["PDF konform 45.35", "CSV-Export Taxas mit Disclaimer", "Integrierte Haftungsklausel", "Integrierte Konformitätsprüfung"],
    step5Title: "Einreichen über Taxas",
    step5Desc: "Melden Sie sich beim ePortal/Agate-Portal des BAZG an und importieren Sie Ihre CSV-Datei. Ihr Rückerstattungsantrag ist bereit.",
    step5Features: ["Kompatibel mit Taxas BAZG", "Schritt-für-Schritt-Anleitung", "Mehrsprachige Unterstützung"],
    ctaTitle: "Bereit anzufangen?",
    ctaSubtitle: "10 Tage kostenlose Testversion, keine Kreditkarte erforderlich",
    ctaButton: "Jetzt starten",
    ctaLogin: "Ich habe bereits ein Konto",
    rate: "Rückerstattungssatz",
    rateValue: "0.3405 CHF/L",
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
    step3Desc: "Aliquota uniforme di 0.3405 CHF/L per l'imposta sugli oli minerali (AFD), applicabile a tutti i settori. Le aziende agricole beneficiano inoltre della ridistribuzione della tassa CO2 tramite la loro cassa AVS. Visualizza istantaneamente il tuo potenziale rimborso.",
    step3Features: ["Aliquota AFD uniforme: 0.3405 CHF/L", "Info ridistribuzione CO2 per agricoltura", "Calcolo istantaneo", "Dashboard in tempo reale"],
    step4Title: "Genera il tuo rapporto",
    step4Desc: "Crea un rapporto PDF conforme al modulo ufficiale 45.35. Esporta un file CSV compatibile con la piattaforma Taxas con dati regolamentari. Un disclaimer obbligatorio garantisce la responsabilità dei dati prima dell'esportazione.",
    step4Features: ["PDF conforme 45.35", "Export CSV Taxas con disclaimer", "Clausola di responsabilità integrata", "Audit di conformità integrato"],
    step5Title: "Invia tramite Taxas",
    step5Desc: "Accedi al portale ePortal/Agate dell'AFD e importa il tuo file CSV. La tua richiesta di rimborso è pronta per l'invio.",
    step5Features: ["Compatibile Taxas AFD", "Istruzioni passo passo", "Supporto multilingue"],
    ctaTitle: "Pronto per iniziare?",
    ctaSubtitle: "Prova gratuita di 10 giorni, senza carta di credito",
    ctaButton: "Inizia ora",
    ctaLogin: "Ho già un account",
    rate: "Tasso di rimborso",
    rateValue: "0.3405 CHF/L",
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
    step3Desc: "Uniform rate of 0.3405 CHF/L for mineral oil tax (FOCBS), applicable to all sectors. Agricultural businesses additionally benefit from CO2 tax redistribution via their AHV compensation fund. See your potential reimbursement instantly.",
    step3Features: ["Uniform FOCBS rate: 0.3405 CHF/L", "CO2 redistribution info for agriculture", "Instant calculation", "Real-time dashboard"],
    step4Title: "Generate your report",
    step4Desc: "Create a PDF report compliant with official form 45.35. Export a CSV file compatible with the Taxas platform with regulatory data. A mandatory disclaimer ensures data responsibility before export.",
    step4Features: ["PDF compliant 45.35", "CSV export Taxas with disclaimer", "Integrated liability clause", "Built-in compliance audit"],
    step5Title: "Submit via Taxas",
    step5Desc: "Log in to the FOCBS ePortal/Agate portal and import your CSV file. Your reimbursement request is ready for submission.",
    step5Features: ["Compatible with Taxas FOCBS", "Step-by-step instructions", "Multilingual support"],
    ctaTitle: "Ready to get started?",
    ctaSubtitle: "10-day free trial, no credit card required",
    ctaButton: "Start now",
    ctaLogin: "I already have an account",
    rate: "Reimbursement rate",
    rateValue: "0.3405 CHF/L",
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
