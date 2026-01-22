# Plan de finalisation MineralTax - 23 janvier 2026

## 🎯 Objectif
Finaliser la plateforme pour le 23 janvier 2026 avec intégration de la segmentation fiscale Agriculture/BTP selon les directives OFDF 2026.

## 📋 Tasks List

### ✅ 1. Nettoyage de marque (Suppression "Sàrl")
**Priorité: HAUTE | Temps estimé: 30 min**

Supprimer toutes les mentions "Sàrl", "GmbH", "SagL" dans:
- [ ] `/client/src/pages/cgv.tsx` (4 langues)
- [ ] `/client/src/pages/confidentialite.tsx` (4 langues)
- [ ] `/client/src/components/app-footer.tsx` (4 langues)
- [ ] `/client/src/lib/i18n.ts` (4 langues)

**Remplacer par:** "MineralTax.ch" uniquement

---

### ✅ 2. Moteur de calcul bi-secteur (Logique OFDF 2026)
**Priorité: CRITIQUE | Temps estimé: 2h**

#### 2.1 Modification du schéma de données
- [ ] Ajouter constantes de taux dans `/shared/schema.ts`:
  - `RATE_AGRICULTURE_PRE_2026 = 0.3406` (34.06 CHF/100L)
  - `RATE_AGRICULTURE_POST_2026 = 0.6005` (60.05 CHF/100L)
  - `RATE_BTP_STANDARD = 0.3406` (34.06 CHF/100L)

#### 2.2 Fonction de calcul dynamique
- [ ] Créer fonction `calculateReimbursementBySectorAndDate()` dans `/shared/schema.ts`
  - Paramètres: `volumeLiters`, `invoiceDate`, `sector`
  - Logique:
    ```
    SI sector === "agriculture_with_direct":
      SI invoiceDate >= 2026-01-01:
        RETOURNER volumeLiters * RATE_AGRICULTURE_POST_2026
      SINON:
        RETOURNER volumeLiters * RATE_AGRICULTURE_PRE_2026
    SINON:
      RETOURNER volumeLiters * RATE_BTP_STANDARD
    ```

#### 2.3 Mise à jour des routes API
- [ ] Modifier `/server/routes.ts`:
  - `POST /api/fuel-entries`: Ajouter calcul dynamique
  - `GET /api/dashboard/stats`: Utiliser le nouveau calcul
  - `POST /api/reports`: Appliquer les taux selon le secteur

#### 2.4 Mise à jour UI
- [ ] Dashboard: Afficher le taux applicable selon le profil
- [ ] Fuel entries: Montrer le calcul avec le bon taux
- [ ] Machine form: Clarifier que le secteur influence le taux

---

### ✅ 3. Refonte page "Comment ça marche" 
**Priorité: HAUTE | Temps estimé: 1h30**

Mettre à jour `/client/src/pages/how-it-works.tsx` et `/client/src/lib/i18n.ts`:

#### Nouvelles informations à intégrer (4 langues):

**FR:**
- Taux agriculture 2026: 60.05 CHF/100L (hausse de 76%)
- Mention obligation Taxas dès mai 2026
- Utilité MineralTax: génère CSV conforme (Stat. 2710 / CI A1)

**DE:**
- Landwirtschaftstarif 2026: 60.05 CHF/100L (Erhöhung um 76%)
- Taxas-Pflicht ab Mai 2026
- MineralTax-Nutzen: generiert konformes CSV (Stat. 2710 / CI A1)

**IT:**
- Tariffa agricoltura 2026: 60.05 CHF/100L (aumento del 76%)
- Obbligo Taxas da maggio 2026
- Utilità MineralTax: genera CSV conforme (Stat. 2710 / CI A1)

**EN:**
- Agriculture rate 2026: 60.05 CHF/100L (76% increase)
- Taxas mandatory from May 2026
- MineralTax benefit: generates compliant CSV (Stat. 2710 / CI A1)

---

### ✅ 4. Smart Banner 2026 (Notification 7 jours)
**Priorité: MOYENNE | Temps estimé: 1h**

- [ ] Créer composant `/client/src/components/banner-2026.tsx`
  - Affichage: 7 jours après connexion
  - localStorage key: `banner2026_dismissed`
  - Design: Bannière persistante en haut du dashboard

**Messages multilingues:**
- FR: "🚀 Nouveau taux 2026 : Récupérez jusqu'à 60.05 CHF / 100L de diesel agricole. Votre compte est prêt pour Taxas !"
- DE: "🚀 Neuer Tarif 2026: Erhalten Sie bis zu 60.05 CHF / 100L für landwirtschaftlichen Diesel. Ihr Konto ist bereit für Taxas!"
- IT: "🚀 Nuova tariffa 2026: Recupera fino a 60.05 CHF / 100L di diesel agricolo. Il tuo account è pronto per Taxas!"
- EN: "🚀 New 2026 rate: Claim up to 60.05 CHF / 100L for agricultural diesel. Your account is ready for Taxas!"

- [ ] Intégrer dans `/client/src/pages/dashboard.tsx`

---

### ✅ 5. Export CSV avec footer de certification
**Priorité: HAUTE | Temps estimé: 45 min**

- [ ] Modifier la fonction d'export CSV dans `/server/routes.ts`
  - Ajouter en fin de fichier:
    ```
    # Calculé selon les directives officielles OFDF 2026 via MineralTax.ch
    # Généré le: [DATE_GENERATION]
    # Taux appliqué: [TAUX_UTILISE] CHF/L
    ```

- [ ] S'assurer que les colonnes obligatoires sont présentes:
  - N° matricule
  - N° châssis
  - Code Stat. 2710
  - CI A1

---

### ✅ 6. Vérification linguistique complète
**Priorité: MOYENNE | Temps estimé: 1h**

Audit complet des 4 langues (FR, DE, IT, EN):
- [ ] Vérifier tous les labels UI dans `/client/src/lib/i18n.ts`
- [ ] S'assurer qu'aucune chaîne n'est en anglais par défaut
- [ ] Tester le changement de langue dans l'interface

---

## 📊 Estimation totale
- **Temps total:** ~7h
- **Deadline:** 23 janvier 2026 23:59
- **Temps disponible:** ~26h

## 🚀 Ordre d'exécution recommandé
1. Nettoyage de marque (urgent, visible)
2. Moteur de calcul bi-secteur (critique pour exactitude)
3. Export CSV certification (conformité légale)
4. Page "Comment ça marche" (communication)
5. Smart Banner (UX)
6. Vérification linguistique (finitions)

## ⚠️ Points d'attention
- **Testing:** Tester avec dates avant/après 01.01.2026
- **Migration:** Vérifier que les anciennes entrées utilisent le bon taux
- **Documentation:** Mettre à jour les guides utilisateur si nécessaire
- **Backup:** Faire un backup de la DB avant déploiement

## 📝 Notes techniques
- Préserver l'intégrité de la structure actuelle (pas de migration de schéma de BD)
- Travail par extension (pas de suppression de colonnes)
- Compatible avec les données existantes
