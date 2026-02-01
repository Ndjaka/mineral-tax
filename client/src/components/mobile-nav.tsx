import { useLocation } from "wouter";
import { Home, Truck, Fuel, FileText, Settings, TreePine } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSector } from "@/lib/sector-context";

interface NavItem {
    icon: React.ElementType;
    label: string;
    href: string;
}

export function MobileNav() {
    const [location, setLocation] = useLocation();
    const { sector } = useSector();
    const isAgri = sector === "agriculture";

    // Items de navigation conditionnels selon le secteur
    const navItems: NavItem[] = isAgri
        ? [
            { icon: Home, label: "Accueil", href: "/dashboard" },
            { icon: Truck, label: "Flotte", href: "/fleet" },
            { icon: TreePine, label: "Surfaces", href: "/agricultural-surfaces" },
            { icon: Settings, label: "Plus", href: "/settings" },
        ]
        : [
            { icon: Home, label: "Accueil", href: "/dashboard" },
            { icon: Truck, label: "Flotte", href: "/fleet" },
            { icon: Fuel, label: "Carburant", href: "/fuel" },
            { icon: FileText, label: "Rapports", href: "/reports" },
            { icon: Settings, label: "Plus", href: "/settings" },
        ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50 safe-area-bottom">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href || location.startsWith(item.href + "/");

                    return (
                        <button
                            key={item.href}
                            onClick={() => setLocation(item.href)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
                                "active:bg-accent", // Touch feedback
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", isActive && "fill-current")} />
                            <span className="text-xs font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
