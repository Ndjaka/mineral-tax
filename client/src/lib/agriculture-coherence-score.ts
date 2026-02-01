/**
 * Score de Cohérence Agriculture
 * 
 * AVERTISSEMENT JURIDIQUE :
 * Ce score est un indicateur INTERNE uniquement.
 * Il n'a AUCUNE valeur juridique.
 * Il ne constitue NI un calcul, NI une estimation de remboursement.
 * Le remboursement agricole est déterminé exclusivement par l'OFDF
 * selon les normes forfaitaires en vigueur (Art. 18 LMin).
 * 
 * INTERDIT :
 * - Aucun litre de carburant
 * - Aucun CHF
 * - Aucun taux de remboursement
 * - Aucune estimation de droit
 */

import type { AgriculturalSurface, Machine } from "@shared/schema";

// Types de machines agricoles (cohérentes avec le secteur Agriculture)
const AGRICULTURAL_MACHINE_TYPES = [
    "tractor",
    "combine_harvester",
    "forage_harvester",
    "sprayer",
    "seeder",
    "baler",
    "tedder",
    "mower",
    "trailer",
    "slurry_tanker",
    "forestry_tractor",
    "vineyard_tractor",
];

// Catégories Taxas agricoles
const AGRICULTURAL_TAXAS_ACTIVITIES = [
    "agriculture_with_direct",
    "agriculture_without_direct",
    "forestry",
];

export interface CoherenceScoreResult {
    /** Score total sur 100 */
    score: number;
    /** Score par catégorie */
    breakdown: {
        surfaces: number; // max 40
        cultures: number; // max 30
        machines: number; // max 20
        completeness: number; // max 10
    };
    /** Messages d'amélioration */
    suggestions: string[];
    /** Niveau de cohérence */
    level: "good" | "partial" | "incomplete";
}

/**
 * Calcule le score de cohérence du dossier Agriculture
 * 
 * RAPPEL : Ce score est purement indicatif et n'a aucune valeur juridique.
 * Il ne prend en compte AUCUNE donnée financière (CHF, litres, taux).
 */
export function calculateAgricultureCoherenceScore(
    surfaces: AgriculturalSurface[],
    machines: Machine[]
): CoherenceScoreResult {
    const suggestions: string[] = [];
    let surfaceScore = 0;
    let cultureScore = 0;
    let machineScore = 0;
    let completenessScore = 0;

    // ========================================
    // 1. SURFACES AGRICOLES (40 points max)
    // ========================================

    // ≥ 1 surface déclarée : +20
    if (surfaces.length >= 1) {
        surfaceScore += 20;
    } else {
        suggestions.push("addSurfaces");
    }

    // Toutes les surfaces complètes : +20
    const completeSurfaces = surfaces.filter(
        (s) => s.totalHectares > 0 && s.cultureType && s.declarationYear
    );
    if (surfaces.length > 0 && completeSurfaces.length === surfaces.length) {
        surfaceScore += 20;
    } else if (surfaces.length > 0 && completeSurfaces.length < surfaces.length) {
        suggestions.push("completeSurfaces");
    }

    // ========================================
    // 2. COHÉRENCE CULTURES (30 points max)
    // ========================================

    // ≥ 1 type de culture déclaré : +10
    const surfacesWithCulture = surfaces.filter((s) => s.cultureType);
    if (surfacesWithCulture.length >= 1) {
        cultureScore += 10;
    } else if (surfaces.length > 0) {
        suggestions.push("defineCultures");
    }

    // Aucune surface sans culture : +10
    const surfacesWithoutCulture = surfaces.filter((s) => !s.cultureType);
    if (surfaces.length > 0 && surfacesWithoutCulture.length === 0) {
        cultureScore += 10;
    } else if (surfacesWithoutCulture.length > 0) {
        suggestions.push("missingCultureTypes");
    }

    // Pas de surface absurdement petite (< 0.1 ha isolée) : +10
    const tinySurfaces = surfaces.filter((s) => s.totalHectares < 0.1);
    if (surfaces.length > 0 && tinySurfaces.length === 0) {
        cultureScore += 10;
    } else if (tinySurfaces.length > 0 && tinySurfaces.length < surfaces.length) {
        // Surfaces très petites mais pas toutes → avertissement léger
        suggestions.push("tinySurfaces");
    } else if (tinySurfaces.length === surfaces.length && surfaces.length > 0) {
        // Toutes très petites → problème potentiel (mais pas bloquant)
        suggestions.push("tinySurfaces");
    }

    // ========================================
    // 3. MACHINES AGRICOLES (20 points max)
    // ========================================

    // Filtrer les machines agricoles uniquement
    const agriculturalMachines = machines.filter(
        (m) =>
            AGRICULTURAL_MACHINE_TYPES.includes(m.type) ||
            AGRICULTURAL_TAXAS_ACTIVITIES.includes(m.taxasActivity || "")
    );

    // ≥ 1 machine agricole déclarée : +10
    if (agriculturalMachines.length >= 1) {
        machineScore += 10;
    } else {
        suggestions.push("addAgriculturalMachines");
    }

    // Machines cohérentes (pas de machine BTP en secteur Agriculture) : +10
    const btpMachinesInAgri = machines.filter(
        (m) =>
            m.taxasActivity === "construction" &&
            !AGRICULTURAL_MACHINE_TYPES.includes(m.type)
    );
    if (btpMachinesInAgri.length === 0) {
        machineScore += 10;
    } else {
        suggestions.push("btpMachinesDetected");
    }

    // ========================================
    // 4. COMPLÉTUDE GLOBALE (10 points max)
    // ========================================

    // Vérifier que l'utilisateur a au moins une surface ET une machine agricole
    const hasBasicData = surfaces.length > 0 && agriculturalMachines.length > 0;
    if (hasBasicData) {
        completenessScore += 10;
    } else if (surfaces.length === 0 && agriculturalMachines.length === 0) {
        suggestions.push("emptyFile");
    }

    // ========================================
    // CALCUL FINAL
    // ========================================

    const totalScore = surfaceScore + cultureScore + machineScore + completenessScore;

    // Déterminer le niveau
    let level: "good" | "partial" | "incomplete";
    if (totalScore >= 80) {
        level = "good";
    } else if (totalScore >= 50) {
        level = "partial";
    } else {
        level = "incomplete";
    }

    return {
        score: totalScore,
        breakdown: {
            surfaces: surfaceScore,
            cultures: cultureScore,
            machines: machineScore,
            completeness: completenessScore,
        },
        suggestions,
        level,
    };
}

/**
 * Retourne la couleur CSS associée au niveau de cohérence
 */
export function getCoherenceLevelColor(level: "good" | "partial" | "incomplete"): string {
    switch (level) {
        case "good":
            return "text-green-600";
        case "partial":
            return "text-orange-500";
        case "incomplete":
            return "text-red-500";
    }
}

/**
 * Retourne la couleur de fond associée au niveau de cohérence
 */
export function getCoherenceLevelBgColor(level: "good" | "partial" | "incomplete"): string {
    switch (level) {
        case "good":
            return "bg-green-100";
        case "partial":
            return "bg-orange-100";
        case "incomplete":
            return "bg-red-100";
    }
}
