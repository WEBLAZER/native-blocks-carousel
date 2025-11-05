/**
 * Script frontend pour Native Blocks Carousel
 * Injecte les variables CSS manquantes pour le mode minimumColumnWidth
 *
 * @package NativeBlocksCarousel
 * @version 1.0.2
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

	// Exécuter au chargement du DOM
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function () {
			injectMinWidthVariables();
		});
	} else {
		// DOM déjà chargé
		injectMinWidthVariables();
	}

	// Ré-exécuter après le chargement complet (au cas où des styles seraient chargés en différé)
	window.addEventListener('load', function () {
		injectMinWidthVariables();
	});

})();

