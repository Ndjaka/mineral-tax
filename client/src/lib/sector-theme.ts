/**
 * Sector Theme Utility
 * Provides consistent color palettes for Agriculture (green) and BTP (blue/orange) sectors
 */

export type Sector = "agriculture" | "btp";

// Palettes de couleurs par secteur
export const sectorThemes = {
    agriculture: {
        // Couleurs principales
        primary: "green",
        primaryColor: "#22c55e", // green-500

        // Classes Tailwind - Texte
        textPrimary: "text-green-600",
        textPrimaryDark: "text-green-800",
        textPrimaryLight: "text-green-400",

        // Classes Tailwind - Backgrounds
        bgPrimary: "bg-green-600",
        bgPrimaryHover: "hover:bg-green-700",
        bgLight: "bg-green-100",
        bgLighter: "bg-green-50",
        bgDark: "bg-green-900/30",

        // Classes Tailwind - Borders
        borderPrimary: "border-green-500",
        borderLight: "border-green-200",
        borderDark: "border-green-800",

        // États et interactions
        focusRing: "focus:ring-green-500",
        hoverText: "hover:text-green-700",

        // Combinaisons courantes
        badge: "bg-green-100 text-green-800 border-green-200",
        badgeDark: "dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
        alert: "bg-green-50 border-green-200 border-l-green-500",
        alertDark: "dark:bg-green-950 dark:border-green-800",
        card: "border-l-4 border-l-green-500",
        button: "bg-green-600 hover:bg-green-700",
    },

    btp: {
        // Couleurs principales
        primary: "blue",
        primaryColor: "#2563eb", // blue-600

        // Classes Tailwind - Texte
        textPrimary: "text-blue-600",
        textPrimaryDark: "text-blue-800",
        textPrimaryLight: "text-blue-400",

        // Classes Tailwind - Backgrounds
        bgPrimary: "bg-blue-600",
        bgPrimaryHover: "hover:bg-blue-700",
        bgLight: "bg-blue-100",
        bgLighter: "bg-blue-50",
        bgDark: "bg-blue-900/30",

        // Classes Tailwind - Borders
        borderPrimary: "border-blue-500",
        borderLight: "border-blue-200",
        borderDark: "border-blue-800",

        // États et interactions
        focusRing: "focus:ring-blue-500",
        hoverText: "hover:text-blue-700",

        // Combinaisons courantes
        badge: "bg-blue-100 text-blue-800 border-blue-200",
        badgeDark: "dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
        alert: "bg-blue-50 border-blue-200 border-l-blue-500",
        alertDark: "dark:bg-blue-950 dark:border-blue-800",
        card: "border-l-4 border-l-blue-500",
        button: "bg-blue-600 hover:bg-blue-700",
    },
} as const;

export type SectorTheme = typeof sectorThemes[keyof typeof sectorThemes];

/**
 * Get the theme for a specific sector
 */
export function getSectorTheme(sector: Sector): SectorTheme {
    return sectorThemes[sector];
}

/**
 * Get a specific style class based on sector
 * Useful for inline conditional styling
 */
export function getSectorClass(
    sector: Sector,
    key: keyof SectorTheme
): string {
    return sectorThemes[sector][key];
}

/**
 * Check if current sector is agriculture
 */
export function isAgriculture(sector: Sector): boolean {
    return sector === "agriculture";
}

/**
 * Check if current sector is BTP
 */
export function isBTP(sector: Sector): boolean {
    return sector === "btp";
}
