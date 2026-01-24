import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, Info, AlertCircle } from "lucide-react";
import { RateIndicator } from "@/components/RateIndicator";
import {
  calculateReimbursementBySectorAndDate,
  getApplicableRate,
  AGRICULTURE_RATE_CHANGE_DATE,
} from "@shared/schema";

export default function CalculatorPage() {
  const { t } = useI18n();
  const [volume, setVolume] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sector, setSector] = useState<string>("btp");

  const volumeNum = parseFloat(volume) || 0;
  const dateObj = date ? new Date(date) : new Date();
  const sectorValue = sector === 'btp' ? null : sector;

  const applicableRate = getApplicableRate(dateObj, sectorValue);
  const reimbursement = calculateReimbursementBySectorAndDate(
    volumeNum,
    dateObj,
    sectorValue
  );

  const isNewRate = dateObj >= AGRICULTURE_RATE_CHANGE_DATE && sector === 'agriculture_with_direct';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("de-CH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold" data-testid="text-calculator-title">
          {t.calculator.title}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          {t.calculator.eligibilityNote}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            {t.calculator.inputVolume}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Champ Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date de la facture</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">
                La date détermine le taux de remboursement applicable
              </p>
            </div>

            {/* Champ Secteur */}
            <div className="space-y-2">
              <Label htmlFor="sector">Secteur d'activité (optionnel)</Label>
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger id="sector" className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agriculture_with_direct">
                    🌾 Agriculture avec paiements directs
                  </SelectItem>
                  <SelectItem value="btp">
                    🏗️ BTP / Autres secteurs
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Le secteur influe sur le taux pour les factures 2026+
              </p>
            </div>

            {/* Champ Volume */}
            <div className="space-y-2">
              <Label htmlFor="volume">{t.fuel.volume}</Label>
              <Input
                id="volume"
                type="number"
                placeholder="0"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                className="text-2xl font-mono h-14"
                data-testid="input-calculator-volume"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="bg-muted/50">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{t.reports.totalVolume}</p>
                <p className="text-xl font-bold font-mono" data-testid="text-total-volume">
                  {formatNumber(volumeNum)} L
                </p>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{t.calculator.rate}</p>
                <p className="text-xl font-bold font-mono text-primary">
                  {(applicableRate * 100).toFixed(2)} CHF/100L
                </p>
                {isNewRate && (
                  <Badge variant="default" className="mt-2 bg-green-600 hover:bg-green-700">
                    ✨ Taux 2026
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card className="bg-primary/10 border-primary/30">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{t.calculator.result}</p>
                <p className="text-2xl font-bold font-mono text-primary" data-testid="text-result">
                  {formatCurrency(reimbursement)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Indicateur de taux détaillé */}
          {date && volumeNum > 0 && (
            <RateIndicator
              date={dateObj}
              sector={sectorValue}
              volumeLiters={volumeNum}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4 text-primary" />
            {t.reports.formReference}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 text-sm">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground">
              {t.calculator.eligibilityNote}
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">OFDF / BAZG / AFD / FOCBS</span>
              <span className="font-medium">{t.reports.formReference}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">{t.reports.rate}</span>
              <span className="font-mono font-medium">
                {(applicableRate * 100).toFixed(2)} CHF/100L
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">{t.reports.taxasInfo}</span>
              <span className="font-medium">Taxas</span>
            </div>
          </div>

          {/* Explication des taux OFDF 2026 */}
          <div className="mt-4 p-3 bg-muted/50 rounded-md text-xs space-y-2">
            <p className="font-semibold">📊 Taux OFDF - Règlement 09 de 2026 :</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Avant 01.01.2026 : <strong>34.06 CHF/100L</strong> (tous secteurs)</li>
              <li>Dès 01.01.2026 Agriculture : <strong className="text-green-700">60.05 CHF/100L</strong> (+76%)</li>
              <li>Dès 01.01.2026 BTP : <strong>34.06 CHF/100L</strong> (inchangé)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
