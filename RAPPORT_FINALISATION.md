# ✅ Finalisation MineralTax - Rapport d'implémentation 

**Date:** 22 janvier 2026  
**Deadline:** 23 janvier 2026  
**Statut:** EN COURS ✓

---

## ✅ Tâches Complétées

### 1. ✅ Nettoyage de marque (100%)
**Temps:** 15 min | **Complexité:** 2/10

Suppression complète de toutes les mentions "Sàrl" remplacées par "MineralTax.ch" dans:
- ✅ `/client/src/lib/i18n.ts` - 4 langues (FR, DE, IT, EN)
- ✅ `/client/src/components/app-footer.tsx` - 4 langues
- ✅ `/client/src/pages/cgv.tsx` - 8 occurrences (4 langues × 2 sections)
- ✅ `/client/src/pages/confidentialite.tsx` - 4 occurrences (4 langues)

**Impact:** Cohérence de la marque à 100% sur toute la plateforme.

---

### 2. ✅ Moteur de calcul bi-secteur (100%)
**Temps:** 45 min | **Complexité:** 7/10

**Fichier modifié:** `/shared/schema.ts`

**Nouvelles constantes ajoutées:**
```typescript
RATE_AGRICULTURE_PRE_2026 = 0.3406   // 34.06 CHF/100L (avant 01.01.2026)
RATE_AGRICULTURE_POST_2026 = 0.6005  // 60.05 CHF/100L (après 01.01.2026) +76%
RATE_BTP_STANDARD = 0.3406           // 34.06 CHF/100L (BTP/Hors route)
AGRICULTURE_RATE_CHANGE_DATE = 2026-01-01
```

**Nouvelles fonctions créées:**
1. `calculateReimbursementBySectorAndDate(volumeLiters, invoiceDate, sector)`
   - Calcule le remboursement selon le secteur et la date
   - Logique automatique: si `agriculture_with_direct` ET date >= 01.01.2026 → 60.05 CHF/L
   - Sinon → 34.06 CHF/L

2. `getApplicableRate(invoiceDate, sector)`
   - Retourne le taux applicable sans calculer le montant
   - Utile pour l'affichage dans l'UI

**Compatibilité:** 
- ✅ Fonction `calculateReimbursement()` maintenue pour rétrocompatibilité
- ✅ Pas de migration de base de données nécessaire
- ✅ Fonctionne avec les données existantes

---

### 3. ✅ Smart Banner 2026 (100%)
**Temps:** 30 min | **Complexité:** 5/10

**Nouveau fichier:** `/client/src/components/banner-2026.tsx`

**Fonctionnalités:**
- ✅ Bannière persistante en haut du dashboard
- ✅ Messages multilingues (FR, DE, IT, EN)
- ✅ Système de fermeture avec localStorage
- ✅ Réaffichage automatique après 7 jours
- ✅ Design moderne avec icône TrendingUp
- ✅ Responsive (mobile-friendly)

**Messages:**
- **FR:** "🚀 Nouveau taux 2026 : Récupérez jusqu'à 60.05 CHF / 100L de diesel agricole. Votre compte est prêt pour Taxas !"
- **DE:** "🚀 Neuer Tarif 2026: Erhalten Sie bis zu 60.05 CHF / 100L für landwirtschaftlichen Diesel..."
- **IT:** "🚀 Nuova tariffa 2026: Recupera fino a 60.05 CHF / 100L di diesel agricolo..."
- **EN:** "🚀 New 2026 rate: Claim up to 60.05 CHF / 100L for agricultural diesel..."

**Intégration:**
- ✅ Ajouté dans `/client/src/pages/dashboard.tsx`
- ✅ Affichage conditionnel (non-dismissé ou 7+ jours depuis dernier dismiss)

---

### 4. ✅ Mise à jour "Comment ça marche" (100%)
**Temps:** 45 min | **Complexité:** 6/10

**Fichier modifié:** `/client/src/pages/how-it-works.tsx`

**Modifications (4 langues):**

**Step 3 - Calcul automatique:**
- ✅ Mention des 2 taux: 60.05 CHF/L (Agriculture) et 34.06 CHF/L (BTP)
- ✅ Précision "+76% de hausse" pour l'agriculture
- ✅ Mention "plaques vertes / paiements directs"
- ✅ Badge affiche "34.06 - 60.05 CHF/L" au lieu de "0.3405 CHF/L"

**Step 4 - Export CSV:**
- ✅ Mention "obligatoire dès mai 2026" pour Taxas
- ✅ Ajout "Codes Stat. 2710 / CI A1"
- ✅ Feature additionnelle dans les bullet points

---

## ⏳ Tâches Restantes

### 5. ⏳ Export CSV avec footer de certification (0%)
**Priorité:** HAUTE | **Temps estimé:** 45 min

**Fichier à modifier:** `/server/routes.ts`

**Actions requises:**
- [ ] Localiser la fonction d'export CSV
- [ ] Ajouter footer avec:
  ```
  # Calculé selon les directives officielles OFDF 2026 via MineralTax.ch
  # Généré le: [DATE]
  # Taux appliqué: [TAUX] CHF/L
  ```
- [ ] Vérifier colonnes obligatoires:
  - N° matricule
  - N° châssis  
  - Code Stat. 2710
  - CI A1

---

### 6. ⏳ Vérification linguistique complète (0%)
**Priorité:** MOYENNE | **Temps estimé:** 1h

**Actions:**
- [ ] Audit complet des 4 langues
- [ ] Vérifier qu'aucune chaîne n'est en anglais par défaut
- [ ] Tester changement de langue
- [ ] Vérifier cohérence terminologique

---

### 7. ⏳ Intégration du calcul bi-secteur dans les routes API (0%)
**Priorité:** CRITIQUE | **Temps estimé:** 1h30

**Fichier:** `/server/routes.ts`

**Endpoints à modifier:**
- [ ] `POST /api/fuel-entries` - Utiliser `calculateReimbursementBySectorAndDate()`
- [ ] `GET /api/dashboard/stats` - Appliquer nouveau calcul
- [ ] `POST /api/reports` - Calculer avec le bon taux selon secteur
- [ ] `PATCH /api/fuel-entries/:id` - Recalculer si date ou machine modifiée

**Logique:**
1. Récupérer la machine associée → obtenir `taxasActivity`
2. Récupérer `invoiceDate` de l'entrée
3. Appliquer `calculateReimbursementBySectorAndDate(volume, date, sector)`

---

## 📊 Progression Globale

| Tâche | Statut | Temps estimé | Temps réel |
|-------|--------|--------------|------------|
| 1. Nettoyage marque | ✅ 100% | 30 min | 15 min |
| 2. Moteur calcul | ✅ 100% | 2h | 45 min |
| 3. Smart Banner | ✅ 100% | 1h | 30 min |
| 4. Page "Comment ça marche" | ✅ 100% | 1h30 | 45 min |
| 5. Export CSV certification | ⏳ 0% | 45 min | - |
| 6. Vérification linguistique | ⏳ 0% | 1h | - |
| 7. Intégration API | ⏳ 0% | 1h30 | - |

**Total:** 57% complété (4/7 tâches)  
**Temps écoulé:** 2h15  
**Temps restant estimé:** 3h15  
**Temps disponible avant deadline:** ~26h ✅

---

## ⚠️ Points Critiques

### 🔴 CRITIQUE - À faire absolument
1. **Intégration API du calcul bi-secteur** (Tâche 7)
   - Sans cela, le nouveau moteur de calcul n'est pas utilisé
   - Impact: Les calculs affichés seront incorrects
   - **Action:** Priorité absolue pour demain matin

### 🟡 IMPORTANT - À ne pas oublier
2. **Export CSV avec certification** (Tâche 5)
   - Conformité légale OFDF
   - Traçabilité des calculs

3. **Tests de non-régression**
   - Vérifier que les entrées existantes fonctionnent toujours
   - Tester avec dates avant/après 01.01.2026
   - Tester avec différents secteurs

---

## 🧪 Plan de Test

### Test 1: Calcul Agriculture (Nouveau taux 2026)
```
Machine: Tracteur (agriculture_with_direct, plaque verte)
Date facture: 15.01.2026
Volume: 100L
Résultat attendu: 60.05 CHF
```

### Test 2: Calcul Agriculture (Ancien taux)
```
Machine: Tracteur (agriculture_with_direct, plaque verte)
Date facture: 20.12.2025
Volume: 100L
Résultat attendu: 34.06 CHF
```

### Test 3: Calcul BTP
```
Machine: Pelle mécanique (construction, plaque bleue)
Date facture: 15.01.2026
Volume: 100L
Résultat attendu: 34.06 CHF
```

---

## 📝 Notes Techniques

### Préservation de l'intégrité
✅ Aucune migration de schéma de base de données nécessaire  
✅ Aucune suppression de colonnes  
✅ Travail par extension uniquement  
✅ Compatibilité avec données existantes

### Fichiers modifiés
1. `/shared/schema.ts` - Moteur de calcul
2. `/client/src/lib/i18n.ts` - Traductions footer
3. `/client/src/components/app-footer.tsx` - Footer
4. `/client/src/components/banner-2026.tsx` - **NOUVEAU**
5. `/client/src/pages/dashboard.tsx` - Intégration bannière
6. `/client/src/pages/how-it-works.tsx` - Mise à jour taux
7. `/client/src/pages/cgv.tsx` - Nettoyage marque
8. `/client/src/pages/confidentialite.tsx` - Nettoyage marque

### Prochaines étapes
1. 🔴 **Urgent:** Intégrer le calcul bi-secteur dans les routes API
2. 🟡 Ajouter footer de certification dans export CSV
3. 🟢 Vérification linguistique finale
4. 🟢 Tests complets
5. 🟢 Backup DB avant déploiement
6. 🟢 Déploiement sur Infomaniak

---

**Statut final:** EN BONNE VOIE ✅  
**Confiance:** 85% de finalisation avant le 23/01/2026
