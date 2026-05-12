# Indeed — Filtre Écoles & Alternances

Extension Firefox pour détecter et signaler les annonces d'alternance postées par des écoles sur Indeed.

## Installation (mode développeur Firefox)

1. Ouvre Firefox et va sur : `about:debugging`
2. Clique sur **"This Firefox"** (ou "Ce Firefox")
3. Clique sur **"Load Temporary Add-on..."**
4. Navigue jusqu'au dossier de l'extension et sélectionne le fichier **`manifest.json`**
5. L'extension est installée ! Rends-toi sur Indeed et les annonces suspectes seront signalées automatiquement.

> ⚠️ En mode temporaire, l'extension disparaît quand tu fermes Firefox. Pour une installation permanente, il faudrait la soumettre à [addons.mozilla.org](https://addons.mozilla.org).

---

## 🎯 Fonctionnalités

- **Détection automatique** des annonces postées par des écoles / CFA
- **Deux niveaux de suspicion** :
  - 🚨 `HIGH` — Annonce très probablement postée par une école
  - ⚠️ `MEDIUM` — Annonce à vérifier
- **Badge informatif** avec les mots-clés détectés
- **Option masquer** les annonces HIGH directement
- **Compatible** avec les résultats chargés dynamiquement (scroll infini)
- **Popup de configuration** pour activer/désactiver le filtre

---

## Comment ça détecte ?

L'extension analyse le texte de chaque annonce et cherche :

- Noms d'écoles connues (Ynov, Epitech, OpenClassrooms, Le Wagon, Simplon, etc.)
- Mots-clés génériques (CFA, formation, académie, campus…)
- Phrases révélatrices ("recrute pour nos partenaires", "gratuit pour l'entreprise", "trouver une entreprise"…)

Plus il y a d'indices, plus le niveau de suspicion est élevé.

---

## Structure des fichiers

```
indeed-filter-extension/
├── manifest.json      ← Configuration de l'extension
├── content.js         ← Script principal (détection + signalement)
├── styles.css         ← Styles des badges
├── popup.html         ← Interface du popup
├── popup.js           ← Logique du popup
├── background.js      ← Script de fond
└── icons/
    ├── icon48.png
    └── icon96.png
```

---

## 🔧 Personnalisation

Pour ajouter tes propres mots-clés suspects, modifie le tableau `SCHOOL_KEYWORDS` dans `content.js`.

---

## 📄 Licence

Usage personnel — libre de redistribuer et modifier.
