/**
 * Frontend script for Any Block Carousel Slider
 * Injects navigation buttons, pagination markers, and CSS variables.
 *
 * @package AnyBlockCarouselSlider
 * @version 2.0.0
 * @author weblazer35
 */

(() => {
	'use strict';

	const SHARED = window.AnyBlockCarouselSliderShared || {};
	const DEFAULT_ARROW_STYLE = SHARED.DEFAULT_ARROW_STYLE || 'chevron';

	const normalizeStyleKey = (styleKey) => {
		if (typeof SHARED.normalizeStyleKey === 'function') {
			return SHARED.normalizeStyleKey(styleKey);
		}
		return styleKey || DEFAULT_ARROW_STYLE;
	};

	const generateArrowMarkup = (direction, color, styleKey) => {
		if (typeof SHARED.generateArrowMarkup === 'function') {
			return SHARED.generateArrowMarkup(direction, color, styleKey);
		}
		return '';
	};

	/**
	 * Extrait la valeur minimumColumnWidth depuis grid-template-columns
	 * WordPress génère : grid-template-columns: repeat(auto-fill, minmax(min(38rem, 100%), 1fr))
	 */
	const extractMinWidthFromGridTemplateColumns = (gridTemplateColumns) => {
		if (!gridTemplateColumns || gridTemplateColumns === 'none') {
			return null;
		}

		// Recherche de minmax(min(XXX, 100%), 1fr)
		const match = gridTemplateColumns.match(/minmax\(min\(([^,]+),\s*100%\)/);
		return match && match[1] ? match[1].trim() : null;
	};

	/**
	 * Recherche la règle CSS grid-template-columns pour un carrousel dans les feuilles de style.
	 */
	const findGridTemplateColumnsRule = (carousel) => {
		const containerClass = Array.from(carousel.classList).find(cls => cls.startsWith('wp-container-'));

		if (!containerClass) {
			return null;
		}

		const styleSheets = Array.from(document.styleSheets);

		for (const sheet of styleSheets) {
			try {
				const rules = sheet.cssRules || sheet.rules;
				if (!rules) continue;

				for (let i = 0; i < rules.length; i++) {
					const rule = rules[i];
					if (rule.selectorText && rule.selectorText.includes(containerClass)) {
						const gridTemplateColumns = rule.style.gridTemplateColumns;
						if (gridTemplateColumns && gridTemplateColumns !== 'none') {
							return gridTemplateColumns;
						}
					}
				}
			} catch (e) {
				// Ignorer les erreurs CORS pour les feuilles de style externes
				continue;
			}
		}

		return null;
	};

	/**
	 * Injecte --carousel-min-width pour les carrousels utilisant le mode minimumColumnWidth.
	 */
	const injectMinWidthVariables = () => {
		const carousels = document.querySelectorAll('.abcs.abcs-min-width');

		carousels.forEach(carousel => {
			const computedStyle = window.getComputedStyle(carousel);
			const currentMinWidth = computedStyle.getPropertyValue('--carousel-min-width');

			if (currentMinWidth && currentMinWidth.trim() !== '') {
				return;
			}

			const gridTemplateColumns = findGridTemplateColumnsRule(carousel);
			if (!gridTemplateColumns) {
				return;
			}

			const minWidth = extractMinWidthFromGridTemplateColumns(gridTemplateColumns);
			if (minWidth) {
				carousel.style.setProperty('--carousel-min-width', minWidth);
			}
		});
	};

	/**
	 * Injecte les variables de padding en lisant directement les valeurs calculées.
	 */
	const injectPaddingVariables = () => {
		const carousels = document.querySelectorAll('.abcs');

		carousels.forEach(carousel => {
			const computedStyle = window.getComputedStyle(carousel);

			const computedGap = computedStyle.gap || computedStyle.columnGap || computedStyle.rowGap;
			if (computedGap && computedGap !== 'normal' && computedGap.trim() !== '') {
				carousel.style.setProperty('--wp--style--block-gap', computedGap);
			}

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

			const paddingLeftValue = normalizePadding(computedStyle.paddingLeft, '0px', 'paddingLeft');
			const paddingRightValue = normalizePadding(computedStyle.paddingRight, '0px', 'paddingRight');
			const paddingTopValue = normalizePadding(computedStyle.paddingTop, '1rem', 'paddingTop');
			const paddingBottomValue = normalizePadding(computedStyle.paddingBottom, '1rem', 'paddingBottom');

			carousel.style.setProperty('--carousel-padding-left', paddingLeftValue);
			carousel.style.setProperty('--carousel-padding-right', paddingRightValue);
			carousel.style.setProperty('--carousel-padding-top', paddingTopValue);
			carousel.style.setProperty('--carousel-padding-bottom', paddingBottomValue);
			carousel.style.setProperty('--carousel-scroll-padding-left', paddingLeftValue);
			carousel.style.setProperty('--carousel-scroll-padding-right', paddingRightValue);

			const buttonOffset = computedStyle.getPropertyValue('--carousel-button-offset');
			if (buttonOffset && buttonOffset.trim() !== '') {
				carousel.style.setProperty('--carousel-button-offset', buttonOffset);
			}
			const buttonBg = computedStyle.getPropertyValue('--carousel-button-bg');
			if (buttonBg && buttonBg.trim() !== '') {
				carousel.style.setProperty('--carousel-button-bg', buttonBg);
			}
			const buttonColor = computedStyle.getPropertyValue('--carousel-button-color');
			if (buttonColor && buttonColor.trim() !== '') {
				carousel.style.setProperty('--carousel-button-color', buttonColor);
			}

			if (parent) {
				parent.style.setProperty('--carousel-padding-left', paddingLeftValue);
				parent.style.setProperty('--carousel-padding-right', paddingRightValue);
				parent.style.setProperty('--carousel-padding-bottom', paddingBottomValue);

				if (buttonOffset && buttonOffset.trim() !== '') {
					parent.style.setProperty('--carousel-button-offset', buttonOffset);
				}
				if (buttonBg && buttonBg.trim() !== '') {
					parent.style.setProperty('--carousel-button-bg', buttonBg);
				}
				if (buttonColor && buttonColor.trim() !== '') {
					parent.style.setProperty('--carousel-button-color', buttonColor);
				}
			}
		});
	};

	/**
	 * Convertit une couleur CSS en hexadécimal pour les SVG.
	 */
	const convertColorToHexForSvg = (color) => {
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
				return '#' + [r, g, b].map(x => {
					const hex = x.toString(16);
					return hex.length === 1 ? '0' + hex : hex;
				}).join('');
			}
		}

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
				return '#' + [r, g, b].map(x => {
					const hex = x.toString(16);
					return hex.length === 1 ? '0' + hex : hex;
				}).join('');
			}
		}

		return '#ffffff';
	};

	const resolveCarouselArrowStyleFromElement = (element) => {
		if (!element || !element.classList) {
			return DEFAULT_ARROW_STYLE;
		}

		const iconClass = Array.from(element.classList).find(cls => cls.startsWith('abcs-icon-'));
		if (iconClass) {
			const styleKey = iconClass.replace('abcs-icon-', '');
			return normalizeStyleKey(styleKey);
		}

		return DEFAULT_ARROW_STYLE;
	};

	const resolveArrowColor = (color, docContext) => {
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
	};

	const resolveButtonColorForCarousel = (carousel) => {
		const computedStyle = window.getComputedStyle(carousel);
		let buttonColor = computedStyle.getPropertyValue('--carousel-button-color').trim();

		if (!buttonColor || buttonColor === '') {
			const root = document.documentElement;
			const rootStyle = window.getComputedStyle(root);
			buttonColor = rootStyle.getPropertyValue('--carousel-button-color').trim();
		}

		if (!buttonColor || buttonColor === '') {
			const wpButton = document.querySelector('.wp-element-button, button.wp-element-button');
			if (wpButton) {
				buttonColor = window.getComputedStyle(wpButton).color;
			} else {
				buttonColor = '#ffffff';
			}
		}

		return convertColorToHexForSvg(buttonColor);
	};

	/**
	 * Calcule la distance de défilement pour une diapositive.
	 */
	const getSlideWidth = (carousel) => {
		const firstChild = carousel.firstElementChild;
		if (!firstChild) {
			return 0;
		}
		const computedStyle = window.getComputedStyle(carousel);
		const gap = computedStyle.getPropertyValue('gap') || computedStyle.getPropertyValue('--wp--style--block-gap') || '1rem';
		let gapValue = 0;
		if (gap && gap !== 'normal') {
			const gapNum = parseFloat(gap);
			if (!isNaN(gapNum)) {
				if (gap.includes('rem')) {
					const rootFontSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
					gapValue = gapNum * rootFontSize;
				} else if (gap.includes('em')) {
					const parentFontSize = parseFloat(computedStyle.fontSize) || 16;
					gapValue = gapNum * parentFontSize;
				} else {
					gapValue = gapNum;
				}
			}
		}
		return firstChild.offsetWidth + gapValue;
	};

	/**
	 * Configure l'accessibilité du conteneur du carrousel (A11y).
	 */
	const setupA11y = (carousel) => {
		// Rendre le conteneur focalisable au clavier
		carousel.setAttribute('tabindex', '0');
		carousel.setAttribute('aria-roledescription', 'carousel');
		carousel.setAttribute('aria-label', carousel.getAttribute('aria-label') || 'Carousel');

		// Assigner le rôle slide à chaque enfant direct (sauf boutons et puces)
		const setSlidesA11y = () => {
			Array.from(carousel.children).forEach((child, index) => {
				if (
					!child.classList.contains('abcs-nav-btn') &&
					!child.classList.contains('abcs-markers') &&
					child.nodeType === 1
				) {
					child.setAttribute('aria-roledescription', 'slide');
					child.setAttribute('aria-label', `Slide ${index + 1}`);
				}
			});
		};

		setSlidesA11y();

		// Observer les changements pour appliquer l'A11y sur les nouveaux slides
		if (typeof MutationObserver !== 'undefined') {
			const observer = new MutationObserver(setSlidesA11y);
			observer.observe(carousel, { childList: true });
		}

		// Gestion du défilement avec les touches directionnelles Gauche / Droite
		carousel.addEventListener('keydown', (e) => {
			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				const isLoopEnabled = carousel.getAttribute('data-abcs-loop') === 'true';
				const atStart = carousel.scrollLeft <= 5;
				if (isLoopEnabled && atStart) {
					carousel.style.scrollBehavior = 'auto';
					carousel.scrollTo({ left: carousel.scrollWidth, behavior: 'auto' });
					carousel.style.scrollBehavior = '';
				} else {
					const slideWidth = getSlideWidth(carousel);
					carousel.scrollBy({ left: -slideWidth, behavior: 'smooth' });
				}
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				const isLoopEnabled = carousel.getAttribute('data-abcs-loop') === 'true';
				const atEnd = carousel.scrollLeft + carousel.offsetWidth >= carousel.scrollWidth - 5;
				if (isLoopEnabled && atEnd) {
					carousel.style.scrollBehavior = 'auto';
					carousel.scrollTo({ left: 0, behavior: 'auto' });
					carousel.style.scrollBehavior = '';
				} else {
					const slideWidth = getSlideWidth(carousel);
					carousel.scrollBy({ left: slideWidth, behavior: 'smooth' });
				}
			}
		});
	};

	/**
	 * Injecte les boutons de navigation et les puces pour tous les carrousels.
	 */
	const injectNavigationUI = () => {
		const carousels = document.querySelectorAll('.abcs');

		carousels.forEach(carousel => {
			if (carousel.dataset.abcsNavInitialized) {
				return;
			}

			const parent = carousel.parentElement;
			if (!parent) return;

			const hideArrows = carousel.classList.contains('abcs-hide-arrows');
			const hideMarkers = carousel.classList.contains('abcs-hide-markers');

			if (!hideArrows) {
				injectNavigationButtons(carousel, parent);
			}

			if (!hideMarkers) {
				injectPaginationMarkers(carousel, parent);
			}

			setupA11y(carousel);

			carousel.dataset.abcsNavInitialized = 'true';
		});
	};

	/**
	 * Crée et insère les boutons Précédent/Suivant.
	 */
	const injectNavigationButtons = (carousel, parent) => {
		const arrowStyle = resolveCarouselArrowStyleFromElement(carousel);
		const arrowColor = resolveButtonColorForCarousel(carousel);

		const prevBtn = document.createElement('button');
		prevBtn.className = 'abcs-nav-btn abcs-nav-btn--prev';
		prevBtn.setAttribute('type', 'button');
		prevBtn.setAttribute('aria-label', 'Previous slide');
		prevBtn.innerHTML = generateArrowMarkup('left', arrowColor, arrowStyle);

		const nextBtn = document.createElement('button');
		nextBtn.className = 'abcs-nav-btn abcs-nav-btn--next';
		nextBtn.setAttribute('type', 'button');
		nextBtn.setAttribute('aria-label', 'Next slide');
		nextBtn.innerHTML = generateArrowMarkup('right', arrowColor, arrowStyle);

		parent.appendChild(prevBtn);
		parent.appendChild(nextBtn);

		prevBtn.addEventListener('click', () => {
			const isLoopEnabled = carousel.getAttribute('data-abcs-loop') === 'true';
			const atStart = carousel.scrollLeft <= 5;

			if (isLoopEnabled && atStart) {
				carousel.style.scrollBehavior = 'auto';
				carousel.scrollTo({ left: carousel.scrollWidth, behavior: 'auto' });
				carousel.style.scrollBehavior = '';
			} else {
				const slideWidth = getSlideWidth(carousel);
				carousel.scrollBy({ left: -slideWidth, behavior: 'smooth' });
			}
		});

		nextBtn.addEventListener('click', () => {
			const isLoopEnabled = carousel.getAttribute('data-abcs-loop') === 'true';
			const atEnd = carousel.scrollLeft + carousel.offsetWidth >= carousel.scrollWidth - 5;

			if (isLoopEnabled && atEnd) {
				carousel.style.scrollBehavior = 'auto';
				carousel.scrollTo({ left: 0, behavior: 'auto' });
				carousel.style.scrollBehavior = '';
			} else {
				const slideWidth = getSlideWidth(carousel);
				carousel.scrollBy({ left: slideWidth, behavior: 'smooth' });
			}
		});

		const updateButtonStates = () => {
			const isLoopEnabled = carousel.getAttribute('data-abcs-loop') === 'true';
			const threshold = 5;
			const atStart = carousel.scrollLeft <= threshold;
			const atEnd = carousel.scrollLeft + carousel.offsetWidth >= carousel.scrollWidth - threshold;

			if (isLoopEnabled) {
				prevBtn.disabled = false;
				nextBtn.disabled = false;
			} else {
				prevBtn.disabled = atStart;
				nextBtn.disabled = atEnd;
			}
		};

		updateButtonStates();
		carousel.addEventListener('scroll', updateButtonStates, { passive: true });

		carousel._abcsNavPrev = prevBtn;
		carousel._abcsNavNext = nextBtn;
		carousel._abcsUpdateButtonStates = updateButtonStates;
	};

	/**
	 * Crée et insère les puces de pagination (markers).
	 */
	const injectPaginationMarkers = (carousel, parent) => {
		const children = Array.from(carousel.children).filter(child => {
			return !child.classList.contains('abcs-nav-btn') && !child.classList.contains('abcs-markers');
		});
		if (!children.length) return;

		const markersContainer = document.createElement('div');
		markersContainer.className = 'abcs-markers';
		markersContainer.setAttribute('role', 'tablist');
		markersContainer.setAttribute('aria-label', 'Carousel pagination');

		const markers = [];
		children.forEach((child, i) => {
			const marker = document.createElement('button');
			marker.className = 'abcs-marker';
			marker.setAttribute('role', 'tab');
			marker.setAttribute('type', 'button');
			marker.setAttribute('aria-label', `Slide ${i + 1}`);

			marker.addEventListener('click', () => {
				const slide = children[i];
				if (slide) {
					carousel.scrollTo({
						left: slide.offsetLeft - carousel.offsetLeft,
						behavior: 'smooth'
					});
				}
			});

			markers.push(marker);
			markersContainer.appendChild(marker);
		});

		parent.appendChild(markersContainer);

		setupActiveMarkerTracking(carousel, markers, children);

		carousel._abcsMarkers = markers;
		carousel._abcsMarkersContainer = markersContainer;
	};

	/**
	 * Suit la diapositive active et met en valeur la puce correspondante.
	 */
	const setupActiveMarkerTracking = (carousel, markers, children) => {
		if (!('IntersectionObserver' in window) || !markers.length) {
			if (markers.length) {
				markers[0].classList.add('is-active');
				markers[0].setAttribute('aria-selected', 'true');
			}
			return;
		}

		const observer = new IntersectionObserver(() => {
			const scrollLeft = carousel.scrollLeft;
			const maxScroll = carousel.scrollWidth - carousel.offsetWidth;
			let activeIndex = 0;

			if (scrollLeft >= maxScroll - 10) {
				activeIndex = children.length - 1;
			} else if (scrollLeft <= 10) {
				activeIndex = 0;
			} else {
				let minDistance = Infinity;
				children.forEach((slide, idx) => {
					const slidePos = slide.offsetLeft - carousel.offsetLeft;
					const distance = Math.abs(slidePos - scrollLeft);
					if (distance < minDistance) {
						minDistance = distance;
						activeIndex = idx;
					}
				});
			}

			markers.forEach((marker, index) => {
				if (index === activeIndex) {
					marker.classList.add('is-active');
					marker.setAttribute('aria-selected', 'true');
				} else {
					marker.classList.remove('is-active');
					marker.setAttribute('aria-selected', 'false');
				}
			});
		}, {
			root: carousel,
			threshold: [0, 0.25, 0.5, 0.75, 1],
			rootMargin: '0px'
		});

		children.forEach(child => {
			observer.observe(child);
		});

		carousel._abcsMarkerObserver = observer;
	};

	/**
	 * Met à jour les icônes de navigation.
	 */
	const applyArrowIconsToCarousels = (color, docContext, overrideConfig) => {
		const baseDoc = docContext || document;
		if (!baseDoc) return;

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

				iframeSelectors.forEach(selector => {
					const iframe = document.querySelector(selector);
					if (iframe && iframe.contentDocument) {
						docsToSearch.add(iframe.contentDocument);
					}
				});
			}

			docsToSearch.forEach(searchDoc => {
				try {
					const found = Array.from(searchDoc.querySelectorAll('.abcs'));
					found.forEach(node => {
						if (node) {
							carousels.push(node);
						}
					});
				} catch (e) {
					// Ignorer
				}
			});
		}

		if (!carousels.length) return;

		carousels = Array.from(new Set(carousels));
		carousels.forEach(carousel => {
			if (!carousel) return;

			const parent = carousel.parentElement;
			if (carousel.classList && carousel.classList.contains('abcs-hide-arrows')) {
				return;
			}

			const explicitStyle = overrideConfig && overrideConfig.styleKey ? overrideConfig.styleKey : null;
			const normalizedKey = normalizeStyleKey(explicitStyle || resolveCarouselArrowStyleFromElement(carousel));

			const arrowColor = resolveButtonColorForCarousel(carousel);

			const prevBtn = carousel._abcsNavPrev || (parent ? parent.querySelector('.abcs-nav-btn--prev') : null);
			const nextBtn = carousel._abcsNavNext || (parent ? parent.querySelector('.abcs-nav-btn--next') : null);

			if (prevBtn) {
				prevBtn.innerHTML = generateArrowMarkup('left', arrowColor, normalizedKey);
			}
			if (nextBtn) {
				nextBtn.innerHTML = generateArrowMarkup('right', arrowColor, normalizedKey);
			}

			if (carousel.dataset) {
				carousel.dataset.abcsCarouselArrowStyle = normalizedKey;
				carousel.dataset.abcsArrowStyle = normalizedKey;
			}

			if (parent && parent.dataset) {
				parent.dataset.abcsCarouselArrowStyle = normalizedKey;
				parent.dataset.abcsArrowStyle = normalizedKey;
			}
		});
	};

	// Stockage des intervalles et statuts hors fonctions
	const autoplayIntervals = new WeakMap();
	const autoplayPaused = new WeakMap();
	const interactionTimeout = new WeakMap();
	const autoplayInitialized = new WeakSet();
	const loopResetSetup = new WeakSet();
	const isAutoScrollingMap = new WeakMap();

	/**
	 * Configuration de la boucle de défilement infini pour l'autoplay.
	 */
	const setupLoopReset = (carousel) => {
		if (loopResetSetup.has(carousel)) return;

		const isLoopEnabled = carousel.getAttribute('data-abcs-loop') === 'true';
		if (!isLoopEnabled) return;

		if (!carousel.firstElementChild) return;

		let isResetting = false;
		const autoplayDelay = parseInt(carousel.getAttribute('data-abcs-autoplay-delay'), 10) || 3000;

		const isAtEnd = () => {
			return carousel.scrollLeft + carousel.offsetWidth >= carousel.scrollWidth - 5;
		};

		const resetToStart = () => {
			if (isResetting) return;
			isResetting = true;
			carousel.style.scrollBehavior = 'auto';
			carousel.scrollTo({ left: 0, behavior: 'auto' });
			carousel.style.scrollBehavior = '';
			if (carousel._abcsUpdateButtonStates) {
				carousel._abcsUpdateButtonStates();
			}
			setTimeout(() => {
				isResetting = false;
			}, 100);
		};

		let scrollTimeout = null;
		let wasAtEnd = false;

		const handleScroll = () => {
			if (isResetting) return;

			const atEnd = isAtEnd();
			const isAutoplayActive = isAutoScrollingMap.get(carousel);

			if (scrollTimeout) {
				clearTimeout(scrollTimeout);
			}

			if (wasAtEnd && atEnd && isAutoplayActive) {
				scrollTimeout = setTimeout(() => {
					if (isAtEnd() && !isResetting) {
						setTimeout(() => {
							if (!isResetting) {
								resetToStart();
							}
						}, autoplayDelay);
					}
				}, 200);
			}

			wasAtEnd = atEnd;
		};

		carousel.addEventListener('scroll', handleScroll, { passive: true });

		carousel._abcsLoopCleanup = () => {
			carousel.removeEventListener('scroll', handleScroll);
			if (scrollTimeout) {
				clearTimeout(scrollTimeout);
			}
			loopResetSetup.delete(carousel);
		};

		loopResetSetup.add(carousel);
	};

	const initAutoplay = () => {
		const carousels = document.querySelectorAll('.abcs[data-abcs-autoplay="true"]');

		carousels.forEach(carousel => {
			if (autoplayInitialized.has(carousel)) return;

			if (!carousel.firstElementChild) return;

			const autoplayDelay = parseInt(carousel.getAttribute('data-abcs-autoplay-delay'), 10) || 3000;
			const isLoopEnabled = carousel.getAttribute('data-abcs-loop') === 'true';

			if (isLoopEnabled) {
				setupLoopReset(carousel);
			}

			let intervalId = null;
			let isPaused = false;
			let isHoverPaused = false;
			let interactionTimeoutId = null;
			let isAutoScrolling = false;
			const RESUME_DELAY = 2000;

			const isAtEnd = () => {
				if (isLoopEnabled) return false;
				const threshold = 5;
				return carousel.scrollLeft + carousel.offsetWidth >= carousel.scrollWidth - threshold;
			};

			const scrollToNext = () => {
				const slideWidth = getSlideWidth(carousel);
				if (slideWidth === 0) return;

				const currentScroll = carousel.scrollLeft;
				const nextScroll = currentScroll + slideWidth;

				if (!isLoopEnabled) {
					const threshold = 5;
					const isAtEndNow = currentScroll + carousel.offsetWidth >= carousel.scrollWidth - threshold;
					if (isAtEndNow) {
						if (intervalId) {
							clearInterval(intervalId);
							intervalId = null;
							autoplayIntervals.delete(carousel);
						}
						return;
					}
				}

				isAutoScrolling = true;
				isAutoScrollingMap.set(carousel, true);
				carousel.scrollTo({
					left: nextScroll,
					behavior: 'smooth'
				});

				setTimeout(() => {
					isAutoScrolling = false;
					isAutoScrollingMap.set(carousel, false);
				}, 700);
			};

			const startAutoplay = () => {
				if (intervalId || (!isLoopEnabled && isAtEnd())) return;

				intervalId = setInterval(() => {
					if (!isPaused) {
						scrollToNext();
					}
				}, autoplayDelay);
				autoplayIntervals.set(carousel, intervalId);
			};

			const pauseAutoplay = () => {
				isPaused = true;
				autoplayPaused.set(carousel, true);
			};

			const resumeAutoplay = () => {
				if (!isLoopEnabled && isAtEnd()) return;
				isPaused = false;
				autoplayPaused.delete(carousel);
			};

			const handleInteraction = () => {
				if (isAutoScrolling || isAutoScrollingMap.get(carousel)) return;

				pauseAutoplay();

				if (interactionTimeoutId) {
					clearTimeout(interactionTimeoutId);
				}

				interactionTimeoutId = setTimeout(() => {
					if (!isHoverPaused) {
						resumeAutoplay();
					}
					interactionTimeoutId = null;
				}, RESUME_DELAY);

				interactionTimeout.set(carousel, interactionTimeoutId);
			};

			const handleMouseEnter = () => {
				isHoverPaused = true;
				pauseAutoplay();
			};
			const handleMouseLeave = () => {
				isHoverPaused = false;
				if (isLoopEnabled || !isAtEnd()) {
					resumeAutoplay();
				}
			};

			carousel.addEventListener('mouseenter', handleMouseEnter);
			carousel.addEventListener('mouseleave', handleMouseLeave);
			carousel.addEventListener('scroll', handleInteraction, { passive: true });
			carousel.addEventListener('touchstart', handleInteraction, { passive: true });
			carousel.addEventListener('mousedown', handleInteraction);

			startAutoplay();
			autoplayInitialized.add(carousel);

			carousel._abcsAutoplayCleanup = () => {
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
	};

	const initCarousel = () => {
		injectMinWidthVariables();
		injectPaddingVariables();
		injectNavigationUI();
		applyArrowIconsToCarousels(null, document);

		const loopCarousels = document.querySelectorAll('.abcs[data-abcs-loop="true"]');
		loopCarousels.forEach(carousel => {
			if (carousel.firstElementChild) {
				setupLoopReset(carousel);
			}
		});

		initAutoplay();
	};

	const initWhenReady = () => {
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => {
				requestAnimationFrame(() => {
					requestAnimationFrame(initCarousel);
				});
			});
		} else {
			requestAnimationFrame(() => {
				requestAnimationFrame(initCarousel);
			});
		}
	};

	initWhenReady();

	window.addEventListener('load', () => {
		const carousels = document.querySelectorAll('.abcs.abcs-min-width');
		let needsMinWidthUpdate = false;
		carousels.forEach(carousel => {
			const minWidth = window.getComputedStyle(carousel).getPropertyValue('--carousel-min-width');
			if (!minWidth || minWidth.trim() === '') {
				needsMinWidthUpdate = true;
			}
		});

		if (needsMinWidthUpdate) {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					initCarousel();
				});
			});
		} else {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					injectPaddingVariables();
					applyArrowIconsToCarousels(null, document);
					initAutoplay();
				});
			});
		}
	});

	const setupAutoplayObserver = () => {
		if (typeof MutationObserver === 'undefined') return;

		const observer = new MutationObserver(mutations => {
			let shouldInit = false;
			mutations.forEach(mutation => {
				mutation.addedNodes.forEach(node => {
					if (node.nodeType === 1) {
						if (node.classList && node.classList.contains('abcs')) {
							shouldInit = true;
						}
						if (node.querySelectorAll && node.querySelectorAll('.abcs').length > 0) {
							shouldInit = true;
						}
					}
				});
			});

			if (shouldInit) {
				requestAnimationFrame(() => {
					injectNavigationUI();
					applyArrowIconsToCarousels(null, document);
					initAutoplay();

					const loopCarousels = document.querySelectorAll('.abcs[data-abcs-loop="true"]');
					loopCarousels.forEach(carousel => {
						if (carousel.firstElementChild && !loopResetSetup.has(carousel)) {
							setupLoopReset(carousel);
						}
					});
				});
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', setupAutoplayObserver);
	} else {
		setupAutoplayObserver();
	}

	if (typeof window !== 'undefined') {
		window.abcsCarousel = window.abcsCarousel || {};
		window.abcsCarousel.applyArrowIconsToCarousels = (color, context, overrideConfig) => {
			const normalizedConfig = overrideConfig ? {
				...overrideConfig,
				styleKey: normalizeStyleKey(overrideConfig.styleKey),
			} : overrideConfig;
			applyArrowIconsToCarousels(color, context || document, normalizedConfig);
		};
		window.abcsCarousel.initAutoplay = initAutoplay;
		window.abcsCarousel.injectNavigationUI = injectNavigationUI;
	}
})();
