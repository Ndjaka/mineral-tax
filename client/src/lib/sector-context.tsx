import React, { createContext, useContext, useState, useEffect } from "react";

type Sector = "agriculture" | "btp";

interface SectorContextType {
    sector: Sector;
    setSector: (sector: Sector) => void;
    toggleSector: () => void;
}

const SectorContext = createContext<SectorContextType | undefined>(undefined);

interface SectorProviderProps {
    children: React.ReactNode;
    userSector?: "agriculture" | "btp" | null;
}

export function SectorProvider({ children, userSector }: SectorProviderProps) {
    const [sector, setSectorState] = useState<Sector>(() => {
        console.log('[SectorProvider] Initializing with userSector:', userSector);
        // Priority: 1. User's registered sector, 2. localStorage, 3. Default to BTP
        if (userSector) {
            console.log('[SectorProvider] Using user sector:', userSector);
            return userSector;
        }
        const saved = localStorage.getItem("mineraltax-sector");
        console.log('[SectorProvider] localStorage value:', saved);
        return (saved === "agriculture" || saved === "btp") ? saved : "btp";
    });

    // Sync with user's sector when it changes (e.g., on login)
    useEffect(() => {
        console.log('[SectorProvider] useEffect - userSector:', userSector, 'current sector:', sector);
        if (userSector && userSector !== sector) {
            console.log('[SectorProvider] Updating sector to:', userSector);
            setSectorState(userSector);
            localStorage.setItem("mineraltax-sector", userSector);
        }
    }, [userSector]);

    const setSector = (newSector: Sector) => {
        setSectorState(newSector);
        localStorage.setItem("mineraltax-sector", newSector);
    };

    const toggleSector = () => {
        setSector(sector === "agriculture" ? "btp" : "agriculture");
    };

    return (
        <SectorContext.Provider value={{ sector, setSector, toggleSector }}>
            {children}
        </SectorContext.Provider>
    );
}

export function useSector() {
    const context = useContext(SectorContext);
    if (context === undefined) {
        throw new Error("useSector must be used within a SectorProvider");
    }
    return context;
}
