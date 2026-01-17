import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { getFiscalYear, isUrgentPeriod } from "@/lib/fiscal-year";

const BANNER_DISMISSED_KEY = "mineraltax-urgent-banner-dismissed";

export function UrgentBanner() {
  const { t, language } = useI18n();
  const [isDismissed, setIsDismissed] = useState(true);
  const fiscalYear = getFiscalYear();

  useEffect(() => {
    const dismissedYear = localStorage.getItem(BANNER_DISMISSED_KEY);
    const currentYear = new Date().getFullYear().toString();
    
    if (dismissedYear !== currentYear && isUrgentPeriod()) {
      setIsDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(BANNER_DISMISSED_KEY, new Date().getFullYear().toString());
  };

  if (isDismissed || !isUrgentPeriod()) {
    return null;
  }

  const bannerTexts: Record<string, string> = {
    fr: `Période fiscale ${fiscalYear} : Déposez vos demandes de remboursement avant la clôture annuelle !`,
    de: `Steuerperiode ${fiscalYear}: Reichen Sie Ihre Rückerstattungsanträge vor dem Jahresabschluss ein!`,
    it: `Periodo fiscale ${fiscalYear}: Presentate le vostre richieste di rimborso prima della chiusura annuale!`,
    en: `Fiscal period ${fiscalYear}: Submit your reimbursement claims before the annual deadline!`,
  };

  return (
    <div className="sticky top-0 z-50 bg-amber-400 text-black px-4 py-3" data-testid="banner-urgent">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium" data-testid="text-urgent-message">
            {bannerTexts[language] || bannerTexts.fr}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="h-8 w-8 text-black"
          data-testid="button-dismiss-banner"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
