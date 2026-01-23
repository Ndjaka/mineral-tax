import { useState, useEffect } from "react";
import { X, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const BANNER_STORAGE_KEY = "banner2026_update_v2";
const BANNER_DISPLAY_DAYS = 7;

export function Banner2026() {
    const { language } = useI18n();
    const [isVisible, setIsVisible] = useState(false);

    const messages = {
        fr: {
            text: "🚀 Mise à jour majeure : Vos remboursements 2026 sont désormais calculés au taux de 60.05 CHF/100L. Votre interface est prête pour le nouveau portail fédéral Taxas.",
            dismiss: "Compris",
        },
        de: {
            text: "🚀 Wichtiges Update: Ihre Rückerstattungen 2026 werden jetzt mit dem Satz von 60.05 CHF/100L berechnet. Ihre Schnittstelle ist bereit für das neue Bundesportal Taxas.",
            dismiss: "Verstanden",
        },
        it: {
            text: "🚀 Aggiornamento importante: I tuoi rimborsi 2026 sono ora calcolati al tasso di 60.05 CHF/100L. La tua interfaccia è pronta per il nuovo portale federale Taxas.",
            dismiss: "Capito",
        },
        en: {
            text: "🚀 Major update: Your 2026 reimbursements are now calculated at the rate of 60.05 CHF/100L. Your interface is ready for the new federal Taxas portal.",
            dismiss: "Got it",
        },
    };

    const content = messages[language as keyof typeof messages] || messages.fr;

    useEffect(() => {
        // Vérifier si la bannière a été fermée
        const dismissed = localStorage.getItem(BANNER_STORAGE_KEY);

        if (!dismissed) {
            setIsVisible(true);
        } else {
            // Respecter la fermeture définitive
            setIsVisible(false);
        }
    }, []);

    const handleDismiss = () => {
        localStorage.setItem(BANNER_STORAGE_KEY, new Date().toISOString());
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
            data-testid="banner-2026"
        >
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="hidden sm:block">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <p className="text-sm md:text-base font-medium flex-1">
                            {content.text}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDismiss}
                        className="text-white hover:bg-blue-700 shrink-0"
                        data-testid="button-dismiss-banner"
                    >
                        <span className="hidden sm:inline mr-2">{content.dismiss}</span>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
