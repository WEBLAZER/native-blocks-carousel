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
				return '#' + [r, g, b].map(function(x) {
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
				return '#' + [r, g, b].map(function(x) {
					const hex = x.toString(16);
					return hex.length === 1 ? '0' + hex : hex;
				}).join('');
			}
		}
		
		return '#ffffff';
	}

	/**
	 * Génère le SVG d'une flèche avec la couleur spécifiée
	 */
	function generateArrowSvg(direction, color) {
		let pathData;
		if (direction === 'left') {
			pathData = 'M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z';
		} else {
			pathData = 'M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z';
		}
		
		const svg = '<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 320 512\'><path fill=\'' + color + '\' d=\'' + pathData + '\'/></svg>';
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
			const leftArrowSvg = generateArrowSvg('left', arrowColor);
			const rightArrowSvg = generateArrowSvg('right', arrowColor);
			
			// Injecter les variables CSS sur :root
			root.style.setProperty('--carousel-button-arrow-left', 'url("' + leftArrowSvg + '")');
			root.style.setProperty('--carousel-button-arrow-right', 'url("' + rightArrowSvg + '")');
		}
	}

	// Fonction d'initialisation principale
	// Le padding est maintenant géré en PHP, mais on utilise JavaScript comme fallback
	// pour lire le padding calculé directement (plus fiable que d'essayer de l'extraire en PHP)
	function initCarousel() {
		injectMinWidthVariables();
		injectPaddingVariables();
		injectArrowSvgs();
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
				requestAnimationFrame(initCarousel);
			});
		} else {
			// Si seulement le padding et les SVG doivent être mis à jour
			requestAnimationFrame(function () {
				requestAnimationFrame(function () {
					injectPaddingVariables();
					injectArrowSvgs();
				});
			});
		}
	});

})();

