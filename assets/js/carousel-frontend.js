/**
 * Script frontend pour Native Blocks Carousel
 * Injecte les variables CSS manquantes pour le mode minimumColumnWidth
 *
 * @package NativeBlocksCarousel
 * @version 1.0.1
 * @author weblazer35
 */

(function () {
	'use strict';

	const DEFAULT_ARROW_STYLE = 'chevron';

	const ICON_BASE = {
		chevron: {
			viewBox: '0 0 320 512',
			paths: {
				left: {
					d: 'M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z'
				},
				right: {
					d: 'M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z'
				}
			}
		},
		arrow: {
			viewBox: '0 0 640 640',
			paths: {
				right: {
					d: 'M566.6 342.6C579.1 330.1 579.1 309.8 566.6 297.3L406.6 137.3C394.1 124.8 373.8 124.8 361.3 137.3C348.8 149.8 348.8 170.1 361.3 182.6L466.7 288L96 288C78.3 288 64 302.3 64 320C64 337.7 78.3 352 96 352L466.7 352L361.3 457.4C348.8 469.9 348.8 490.2 361.3 502.7C373.8 515.2 394.1 515.2 406.6 502.7L566.6 342.7z'
				},
				left: {
					d: 'M566.6 342.6C579.1 330.1 579.1 309.8 566.6 297.3L406.6 137.3C394.1 124.8 373.8 124.8 361.3 137.3C348.8 149.8 348.8 170.1 361.3 182.6L466.7 288L96 288C78.3 288 64 302.3 64 320C64 337.7 78.3 352 96 352L466.7 352L361.3 457.4C348.8 469.9 348.8 490.2 361.3 502.7C373.8 515.2 394.1 515.2 406.6 502.7L566.6 342.7z',
					transform: 'scale(-1 1) translate(-640 0)'
				}
			}
		}
	};

	const ICON_ALIASES = {
		classic: 'chevron',
		'solid-full': 'arrow',
		arrowfull: 'arrow'
	};

	const ARROW_ICONS = {
		...ICON_BASE,
		classic: ICON_BASE.chevron,
		'solid-full': ICON_BASE.arrow,
	};

	const normalizeStyleKey = (styleKey) => {
		if (!styleKey) {
			return DEFAULT_ARROW_STYLE;
		}
		if (ICON_BASE[styleKey]) {
			return styleKey;
		}
		if (ICON_ALIASES[styleKey]) {
			return ICON_ALIASES[styleKey];
		}
		return DEFAULT_ARROW_STYLE;
	};

	/**
	 * Extrait la valeur minimumColumnWidth depuis grid-template-columns
	 * WordPress génère : grid-template-columns: repeat(auto-fill, minmax(min(38rem, 100%), 1fr))
	 */
	function extractMinWidthFromGridTemplateColumns(gridTemplateColumns) {
		if (!gridTemplateColumns || gridTemplateColumns === 'none') {
			return null;
		}

		// Chercher minmax(min(XXX, 100%), 1fr)
		const match = gridTemplateColumns.match(/minmax\(min\(([^,]+),\s*100%\)/);
		if (match && match[1]) {
			return match[1].trim();
		}

		return null;
	}

	/**
	 * Trouve la règle CSS grid-template-columns pour un carousel depuis les stylesheets
	 */
	function findGridTemplateColumnsRule(carousel) {
		// Chercher une classe wp-container unique sur le carousel
		const containerClass = Array.from(carousel.classList).find(function (cls) {
			return cls.startsWith('wp-container-');
		});

		if (!containerClass) {
			return null;
		}

		// Parcourir toutes les feuilles de style
		const styleSheets = Array.from(document.styleSheets);

		for (var i = 0; i < styleSheets.length; i++) {
			try {
				const rules = styleSheets[i].cssRules || styleSheets[i].rules;
				if (!rules) continue;

				for (var j = 0; j < rules.length; j++) {
					const rule = rules[j];
					if (rule.selectorText && rule.selectorText.includes(containerClass)) {
						const gridTemplateColumns = rule.style.gridTemplateColumns;
						if (gridTemplateColumns && gridTemplateColumns !== 'none') {
							return gridTemplateColumns;
						}
					}
				}
			} catch (e) {
				// Ignorer les erreurs CORS pour les stylesheets externes
				continue;
			}
		}

		return null;
	}

	/**
	 * Injecte --carousel-min-width pour les carousels en mode minimumColumnWidth
	 */
	function injectMinWidthVariables() {
		// Trouver tous les carousels avec la classe nbc-carousel-min-width
		const carousels = document.querySelectorAll('.nbc-carousel.nbc-carousel-min-width');

		carousels.forEach(function (carousel) {
			// Vérifier si la variable est déjà définie
			const computedStyle = window.getComputedStyle(carousel);
			const currentMinWidth = computedStyle.getPropertyValue('--carousel-min-width');

			// Si déjà définie (par PHP), ne rien faire
			if (currentMinWidth && currentMinWidth.trim() !== '') {
				return;
			}

			// Trouver la règle CSS grid-template-columns dans les stylesheets
			const gridTemplateColumns = findGridTemplateColumnsRule(carousel);

			if (!gridTemplateColumns) {
				// Silencieux en production - la variable sera peut-être définie par PHP
				return;
			}

			// Extraire la valeur minimumColumnWidth
			const minWidth = extractMinWidthFromGridTemplateColumns(gridTemplateColumns);

			if (minWidth) {
				// Injecter la variable CSS
				carousel.style.setProperty('--carousel-min-width', minWidth);
			}
		});
	}

	/**
	 * Injecte les variables de padding en lisant directement le padding calculé
	 * Solution optimale : lire le padding calculé par le navigateur (qui inclut tous les styles)
	 * et l'injecter comme variable CSS. Cela fonctionne même si PHP n'a pas réussi à extraire le padding.
	 */
	function injectPaddingVariables() {
		const carousels = document.querySelectorAll('.nbc-carousel');

		carousels.forEach(function (carousel) {
			const computedStyle = window.getComputedStyle(carousel);

			// Lire le gap calculé pour corriger les largeurs
			const computedGap = computedStyle.gap || computedStyle.columnGap || computedStyle.rowGap;
			if (computedGap && computedGap !== 'normal' && computedGap.trim() !== '') {
				carousel.style.setProperty('--wp--style--block-gap', computedGap);
			}

			// Lire le padding calculé directement (fonctionne même si défini via style inline)
			const paddingLeft = computedStyle.paddingLeft;
			const paddingRight = computedStyle.paddingRight;
			const paddingTop = computedStyle.paddingTop;
			const paddingBottom = computedStyle.paddingBottom;

			// Toujours définir les variables, même si le padding est 0
			// Utiliser '0px' au lieu de '0' pour éviter les problèmes avec calc()
			const paddingLeftValue = paddingLeft === '0px' ? '0px' : paddingLeft || '0px';
			const paddingRightValue = paddingRight === '0px' ? '0px' : paddingRight || '0px';
			const paddingTopValue = paddingTop === '0px' ? '0px' : paddingTop || '1rem';
			const paddingBottomValue = paddingBottom === '0px' ? '0px' : paddingBottom || '1rem';

			// Injecter sur le carousel
			carousel.style.setProperty('--carousel-padding-left', paddingLeftValue);
			carousel.style.setProperty('--carousel-padding-right', paddingRightValue);
			carousel.style.setProperty('--carousel-padding-top', paddingTopValue);
			carousel.style.setProperty('--carousel-padding-bottom', paddingBottomValue);
			carousel.style.setProperty('--carousel-scroll-padding-left', paddingLeftValue);
			carousel.style.setProperty('--carousel-scroll-padding-right', paddingRightValue);

			// Copier sur le parent pour les boutons fallback
			const parent = carousel.parentElement;
			if (parent) {
				parent.style.setProperty('--carousel-padding-left', paddingLeftValue);
				parent.style.setProperty('--carousel-padding-right', paddingRightValue);
			}
		});
	}

	/**
	 * Convertit une couleur CSS en hexadécimal pour les SVG
	 */
	function convertColorToHexForSvg(color) {
		if (!color) return '#ffffff';

		if (color.startsWith('#')) {
			return color;
		}

		if (color.startsWith('rgb')) {
			const matches = color.match(/\d+/g);
			if (matches && matches.length >= 3) {
				const r = parseInt(matches[0]);
				const g = parseInt(matches[1]);
				const b = parseInt(matches[2]);
				return '#' + [r, g, b].map(function (x) {
					const hex = x.toString(16);
					return hex.length === 1 ? '0' + hex : hex;
				}).join('');
			}
		}

		// Fallback : créer un élément temporaire pour obtenir la valeur hex
		const temp = document.createElement('div');
		temp.style.color = color;
		temp.style.position = 'absolute';
		temp.style.visibility = 'hidden';
		document.body.appendChild(temp);
		const computedColor = window.getComputedStyle(temp).color;
		document.body.removeChild(temp);

		if (computedColor.startsWith('rgb')) {
			const matches = computedColor.match(/\d+/g);
			if (matches && matches.length >= 3) {
				const r = parseInt(matches[0]);
				const g = parseInt(matches[1]);
				const b = parseInt(matches[2]);
				return '#' + [r, g, b].map(function (x) {
					const hex = x.toString(16);
					return hex.length === 1 ? '0' + hex : hex;
				}).join('');
			}
		}

		return '#ffffff';
	}

	function resolveCarouselArrowStyleFromElement(element) {
		if (!element || !element.classList) {
			return DEFAULT_ARROW_STYLE;
		}

		const iconClass = Array.prototype.find.call(element.classList, function (cls) {
			return cls.indexOf('nbc-carousel-icon-') === 0;
		});

		if (iconClass) {
			const styleKey = iconClass.replace('nbc-carousel-icon-', '');
			return normalizeStyleKey(styleKey);
		}

		return DEFAULT_ARROW_STYLE;
	}

	function resolveArrowColor(color, docContext) {
		const doc = docContext || document;
		let actualColor = color;
		if (!actualColor || actualColor === '' || actualColor === 'rgba(0, 0, 0, 0)' || actualColor === 'transparent') {
			const root = doc.documentElement || doc;
			if (root && root.style) {
				actualColor = root.style.getPropertyValue('--carousel-button-color');
			}

			if ((!actualColor || actualColor === '') && doc.defaultView && doc.defaultView.getComputedStyle) {
				const computedRoot = doc.defaultView.getComputedStyle(root);
				if (computedRoot) {
					actualColor = computedRoot.getPropertyValue('--carousel-button-color');
				}
			}
		}

		return convertColorToHexForSvg(actualColor || '#ffffff');
	}

	function applyArrowIconsToCarousels(color, docContext, overrideConfig) {
		const baseDoc = docContext || document;

		if (!baseDoc) {
			return;
		}

		let carousels = [];

		if (overrideConfig && Array.isArray(overrideConfig.elements) && overrideConfig.elements.length) {
			carousels = overrideConfig.elements.filter(Boolean);
		} else {
			const docsToSearch = new Set();

			if (baseDoc && typeof baseDoc.querySelectorAll === 'function') {
				docsToSearch.add(baseDoc);
			}

			if (baseDoc === document) {
				const iframeSelectors = [
					'.editor-canvas iframe',
					'iframe[name="editor-canvas"]',
					'.edit-site-visual-editor__editor-canvas',
				];

				iframeSelectors.forEach((selector) => {
					const iframe = document.querySelector(selector);
					if (iframe && iframe.contentDocument) {
						docsToSearch.add(iframe.contentDocument);
					}
				});
			}

			docsToSearch.forEach((searchDoc) => {
				try {
					const found = Array.from(searchDoc.querySelectorAll('.nbc-carousel'));
					found.forEach((node) => {
						if (node) {
							carousels.push(node);
						}
					});
				} catch (e) {
					// Ignorer les contextes non accessibles
				}
			});
		}

		if (!carousels.length) {
			return;
		}

		carousels = Array.from(new Set(carousels));

		const arrowColorCache = new WeakMap();

		Array.prototype.forEach.call(carousels, function (carousel) {
			const docForCarousel = carousel && carousel.ownerDocument ? carousel.ownerDocument : baseDoc;
			const explicitStyle = overrideConfig && overrideConfig.styleKey ? overrideConfig.styleKey : null;
			const normalizedKey = normalizeStyleKey(explicitStyle || resolveCarouselArrowStyleFromElement(carousel));
			let arrowColor = arrowColorCache.get(docForCarousel);
			if (!arrowColor) {
				arrowColor = resolveArrowColor(color, docForCarousel);
				arrowColorCache.set(docForCarousel, arrowColor);
			}
			const leftArrowSvg = generateArrowSvg('left', arrowColor, normalizedKey);
			const rightArrowSvg = generateArrowSvg('right', arrowColor, normalizedKey);

			carousel.style.setProperty('--carousel-button-arrow-left', 'url("' + leftArrowSvg + '")');
			carousel.style.setProperty('--carousel-button-arrow-right', 'url("' + rightArrowSvg + '")');

			const parent = carousel.parentElement;
			if (parent) {
				parent.style.setProperty('--carousel-button-arrow-left', 'url("' + leftArrowSvg + '")');
				parent.style.setProperty('--carousel-button-arrow-right', 'url("' + rightArrowSvg + '")');
			}
		});
	}

	/**
	 * Génère le SVG d'une flèche avec la couleur spécifiée
	 */
	function generateArrowSvg(direction, color, iconKey) {
		const normalizedKey = normalizeStyleKey(iconKey);
		const icon = ARROW_ICONS[normalizedKey] || ARROW_ICONS[DEFAULT_ARROW_STYLE];
		const directionKey = direction === 'left' ? 'left' : 'right';
		const pathConfig = icon.paths[directionKey] || icon.paths.right;
		const attributes = ["fill='" + color + "'", "d='" + pathConfig.d + "'"];

		if (pathConfig.transform) {
			attributes.push("transform='" + pathConfig.transform + "'");
		}

		const svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='" + icon.viewBox + "'><path " + attributes.join(' ') + " /></svg>";
		return 'data:image/svg+xml,' + encodeURIComponent(svg);
	}

	/**
	 * Injecte les SVG des flèches avec la couleur du texte des boutons
	 * Lit la variable --carousel-button-color injectée par PHP et génère les SVG
	 */
	function injectArrowSvgs() {
		const root = document.documentElement;
		const rootStyle = window.getComputedStyle(root);

		// Lire la couleur du texte des boutons depuis la variable CSS
		const buttonColor = rootStyle.getPropertyValue('--carousel-button-color').trim();

		// Si la variable n'est pas définie, essayer de la lire depuis un bouton WordPress réel
		let actualColor = buttonColor;
		if (!actualColor || actualColor === '') {
			// Chercher un bouton WordPress sur la page
			const wpButton = document.querySelector('.wp-element-button, button.wp-element-button');
			if (wpButton) {
				const buttonStyle = window.getComputedStyle(wpButton);
				actualColor = buttonStyle.color;
			} else {
				// Fallback vers blanc
				actualColor = '#ffffff';
			}
		}

		// Générer les SVG avec la couleur trouvée
		if (actualColor && actualColor !== 'rgba(0, 0, 0, 0)' && actualColor !== '') {
			const arrowColor = convertColorToHexForSvg(actualColor);
			const defaultLeftArrow = generateArrowSvg('left', arrowColor, DEFAULT_ARROW_STYLE);
			const defaultRightArrow = generateArrowSvg('right', arrowColor, DEFAULT_ARROW_STYLE);

			// Injecter les variables CSS sur :root
			root.style.setProperty('--carousel-button-arrow-left', 'url("' + defaultLeftArrow + '")');
			root.style.setProperty('--carousel-button-arrow-right', 'url("' + defaultRightArrow + '")');
		}

		// ne pas forcer le style sur chaque carousel ici, ils seront normalisés plus loin
	}

	// Fonction d'initialisation principale
	// Le padding est maintenant géré en PHP, mais on utilise JavaScript comme fallback
	// pour lire le padding calculé directement (plus fiable que d'essayer de l'extraire en PHP)
	function initCarousel() {
		injectMinWidthVariables();
		injectPaddingVariables();
		injectArrowSvgs();
		applyArrowIconsToCarousels(null, document);
	}

	// Exécuter au chargement du DOM
	// Utiliser requestAnimationFrame pour s'assurer que le CSS est chargé
	function initWhenReady() {
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', function () {
				// Attendre que le CSS soit appliqué
				requestAnimationFrame(function () {
					requestAnimationFrame(initCarousel);
				});
			});
		} else {
			// DOM déjà chargé, attendre que le CSS soit appliqué
			requestAnimationFrame(function () {
				requestAnimationFrame(initCarousel);
			});
		}
	}

	initWhenReady();

	// Ré-exécuter après le chargement complet (au cas où des styles seraient chargés en différé)
	window.addEventListener('load', function () {
		// Vérifier si --carousel-min-width est manquant pour certains carousels
		const carousels = document.querySelectorAll('.nbc-carousel.nbc-carousel-min-width');
		let needsMinWidthUpdate = false;
		carousels.forEach(function (carousel) {
			const computedStyle = window.getComputedStyle(carousel);
			const minWidth = computedStyle.getPropertyValue('--carousel-min-width');
			if (!minWidth || minWidth.trim() === '') {
				needsMinWidthUpdate = true;
			}
		});

		// Toujours ré-injecter les variables de padding au cas où des styles seraient chargés en différé
		// Cela garantit que les variables sont toujours à jour
		if (needsMinWidthUpdate) {
			requestAnimationFrame(function () {
				requestAnimationFrame(function () {
					initCarousel();
				});
			});
		} else {
			// Si seulement le padding et les SVG doivent être mis à jour
			requestAnimationFrame(function () {
				requestAnimationFrame(function () {
					injectPaddingVariables();
					injectArrowSvgs();
					applyArrowIconsToCarousels(null, document);
				});
			});
		}
	});

	if (typeof window !== 'undefined') {
		window.nbcCarousel = window.nbcCarousel || {};
		window.nbcCarousel.applyArrowIconsToCarousels = function (color, context, overrideConfig) {
			const normalizedConfig = overrideConfig ? {
				...overrideConfig,
				styleKey: normalizeStyleKey(overrideConfig.styleKey),
			} : overrideConfig;
			applyArrowIconsToCarousels(color, context || document, normalizedConfig);
		};
	}

})();

