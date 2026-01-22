import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export default function Confidentialite() {
  const { language } = useI18n();

  const content = {
    fr: {
      title: "Politique de Confidentialité",
      lastUpdate: "Dernière mise à jour : Janvier 2026",
      back: "Retour",
      sections: [
        {
          title: "1. Responsable du traitement",
          content: `MineralTax.ch\nChemin des Lentillières\n1023 Crissier, Suisse\nEmail : support@mineraltax.ch`,
        },
        {
          title: "2. Données collectées",
          content: `Nous collectons les données suivantes :\n• Données d'identification : nom, prénom, email\n• Données d'entreprise : raison sociale, IDE, adresse, IBAN\n• Données de flotte : machines, consommations de carburant\n• Données techniques : logs de connexion, adresse IP`,
        },
        {
          title: "3. Finalités du traitement",
          content: `Vos données sont utilisées pour :\n• Fournir le service MineralTax\n• Générer vos rapports de remboursement\n• Gérer votre abonnement et facturation\n• Améliorer nos services`,
        },
        {
          title: "4. Base légale",
          content: `Le traitement est fondé sur :\n• L'exécution du contrat (fourniture du service)\n• Vos obligations légales (documentation fiscale)\n• Notre intérêt légitime (amélioration du service)`,
        },
        {
          title: "5. Hébergement et sécurité",
          content: `Vos données sont hébergées en Suisse par Infomaniak, hébergeur suisse certifié ISO 27001. Toutes les communications sont chiffrées en SSL/TLS. Nous appliquons les mesures de sécurité conformes à la LPD.`,
        },
        {
          title: "6. Partage des données",
          content: `Nous ne vendons jamais vos données. Elles peuvent être partagées avec :\n• Stripe (paiements) - certifié Swiss-US Data Privacy Framework\n• Infomaniak (hébergement) - Suisse\n\nAucune transmission automatique à l'OFDF n'est effectuée. Vous gardez le contrôle total de vos soumissions.`,
        },
        {
          title: "7. Conservation des données",
          content: `Les données sont conservées :\n• Données comptables : 10 ans (obligation légale suisse)\n• Données de compte : durée de l'abonnement + 1 an\n• Logs techniques : 12 mois`,
        },
        {
          title: "8. Vos droits (LPD)",
          content: `Conformément à la Loi fédérale sur la protection des données (LPD), vous avez le droit de :\n• Accéder à vos données\n• Rectifier vos données\n• Supprimer vos données\n• Exporter vos données (portabilité)\n• Retirer votre consentement\n\nPour exercer ces droits : support@mineraltax.ch`,
        },
        {
          title: "9. Cookies",
          content: `Nous utilisons uniquement des cookies techniques essentiels au fonctionnement du service (session, préférences de langue). Aucun cookie de tracking ou publicitaire n'est utilisé.`,
        },
        {
          title: "10. Modifications",
          content: `Cette politique peut être mise à jour. Toute modification significative sera notifiée par email.`,
        },
      ],
    },
    de: {
      title: "Datenschutzrichtlinie",
      lastUpdate: "Letzte Aktualisierung: Januar 2026",
      back: "Zurück",
      sections: [
        {
          title: "1. Verantwortlicher",
          content: `MineralTax.ch\nChemin des Lentillières\n1023 Crissier, Schweiz\nEmail: support@mineraltax.ch`,
        },
        {
          title: "2. Erhobene Daten",
          content: `Wir erheben folgende Daten:\n• Identifikationsdaten: Name, Vorname, E-Mail\n• Unternehmensdaten: Firmenname, UID, Adresse, IBAN\n• Flottendaten: Maschinen, Kraftstoffverbrauch\n• Technische Daten: Verbindungsprotokolle, IP-Adresse`,
        },
        {
          title: "3. Verarbeitungszwecke",
          content: `Ihre Daten werden verwendet für:\n• Bereitstellung des MineralTax-Dienstes\n• Erstellung Ihrer Rückerstattungsberichte\n• Verwaltung Ihres Abonnements\n• Verbesserung unserer Dienste`,
        },
        {
          title: "4. Rechtsgrundlage",
          content: `Die Verarbeitung basiert auf:\n• Vertragserfüllung\n• Gesetzliche Pflichten\n• Berechtigte Interessen`,
        },
        {
          title: "5. Hosting und Sicherheit",
          content: `Ihre Daten werden in der Schweiz bei Infomaniak gehostet (ISO 27001 zertifiziert). Alle Kommunikationen sind SSL/TLS-verschlüsselt.`,
        },
        {
          title: "6. Datenweitergabe",
          content: `Wir verkaufen Ihre Daten niemals. Mögliche Weitergabe an:\n• Stripe (Zahlungen)\n• Infomaniak (Hosting)\n\nKeine automatische Übermittlung an das BAZG.`,
        },
        {
          title: "7. Aufbewahrung",
          content: `• Buchhaltungsdaten: 10 Jahre\n• Kontodaten: Abonnementdauer + 1 Jahr\n• Technische Logs: 12 Monate`,
        },
        {
          title: "8. Ihre Rechte (DSG)",
          content: `Gemäss Datenschutzgesetz haben Sie das Recht auf:\n• Auskunft\n• Berichtigung\n• Löschung\n• Datenübertragbarkeit\n\nKontakt: support@mineraltax.ch`,
        },
        {
          title: "9. Cookies",
          content: `Wir verwenden nur technisch notwendige Cookies. Keine Tracking- oder Werbe-Cookies.`,
        },
        {
          title: "10. Änderungen",
          content: `Diese Richtlinie kann aktualisiert werden. Wesentliche Änderungen werden per E-Mail mitgeteilt.`,
        },
      ],
    },
    it: {
      title: "Politica sulla Privacy",
      lastUpdate: "Ultimo aggiornamento: Gennaio 2026",
      back: "Indietro",
      sections: [
        {
          title: "1. Titolare del trattamento",
          content: `MineralTax.ch\nChemin des Lentillières\n1023 Crissier, Svizzera\nEmail: support@mineraltax.ch`,
        },
        {
          title: "2. Dati raccolti",
          content: `Raccogliamo i seguenti dati:\n• Dati identificativi: nome, cognome, email\n• Dati aziendali: ragione sociale, IDE, indirizzo, IBAN\n• Dati flotta: macchine, consumi carburante\n• Dati tecnici: log di connessione, indirizzo IP`,
        },
        {
          title: "3. Finalità del trattamento",
          content: `I vostri dati sono utilizzati per:\n• Fornire il servizio MineralTax\n• Generare i rapporti di rimborso\n• Gestire l'abbonamento\n• Migliorare i servizi`,
        },
        {
          title: "4. Base giuridica",
          content: `Il trattamento si basa su:\n• Esecuzione del contratto\n• Obblighi legali\n• Interesse legittimo`,
        },
        {
          title: "5. Hosting e sicurezza",
          content: `I dati sono ospitati in Svizzera da Infomaniak (certificato ISO 27001). Tutte le comunicazioni sono crittografate SSL/TLS.`,
        },
        {
          title: "6. Condivisione dati",
          content: `Non vendiamo mai i vostri dati. Possibile condivisione con:\n• Stripe (pagamenti)\n• Infomaniak (hosting)\n\nNessuna trasmissione automatica all'AFD.`,
        },
        {
          title: "7. Conservazione",
          content: `• Dati contabili: 10 anni\n• Dati account: durata abbonamento + 1 anno\n• Log tecnici: 12 mesi`,
        },
        {
          title: "8. I vostri diritti (LPD)",
          content: `Secondo la legge sulla protezione dei dati, avete diritto a:\n• Accesso\n• Rettifica\n• Cancellazione\n• Portabilità\n\nContatto: support@mineraltax.ch`,
        },
        {
          title: "9. Cookie",
          content: `Utilizziamo solo cookie tecnici essenziali. Nessun cookie di tracciamento o pubblicitario.`,
        },
        {
          title: "10. Modifiche",
          content: `Questa politica può essere aggiornata. Modifiche significative saranno comunicate via email.`,
        },
      ],
    },
    en: {
      title: "Privacy Policy",
      lastUpdate: "Last updated: January 2026",
      back: "Back",
      sections: [
        {
          title: "1. Data Controller",
          content: `MineralTax.ch\nChemin des Lentillières\n1023 Crissier, Switzerland\nEmail: support@mineraltax.ch`,
        },
        {
          title: "2. Data Collected",
          content: `We collect the following data:\n• Identification data: name, email\n• Company data: company name, IDE, address, IBAN\n• Fleet data: machines, fuel consumption\n• Technical data: connection logs, IP address`,
        },
        {
          title: "3. Processing Purposes",
          content: `Your data is used to:\n• Provide the MineralTax service\n• Generate reimbursement reports\n• Manage your subscription\n• Improve our services`,
        },
        {
          title: "4. Legal Basis",
          content: `Processing is based on:\n• Contract execution\n• Legal obligations\n• Legitimate interests`,
        },
        {
          title: "5. Hosting and Security",
          content: `Your data is hosted in Switzerland by Infomaniak (ISO 27001 certified). All communications are SSL/TLS encrypted.`,
        },
        {
          title: "6. Data Sharing",
          content: `We never sell your data. May be shared with:\n• Stripe (payments)\n• Infomaniak (hosting)\n\nNo automatic transmission to FOCBS.`,
        },
        {
          title: "7. Retention",
          content: `• Accounting data: 10 years\n• Account data: subscription duration + 1 year\n• Technical logs: 12 months`,
        },
        {
          title: "8. Your Rights (FADP)",
          content: `Under Swiss data protection law, you have the right to:\n• Access\n• Rectification\n• Deletion\n• Portability\n\nContact: support@mineraltax.ch`,
        },
        {
          title: "9. Cookies",
          content: `We only use essential technical cookies. No tracking or advertising cookies.`,
        },
        {
          title: "10. Changes",
          content: `This policy may be updated. Significant changes will be notified by email.`,
        },
      ],
    },
  };

  const c = content[language as keyof typeof content] || content.fr;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6" data-testid="link-back">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {c.back}
          </Link>
        </Button>

        <h1 className="text-3xl font-bold mb-2">{c.title}</h1>
        <p className="text-muted-foreground mb-8">{c.lastUpdate}</p>

        <div className="space-y-8">
          {c.sections.map((section, index) => (
            <div key={index}>
              <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
              <p className="text-muted-foreground whitespace-pre-line">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
