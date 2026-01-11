import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Info, AlertCircle } from "lucide-react";
import { REIMBURSEMENT_RATE_CHF_PER_LITER } from "@shared/schema";

export default function CalculatorPage() {
  const { t } = useI18n();
  const [volume, setVolume] = useState<string>("");

  const volumeNum = parseFloat(volume) || 0;
  const reimbursement = volumeNum * REIMBURSEMENT_RATE_CHF_PER_LITER;

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
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-calculator-title">
          {t.calculator.title}
        </h1>
        <p className="text-muted-foreground mt-1">
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
                  0.3405 CHF/L
                </p>
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
              <span className="font-mono font-medium">0.3405 CHF/L</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">{t.reports.taxasInfo}</span>
              <span className="font-medium">Taxas</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
