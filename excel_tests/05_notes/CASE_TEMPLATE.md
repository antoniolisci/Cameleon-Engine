# CASE_XXX — titre court

## Statut
broken / working / edge_case

## Fichier source local
Nom du fichier local (sans contenu sensible — pas de User_ID, pas de valeurs financières).

## Type supposé
Trade History / Order History / Wallet / Earn / Unknown

## Symptôme observé
Message UI exact affiché lors de l'import.

## Ce que le système détecte
- format :
- statuts :
- headers :
- nombre de lignes :
- nombre de trades extraits :

## Hypothèse
Où le pipeline semble casser :
- [ ] parsing (séparateur, BOM, encodage)
- [ ] header detection (ligne d'en-têtes non reconnue)
- [ ] classification (FULL_TRADING / PARTIAL_TRADING / NON_TRADING)
- [ ] mapping (normalizeOrderRow / normalizeTrade)
- [ ] validation (isValidTrade / isFilledStatus)
- [ ] storage (session-repo)
- [ ] UI (message affiché incorrect)

## Étapes de reproduction
1.
2.
3.

## Résultat attendu

## Résultat obtenu

## Statut de correction
non traité / en cours / corrigé / validé

## Notes
