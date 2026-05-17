# IMPORT-002 — Vendorisation SheetJS : CDN → local

## Statut
Résolu — appliqué en production

## Contexte

SheetJS est la bibliothèque utilisée pour parser les fichiers `.xlsx` / `.xls` importés
dans le module comportemental (onglet Comportement → import CSV/Excel).

## Ancienne architecture (CDN)

**Fichier :** `src/js/behavior/import/uploader.js`

```javascript
script.src = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
```

- Chargement dynamique (lazy) au premier import XLSX
- Dépendance réseau externe à chaque usage
- Pas de contrôle d'intégrité (aucun attribut SRI)
- Risque supply chain : si `cdn.sheetjs.com` est compromis, le script malveillant
  s'exécute avec accès complet au DOM et au localStorage

## Nouvelle architecture (vendor local)

**Fichier :** `src/js/vendor/xlsx.full.min.js`  
**Version :** 0.20.3 (identique à l'ancienne référence CDN)  
**Taille :** 930 Ko

```javascript
script.src = new URL('../../vendor/xlsx.full.min.js', import.meta.url).href;
```

- Chargement depuis le système de fichiers local (chemin relatif ES module)
- Zéro appel réseau externe
- Fonctionne hors-ligne
- Version figée et contrôlée dans le repo
- Le lazy loading est conservé : chargé uniquement au premier import XLSX

## Raison du changement

Audit sécurité local-first (SECURITY_AUDIT_001) — risque identifié :
dépendance CDN sans SRI dans un contexte d'application local-first.
La vendorisation élimine complètement la surface d'attaque réseau.

## Chemin relatif

```
src/js/behavior/import/uploader.js  →  ../../vendor/xlsx.full.min.js
                                     =  src/js/vendor/xlsx.full.min.js
```

## Commit
chore(security): vendorize SheetJS locally for offline local-first imports

## Date
2026-05-17
