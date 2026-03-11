/**
 * Frontend script for Any Block Carousel Slider
 * Injects missing CSS variables for the minimumColumnWidth mode.
 *
 * @package AnyBlockCarouselSlider
 * @version 1.0.4
 * @author weblazer35
 */

(function () {
	'use strict';

	const SHARED = window.AnyBlockCarouselSliderShared || {};
	const FALLBACK_DEFAULT_ARROW_STYLE = 'chevron';
	const DEFAULT_ARROW_STYLE = SHARED.DEFAULT_ARROW_STYLE || FALLBACK_DEFAULT_ARROW_STYLE;

	const FALLBACK_ICON_BASE = {
		chevron: {
			viewBox: '0 0 640 640',
			paths: {
				right: {
					d: 'M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z'
				},
				left: {
					d: 'M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z',
					transform: 'scale(-1 1) translate(-640 0)'
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
		},
		angles: {
			viewBox: '0 0 640 640',
			paths: {
				right: {
					d: 'M535.1 342.6C547.6 330.1 547.6 309.8 535.1 297.3L375.1 137.3C362.6 124.8 342.3 124.8 329.8 137.3C317.3 149.8 317.3 170.1 329.8 182.6L467.2 320L329.9 457.4C317.4 469.9 317.4 490.2 329.9 502.7C342.4 515.2 362.7 515.2 375.2 502.7L535.2 342.7zM183.1 502.6L343.1 342.6C355.6 330.1 355.6 309.8 343.1 297.3L183.1 137.3C170.6 124.8 150.3 124.8 137.8 137.3C125.3 149.8 125.3 170.1 137.8 182.6L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7z'
				},
				left: {
					d: 'M535.1 342.6C547.6 330.1 547.6 309.8 535.1 297.3L375.1 137.3C362.6 124.8 342.3 124.8 329.8 137.3C317.3 149.8 317.3 170.1 329.8 182.6L467.2 320L329.9 457.4C317.4 469.9 317.4 490.2 329.9 502.7C342.4 515.2 362.7 515.2 375.2 502.7L535.2 342.7zM183.1 502.6L343.1 342.6C355.6 330.1 355.6 309.8 343.1 297.3L183.1 137.3C170.6 124.8 150.3 124.8 137.8 137.3C125.3 149.8 125.3 170.1 137.8 182.6L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7z',
					transform: 'scale(-1 1) translate(-640 0)'
				}
			}
		}
	};

	const FALLBACK_ICON_ALIASES = {
		classic: 'chevron',
		'solid-full': 'arrow',
		arrowfull: 'arrow',
		'angles-right-solid-full': 'angles'
	};

	const FALLBACK_ARROW_ICONS = {
		...FALLBACK_ICON_BASE,
		classic: FALLBACK_ICON_BASE.chevron,
		'solid-full': FALLBACK_ICON_BASE.arrow,
		angles: FALLBACK_ICON_BASE.angles,
	};

	const fallbackNormalizeStyleKey = (styleKey) => {
		if (!styleKey) {
			return FALLBACK_DEFAULT_ARROW_STYLE;
		}
		if (FALLBACK_ICON_BASE[styleKey]) {
			return styleKey;
		}
		if (FALLBACK_ICON_ALIASES[styleKey]) {
			return FALLBACK_ICON_ALIASES[styleKey];
		}
		return FALLBACK_DEFAULT_ARROW_STYLE;
	};

	const normalizeStyleKey = typeof SHARED.normalizeStyleKey === 'function'
		? (styleKey) => SHARED.normalizeStyleKey(styleKey)
		: fallbackNormalizeStyleKey;

	const getIconDefinition = typeof SHARED.getIconDefinition === 'function'
		? (styleKey) => SHARED.getIconDefinition(styleKey)
		: (styleKey) => FALLBACK_ARROW_ICONS[fallbackNormalizeStyleKey(styleKey)];

	const fallbackBuildSvg = (direction, color, styleKey, toDataUrl = false) => {
		const normalizedKey = fallbackNormalizeStyleKey(styleKey);
		const icon = FALLBACK_ARROW_ICONS[normalizedKey] || FALLBACK_ARROW_ICONS[FALLBACK_DEFAULT_ARROW_STYLE];
		const directionKey = direction === 'left' ? 'left' : 'right';
		const pathConfig = icon.paths[directionKey] || icon.paths.right;
		const attributes = [`fill='${color}'`, `d='${pathConfig.d}'`];

		if (pathConfig.transform) {
			attributes.push(`transform='${pathConfig.transform}'`);
		}

		const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${icon.viewBox}'><path ${attributes.join(' ')} /></svg>`;

		if (toDataUrl) {
			return `data:image/svg+xml,${encodeURIComponent(svg)}`;
		}

		return svg;
	};

	const generateArrowSvg = typeof SHARED.generateArrowSvg === 'function'
		? (direction, color, styleKey) => SHARED.generateArrowSvg(direction, color, styleKey)
		: (direction, color, styleKey) => fallbackBuildSvg(direction, color, styleKey, true);

	const generateArrowMarkup = typeof SHARED.generateArrowMarkup === 'function'
		? (direction, color, styleKey) => SHARED.generateArrowMarkup(direction, color, styleKey)
		: (direction, color, styleKey) => fallbackBuildSvg(direction, color, styleKey, false);

	const isValidArrowStyle = (styleKey) => !!getIconDefinition(styleKey);

	/**
	 * Extrait la valeur minimumColumnWidth depuis grid-template-columns
	 * WordPress generates: grid-template-columns: repeat(auto-fill, minmax(min(38rem, 100%), 1fr))
	 */
	function extractMinWidthFromGridTemplateColumns(gridTemplateColumns) {
		if (!gridTemplateColumns || gridTemplateColumns === 'none') {
			return null;
		}

		// Look for minmax(min(XXX, 100%), 1fr)
		const match = gridTemplateColumns.match(/minmax\(min\(([^,]+),\s*100%\)/);
		if (match && match[1]) {
			return match[1].trim();
		}

		return null;
	}

	/**
	 * Finds the grid-template-columns CSS rule for a carousel from the stylesheets.
	 */
	function findGridTemplateColumnsRule(carousel) {
		// Look for a unique wp-container class on the carousel
		const containerClass = Array.from(carousel.classList).find(function (cls) {
			return cls.startsWith('wp-container-');
		});

		if (!containerClass) {
			return null;
		}

		// Iterate over every stylesheet
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
				// Ignore CORS errors for external stylesheets
				continue;
			}
		}

		return null;
	}

	/**
	 * Injects --carousel-min-width for carousels using minimumColumnWidth mode.
	 */
	function injectMinWidthVariables() {
		// Find all carousels with the abcs-min-width class
		const carousels = document.querySelectorAll('.abcs.abcs-min-width');

		carousels.forEach(function (carousel) {
			// Check whether the variable is already defined
			const computedStyle = window.getComputedStyle(carousel);
			const currentMinWidth = computedStyle.getPropertyValue('--carousel-min-width');

			// If already defined (by PHP), do nothing
			if (currentMinWidth && currentMinWidth.trim() !== '') {
				return;
			}

			// Locate the grid-template-columns rule inside stylesheets
			const gridTemplateColumns = findGridTemplateColumnsRule(carousel);

			if (!gridTemplateColumns) {
				// Silent in production—the variable might eventually be set by PHP
				return;
			}

			// Extract the minimumColumnWidth value
			const minWidth = extractMinWidthFromGridTemplateColumns(gridTemplateColumns);

			if (minWidth) {
				// Inject the CSS variable
				carousel.style.setProperty('--carousel-min-width', minWidth);
			}
		});
	}

	/**
	 * Injects padding variables by reading computed padding directly.
	 * Optimal approach: rely on the browser’s computed values (which include every style)
	 * and inject them as CSS variables. Works even when PHP fails to extract padding.
	 */
	function injectPaddingVariables() {
		const carousels = document.querySelectorAll('.abcs');

		carousels.forEach(function (carousel) {
			const computedStyle = window.getComputedStyle(carousel);

			// Read the computed gap to adjust widths
			const computedGap = computedStyle.gap || computedStyle.columnGap || computedStyle.rowGap;
			if (computedGap && computedGap !== 'normal' && computedGap.trim() !== '') {
				carousel.style.setProperty('--wp--style--block-gap', computedGap);
			}

			// Read computed padding directly (works even when defined via inline style)
			const paddingLeft = computedStyle.paddingLeft;
			const paddingRight = computedStyle.paddingRight;
			const paddingTop = computedStyle.paddingTop;
			const paddingBottom = computedStyle.paddingBottom;

			const parent = carousel.parentElement;
			const parentStyle = parent ? window.getComputedStyle(parent) : null;

			const normalizePadding = (value, fallback, axis) => {
				if (value && value !== '0px') {
					return value;
				}
				const parentValue = parentStyle ? parentStyle[axis] : null;
				if (parentValue && parentValue !== '0px') {
					return parentValue;
				}
				return fallback;
			};

			const paddingLeftValue = normalizePadding(paddingLeft, '0px', 'paddingLeft');
			const paddingRightValue = normalizePadding(paddingRight, '0px', 'paddingRight');
			const paddingTopValue = normalizePadding(paddingTop, '1rem', 'paddingTop');
			const paddingBottomValue = normalizePadding(paddingBottom, '1rem', 'paddingBottom');

			// Apply to the carousel
			carousel.style.setProperty('--carousel-padding-left', paddingLeftValue);
			carousel.style.setProperty('--carousel-padding-right', paddingRightValue);
			carousel.style.setProperty('--carousel-padding-top', paddingTopValue);
			carousel.style.setProperty('--carousel-padding-bottom', paddingBottomValue);
			carousel.style.setProperty('--carousel-scroll-padding-left', paddingLeftValue);
			carousel.style.setProperty('--carousel-scroll-padding-right', paddingRightValue);

			// Mirror the values on the parent for fallback buttons
			if (parent) {
				parent.style.setProperty('--carousel-padding-left', paddingLeftValue);
				parent.style.setProperty('--carousel-padding-right', paddingRightValue);
				parent.style.setProperty('--carousel-padding-bottom', paddingBottomValue);
			}
		});
	}

	/**
	 * Converts a CSS color to hexadecimal for SVGs.
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

		// Fallback: create a temporary element to retrieve the hex value
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
			return cls.indexOf('abcs-icon-') === 0;
		});

		if (iconClass) {
			const styleKey = iconClass.replace('abcs-icon-', '');
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
					const found = Array.from(searchDoc.querySelectorAll('.abcs'));
					found.forEach((node) => {
						if (node) {
							carousels.push(node);
						}
					});
				} catch (e) {
					// Ignore contexts that are not accessible
				}
			});
		}

		if (!carousels.length) {
			return;
		}

		carousels = Array.from(new Set(carousels));

		const arrowColorCache = new WeakMap();

		Array.prototype.forEach.call(carousels, function (carousel) {
			if (!carousel) {
				return;
			}

			const parent = carousel.parentElement;

			if (carousel.classList && carousel.classList.contains('abcs-hide-arrows')) {
				carousel.style.setProperty('--carousel-button-arrow-left', 'none');
				carousel.style.setProperty('--carousel-button-arrow-right', 'none');
				if (parent) {
					parent.style.setProperty('--carousel-button-arrow-left', 'none');
					parent.style.setProperty('--carousel-button-arrow-right', 'none');
				}
				return;
			}

			const docForCarousel = carousel && carousel.ownerDocument ? carousel.ownerDocument : baseDoc;
			const explicitStyle = overrideConfig && overrideConfig.styleKey ? overrideConfig.styleKey : null;
			const normalizedKey = normalizeStyleKey(explicitStyle || resolveCarouselArrowStyleFromElement(carousel));
			const styleKey = isValidArrowStyle(normalizedKey) ? normalizedKey : DEFAULT_ARROW_STYLE;
			let arrowColor = arrowColorCache.get(docForCarousel);
			if (!arrowColor) {
				arrowColor = resolveArrowColor(color, docForCarousel);
				arrowColorCache.set(docForCarousel, arrowColor);
			}
			const leftArrowSvg = generateArrowSvg('left', arrowColor, styleKey);
			const rightArrowSvg = generateArrowSvg('right', arrowColor, styleKey);

			carousel.style.setProperty('--carousel-button-arrow-left', 'url("' + leftArrowSvg + '")');
			carousel.style.setProperty('--carousel-button-arrow-right', 'url("' + rightArrowSvg + '")');
			if (carousel.dataset) {
				carousel.dataset.abcsCarouselArrowStyle = styleKey;
				carousel.dataset.abcsArrowStyle = styleKey;
			}

			if (parent) {
				if (parent.dataset) {
					parent.dataset.abcsCarouselArrowStyle = styleKey;
					parent.dataset.abcsArrowStyle = styleKey;
				}
				parent.style.setProperty('--carousel-button-arrow-left', 'url("' + leftArrowSvg + '")');
				parent.style.setProperty('--carousel-button-arrow-right', 'url("' + rightArrowSvg + '")');
			}
		});
	}

	/**
	 * Injects CSS variables into a <style> tag instead of inline style attribute.
	 * This is a better practice than using element.style.setProperty() on documentElement.
	 *
	 * @param {Object} variables - Object with CSS variable names as keys and values as values
	 */
	function injectCssVariablesInStyleTag(variables) {
		const head = document.head || document.getElementsByTagName('head')[0];

		if (!head) return;

		// Find or create the style tag for carousel variables
		let styleTag = document.getElementById('carousel-dynamic-variables');

		if (!styleTag) {
			styleTag = document.createElement('style');
			styleTag.id = 'carousel-dynamic-variables';
			styleTag.type = 'text/css';
			head.appendChild(styleTag);
		}

		// Build CSS with all variables
		let css = ':root {';
		for (const [key, value] of Object.entries(variables)) {
			if (value !== null && value !== undefined && value !== '') {
				css += '\n  ' + key + ': ' + value + ';';
			}
		}
		css += '\n}';

		styleTag.textContent = css;
	}

	/**
	 * Injects arrow SVGs using the button text color.
	 * Reads the --carousel-button-color variable injected by PHP and generates SVGs.
	 */
	function injectArrowSvgs() {
		const root = document.documentElement;
		const rootStyle = window.getComputedStyle(root);

		// Read the button text colour from the CSS variable
		const buttonColor = rootStyle.getPropertyValue('--carousel-button-color').trim();

		// If the variable is missing, try to read it from a real WordPress button
		let actualColor = buttonColor;
		if (!actualColor || actualColor === '') {
			// Look for a WordPress button on the page
			const wpButton = document.querySelector('.wp-element-button, button.wp-element-button');
			if (wpButton) {
				const buttonStyle = window.getComputedStyle(wpButton);
				actualColor = buttonStyle.color;
			} else {
				// Fallback to white
				actualColor = '#ffffff';
			}
		}

		// Generate SVGs with the retrieved color
		if (actualColor && actualColor !== 'rgba(0, 0, 0, 0)' && actualColor !== '') {
			const arrowColor = convertColorToHexForSvg(actualColor);
			const defaultLeftArrow = generateArrowSvg('left', arrowColor, DEFAULT_ARROW_STYLE);
			const defaultRightArrow = generateArrowSvg('right', arrowColor, DEFAULT_ARROW_STYLE);

			// Inject CSS variables in a style tag instead of inline style attribute
			const variables = {
				'--carousel-button-arrow-left': 'url("' + defaultLeftArrow + '")',
				'--carousel-button-arrow-right': 'url("' + defaultRightArrow + '")'
			};
			injectCssVariablesInStyleTag(variables);
		}

		// Do not force the style on each carousel here; they are normalised later
	}

	/**
	 * Initializes autoplay for carousels with autoplay enabled.
	 * Handles automatic scrolling, pause on hover/interaction, and stop at end.
	 */
	// Store intervals and state outside function to persist across calls
	const autoplayIntervals = new WeakMap();
	const autoplayPaused = new WeakMap();
	const interactionTimeout = new WeakMap();
	const autoplayInitialized = new WeakSet();
	const loopResetSetup = new WeakSet();
	const isAutoScrollingMap = new WeakMap(); // Track autoplay scrolling state

	/**
	 * Setup loop functionality: keep buttons visible and handle reset when clicking Next at the end
	 * Simple approach: listen for clicks and check if we're at the end, then reset
	 */
	function setupLoopReset(carousel) {
		// Skip if already setup
		if (loopResetSetup.has(carousel)) {
			return;
		}

		const isLoopEnabled = carousel.getAttribute('data-abcs-loop') === 'true';
		if (!isLoopEnabled) {
			return;
		}

		// Skip if carousel has no children
		if (!carousel.firstElementChild) {
			return;
		}

		let isResetting = false; // Flag to prevent multiple resets

		// Get autoplay delay for this carousel (if autoplay is enabled)
		const autoplayDelay = parseInt(carousel.getAttribute('data-abcs-autoplay-delay'), 10) || 3000;

		// Function to check if we're at the end
		function isAtEnd() {
			const threshold = 5;
			return carousel.scrollLeft + carousel.offsetWidth >= carousel.scrollWidth - threshold;
		}

		// Function to check if we're at the start
		function isAtStart() {
			const threshold = 5;
			return carousel.scrollLeft <= threshold;
		}

		// Function to reset to start
		function resetToStart() {
			if (isResetting) {
				return;
			}
			isResetting = true;
			carousel.style.scrollBehavior = 'auto';
			carousel.scrollTo({
				left: 0,
				behavior: 'auto'
			});
			carousel.style.scrollBehavior = '';
			setTimeout(function () {
				isResetting = false;
			}, 100);
		}

		// Function to reset to end
		function resetToEnd() {
			if (isResetting) {
				return;
			}
			isResetting = true;
			carousel.style.scrollBehavior = 'auto';
			carousel.scrollTo({
				left: carousel.scrollWidth,
				behavior: 'auto'
			});
			carousel.style.scrollBehavior = '';
			setTimeout(function () {
				isResetting = false;
			}, 100);
		}

		// Track if we were already at boundaries BEFORE any interaction
		// This distinguishes "arriving at the end" from "already at the end"
		let wasAtEndBeforeInteraction = false;
		let wasAtStartBeforeInteraction = false;
		let clickTimeout = null;
		let scrollTimeout = null;
		let previousScrollLeft = carousel.scrollLeft;

		// Update boundary flags on scroll (to track when we reach boundaries)
		function updateBoundaryFlags() {
			// Only update if we're not resetting
			if (!isResetting) {
				wasAtEndBeforeInteraction = isAtEnd();
				wasAtStartBeforeInteraction = isAtStart();
			}
		}

		// Listen for clicks on the carousel (this will catch clicks on scroll buttons)
		function handleClick(e) {
			if (isResetting) {
				return;
			}

			// Clear any pending click timeout
			if (clickTimeout) {
				clearTimeout(clickTimeout);
			}

			// Store state BEFORE the click - this is crucial!
			// We use the flag that was set BEFORE this click, not the current state
			const wasAtEndBeforeClick = wasAtEndBeforeInteraction;
			const wasAtStartBeforeClick = wasAtStartBeforeInteraction;

			// Only reset if we were ALREADY at the end BEFORE the click
			// This allows the first click to show the last slide, and the second click to reset
			if (wasAtEndBeforeClick) {
				clickTimeout = setTimeout(function () {
					if (isResetting) {
						return;
					}
					// If still at end after click, the button couldn't scroll - reset to start
					if (isAtEnd()) {
						resetToStart();
					}
				}, 400); // Longer delay to let scroll-button try to scroll
			}
			// Only reset if we were ALREADY at the start BEFORE the click
			else if (wasAtStartBeforeClick) {
				clickTimeout = setTimeout(function () {
					if (isResetting) {
						return;
					}
					// If still at start after click, the button couldn't scroll - reset to end
					if (isAtStart()) {
						resetToEnd();
					}
				}, 400);
			}

			// After the click, update flags for next time (but don't reset now)
			// This ensures that if we just arrived at the end, the next click will trigger reset
			setTimeout(function () {
				updateBoundaryFlags();
			}, 500); // Wait for scroll to complete before updating flags
		}

		// Handle scroll events - only reset if we were ALREADY at the end before scrolling
		function handleScroll() {
			if (isResetting) {
				previousScrollLeft = carousel.scrollLeft;
				return;
			}

			const currentScrollLeft = carousel.scrollLeft;
			const isScrollingForward = currentScrollLeft > previousScrollLeft;
			const isScrollingBackward = currentScrollLeft < previousScrollLeft;
			const scrollDelta = Math.abs(currentScrollLeft - previousScrollLeft);

			// Update boundary flags as we scroll
			updateBoundaryFlags();

			previousScrollLeft = currentScrollLeft;

			// Clear any pending scroll timeout
			if (scrollTimeout) {
				clearTimeout(scrollTimeout);
			}

			// Check if this is autoplay scrolling
			const isAutoplayActive = isAutoScrollingMap.get(carousel);

			// Ignore tiny scrolls (scroll-snap adjustments) - they're less than 10px
			// BUT allow autoplay scrolls even if tiny (autoplay is programmatic, not scroll-snap)
			const isSignificantScroll = scrollDelta > 10 || isAutoplayActive;

			// Only reset if we were ALREADY at the end BEFORE this scroll AND still at end
			// AND it's a significant scroll (not just scroll-snap micro-adjustments)
			// OR if it's autoplay (which can have small scrolls)
			// This prevents reset when scrolling normally towards the end or from scroll-snap
			if (wasAtEndBeforeInteraction && isAtEnd() && isScrollingForward && isSignificantScroll) {
				scrollTimeout = setTimeout(function () {
					if (isAtEnd() && !isResetting && wasAtEndBeforeInteraction) {
						// We were already at the end and tried to scroll forward - reset to start
						// If autoplay is active, add delay before reset equal to autoplay delay
						if (isAutoplayActive) {
							setTimeout(function () {
								if (!isResetting) {
									resetToStart();
								}
							}, autoplayDelay);
						} else {
							resetToStart();
						}
					}
				}, 200);
			}
			// Only reset if we were ALREADY at the start BEFORE this scroll AND still at start
			else if (wasAtStartBeforeInteraction && isAtStart() && isScrollingBackward && isSignificantScroll) {
				scrollTimeout = setTimeout(function () {
					if (isAtStart() && !isResetting && wasAtStartBeforeInteraction) {
						// We were already at the start and tried to scroll backward - reset to end
						resetToEnd();
					}
				}, 200);
			}
		}

		// Initialize boundary flags
		updateBoundaryFlags();

		// Listen for clicks and scroll events
		carousel.addEventListener('click', handleClick);
		carousel.addEventListener('scroll', handleScroll, { passive: true });

		// Store handler references for cleanup
		carousel._abcsLoopClickHandler = handleClick;
		carousel._abcsLoopScrollHandler = handleScroll;

		// Store cleanup function
		carousel._abcsLoopCleanup = function () {
			if (carousel._abcsLoopClickHandler) {
				carousel.removeEventListener('click', carousel._abcsLoopClickHandler);
			}
			if (carousel._abcsLoopScrollHandler) {
				carousel.removeEventListener('scroll', carousel._abcsLoopScrollHandler);
			}
			if (clickTimeout) {
				clearTimeout(clickTimeout);
			}
			if (scrollTimeout) {
				clearTimeout(scrollTimeout);
			}
			loopResetSetup.delete(carousel);
		};

		loopResetSetup.add(carousel);
	}

	function initAutoplay() {
		const carousels = document.querySelectorAll('.abcs[data-abcs-autoplay="true"]');

		carousels.forEach(function (carousel) {
			// Skip if already initialized
			if (autoplayInitialized.has(carousel)) {
				return;
			}

			// Skip if carousel has no children
			if (!carousel.firstElementChild) {
				return;
			}

			const autoplayDelay = parseInt(carousel.getAttribute('data-abcs-autoplay-delay'), 10) || 3000;
			const isLoopEnabled = carousel.getAttribute('data-abcs-loop') === 'true';

			// Setup loop reset if loop is enabled
			if (isLoopEnabled) {
				setupLoopReset(carousel);
			}
			let intervalId = null;
			let isPaused = false;
			let isHoverPaused = false;
			let interactionTimeoutId = null;
			let isAutoScrolling = false; // Flag to track if scroll is from autoplay
			const RESUME_DELAY = 2000; // Resume autoplay after 2 seconds of no interaction

			// Calculate slide width including gap
			function getSlideWidth() {
				const firstChild = carousel.firstElementChild;
				if (!firstChild) {
					return 0;
				}
				const computedStyle = window.getComputedStyle(carousel);
				const gap = computedStyle.getPropertyValue('gap') || computedStyle.getPropertyValue('--wp--style--block-gap') || '1rem';
				// Convert gap to pixels if it has a unit
				let gapValue = 0;
				if (gap && gap !== 'normal') {
					// Try to parse as number (for px values)
					const gapNum = parseFloat(gap);
					if (!isNaN(gapNum)) {
						// If gap contains 'rem' or 'em', convert to pixels
						if (gap.includes('rem')) {
							const rootFontSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
							gapValue = gapNum * rootFontSize;
						} else if (gap.includes('em')) {
							const parentFontSize = parseFloat(computedStyle.fontSize) || 16;
							gapValue = gapNum * parentFontSize;
						} else {
							// Assume px or unitless
							gapValue = gapNum;
						}
					}
				}
				return firstChild.offsetWidth + gapValue;
			}

			// Check if carousel is at the end
			function isAtEnd() {
				// If loop is enabled, never consider it at the end
				if (isLoopEnabled) {
					return false;
				}
				const threshold = 5; // Small threshold for rounding errors
				return carousel.scrollLeft + carousel.offsetWidth >= carousel.scrollWidth - threshold;
			}


			// Scroll to next slide
			function scrollToNext() {
				const slideWidth = getSlideWidth();
				if (slideWidth === 0) {
					return;
				}

				const currentScroll = carousel.scrollLeft;
				const nextScroll = currentScroll + slideWidth;

				// If loop is disabled, check if we're at the end
				if (!isLoopEnabled) {
					const threshold = 5;
					const isAtEndNow = currentScroll + carousel.offsetWidth >= carousel.scrollWidth - threshold;
					if (isAtEndNow) {
						// Stop autoplay if at the end and loop is disabled
						if (intervalId) {
							clearInterval(intervalId);
							intervalId = null;
							autoplayIntervals.delete(carousel);
						}
						return;
					}
				}

				// With loop enabled, the reset handler will detect the end and jump to start
				// We just scroll normally - the handler manages the reset
				isAutoScrolling = true;
				isAutoScrollingMap.set(carousel, true);
				carousel.scrollTo({
					left: nextScroll,
					behavior: 'smooth'
				});

				// Keep the flag active longer to allow handler to detect end during smooth scroll
				setTimeout(function () {
					isAutoScrolling = false;
					isAutoScrollingMap.set(carousel, false);
				}, 700); // Slightly longer to ensure smooth scroll completes
			}

			// Start autoplay
			function startAutoplay() {
				// If loop is disabled, check if we're at the end
				if (intervalId || (!isLoopEnabled && isAtEnd())) {
					return;
				}

				// Start autoplay (loop reset is already set up if needed)
				intervalId = setInterval(function () {
					if (!isPaused) {
						scrollToNext();
					}
				}, autoplayDelay);
				autoplayIntervals.set(carousel, intervalId);
			}

			// Pause autoplay
			function pauseAutoplay() {
				isPaused = true;
				autoplayPaused.set(carousel, true);
			}

			// Resume autoplay
			function resumeAutoplay() {
				// If loop is disabled and we're at the end, don't resume
				if (!isLoopEnabled && isAtEnd()) {
					return;
				}
				isPaused = false;
				autoplayPaused.delete(carousel);
			}

			// Handle interaction - pause and resume after delay
			function handleInteraction() {
				// Ignore scroll events from autoplay
				if (isAutoScrolling || isAutoScrollingMap.get(carousel)) {
					return;
				}

				pauseAutoplay();

				// Clear existing timeout
				if (interactionTimeoutId) {
					clearTimeout(interactionTimeoutId);
				}

				// Resume after delay (only if not hover paused)
				interactionTimeoutId = setTimeout(function () {
					if (!isHoverPaused) {
						resumeAutoplay();
					}
					interactionTimeoutId = null;
				}, RESUME_DELAY);

				interactionTimeout.set(carousel, interactionTimeoutId);
			}

			// Event listeners for pause on hover
			const handleMouseEnter = function () {
				isHoverPaused = true;
				pauseAutoplay();
			};
			const handleMouseLeave = function () {
				isHoverPaused = false;
				// Resume if loop is enabled or if not at the end
				if (isLoopEnabled || !isAtEnd()) {
					resumeAutoplay();
				}
			};
			carousel.addEventListener('mouseenter', handleMouseEnter);
			carousel.addEventListener('mouseleave', handleMouseLeave);

			// Event listeners for pause on interaction
			carousel.addEventListener('scroll', handleInteraction, { passive: true });
			carousel.addEventListener('touchstart', handleInteraction, { passive: true });
			carousel.addEventListener('mousedown', handleInteraction);

			// Pause when clicking on scroll buttons (handled via parent click events)
			// Note: ::scroll-button are pseudo-elements, so we listen on the carousel itself

			// Start autoplay
			startAutoplay();

			// Mark as initialized
			autoplayInitialized.add(carousel);

			// Cleanup function (stored for potential future use)
			carousel._abcsAutoplayCleanup = function () {
				if (intervalId) {
					clearInterval(intervalId);
					intervalId = null;
					autoplayIntervals.delete(carousel);
				}
				if (interactionTimeoutId) {
					clearTimeout(interactionTimeoutId);
					interactionTimeoutId = null;
					interactionTimeout.delete(carousel);
				}
				carousel.removeEventListener('mouseenter', handleMouseEnter);
				carousel.removeEventListener('mouseleave', handleMouseLeave);
				carousel.removeEventListener('scroll', handleInteraction);
				carousel.removeEventListener('touchstart', handleInteraction);
				carousel.removeEventListener('mousedown', handleInteraction);
			};
		});
	}

	// Main initialisation function
	// Padding is now handled in PHP, but we keep JavaScript as a fallback
	// to read computed padding directly (more reliable than extracting it in PHP)
	function initCarousel() {
		injectMinWidthVariables();
		injectPaddingVariables();
		injectArrowSvgs();
		applyArrowIconsToCarousels(null, document);

		// Setup loop reset for all carousels with loop enabled
		const loopCarousels = document.querySelectorAll('.abcs[data-abcs-loop="true"]');
		loopCarousels.forEach(function (carousel) {
			if (carousel.firstElementChild) {
				setupLoopReset(carousel);
			}
		});

		initAutoplay();
	}

	// Run on DOM ready
	// Use requestAnimationFrame to make sure CSS has loaded
	function initWhenReady() {
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', function () {
				// Wait for CSS to settle
				requestAnimationFrame(function () {
					requestAnimationFrame(initCarousel);
				});
			});
		} else {
			// DOM already loaded; still wait for CSS to settle
			requestAnimationFrame(function () {
				requestAnimationFrame(initCarousel);
			});
		}
	}

	initWhenReady();

	// Run again after load (in case styles were loaded later)
	window.addEventListener('load', function () {
		// Check whether --carousel-min-width is missing on some carousels
		const carousels = document.querySelectorAll('.abcs.abcs-min-width');
		let needsMinWidthUpdate = false;
		carousels.forEach(function (carousel) {
			const computedStyle = window.getComputedStyle(carousel);
			const minWidth = computedStyle.getPropertyValue('--carousel-min-width');
			if (!minWidth || minWidth.trim() === '') {
				needsMinWidthUpdate = true;
			}
		});

		// Always re-inject padding variables in case styles were deferred.
		// This keeps variables fresh.
		if (needsMinWidthUpdate) {
			requestAnimationFrame(function () {
				requestAnimationFrame(function () {
					initCarousel();
				});
			});
		} else {
			// If only padding and SVGs need an update
			requestAnimationFrame(function () {
				requestAnimationFrame(function () {
					injectPaddingVariables();
					injectArrowSvgs();
					applyArrowIconsToCarousels(null, document);
					initAutoplay();
				});
			});
		}
	});

	// Handle dynamically added carousels with MutationObserver
	function setupAutoplayObserver() {
		// Only set up observer if MutationObserver is available
		if (typeof MutationObserver === 'undefined') {
			return;
		}

		const observer = new MutationObserver(function (mutations) {
			let shouldInitAutoplay = false;
			let shouldInitLoop = false;
			mutations.forEach(function (mutation) {
				mutation.addedNodes.forEach(function (node) {
					if (node.nodeType === 1) { // Element node
						// Check if the added node is a carousel
						if (node.classList && node.classList.contains('abcs')) {
							if (node.getAttribute('data-abcs-autoplay') === 'true') {
								shouldInitAutoplay = true;
							}
							if (node.getAttribute('data-abcs-loop') === 'true') {
								shouldInitLoop = true;
							}
						}
						// Check for carousels within the added node
						if (node.querySelectorAll) {
							const autoplayCarousels = node.querySelectorAll('.abcs[data-abcs-autoplay="true"]');
							if (autoplayCarousels.length > 0) {
								shouldInitAutoplay = true;
							}
							const loopCarousels = node.querySelectorAll('.abcs[data-abcs-loop="true"]');
							if (loopCarousels.length > 0) {
								shouldInitLoop = true;
							}
						}
					}
				});
			});

			if (shouldInitAutoplay) {
				// Use requestAnimationFrame to ensure DOM is ready
				requestAnimationFrame(function () {
					initAutoplay();
				});
			}
			if (shouldInitLoop) {
				// Setup loop reset for new carousels
				requestAnimationFrame(function () {
					const loopCarousels = document.querySelectorAll('.abcs[data-abcs-loop="true"]');
					loopCarousels.forEach(function (carousel) {
						if (carousel.firstElementChild && !loopResetSetup.has(carousel)) {
							setupLoopReset(carousel);
						}
					});
				});
			}
		});

		// Start observing the document body for added nodes
		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
	}

	// Set up observer after initial load
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function () {
			setupAutoplayObserver();
		});
	} else {
		setupAutoplayObserver();
	}

	if (typeof window !== 'undefined') {
		window.abcsCarousel = window.abcsCarousel || {};
		window.abcsCarousel.applyArrowIconsToCarousels = function (color, context, overrideConfig) {
			const normalizedConfig = overrideConfig ? {
				...overrideConfig,
				styleKey: normalizeStyleKey(overrideConfig.styleKey),
			} : overrideConfig;
			applyArrowIconsToCarousels(color, context || document, normalizedConfig);
		};
		window.abcsCarousel.initAutoplay = initAutoplay;
	}

})();

