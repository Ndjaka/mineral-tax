import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    getApplicableRate,
    calculateReimbursementBySectorAndDate,
    AGRICULTURE_RATE_CHANGE_DATE,
} from "@shared/schema";

interface RateIndicatorProps {
    date: Date | null;
    sector?: string | null;
    volumeLiters?: number;
}

export function RateIndicator({ date, sector, volumeLiters }: RateIndicatorProps) {
    if (!date) return null;

    const rate = getApplicableRate(date, sector);
    const rateDisplay = (rate * 100).toFixed(2); // Convertir en CHF/100L

    const isNewRate =
        date >= AGRICULTURE_RATE_CHANGE_DATE && sector === "agriculture_with_direct";

    const reimbursement = volumeLiters
        ? calculateReimbursementBySectorAndDate(volumeLiters, date, sector)
        : null;

    return (
        <div className="mt-2 p-3 bg-muted/50 rounded-md border">
            <div className="flex items-center gap-2 flex-wrap">
                <div className={`flex items-center gap-2 text-sm font-medium ${isNewRate ? 'text-green-600' : 'text-foreground'}`}>
                    <Info className="h-4 w-4" />
                    <span>
                        Taux appliqué : <strong>{rateDisplay} CHF/100L</strong>
                    </span>
                </div>

                {isNewRate && (
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                        ✨ Nouveau taux 2026
                    </Badge>
                )}

                {reimbursement !== null && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
                        <span>→ Remboursement estimé :</span>
                        <span className="font-semibold text-foreground">
                            {reimbursement.toFixed(2)} CHF
                        </span>
                    </div>
                )}
            </div>

            {isNewRate && (
                <p className="text-xs text-muted-foreground mt-2">
                    🌾 Taux bonifié pour l'agriculture avec paiements directs (+76%)
                </p>
            )}
        </div>
    );
}
