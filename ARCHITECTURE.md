# Native Blocks Carousel — Notes d’Architecture

Ce document résume le fonctionnement interne du plugin `native-blocks-carousel` afin de faciliter la compréhension et la maintenance future.

## Vue d’ensemble

Le plugin transforme certains blocs Gutenberg (`core/group`, `core/post-template`, `core/gallery`) en carrousels responsives, compatibles Full Site Editing et personnalisations diverses. Il s’appuie sur :

- **PHP** pour l’enregistrement du bloc, l’autoloading et la configuration côté serveur.
- **JavaScript** pour l’intégration Gutenberg (panneau inspector, synchronisation des attributs, mise à jour DOM en temps réel) et pour l’initialisation Frontend (calcul des gaps/paddings, génération dynamique des SVG de flèches, normalisation des classes).
- **CSS** pour les styles du carrousel, les variantes de boutons et les fallbacks `scroll-button`.

## Structure principale

```
wp-content/plugins/native-blocks-carousel/
├── assets/
│   ├── css/
│   │   └── carousel.css          # Styles principaux du carrousel (éditeur + front)
│   └── js/
│       ├── carousel-button.js    # Injection Gutenberg (panneau Inspector, styles inline)
│       └── carousel-frontend.js  # Initialisation et fallbacks côté Front
├── includes/
│   ├── Autoloader.php            # Autoload simple, enregistre les classes du plugin
│   └── ...                       # (autres classes PHP : block registration, helpers, etc.)
├── languages/                    # Fichiers de traduction .po/.mo
├── native-blocks-carousel.php    # Point d’entrée du plugin (hooks et bootstrap)
└── ARCHITECTURE.md               # Ce document
```

### `native-blocks-carousel.php`
- Charge l’autoloader (`Includes\Autoloader`), enregistre les assets et le bloc Gutenberg.
- Déclare le namespace principal `NativeBlocksCarousel`.
- Dispose généralement des hooks `init`, `enqueue_block_editor_assets`, `enqueue_block_assets`, etc.

### `includes/Autoloader.php`
- Enregistre automatiquement les classes situées dans `includes/`.
- Mapping simple : `NativeBlocksCarousel\Foo\Bar` → `includes/Foo/Bar.php`.

## JavaScript : intégration éditeur (`assets/js/carousel-button.js`)

### Responsabilités
- Ajoute l’attribut `carouselEnabled` et `carouselArrowStyle` aux blocs supportés.
- Injecte dans l’inspector :
  - Un toggle pour activer/désactiver le carrousel.
  - Un sélecteur visuel (boutons radio `Chevron` / `Flèche`) qui génère les icônes SVG directement depuis le registre `ARROW_ICONS`.
- Normalise les classes (`nbc-carousel-icon-*`, `nbc-carousel-cols-*`).
- Calcule le `gap` réel via `getComputedStyle` et l’injecte dans les styles inline (`--wp--style--block-gap`).
- Copie padding/gap sur le parent pour les fallbacks.
- Fournit `window.nbcCarousel.applyArrowIconsToCarousels` pour déclencher la régénération manuelle des flèches (debug).

### Points clés
- `DEFAULT_ARROW_STYLE = 'chevron'` (chevron fin). Alias hérités (`classic`, `solid-full`) convertis via `normalizeStyleKey`.
- `applyArrowIconsToCarousels()` génère des data URI pour `--carousel-button-arrow-left/right` en respectant la couleur calculée (`--carousel-button-color`).
- Utilisation extensive de `requestAnimationFrame` et `MutationObserver` pour rester synchronisé avec Gutenberg.

## JavaScript : runtime frontend (`assets/js/carousel-frontend.js`)

### Responsabilités
- Calcule / injecte dynamiquement :
  - `--carousel-min-width` (pour les grilles en mode auto).
  - `--carousel-padding-*` à partir du DOM réel.
  - `--wp--style--block-gap` via `computedStyle.gap` pour garantir les bons calculs responsive.
- Génère les SVG des flèches en tenant compte de la classe (`nbc-carousel-icon-chevron` ou `nbc-carousel-icon-arrow`).
- Définit un fallback root (`:root`) mais laisse `applyArrowIconsToCarousels()` surcharger chaque carrousel avec la bonne icône.
- Met à disposition `window.nbcCarousel.applyArrowIconsToCarousels` pour re-synchroniser, utile si un thème manipule le DOM après coup.

### Mécanique
- `ICON_BASE` partage la même définition que côté éditeur (chevron = 320×512, arrow = 640×640).
- `applyArrowIconsToCarousels()` :
  - collecte les carrousels (DOM principal + iframe éditeur si présent),
  - normalise la clé de style, en lit la couleur via `resolveArrowColor`,
  - injecte les data URI sur le carrousel et son parent.

## CSS (`assets/css/carousel.css`)

### Sections principales
- Définition des variables (`:root`) : dimensions des boutons, offsets, etc.
- Layout flex + scroll-snap pour les carrousels.
- Règles spécifiques :
  - Grilles (`nbc-carousel-cols-*`), mode auto (`nbc-carousel-min-width`).
  - Galeries, groupes, post templates…
- Fallback `:has(> .nbc-carousel)::before/::after` et `::scroll-button` (nouvelles API CSS).
- Responsivité (`@media 600px`, `782px`, etc.) alignée sur les breakpoints WordPress.

### Variables importantes
- `--wp--style--block-gap` : injectée depuis JS pour refléter le gap réel.
- `--carousel-button-arrow-left/right` : data URI des flèches (mise à jour dynamique).
- `--carousel-button-bg` / `--carousel-button-color` : issus des boutons du thème.

## Flux de données

1. **Activation du carrousel** dans l’éditeur :
   - Ajout des classes `nbc-carousel`, `nbc-carousel-icon-{style}`, `nbc-carousel-cols-*`.
   - Injection des styles inline (padding/gap/variables) sur le bloc.

2. **Sauvegarde** : les classes et attributs deviennent du HTML, aucun script n’est requis côté front pour reconstruire.

3. **Front-end** :
   - `carousel-frontend.js` lit le DOM rendu, calcule les variables manquantes, applique les data URI corrects.
   - Les styles CSS prennent la main pour le layout et les flèches.

4. **Interaction** : les flèches utilisent `scroll-button` (si supporté) ou les fallbacks `::before/::after`. Les variables CSS synchronisées garantissent cohérence éditeur/front.

## Points de vigilance

- **Aliases historiques** (`classic`, `solid-full`) : toujours passer par `normalizeStyleKey` avant d’utiliser les icônes.
- **Gap** : ne pas se fier au fallback 1rem ; la valeur calculée dans l’éditeur/front doit être injectée par JS.
- **Exports** : exclure `.git`, `node_modules`, archives existantes lors de la création du zip (commande utilisée : `zip -rq native-blocks-carousel-latest.zip native-blocks-carousel -x ...`).
- **Push Git** : en environnement restreint, `GIT_SSL_NO_VERIFY=1` peut être nécessaire.

## Commandes utiles

```bash
# Créer l’archive plugin
cd wp-content/plugins
zip -rq native-blocks-carousel-latest.zip native-blocks-carousel -x "native-blocks-carousel/.git/*" "native-blocks-carousel/node_modules/*"

# Statut Git
cd native-blocks-carousel
git status -sb

# Commit / push (si certificat SSL absent)
GIT_SSL_NO_VERIFY=1 git push
```

## Extension future

- Ajout d’autres styles d’icônes : étendre `ICON_BASE` + options du sélecteur.
- Gestion fine du gap (ex. row/column différents) : ajuster les calculs ou ajouter un inspector Control.
- Animation / autoplay : ajouter un module JS dédié, s’appuyant sur les classes `nbc-carousel` (sans casser le fallback).

Cette fiche peut servir de point d’entrée rapide pour toute modification future. N’hésite pas à la compléter au fil des évolutions du plugin.
