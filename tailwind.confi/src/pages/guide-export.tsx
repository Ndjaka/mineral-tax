import { Link, useLocation } from "wouter";
import { Check, Download, ExternalLink, ArrowRight, FileSpreadsheet, Globe, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { getFiscalYear } from "@/lib/fiscal-year";

export default function GuideExport() {
  const { t, language } = useI18n();
  const [, setLocation] = useLocation();
  const fiscalYear = getFiscalYear();

  const steps = [
    {
      number: 1,
      status: "completed",
      title: {
        fr: "Calcul Terminé",
        de: "Berechnung Abgeschlossen",
        it: "Calcolo Completato",
        en: "Calculation Complete",
      },
      icon: Check,
    },
    {
      number: 2,
      status: "completed",
      title: {
        fr: "Fichier Prêt",
        de: "Datei Bereit",
        it: "File Pronto",
        en: "File Ready",
      },
      icon: FileSpreadsheet,
    },
    {
      number: 3,
      status: "current",
      title: {
        fr: "Importation Taxas",
        de: "Taxas-Import",
        it: "Importazione Taxas",
        en: "Taxas Import",
      },
      icon: Upload,
    },
  ];

  const instructions = {
    fr: {
      title: "Guide d'importation Taxas",
      subtitle: `Importez vos données de la période fiscale ${fiscalYear} dans le système officiel`,
      step1Title: "Téléchargez votre fichier CSV optimisé",
      step1Desc: "Le fichier a été généré avec toutes les données conformes au format Taxas.",
      step2Title: "Connectez-vous sur Agate.ch",
      step2Desc: "Accédez au portail ePortal de l'administration fédérale avec votre CH-Login.",
      step3Title: "Importez dans le formulaire 45.35",
      step3Desc: "Dans le formulaire de remboursement, cliquez sur 'Importer CSV' et sélectionnez votre fichier.",
      downloadButton: "Télécharger le CSV",
      agateButton: "Accéder à Agate.ch",
      backToReports: "Retour aux rapports",
    },
    de: {
      title: "Taxas-Importanleitung",
      subtitle: `Importieren Sie Ihre Daten der Steuerperiode ${fiscalYear} in das offizielle System`,
      step1Title: "Laden Sie Ihre optimierte CSV-Datei herunter",
      step1Desc: "Die Datei wurde mit allen Daten im Taxas-konformen Format erstellt.",
      step2Title: "Melden Sie sich bei Agate.ch an",
      step2Desc: "Greifen Sie auf das ePortal der Bundesverwaltung mit Ihrem CH-Login zu.",
      step3Title: "Importieren Sie in Formular 45.35",
      step3Desc: "Klicken Sie im Rückerstattungsformular auf 'CSV importieren' und wählen Sie Ihre Datei.",
      downloadButton: "CSV herunterladen",
      agateButton: "Zu Agate.ch",
      backToReports: "Zurück zu Berichten",
    },
    it: {
      title: "Guida all'importazione Taxas",
      subtitle: `Importate i vostri dati del periodo fiscale ${fiscalYear} nel sistema ufficiale`,
      step1Title: "Scaricate il vostro file CSV ottimizzato",
      step1Desc: "Il file è stato generato con tutti i dati conformi al formato Taxas.",
      step2Title: "Accedete a Agate.ch",
      step2Desc: "Accedete al portale ePortal dell'amministrazione federale con il vostro CH-Login.",
      step3Title: "Importate nel modulo 45.35",
      step3Desc: "Nel modulo di rimborso, cliccate su 'Importa CSV' e selezionate il vostro file.",
      downloadButton: "Scarica CSV",
      agateButton: "Accedi a Agate.ch",
      backToReports: "Torna ai rapporti",
    },
    en: {
      title: "Taxas Import Guide",
      subtitle: `Import your fiscal period ${fiscalYear} data into the official system`,
      step1Title: "Download your optimized CSV file",
      step1Desc: "The file has been generated with all data in Taxas-compliant format.",
      step2Title: "Log in to Agate.ch",
      step2Desc: "Access the federal administration ePortal with your CH-Login.",
      step3Title: "Import into form 45.35",
      step3Desc: "In the reimbursement form, click 'Import CSV' and select your file.",
      downloadButton: "Download CSV",
      agateButton: "Go to Agate.ch",
      backToReports: "Back to reports",
    },
  };

  const content = instructions[language as keyof typeof instructions] || instructions.fr;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{content.title}</h1>
          <p className="text-muted-foreground">{content.subtitle}</p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    step.status === "completed"
                      ? "bg-green-500 text-white"
                      : step.status === "current"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.status === "completed" ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    step.status === "current" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {step.title[language as keyof typeof step.title] || step.title.fr}
                </span>
                {index < steps.length - 1 && (
                  <ArrowRight className="mx-4 h-5 w-5 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                {content.step1Title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{content.step1Desc}</p>
              <Button data-testid="button-download-csv">
                <Download className="mr-2 h-4 w-4" />
                {content.downloadButton}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                {content.step2Title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{content.step2Desc}</p>
              <Button variant="outline" asChild data-testid="button-agate">
                <a
                  href="https://www.agate.ch"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {content.agateButton}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                {content.step3Title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{content.step3Desc}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button variant="ghost" asChild data-testid="link-back-reports">
            <Link href="/reports">{content.backToReports}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
