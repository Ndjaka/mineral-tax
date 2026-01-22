import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { ScrollText, Shield, HelpCircle } from "lucide-react";

export function AppFooter() {
  const { language } = useI18n();

  const texts = {
    fr: {
      copyright: "MineralTax.ch. Tous droits réservés.",
      hosted: "Hébergé en Suisse par Infomaniak",
      lpd: "Données traitées selon la LPD suisse",
      jurisdiction: "For juridique : Crissier, Suisse",
      disclaimer: "MineralTax n'est pas un service officiel de l'OFDF mais un outil d'aide à la préparation conforme aux formats fédéraux.",
      terms: "CGV",
      privacy: "Confidentialité",
      help: "Besoin d'aide ?",
      linkedin: "LinkedIn",
    },
    de: {
      copyright: "MineralTax.ch. Alle Rechte vorbehalten.",
      hosted: "Gehostet in der Schweiz bei Infomaniak",
      lpd: "Daten gemäss Schweizer DSG verarbeitet",
      jurisdiction: "Gerichtsstand: Crissier, Schweiz",
      disclaimer: "MineralTax ist kein offizieller Dienst des BAZG, sondern ein Hilfstool zur Vorbereitung gemäss den Bundesformaten.",
      terms: "AGB",
      privacy: "Datenschutz",
      help: "Brauchen Sie Hilfe?",
      linkedin: "LinkedIn",
    },
    it: {
      copyright: "MineralTax.ch. Tutti i diritti riservati.",
      hosted: "Ospitato in Svizzera da Infomaniak",
      lpd: "Dati trattati secondo la LPD svizzera",
      jurisdiction: "Foro competente: Crissier, Svizzera",
      disclaimer: "MineralTax non è un servizio ufficiale dell'AFD ma uno strumento di preparazione conforme ai formati federali.",
      terms: "CGV",
      privacy: "Privacy",
      help: "Hai bisogno di aiuto?",
      linkedin: "LinkedIn",
    },
    en: {
      copyright: "MineralTax.ch. All rights reserved.",
      hosted: "Hosted in Switzerland by Infomaniak",
      lpd: "Data processed under Swiss FADP",
      jurisdiction: "Jurisdiction: Crissier, Switzerland",
      disclaimer: "MineralTax is not an official FOCBS service but a preparation tool compliant with federal formats.",
      terms: "Terms",
      privacy: "Privacy",
      help: "Need help?",
      linkedin: "LinkedIn",
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
            <a
              href="https://www.linkedin.com/company/mineraltax/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary transition-colors"
              data-testid="link-linkedin-footer"
              aria-label={`Suivez-nous sur ${c.linkedin}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              <span className="hidden sm:inline">{c.linkedin}</span>
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
