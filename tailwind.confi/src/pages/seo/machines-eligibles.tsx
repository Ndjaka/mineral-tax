import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, CheckCircle, XCircle, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react";

export default function MachinesEligiblesPage() {
  const { language } = useI18n();

  const content = {
    fr: {
      title: "Machines et véhicules éligibles au remboursement de la taxe minérale",
      subtitle: "Catégories officielles Taxas, plaques d'immatriculation suisses et cas particuliers",
      intro: "Seules les machines utilisées hors de la voie publique peuvent prétendre au remboursement de la taxe sur les huiles minérales. Voici le guide complet des catégories éligibles selon l'OFDF.",
      plateTitle: "Plaques d'immatriculation suisses",
      plates: [
        { color: "bg-green-600", text: "Plaque verte", status: "eligible", desc: "Véhicules agricoles et forestiers - Éligible par défaut" },
        { color: "bg-yellow-500", text: "Plaque jaune", status: "eligible", desc: "Machines industrielles hors route - Éligible par défaut" },
        { color: "bg-white border", text: "Plaque blanche", status: "not-eligible", desc: "Véhicules routiers standards - Non éligible (sauf exceptions)" },
        { color: "bg-blue-600", text: "Plaque bleue", status: "not-eligible", desc: "Véhicules de location - Non éligible (sauf exceptions)" },
      ],
      categoriesTitle: "Catégories officielles Taxas",
      categories: [
        { name: "Agriculture avec paiements directs", code: "AGRI_DIRECT", examples: "Tracteurs, moissonneuses, remorques agricoles" },
        { name: "Agriculture sans paiements directs", code: "AGRI_NO_DIRECT", examples: "Exploitations non subventionnées" },
        { name: "Sylviculture", code: "SYLV", examples: "Abatteuses, débusqueuses, broyeurs forestiers" },
        { name: "Construction / Chantier", code: "CONSTRUCT", examples: "Pelles, bulldozers, chargeuses, grues" },
        { name: "Extraction pierres naturelles", code: "STONE", examples: "Équipements de carrière et d'extraction" },
        { name: "Transport concessionnaire", code: "CONC_TRANS", examples: "Transport public non routier" },
        { name: "Dameuses", code: "SNOW", examples: "Dameuses de pistes de ski" },
        { name: "Pêche professionnelle", code: "FISH", examples: "Bateaux de pêche professionnelle" },
        { name: "Générateurs stationnaires", code: "STAT_GEN", examples: "Groupes électrogènes fixes" },
      ],
      exceptionsTitle: "Cas particuliers et exceptions",
      exceptions: [
        { title: "Déneigement avec plaque blanche", desc: "Les véhicules utilisés exclusivement pour le déneigement peuvent être éligibles sur justification." },
        { title: "Usage mixte", desc: "Les machines utilisées partiellement sur route et partiellement hors route ne sont éligibles que pour la part hors route." },
        { title: "Véhicules de chantier temporaires", desc: "Les véhicules avec immatriculation temporaire pour chantier peuvent être éligibles." },
      ],
      cta: "Gérer ma flotte",
      back: "Retour aux ressources",
    },
    de: {
      title: "Maschinen und Fahrzeuge mit Anspruch auf Mineralölsteuer-Rückerstattung",
      subtitle: "Offizielle Taxas-Kategorien, Schweizer Nummernschilder und Sonderfälle",
      intro: "Nur Maschinen, die ausserhalb öffentlicher Strassen eingesetzt werden, haben Anspruch auf Rückerstattung der Mineralölsteuer. Hier ist der vollständige Leitfaden zu den berechtigten Kategorien gemäss BAZG.",
      plateTitle: "Schweizer Nummernschilder",
      plates: [
        { color: "bg-green-600", text: "Grünes Schild", status: "eligible", desc: "Land- und Forstwirtschaftsfahrzeuge - Standardmässig berechtigt" },
        { color: "bg-yellow-500", text: "Gelbes Schild", status: "eligible", desc: "Industrielle Offroad-Maschinen - Standardmässig berechtigt" },
        { color: "bg-white border", text: "Weisses Schild", status: "not-eligible", desc: "Standard-Strassenfahrzeuge - Nicht berechtigt (ausser Ausnahmen)" },
        { color: "bg-blue-600", text: "Blaues Schild", status: "not-eligible", desc: "Mietfahrzeuge - Nicht berechtigt (ausser Ausnahmen)" },
      ],
      categoriesTitle: "Offizielle Taxas-Kategorien",
      categories: [
        { name: "Landwirtschaft mit Direktzahlungen", code: "AGRI_DIRECT", examples: "Traktoren, Mähdrescher, landwirtschaftliche Anhänger" },
        { name: "Landwirtschaft ohne Direktzahlungen", code: "AGRI_NO_DIRECT", examples: "Nicht subventionierte Betriebe" },
        { name: "Forstwirtschaft", code: "SYLV", examples: "Harvester, Forwarder, Holzhacker" },
        { name: "Bau / Baustelle", code: "CONSTRUCT", examples: "Bagger, Bulldozer, Radlader, Kräne" },
        { name: "Natursteingewinnung", code: "STONE", examples: "Steinbruch- und Abbaugeräte" },
        { name: "Konzessionsverkehr", code: "CONC_TRANS", examples: "Öffentlicher Nicht-Strassenverkehr" },
        { name: "Pistenfahrzeuge", code: "SNOW", examples: "Pistenpräparierungsfahrzeuge" },
        { name: "Berufsfischerei", code: "FISH", examples: "Professionelle Fischerboote" },
        { name: "Stationäre Generatoren", code: "STAT_GEN", examples: "Feste Stromerzeuger" },
      ],
      exceptionsTitle: "Sonderfälle und Ausnahmen",
      exceptions: [
        { title: "Schneeräumung mit weissem Schild", desc: "Fahrzeuge, die ausschliesslich für die Schneeräumung eingesetzt werden, können auf Nachweis berechtigt sein." },
        { title: "Gemischte Nutzung", desc: "Maschinen, die teilweise auf der Strasse und teilweise abseits der Strasse eingesetzt werden, sind nur für den Offroad-Anteil berechtigt." },
        { title: "Temporäre Baustellenfahrzeuge", desc: "Fahrzeuge mit temporärer Baustellenzulassung können berechtigt sein." },
      ],
      cta: "Meine Flotte verwalten",
      back: "Zurück zu den Ressourcen",
    },
    it: {
      title: "Macchine e veicoli ammissibili al rimborso dell'imposta minerale",
      subtitle: "Categorie ufficiali Taxas, targhe svizzere e casi particolari",
      intro: "Solo le macchine utilizzate fuori dalla strada pubblica possono richiedere il rimborso dell'imposta sugli oli minerali. Ecco la guida completa alle categorie ammissibili secondo l'AFD.",
      plateTitle: "Targhe svizzere",
      plates: [
        { color: "bg-green-600", text: "Targa verde", status: "eligible", desc: "Veicoli agricoli e forestali - Ammissibile di default" },
        { color: "bg-yellow-500", text: "Targa gialla", status: "eligible", desc: "Macchine industriali fuori strada - Ammissibile di default" },
        { color: "bg-white border", text: "Targa bianca", status: "not-eligible", desc: "Veicoli stradali standard - Non ammissibile (salvo eccezioni)" },
        { color: "bg-blue-600", text: "Targa blu", status: "not-eligible", desc: "Veicoli a noleggio - Non ammissibile (salvo eccezioni)" },
      ],
      categoriesTitle: "Categorie ufficiali Taxas",
      categories: [
        { name: "Agricoltura con pagamenti diretti", code: "AGRI_DIRECT", examples: "Trattori, mietitrebbie, rimorchi agricoli" },
        { name: "Agricoltura senza pagamenti diretti", code: "AGRI_NO_DIRECT", examples: "Aziende non sovvenzionate" },
        { name: "Silvicoltura", code: "SYLV", examples: "Abbattitrici, trattori forestali, cippatori" },
        { name: "Costruzione / Cantiere", code: "CONSTRUCT", examples: "Escavatori, bulldozer, pale, gru" },
        { name: "Estrazione pietre naturali", code: "STONE", examples: "Attrezzature per cave e estrazione" },
        { name: "Trasporto in concessione", code: "CONC_TRANS", examples: "Trasporto pubblico non stradale" },
        { name: "Battipista", code: "SNOW", examples: "Veicoli per preparazione piste da sci" },
        { name: "Pesca professionale", code: "FISH", examples: "Barche da pesca professionale" },
        { name: "Generatori stazionari", code: "STAT_GEN", examples: "Gruppi elettrogeni fissi" },
      ],
      exceptionsTitle: "Casi particolari ed eccezioni",
      exceptions: [
        { title: "Sgombero neve con targa bianca", desc: "I veicoli utilizzati esclusivamente per lo sgombero neve possono essere ammissibili su giustificazione." },
        { title: "Uso misto", desc: "Le macchine utilizzate parzialmente su strada e parzialmente fuori strada sono ammissibili solo per la quota fuori strada." },
        { title: "Veicoli di cantiere temporanei", desc: "I veicoli con immatricolazione temporanea per cantiere possono essere ammissibili." },
      ],
      cta: "Gestisci la mia flotta",
      back: "Torna alle risorse",
    },
    en: {
      title: "Machines and Vehicles Eligible for Mineral Tax Reimbursement",
      subtitle: "Official Taxas categories, Swiss license plates and special cases",
      intro: "Only machines used off public roads can claim mineral oil tax reimbursement. Here is the complete guide to eligible categories according to FOCBS.",
      plateTitle: "Swiss License Plates",
      plates: [
        { color: "bg-green-600", text: "Green plate", status: "eligible", desc: "Agricultural and forestry vehicles - Eligible by default" },
        { color: "bg-yellow-500", text: "Yellow plate", status: "eligible", desc: "Industrial off-road machines - Eligible by default" },
        { color: "bg-white border", text: "White plate", status: "not-eligible", desc: "Standard road vehicles - Not eligible (except exceptions)" },
        { color: "bg-blue-600", text: "Blue plate", status: "not-eligible", desc: "Rental vehicles - Not eligible (except exceptions)" },
      ],
      categoriesTitle: "Official Taxas Categories",
      categories: [
        { name: "Agriculture with direct payments", code: "AGRI_DIRECT", examples: "Tractors, harvesters, agricultural trailers" },
        { name: "Agriculture without direct payments", code: "AGRI_NO_DIRECT", examples: "Non-subsidized farms" },
        { name: "Forestry", code: "SYLV", examples: "Harvesters, forwarders, wood chippers" },
        { name: "Construction / Site", code: "CONSTRUCT", examples: "Excavators, bulldozers, loaders, cranes" },
        { name: "Natural stone extraction", code: "STONE", examples: "Quarry and extraction equipment" },
        { name: "Concession transport", code: "CONC_TRANS", examples: "Public non-road transport" },
        { name: "Snow groomers", code: "SNOW", examples: "Ski slope preparation vehicles" },
        { name: "Professional fishing", code: "FISH", examples: "Professional fishing boats" },
        { name: "Stationary generators", code: "STAT_GEN", examples: "Fixed power generators" },
      ],
      exceptionsTitle: "Special Cases and Exceptions",
      exceptions: [
        { title: "Snow removal with white plate", desc: "Vehicles used exclusively for snow removal may be eligible with justification." },
        { title: "Mixed use", desc: "Machines used partially on-road and partially off-road are only eligible for the off-road portion." },
        { title: "Temporary construction vehicles", desc: "Vehicles with temporary construction registration may be eligible." },
      ],
      cta: "Manage my fleet",
      back: "Back to resources",
    },
  };

  const t = content[language] || content.fr;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <Link href="/ressources">
          <span className="text-sm text-muted-foreground hover:text-primary inline-flex items-center mb-6 cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t.back}
          </span>
        </Link>

        <div className="mb-8">
          <Badge variant="outline" className="mb-4">
            <Truck className="h-3 w-3 mr-1" />
            {language === "fr" ? "Éligibilité" : language === "de" ? "Berechtigung" : language === "it" ? "Ammissibilità" : "Eligibility"}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t.title}</h1>
          <p className="text-lg text-muted-foreground">{t.subtitle}</p>
        </div>

        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <p className="text-lg">{t.intro}</p>
          </CardContent>
        </Card>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">{t.plateTitle}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {t.plates.map((plate, idx) => (
              <Card key={idx} className={plate.status === "eligible" ? "border-green-500/30" : "border-destructive/30"}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`w-12 h-8 rounded ${plate.color} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{plate.text}</span>
                      {plate.status === "eligible" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{plate.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">{t.categoriesTitle}</h2>
          <div className="space-y-3">
            {t.categories.map((cat, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                      <span className="font-medium">{cat.name}</span>
                      <Badge variant="outline" className="font-mono text-xs">{cat.code}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground sm:ml-auto">{cat.examples}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            {t.exceptionsTitle}
          </h2>
          <div className="space-y-4">
            {t.exceptions.map((exc, idx) => (
              <Card key={idx} className="border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-950/20">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{exc.title}</h3>
                  <p className="text-sm text-muted-foreground">{exc.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 sm:p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">
              {language === "fr" ? "Gérez votre flotte avec MineralTax" : language === "de" ? "Verwalten Sie Ihre Flotte mit MineralTax" : language === "it" ? "Gestisci la tua flotta con MineralTax" : "Manage your fleet with MineralTax"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === "fr" ? "Catégories Taxas automatiques, vérification d'éligibilité et export CSV." : language === "de" ? "Automatische Taxas-Kategorien, Berechtigungsprüfung und CSV-Export." : language === "it" ? "Categorie Taxas automatiche, verifica ammissibilità ed export CSV." : "Automatic Taxas categories, eligibility check and CSV export."}
            </p>
            <Button size="lg" asChild>
              <a href="/" data-testid="link-cta-fleet">
                {t.cta}
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
