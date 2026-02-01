import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export default function CGV() {
  const { language } = useI18n();

  const content = {
    fr: {
      title: "Conditions Générales de Vente",
      lastUpdate: "Dernière mise à jour : Janvier 2026",
      back: "Retour",
      sections: [
        {
          title: "1. Objet",
          content: `Les présentes Conditions Générales de Vente (CGV) régissent l'utilisation de la plateforme MineralTax Swiss, un outil SaaS d'aide à la préparation des demandes de remboursement de l'impôt sur les huiles minérales en Suisse.`,
        },
        {
          title: "2. Clause de non-affiliation",
          content: `MineralTax n'est pas un service officiel de l'Office fédéral de la douane et de la sécurité des frontières (OFDF). Il s'agit d'un outil privé d'aide à la préparation conforme aux formats fédéraux. La soumission officielle des demandes de remboursement doit être effectuée directement via la plateforme Taxas de l'OFDF.`,
        },
        {
          title: "3. Services proposés",
          content: `MineralTax propose les services suivants : gestion de flotte de véhicules et machines, saisie des entrées de carburant, calcul automatique des remboursements au taux officiel (0.3405 CHF/L), génération de rapports PDF conformes au formulaire 45.35, export CSV compatible Taxas, et numérisation OCR des tickets de carburant.`,
        },
        {
          title: "4. Abonnement et tarification",
          content: `L'abonnement annuel est de CHF 150.- (Agriculture) ou CHF 390.- (BTP) TTC. Un essai gratuit de 10 jours est offert à tout nouvel utilisateur. Pendant l'essai, toutes les fonctionnalités sont accessibles. Après expiration, les exports PDF et CSV sont bloqués jusqu'à souscription.`,
        },
        {
          title: "5. Paiement",
          content: `Les paiements sont traités de manière sécurisée via Stripe. Stripe est certifié sous le Swiss-US Data Privacy Framework. Les données de paiement ne sont jamais stockées sur nos serveurs.`,
        },
        {
          title: "6. Résiliation",
          content: `L'abonnement peut être résilié à tout moment depuis l'espace client. La résiliation prend effet à la fin de la période en cours. Aucun remboursement prorata n'est effectué.`,
        },
        {
          title: "7. Responsabilité",
          content: `MineralTax fournit un outil d'aide à la préparation. L'utilisateur reste seul responsable de la vérification et de la soumission de ses demandes auprès de l'OFDF. MineralTax ne peut être tenu responsable d'erreurs dans les déclarations ou de refus de remboursement par l'administration.`,
        },
        {
          title: "8. Propriété intellectuelle",
          content: `L'ensemble du contenu de la plateforme (code, design, textes) est la propriété de MineralTax.ch. Toute reproduction sans autorisation est interdite.`,
        },
        {
          title: "9. For juridique",
          content: `Les présentes CGV sont soumises au droit suisse. Tout litige sera soumis à la compétence exclusive des tribunaux du Canton de Vaud, Suisse.`,
        },
        {
          title: "10. Contact",
          content: `MineralTax.ch\nChemin des Lentillières\n1023 Crissier, Suisse\nEmail : support@mineraltax.ch`,
        },
      ],
    },
    de: {
      title: "Allgemeine Geschäftsbedingungen",
      lastUpdate: "Letzte Aktualisierung: Januar 2026",
      back: "Zurück",
      sections: [
        {
          title: "1. Gegenstand",
          content: `Diese Allgemeinen Geschäftsbedingungen (AGB) regeln die Nutzung der Plattform MineralTax Swiss, einem SaaS-Tool zur Vorbereitung von Rückerstattungsanträgen für die Mineralölsteuer in der Schweiz.`,
        },
        {
          title: "2. Haftungsausschluss",
          content: `MineralTax ist kein offizieller Dienst des Bundesamts für Zoll und Grenzsicherheit (BAZG). Es handelt sich um ein privates Hilfstool zur Vorbereitung gemäss den Bundesformaten. Die offizielle Einreichung muss direkt über die Taxas-Plattform des BAZG erfolgen.`,
        },
        {
          title: "3. Angebotene Dienstleistungen",
          content: `MineralTax bietet folgende Dienstleistungen: Flottenmanagement, Kraftstofferfassung, automatische Berechnung der Rückerstattungen zum offiziellen Satz (0.3405 CHF/L), PDF-Berichte gemäss Formular 45.35, Taxas-kompatible CSV-Exporte und OCR-Digitalisierung von Kraftstoffbelegen.`,
        },
        {
          title: "4. Abonnement und Preise",
          content: `Das Jahresabonnement kostet CHF 150.- (Landwirtschaft) oder CHF 390.- (Bau) inkl. MwSt. Eine 10-tägige kostenlose Testversion wird jedem neuen Benutzer angeboten. Nach Ablauf werden PDF- und CSV-Exporte bis zur Anmeldung gesperrt.`,
        },
        {
          title: "5. Zahlung",
          content: `Zahlungen werden sicher über Stripe abgewickelt. Stripe ist unter dem Swiss-US Data Privacy Framework zertifiziert.`,
        },
        {
          title: "6. Kündigung",
          content: `Das Abonnement kann jederzeit im Kundenbereich gekündigt werden. Die Kündigung wird am Ende des laufenden Zeitraums wirksam.`,
        },
        {
          title: "7. Haftung",
          content: `MineralTax ist ein Vorbereitungstool. Der Benutzer bleibt allein verantwortlich für die Überprüfung und Einreichung seiner Anträge beim BAZG.`,
        },
        {
          title: "8. Geistiges Eigentum",
          content: `Der gesamte Inhalt der Plattform ist Eigentum von MineralTax.ch. Jede Vervielfältigung ohne Genehmigung ist untersagt.`,
        },
        {
          title: "9. Gerichtsstand",
          content: `Diese AGB unterliegen dem Schweizer Recht. Gerichtsstand ist ausschliesslich der Kanton Waadt, Schweiz.`,
        },
        {
          title: "10. Kontakt",
          content: `MineralTax.ch\nChemin des Lentillières\n1023 Crissier, Schweiz\nEmail: support@mineraltax.ch`,
        },
      ],
    },
    it: {
      title: "Condizioni Generali di Vendita",
      lastUpdate: "Ultimo aggiornamento: Gennaio 2026",
      back: "Indietro",
      sections: [
        {
          title: "1. Oggetto",
          content: `Le presenti Condizioni Generali di Vendita (CGV) regolano l'utilizzo della piattaforma MineralTax Swiss, uno strumento SaaS per la preparazione delle richieste di rimborso della tassa sugli oli minerali in Svizzera.`,
        },
        {
          title: "2. Clausola di non affiliazione",
          content: `MineralTax non è un servizio ufficiale dell'Ufficio federale della dogana e della sicurezza dei confini (UDSC). Si tratta di uno strumento privato conforme ai formati federali. La presentazione ufficiale deve essere effettuata tramite la piattaforma Taxas dell'UDSC.`,
        },
        {
          title: "3. Servizi offerti",
          content: `MineralTax offre: gestione flotta, registrazione carburante, calcolo automatico dei rimborsi (0.3405 CHF/L), rapporti PDF conformi al modulo 45.35, export CSV compatibili Taxas e digitalizzazione OCR delle ricevute.`,
        },
        {
          title: "4. Abbonamento e prezzi",
          content: `L'abbonamento annuale costa CHF 150.- (Agricoltura) o CHF 390.- (Edilizia) IVA inclusa. Una prova gratuita di 10 giorni è offerta a ogni nuovo utente.`,
        },
        {
          title: "5. Pagamento",
          content: `I pagamenti sono elaborati in modo sicuro tramite Stripe, certificato sotto lo Swiss-US Data Privacy Framework.`,
        },
        {
          title: "6. Disdetta",
          content: `L'abbonamento può essere disdetto in qualsiasi momento. La disdetta ha effetto alla fine del periodo in corso.`,
        },
        {
          title: "7. Responsabilità",
          content: `MineralTax è uno strumento di preparazione. L'utente resta responsabile della verifica e della presentazione delle sue richieste all'UDSC.`,
        },
        {
          title: "8. Proprietà intellettuale",
          content: `Tutti i contenuti della piattaforma sono di proprietà di MineralTax.ch.`,
        },
        {
          title: "9. Foro competente",
          content: `Le presenti CGV sono soggette al diritto svizzero. Foro competente: Canton Vaud, Svizzera.`,
        },
        {
          title: "10. Contatto",
          content: `MineralTax.ch\nChemin des Lentillières\n1023 Crissier, Svizzera\nEmail: support@mineraltax.ch`,
        },
      ],
    },
    en: {
      title: "Terms and Conditions",
      lastUpdate: "Last updated: January 2026",
      back: "Back",
      sections: [
        {
          title: "1. Purpose",
          content: `These Terms and Conditions govern the use of MineralTax Swiss, a SaaS platform for preparing mineral oil tax reimbursement claims in Switzerland.`,
        },
        {
          title: "2. Non-affiliation clause",
          content: `MineralTax is not an official service of the Federal Office for Customs and Border Security (FOCBS). It is a private tool compliant with federal formats. Official submission must be done through the FOCBS Taxas platform.`,
        },
        {
          title: "3. Services offered",
          content: `MineralTax provides: fleet management, fuel entry logging, automatic reimbursement calculation (0.3405 CHF/L), PDF reports compliant with form 45.35, Taxas-compatible CSV exports, and OCR digitization of fuel receipts.`,
        },
        {
          title: "4. Subscription and pricing",
          content: `Annual subscription costs CHF 150.- (Agriculture) or CHF 390.- (Construction) including VAT. A 10-day free trial is offered to every new user.`,
        },
        {
          title: "5. Payment",
          content: `Payments are processed securely via Stripe, certified under the Swiss-US Data Privacy Framework.`,
        },
        {
          title: "6. Cancellation",
          content: `Subscriptions can be cancelled at any time. Cancellation takes effect at the end of the current period.`,
        },
        {
          title: "7. Liability",
          content: `MineralTax is a preparation tool. Users remain solely responsible for verifying and submitting their claims to FOCBS.`,
        },
        {
          title: "8. Intellectual property",
          content: `All platform content is the property of MineralTax.ch.`,
        },
        {
          title: "9. Jurisdiction",
          content: `These terms are governed by Swiss law. Jurisdiction: Canton of Vaud, Switzerland.`,
        },
        {
          title: "10. Contact",
          content: `MineralTax.ch\nChemin des Lentillières\n1023 Crissier, Switzerland\nEmail: support@mineraltax.ch`,
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
