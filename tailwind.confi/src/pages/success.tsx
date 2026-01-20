import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";

export default function SuccessPage() {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setVerifying(false);
      setError(t.success?.missingSession || "Session ID missing");
      return;
    }

    async function verifyPayment() {
      try {
        const response = await apiRequest("GET", `/api/checkout/success?session_id=${sessionId}`);
        const data = await response.json();
        
        if (data.success && data.status === "paid") {
          setVerified(true);
        } else {
          setError(t.success?.paymentFailed || "Payment verification failed");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError(t.success?.verificationError || "Unable to verify payment");
      } finally {
        setVerifying(false);
      }
    }

    verifyPayment();
  }, [t]);

  const handleReturnToDashboard = () => {
    setLocation("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="flex flex-col items-center gap-4">
            {verifying ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <span>{t.success?.verifying || "Verifying payment..."}</span>
              </>
            ) : verified ? (
              <>
                <CheckCircle className="h-12 w-12 text-green-600" />
                <span>{t.success?.title || "Thank you!"}</span>
              </>
            ) : (
              <span className="text-destructive">{t.common.error}</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {verified && (
            <p className="text-muted-foreground">
              {t.success?.message || "Your MineralTax subscription is now active."}
            </p>
          )}
          {error && (
            <p className="text-destructive">{error}</p>
          )}
          <Button
            onClick={handleReturnToDashboard}
            className="w-full"
            data-testid="button-return-dashboard"
          >
            {t.success?.returnToDashboard || "Return to Dashboard"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
