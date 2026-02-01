import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, Shield } from "lucide-react";

/**
 * CALCULATEUR DÉSACTIVÉ - V1
 * 
 * Cette page est intentionnellement désactivée pour la V1.
 * MineralTax est un outil de PRÉPARATION de données, pas de calcul officiel.
 * 
 * Conformité : Art. 18 LMin - Les remboursements sont calculés par l'OFDF via Taxas.
 * 
 * @see https://www.bazg.admin.ch/bazg/fr/home/themes/impot-huiles-minerales.html
 */
export default function CalculatorPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-lg w-full border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
        <CardContent className="p-8 text-center space-y-6">
          {/* Icône d'avertissement */}
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>

          {/* Titre */}
          <div>
            <h1 className="text-xl font-semibold text-amber-800 dark:text-amber-200">
              Fonctionnalité désactivée
            </h1>
            <p className="text-amber-700 dark:text-amber-300 mt-2">
              MineralTax ne calcule aucun remboursement.
            </p>
          </div>

          {/* Explication */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 text-left border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <p>
                  <strong>MineralTax est un outil de préparation</strong>, pas un calculateur fiscal.
                </p>
                <p>
                  Les montants de remboursement sont calculés officiellement par l'OFDF
                  lors de votre déclaration sur la plateforme Taxas.
                </p>
                <p className="text-xs text-muted-foreground">
                  Référence : Art. 18 de la Loi sur l'imposition des huiles minérales (LMin)
                </p>
              </div>
            </div>
          </div>

          {/* Bouton retour */}
          <Button
            onClick={() => setLocation("/")}
            className="w-full"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
