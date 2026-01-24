import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RateIndicator } from "./RateIndicator";
import { calculateReimbursementBySectorAndDate } from "@shared/schema";

export function GainSimulator() {
    const [open, setOpen] = useState(false);
    const [volume, setVolume] = useState("");
    const [date, setDate] = useState<Date | null>(null);
    const [sector, setSector] = useState<string>("");
    const [result, setResult] = useState<number | null>(null);

    const calculate = () => {
        if (!date || !volume) return;

        const volumeNum = parseFloat(volume);
        if (isNaN(volumeNum) || volumeNum <= 0) {
            return;
        }

        // Convert 'btp' to null since BTP uses null/empty sector
        const sectorValue = sector === 'btp' ? null : sector;

        const amount = calculateReimbursementBySectorAndDate(
            volumeNum,
            date,
            sectorValue
        );
        setResult(amount);
    };

    const reset = () => {
        setVolume("");
        setDate(null);
        setSector("");
        setResult(null);
    };

    return (
        <>
            <Button onClick={() => setOpen(true)} variant="outline" size="sm">
                <Calculator className="h-4 w-4 mr-2" />
                Calculer mon gain
            </Button>

            <Dialog open={open} onOpenChange={(isOpen) => {
                setOpen(isOpen);
                if (!isOpen) reset();
            }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>💰 Simulateur de Remboursement</DialogTitle>
                        <DialogDescription>
                            Estimez le montant de remboursement que vous pouvez récupérer
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="sim-volume">
                                Volume de carburant (litres) *
                            </Label>
                            <Input
                                id="sim-volume"
                                type="number"
                                placeholder="ex: 500"
                                value={volume}
                                onChange={(e) => {
                                    setVolume(e.target.value);
                                    setResult(null);
                                }}
                                min="0"
                                step="0.01"
                            />
                            <p className="text-xs text-muted-foreground">
                                Entrez le volume total de carburant consommé
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sim-date">Date de la facture *</Label>
                            <Input
                                id="sim-date"
                                type="date"
                                onChange={(e) => {
                                    setDate(e.target.value ? new Date(e.target.value) : null);
                                    setResult(null);
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                La date détermine le taux applicable
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sim-sector">Secteur (optionnel)</Label>
                            <Select
                                value={sector}
                                onValueChange={(value) => {
                                    setSector(value);
                                    setResult(null);
                                }}
                            >
                                <SelectTrigger id="sim-sector">
                                    <SelectValue placeholder="BTP / Autres secteurs (34.06 CHF/100L)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="agriculture_with_direct">
                                        🌾 Agriculture avec paiements directs (taux bonifié)
                                    </SelectItem>
                                    <SelectItem value="btp">
                                        🏗️ BTP / Autres secteurs (taux standard)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Le secteur influe sur le taux pour les factures 2026+
                            </p>
                        </div>

                        {date && (
                            <RateIndicator
                                date={date}
                                sector={sector === 'btp' ? null : sector}
                                volumeLiters={volume ? parseFloat(volume) : undefined}
                            />
                        )}

                        <Button
                            onClick={calculate}
                            className="w-full"
                            disabled={!date || !volume || parseFloat(volume) <= 0}
                        >
                            <Calculator className="h-4 w-4 mr-2" />
                            Calculer le remboursement
                        </Button>

                        {result !== null && (
                            <Alert className="bg-green-50 border-green-200">
                                <AlertTitle className="text-green-900 flex items-center gap-2">
                                    <span className="text-2xl">💰</span>
                                    Résultat de la simulation
                                </AlertTitle>
                                <AlertDescription>
                                    <div className="mt-2 space-y-2">
                                        <div className="text-3xl font-bold text-green-700">
                                            {result.toFixed(2)} CHF
                                        </div>
                                        <div className="text-sm text-green-800">
                                            Pour {parseFloat(volume).toLocaleString('fr-CH')} litres de carburant
                                        </div>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        {result !== null && (
                            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                                <p className="font-semibold mb-1">ℹ️ Comment récupérer ce montant :</p>
                                <ol className="list-decimal list-inside space-y-1">
                                    <li>Créez une entrée de carburant avec ces informations</li>
                                    <li>Générez un rapport pour la période concernée</li>
                                    <li>Exportez le fichier CSV au format Taxas OFDF</li>
                                    <li>Soumettez votre demande à l'administration</li>
                                </ol>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
