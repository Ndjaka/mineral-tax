#!/bin/bash
# Script to apply Dashboard BTP modifications to construction-sites.tsx

FILE="/Users/charleskombi/Documents/MineralTax/client/src/pages/construction-sites.tsx"

# 1. Add new icons to lucide-react import
sed -i '' 's/import { Plus, Pencil, Trash2, Building2, MapPin, Calendar, Info, HardHat, Wrench, ArrowLeft } from "lucide-react";/import { Plus, Pencil, Trash2, Building2, MapPin, Calendar, Info, HardHat, Wrench, ArrowLeft, BarChart3, Fuel, AlertCircle } from "lucide-react";/' "$FILE"

echo "Step 1: Icons added"

# 2. Add DashboardData type and query after line that contains "enabled: !!viewingSite" and before "// Filtrer machines BTP"
# Using awk for multi-line insertion
awk '
/\/\/ Filtrer machines BTP uniquement/ {
    print "    // Type pour le dashboard"
    print "    type DashboardData = {"
    print "        site: ConstructionSite;"
    print "        summary: { totalMachines: number; totalFuelEntries: number; totalLiters: number };"
    print "        machineDetails: { machine: Machine; assignmentPeriod: { start: string; end: string | null }; fuelEntriesCount: number; totalLiters: number }[];"
    print "        coherenceMessages: { type: 'info' | 'warning'; message: string }[];"
    print "    };"
    print ""
    print "    // Query dashboard chantier"
    print "    const { data: dashboardData, isLoading: dashboardLoading } = useQuery<DashboardData>({"
    print "        queryKey: [\`/api/construction-sites/$\{viewingSite?.id\}/dashboard\`],"
    print "        enabled: !!viewingSite,"
    print "    });"
    print ""
    print "    // État onglet actif (Dashboard / Affectations)"
    print "    const [activeTab, setActiveTab] = useState<'assignments' | 'dashboard'>('dashboard');"
    print ""
}
{print}
' "$FILE" > "${FILE}.tmp" && mv "${FILE}.tmp" "$FILE"

echo "Step 2: Dashboard type and query added"
echo "Done! Please verify the file manually."
