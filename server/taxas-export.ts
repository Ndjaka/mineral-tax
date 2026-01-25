import type { User } from "@shared/schema";

/**
 * Generate a unique technical signature for TAXAS exports
 * Format: MTX26-{TIMESTAMP}-{USER_ID_SHORT}
 * Example: MTX26-20260125-A1B2C3
 */
export function generateTaxasSignature(userId: string): string {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const userIdShort = userId.slice(0, 6).toUpperCase();
    return `MTX26-${timestamp}-${userIdShort}`;
}

/**
 * Format a number for TAXAS CSV (2 decimal places, dot separator)
 */
export function formatTaxasNumber(value: number): string {
    return value.toFixed(2);
}

/**
 * Format a date for TAXAS CSV (YYYY-MM-DD)
 */
export function formatTaxasDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().slice(0, 10);
}

/**
 * Sanitize text for CSV (remove semicolons and line breaks)
 */
export function sanitizeTaxasText(text: string | null): string {
    if (!text) return '';
    return text
        .replace(/;/g, ',')
        .replace(/\r?\n/g, ' ')
        .trim();
}

/**
 * Map fuel type to OFDF product code
 */
export function mapFuelTypeToProductCode(fuelType: string): string {
    const mapping: Record<string, string> = {
        'diesel': 'DIESEL',
        'gasoline': 'ESSENCE',
        'biodiesel': 'BIODIESEL',
    };
    return mapping[fuelType.toLowerCase()] || 'DIESEL';
}

/**
 * Map machine type to OFDF machine code
 */
export function mapMachineTypeToCode(machineType: string): string {
    const mapping: Record<string, string> = {
        'excavator': 'EXC',
        'spider_excavator': 'EXS',
        'loader': 'LDR',
        'crane': 'CRA',
        'drill': 'DRL',
        'finisher': 'FIN',
        'milling_machine': 'MIL',
        'roller': 'ROL',
        'dumper': 'DMP',
        'forklift': 'FLT',
        'crusher': 'CRU',
        'generator': 'GEN',
        'compressor': 'CMP',
        'concrete_pump': 'CPM',
        'other': 'OTH',
    };
    return mapping[machineType.toLowerCase()] || 'OTH';
}

/**
 * Get reimbursement rate (uniform for all sectors - mineral oil tax only)
 * Note: Agriculture also benefits from CO2 tax redistribution (calculated by AVS)
 */
export function getTaxasRate(activitySector?: "agriculture" | "btp" | null, year?: number): number {
    return 0.3405; // 34.05 cts/L (mineral oil tax for all sectors)
}

interface TaxasExportRow {
    referenceId: string;
    uidAssujetti: string;
    nomAssujetti: string;
    adresse: string;
    codeMachine: string;
    numeroMachine: string;
    codeProduit: string;
    dateConsommation: string;
    quantiteLitres: string;
    tauxImpotCHFL: string;
    montantRemboursableCHF: string;
    periodeFiscale: string;
    declarationOrigineFR: string;
    declarationOrigineDE: string;
    directiveVersion: string;
    signatureTechnique: string;
    remarques: string;
}

/**
 * Generate TAXAS CSV content from export rows
 * Includes UTF-8 BOM, proper headers, and CRLF line endings
 */
export function generateTaxasCSV(rows: TaxasExportRow[]): string {
    const BOM = '\uFEFF'; // UTF-8 BOM
    const CRLF = '\r\n';

    // CSV header (exact OFDF column order)
    const headers = [
        'ReferenceID',
        'UID_Assujetti',
        'Nom_Assujetti',
        'Adresse',
        'Code_Machine',
        'Numero_Machine',
        'Code_Produit',
        'Date_Consommation',
        'Quantite_Litres',
        'Taux_Impot_CHF_L',
        'Montant_Remboursable_CHF',
        'Periode_Fiscale',
        'Declaration_Origine_FR',
        'Declaration_Origine_DE',
        'Directive_Version',
        'Signature_Technique',
        'Remarques'
    ];

    let csv = BOM + headers.join(';') + CRLF;

    // Add data rows
    for (const row of rows) {
        const values = [
            row.referenceId,
            row.uidAssujetti,
            row.nomAssujetti,
            row.adresse,
            row.codeMachine,
            row.numeroMachine,
            row.codeProduit,
            row.dateConsommation,
            row.quantiteLitres,
            row.tauxImpotCHFL,
            row.montantRemboursableCHF,
            row.periodeFiscale,
            row.declarationOrigineFR,
            row.declarationOrigineDE,
            row.directiveVersion,
            row.signatureTechnique,
            row.remarques
        ];

        csv += values.join(';') + CRLF;
    }

    return csv;
}

export type { TaxasExportRow };
