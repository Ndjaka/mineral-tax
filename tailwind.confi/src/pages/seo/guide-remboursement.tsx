import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, Clock, AlertTriangle, ArrowRight, ArrowLeft, Building, FileCheck } from "lucide-react";

export default function GuideRemboursementPage() {
  const { language } = useI18n();

  const content = {
    fr: {
      title: "Guide complet du remboursement de la taxe sur les huiles minérales en Suisse",
      subtitle: "Formulaire 45.35, procédure OFDF et soumission via Taxas - Guide officiel 2026",
      intro: "L'impôt sur les huiles minérales (Mineralölsteuer) peut être partiellement remboursé aux entreprises utilisant des machines hors route. Ce guide détaille la procédure officielle de l'Office fédéral de la douane et de la sécurité des frontières (OFDF).",
      sections: [
        {
          title: "Qu'est-ce que le remboursement de la taxe minérale ?",
          content: "Le remboursement de la taxe sur les huiles minérales permet aux entreprises suisses de récupérer une partie de l'impôt payé sur le diesel utilisé dans des machines qui ne circulent pas sur la voie publique. Le taux actuel est de 0.3405 CHF par litre.",
        },
        {
          title: "Qui peut demander un remboursement ?",
          content: "Les entreprises de construction, d'agriculture, de sylviculture, de transport concessionnaire et d'autres secteurs utilisant des machines hors route peuvent prétendre au remboursement. Les véhicules doivent être immatriculés avec des plaques vertes ou jaunes (usage non routier).",
        },
        {
          title: "Le formulaire 45.35",
          content: "Le formulaire officiel 45.35 est le document requis par l'OFDF pour toute demande de remboursement. Il doit contenir les informations détaillées sur les machines, les consommations de carburant et les justificatifs (factures, tickets).",
        },
        {
          title: "La plateforme Taxas",
          content: "Taxas est la plateforme numérique officielle de l'OFDF pour la gestion des impôts à la consommation. Toutes les demandes de remboursement doivent être soumises électroniquement via cette plateforme après connexion avec votre Login CH.",
        },
      ],
      steps: [
        { title: "Créer un compte Login CH", desc: "Obtenez une identité numérique suisse officielle" },
        { title: "S'inscrire comme partenaire OFDF", desc: "Enregistrez votre entreprise auprès de la douane" },
        { title: "Préparer vos données", desc: "Compilez machines, consommations et justificatifs" },
        { title: "Soumettre via Taxas", desc: "Transmettez votre demande sur le portail officiel" },
      ],
      deadlines: "Les demandes doivent être soumises trimestriellement. Conservez tous vos justificatifs pendant 10 ans.",
      cta: "Simplifier ma déclaration",
      back: "Retour aux ressources",
    },
    de: {
      title: "Vollständiger Leitfaden zur Rückerstattung der Mineralölsteuer in der Schweiz",
      subtitle: "Formular 45.35, BAZG-Verfahren und Einreichung über Taxas - Offizieller Leitfaden 2026",
      intro: "Die Mineralölsteuer kann teilweise an Unternehmen zurückerstattet werden, die Maschinen ausserhalb des Strassenverkehrs einsetzen. Dieser Leitfaden beschreibt das offizielle Verfahren des Bundesamts für Zoll und Grenzsicherheit (BAZG).",
      sections: [
        {
          title: "Was ist die Mineralölsteuer-Rückerstattung?",
          content: "Die Rückerstattung der Mineralölsteuer ermöglicht es Schweizer Unternehmen, einen Teil der auf Diesel gezahlten Steuer zurückzufordern, der in Maschinen verwendet wird, die nicht am Strassenverkehr teilnehmen. Der aktuelle Satz beträgt 0.3405 CHF pro Liter.",
        },
        {
          title: "Wer kann eine Rückerstattung beantragen?",
          content: "Bau-, Landwirtschafts-, Forstwirtschafts-, Konzessionsverkehrs- und andere Unternehmen, die Offroad-Maschinen einsetzen, können Rückerstattungen beantragen. Die Fahrzeuge müssen mit grünen oder gelben Kennzeichen (nicht strassenzugelassen) registriert sein.",
        },
        {
          title: "Das Formular 45.35",
          content: "Das offizielle Formular 45.35 ist das vom BAZG geforderte Dokument für jeden Rückerstattungsantrag. Es muss detaillierte Informationen über Maschinen, Kraftstoffverbrauch und Belege (Rechnungen, Quittungen) enthalten.",
        },
        {
          title: "Die Taxas-Plattform",
          content: "Taxas ist die offizielle digitale Plattform des BAZG für die Verwaltung von Verbrauchssteuern. Alle Rückerstattungsanträge müssen nach der Anmeldung mit Ihrem Login CH elektronisch über diese Plattform eingereicht werden.",
        },
      ],
      steps: [
        { title: "Login CH-Konto erstellen", desc: "Erhalten Sie eine offizielle Schweizer digitale Identität" },
        { title: "Als BAZG-Partner registrieren", desc: "Registrieren Sie Ihr Unternehmen beim Zoll" },
        { title: "Daten vorbereiten", desc: "Stellen Sie Maschinen, Verbrauch und Belege zusammen" },
        { title: "Über Taxas einreichen", desc: "Übermitteln Sie Ihren Antrag auf dem offiziellen Portal" },
      ],
      deadlines: "Anträge müssen vierteljährlich eingereicht werden. Bewahren Sie alle Belege 10 Jahre auf.",
      cta: "Meine Erklärung vereinfachen",
      back: "Zurück zu den Ressourcen",
    },
    it: {
      title: "Guida completa al rimborso dell'imposta sugli oli minerali in Svizzera",
      subtitle: "Modulo 45.35, procedura AFD e presentazione tramite Taxas - Guida ufficiale 2026",
      intro: "L'imposta sugli oli minerali può essere parzialmente rimborsata alle aziende che utilizzano macchine fuori strada. Questa guida descrive la procedura ufficiale dell'Amministrazione federale delle dogane (AFD).",
      sections: [
        {
          title: "Cos'è il rimborso dell'imposta minerale?",
          content: "Il rimborso dell'imposta sugli oli minerali consente alle aziende svizzere di recuperare parte dell'imposta pagata sul diesel utilizzato in macchine che non circolano su strada pubblica. Il tasso attuale è di 0.3405 CHF al litro.",
        },
        {
          title: "Chi può richiedere un rimborso?",
          content: "Le aziende di costruzione, agricoltura, silvicoltura, trasporto in concessione e altri settori che utilizzano macchine fuori strada possono richiedere il rimborso. I veicoli devono essere immatricolati con targhe verdi o gialle (uso non stradale).",
        },
        {
          title: "Il modulo 45.35",
          content: "Il modulo ufficiale 45.35 è il documento richiesto dall'AFD per qualsiasi richiesta di rimborso. Deve contenere informazioni dettagliate su macchine, consumi di carburante e giustificativi (fatture, scontrini).",
        },
        {
          title: "La piattaforma Taxas",
          content: "Taxas è la piattaforma digitale ufficiale dell'AFD per la gestione delle imposte sul consumo. Tutte le richieste di rimborso devono essere presentate elettronicamente tramite questa piattaforma dopo l'accesso con il Login CH.",
        },
      ],
      steps: [
        { title: "Creare un account Login CH", desc: "Ottieni un'identità digitale svizzera ufficiale" },
        { title: "Registrarsi come partner AFD", desc: "Registra la tua azienda presso la dogana" },
        { title: "Preparare i dati", desc: "Compila macchine, consumi e giustificativi" },
        { title: "Presentare tramite Taxas", desc: "Trasmetti la tua richiesta sul portale ufficiale" },
      ],
      deadlines: "Le richieste devono essere presentate trimestralmente. Conserva tutti i giustificativi per 10 anni.",
      cta: "Semplifica la mia dichiarazione",
      back: "Torna alle risorse",
    },
    en: {
      title: "Complete Guide to Mineral Oil Tax Reimbursement in Switzerland",
      subtitle: "Form 45.35, FOCBS Procedure and Submission via Taxas - Official Guide 2026",
      intro: "The mineral oil tax can be partially reimbursed to companies using off-road machines. This guide details the official procedure of the Federal Office for Customs and Border Security (FOCBS).",
      sections: [
        {
          title: "What is mineral tax reimbursement?",
          content: "Mineral oil tax reimbursement allows Swiss companies to recover part of the tax paid on diesel used in machines that do not travel on public roads. The current rate is 0.3405 CHF per liter.",
        },
        {
          title: "Who can request a reimbursement?",
          content: "Construction, agriculture, forestry, concession transport and other companies using off-road machines can claim reimbursement. Vehicles must be registered with green or yellow plates (non-road use).",
        },
        {
          title: "Form 45.35",
          content: "The official Form 45.35 is the document required by FOCBS for any reimbursement request. It must contain detailed information about machines, fuel consumption and supporting documents (invoices, receipts).",
        },
        {
          title: "The Taxas Platform",
          content: "Taxas is the official digital platform of FOCBS for consumption tax management. All reimbursement requests must be submitted electronically via this platform after logging in with your Login CH.",
        },
      ],
      steps: [
        { title: "Create a Login CH account", desc: "Obtain an official Swiss digital identity" },
        { title: "Register as FOCBS partner", desc: "Register your company with customs" },
        { title: "Prepare your data", desc: "Compile machines, consumption and receipts" },
        { title: "Submit via Taxas", desc: "Transmit your request on the official portal" },
      ],
      deadlines: "Requests must be submitted quarterly. Keep all receipts for 10 years.",
      cta: "Simplify my declaration",
      back: "Back to resources",
    },
  };

  const t = content[language] || content.fr;

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
            <FileText className="h-3 w-3 mr-1" />
            {language === "fr" ? "Guide officiel" : language === "de" ? "Offizieller Leitfaden" : language === "it" ? "Guida ufficiale" : "Official Guide"}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t.title}</h1>
          <p className="text-lg text-muted-foreground">{t.subtitle}</p>
        </div>

        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <p className="text-lg">{t.intro}</p>
          </CardContent>
        </Card>

        <div className="space-y-8 mb-12">
          {t.sections.map((section, idx) => (
            <div key={idx}>
              <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                {section.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              {language === "fr" ? "Les 4 étapes pour obtenir votre remboursement" : language === "de" ? "Die 4 Schritte zur Rückerstattung" : language === "it" ? "I 4 passaggi per ottenere il rimborso" : "The 4 Steps to Get Your Reimbursement"}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {t.steps.map((step, idx) => (
                <div key={idx} className="flex gap-3 p-4 rounded-lg bg-muted/50">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardContent className="p-6 flex gap-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">
                {language === "fr" ? "Délais et conservation" : language === "de" ? "Fristen und Aufbewahrung" : language === "it" ? "Scadenze e conservazione" : "Deadlines and Retention"}
              </h3>
              <p className="text-sm text-muted-foreground">{t.deadlines}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 sm:p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">
              {language === "fr" ? "MineralTax automatise votre déclaration" : language === "de" ? "MineralTax automatisiert Ihre Erklärung" : language === "it" ? "MineralTax automatizza la tua dichiarazione" : "MineralTax automates your declaration"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === "fr" ? "Essai gratuit de 10 jours, sans engagement." : language === "de" ? "10 Tage kostenlos testen, ohne Verpflichtung." : language === "it" ? "Prova gratuita di 10 giorni, senza impegno." : "10-day free trial, no commitment."}
            </p>
            <Button size="lg" asChild>
              <a href="/" data-testid="link-cta-trial">
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
