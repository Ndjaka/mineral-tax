import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { ScrollText, Shield, HelpCircle } from "lucide-react";

export function AppFooter() {
  const { language } = useI18n();

  const texts = {
    fr: {
      copyright: "MineralTax Sàrl. Tous droits réservés.",
      hosted: "Hébergé en Suisse par Infomaniak",
      lpd: "Données sécurisées (LPD)",
      jurisdiction: "For juridique : Crissier, Suisse",
      disclaimer: "MineralTax n'est pas un service officiel de l'OFDF mais un outil d'aide à la préparation conforme aux formats fédéraux.",
      terms: "CGV",
      privacy: "Confidentialité",
      help: "Besoin d'aide ?",
    },
    de: {
      copyright: "MineralTax Sàrl. Alle Rechte vorbehalten.",
      hosted: "Gehostet in der Schweiz bei Infomaniak",
      lpd: "Gesicherte Daten (DSG)",
      jurisdiction: "Gerichtsstand: Crissier, Schweiz",
      disclaimer: "MineralTax ist kein offizieller Dienst des BAZG, sondern ein Hilfstool zur Vorbereitung gemäss den Bundesformaten.",
      terms: "AGB",
      privacy: "Datenschutz",
      help: "Brauchen Sie Hilfe?",
    },
    it: {
      copyright: "MineralTax Sàrl. Tutti i diritti riservati.",
      hosted: "Ospitato in Svizzera da Infomaniak",
      lpd: "Dati protetti (LPD)",
      jurisdiction: "Foro competente: Crissier, Svizzera",
      disclaimer: "MineralTax non è un servizio ufficiale dell'AFD ma uno strumento di preparazione conforme ai formati federali.",
      terms: "CGV",
      privacy: "Privacy",
      help: "Hai bisogno di aiuto?",
    },
    en: {
      copyright: "MineralTax Sàrl. All rights reserved.",
      hosted: "Hosted in Switzerland by Infomaniak",
      lpd: "Secured data (FADP)",
      jurisdiction: "Jurisdiction: Crissier, Switzerland",
      disclaimer: "MineralTax is not an official FOCBS service but a preparation tool compliant with federal formats.",
      terms: "Terms",
      privacy: "Privacy",
      help: "Need help?",
    },
  };

  const c = texts[language as keyof typeof texts] || texts.fr;

  return (
    <footer className="border-t py-6 px-6 mt-auto bg-muted/30">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <span className="font-medium text-foreground">&copy; 2026 {c.copyright}</span>
            <span className="hidden md:inline">|</span>
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {c.hosted}
            </span>
            <span className="hidden md:inline">|</span>
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {c.lpd}
            </span>
            <span className="hidden md:inline">|</span>
            <span>{c.jurisdiction}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/cgv" 
              className="hover:text-foreground transition-colors"
              data-testid="link-cgv-footer"
            >
              <ScrollText className="h-4 w-4 inline mr-1" />
              {c.terms}
            </Link>
            <Link 
              href="/confidentialite" 
              className="hover:text-foreground transition-colors"
              data-testid="link-privacy-footer"
            >
              {c.privacy}
            </Link>
            <a 
              href="mailto:support@mineraltax.ch"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              data-testid="link-help-footer"
            >
              <HelpCircle className="h-4 w-4" />
              {c.help}
            </a>
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground/70">
          {c.disclaimer}
        </p>
      </div>
    </footer>
  );
}
