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
	 * Extracts minimumColumnWidth value from grid-template-columns.
	 * WordPress generates: grid-template-columns: repeat(auto-fill, minmax(min(38rem, 100%), 1fr))
	 */
	const extractMinWidthFromGridTemplateColumns = (gridTemplateColumns) => {
		if (!gridTemplateColumns || gridTemplateColumns === 'none') {
			return null;
		}

		// Search for minmax(min(XXX, 100%), 1fr)
		const match = gridTemplateColumns.match(/minmax\(min\(([^,]+),\s*100%\)/);
		return match && match[1] ? match[1].trim() : null;
	};

	/**
	 * Searches stylesheets for the grid-template-columns CSS rule of a carousel.
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
				// Ignore CORS errors for external stylesheets
				continue;
			}
		}

		return null;
	};

	/**
	 * Injects --carousel-min-width for carousels using minimumColumnWidth mode.
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
	 * Resolves a single horizontal gap value from computed styles.
	 * Handles Safari returning dual values for gap shorthand (e.g. "19.2px 19.2px").
	 */
	const resolveSingleHorizontalGap = (computedStyle) => {
		if (!computedStyle) return null;

		const columnGap = computedStyle.columnGap;
		if (columnGap && columnGap !== 'normal' && columnGap.trim() !== '') {
			const parts = columnGap.trim().split(/\s+/);
			return parts[0];
		}

		const gap = computedStyle.gap;
		if (gap && gap !== 'normal' && gap.trim() !== '') {
			const parts = gap.trim().split(/\s+/);
			// CSS shorthand syntax is: gap: <row-gap> <column-gap>
			// For horizontal carousels, use column-gap (2nd value) if present, else row-gap (1st value)
			return parts.length > 1 ? parts[1] : parts[0];
		}

		const rowGap = computedStyle.rowGap;
		if (rowGap && rowGap !== 'normal' && rowGap.trim() !== '') {
			const parts = rowGap.trim().split(/\s+/);
			return parts[0];
		}

		return null;
	};

	/**
	 * Injects padding variables by reading computed values directly.
	 */
	const injectPaddingVariables = () => {
		const carousels = document.querySelectorAll('.abcs');

		carousels.forEach(carousel => {
			const computedStyle = window.getComputedStyle(carousel);

			const singleHorizontalGap = resolveSingleHorizontalGap(computedStyle);
			if (singleHorizontalGap) {
				carousel.style.setProperty('--wp--style--block-gap', singleHorizontalGap);
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
	 * Converts CSS color string to hexadecimal for SVGs.
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
	 * Calculates scroll step width for a slide.
	 */
	const getSlideWidth = (carousel) => {
		const firstChild = Array.from(carousel.children).find(child => {
			return !child.classList.contains('abcs-nav-btn') && !child.classList.contains('abcs-markers');
		}) || carousel.firstElementChild;
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
	 * Detects whether carousel is in an RTL (Right-to-Left) context.
	 */
	const isRtlMode = (carousel) => {
		return window.getComputedStyle(carousel).direction === 'rtl';
	};

	/**
	 * Returns normalized scroll position (distance in pixels from start).
	 */
	const getScrollProgress = (carousel) => {
		return Math.abs(carousel.scrollLeft);
	};

	/**
	 * Checks if carousel is at its start position.
	 */
	const isAtStart = (carousel, threshold = 5) => {
		return getScrollProgress(carousel) <= threshold;
	};

	/**
	 * Checks if carousel is at its end position.
	 */
	const isAtEnd = (carousel, threshold = 5) => {
		const maxScroll = carousel.scrollWidth - carousel.offsetWidth;
		return getScrollProgress(carousel) >= maxScroll - threshold;
	};

	/**
	 * Checks if user prefers reduced motion (A11y / WCAG).
	 */
	const prefersReducedMotion = () => {
		return typeof window !== 'undefined' &&
			typeof window.matchMedia === 'function' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	};

	/**
	 * Returns scroll behavior respecting user motion preferences.
	 */
	const getScrollBehavior = (preferred = 'smooth') => {
		return prefersReducedMotion() ? 'auto' : preferred;
	};

	/**
	 * Resets carousel scroll position to start (Slide 1).
	 */
	const scrollToStart = (carousel, behavior = 'auto') => {
		const effectiveBehavior = prefersReducedMotion() ? 'auto' : behavior;
		carousel.style.scrollBehavior = effectiveBehavior;
		carousel.scrollTo({ left: 0, behavior: effectiveBehavior });
		carousel.style.scrollBehavior = '';
	};

	/**
	 * Scrolls carousel all the way to the end (Last slide).
	 */
	const scrollToEnd = (carousel, behavior = 'auto') => {
		const isRtl = isRtlMode(carousel);
		const maxScroll = carousel.scrollWidth - carousel.offsetWidth;
		const effectiveBehavior = prefersReducedMotion() ? 'auto' : behavior;
		carousel.style.scrollBehavior = effectiveBehavior;
		carousel.scrollTo({ left: isRtl ? -maxScroll : maxScroll, behavior: effectiveBehavior });
		carousel.style.scrollBehavior = '';
	};

	/**
	 * Sets up accessibility attributes for carousel container (A11y).
	 */
	const setupA11y = (carousel) => {
		// Make container keyboard focusable
		carousel.setAttribute('tabindex', '0');
		carousel.setAttribute('aria-roledescription', 'carousel');
		carousel.setAttribute('aria-label', carousel.getAttribute('aria-label') || 'Carousel');

		// Assign slide role to every direct element child (excluding buttons and markers)
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

		// Observe DOM changes to apply A11y on dynamically added slides
		if (typeof MutationObserver !== 'undefined') {
			const observer = new MutationObserver(setSlidesA11y);
			observer.observe(carousel, { childList: true });
		}

		// Handle left/right arrow key navigation
		carousel.addEventListener('keydown', (e) => {
			const isMobileOnly = carousel.getAttribute('data-abcs-mobile-only') === 'true' || carousel.classList.contains('abcs-mobile-only');
			if (isMobileOnly && window.innerWidth >= 782) {
				return;
			}
			const isLoopEnabled = carousel.getAttribute('data-abcs-loop') === 'true';
			const isRtl = isRtlMode(carousel);

			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				if (isRtl) {
					if (isLoopEnabled && isAtEnd(carousel)) {
						scrollToStart(carousel);
					} else {
						const slideWidth = getSlideWidth(carousel);
						carousel.scrollBy({ left: -slideWidth, behavior: getScrollBehavior('smooth') });
					}
				} else {
					if (isLoopEnabled && isAtStart(carousel)) {
						scrollToEnd(carousel);
					} else {
						const slideWidth = getSlideWidth(carousel);
						carousel.scrollBy({ left: -slideWidth, behavior: getScrollBehavior('smooth') });
					}
				}
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				if (isRtl) {
					if (isLoopEnabled && isAtStart(carousel)) {
						scrollToEnd(carousel);
					} else {
						const slideWidth = getSlideWidth(carousel);
						carousel.scrollBy({ left: slideWidth, behavior: getScrollBehavior('smooth') });
					}
				} else {
					if (isLoopEnabled && isAtEnd(carousel)) {
						scrollToStart(carousel);
					} else {
						const slideWidth = getSlideWidth(carousel);
						carousel.scrollBy({ left: slideWidth, behavior: getScrollBehavior('smooth') });
					}
				}
			}
		});
	};

	/**
	 * Injects navigation buttons and pagination markers for all carousels.
	 */
	const injectNavigationUI = () => {
		const carousels = document.querySelectorAll('.abcs');

		carousels.forEach(carousel => {
			if (carousel.dataset.abcsNavInitialized) {
				return;
			}

			const parent = carousel.parentElement;
			if (!parent) return;

			if (carousel.classList.contains('abcs-mobile-only')) {
				parent.classList.add('abcs-parent-mobile-only');
			}

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
	 * Creates and inserts Previous/Next navigation buttons.
	 */
	const injectNavigationButtons = (carousel, parent) => {
		const arrowStyle = resolveCarouselArrowStyleFromElement(carousel);
		const arrowColor = resolveButtonColorForCarousel(carousel);
		const isRtl = isRtlMode(carousel);

		const prevBtn = document.createElement('button');
		prevBtn.className = 'abcs-nav-btn abcs-nav-btn--prev';
		prevBtn.setAttribute('type', 'button');
		prevBtn.setAttribute('aria-label', isRtl ? 'Next slide' : 'Previous slide');
		prevBtn.innerHTML = generateArrowMarkup('left', arrowColor, arrowStyle);

		const nextBtn = document.createElement('button');
		nextBtn.className = 'abcs-nav-btn abcs-nav-btn--next';
		nextBtn.setAttribute('type', 'button');
		nextBtn.setAttribute('aria-label', isRtl ? 'Previous slide' : 'Next slide');
		nextBtn.innerHTML = generateArrowMarkup('right', arrowColor, arrowStyle);

		parent.appendChild(prevBtn);
		parent.appendChild(nextBtn);

		// prevBtn: physical left button (left arrow icon)
		prevBtn.addEventListener('click', () => {
			const isLoopEnabled = carousel.getAttribute('data-abcs-loop') === 'true';
			const isRtlCurrent = isRtlMode(carousel);

			if (isRtlCurrent) {
				// In RTL, moving left means advancing toward the end
				if (isLoopEnabled && isAtEnd(carousel)) {
					scrollToStart(carousel);
				} else {
					const slideWidth = getSlideWidth(carousel);
					carousel.scrollBy({ left: -slideWidth, behavior: getScrollBehavior('smooth') });
				}
			} else {
				// In LTR, moving left means rewinding toward the start
				if (isLoopEnabled && isAtStart(carousel)) {
					scrollToEnd(carousel);
				} else {
					const slideWidth = getSlideWidth(carousel);
					carousel.scrollBy({ left: -slideWidth, behavior: getScrollBehavior('smooth') });
				}
			}
		});

		// nextBtn: physical right button (right arrow icon)
		nextBtn.addEventListener('click', () => {
			const isLoopEnabled = carousel.getAttribute('data-abcs-loop') === 'true';
			const isRtlCurrent = isRtlMode(carousel);

			if (isRtlCurrent) {
				// In RTL, moving right means rewinding toward the start
				if (isLoopEnabled && isAtStart(carousel)) {
					scrollToEnd(carousel);
				} else {
					const slideWidth = getSlideWidth(carousel);
					carousel.scrollBy({ left: slideWidth, behavior: getScrollBehavior('smooth') });
				}
			} else {
				// In LTR, moving right means advancing toward the end
				if (isLoopEnabled && isAtEnd(carousel)) {
					scrollToStart(carousel);
				} else {
					const slideWidth = getSlideWidth(carousel);
					carousel.scrollBy({ left: slideWidth, behavior: getScrollBehavior('smooth') });
				}
			}
		});

		const updateButtonStates = () => {
			const isLoopEnabled = carousel.getAttribute('data-abcs-loop') === 'true';
			const isRtlCurrent = isRtlMode(carousel);

			if (isLoopEnabled) {
				prevBtn.disabled = false;
				nextBtn.disabled = false;
			} else {
				if (isRtlCurrent) {
					// In RTL: end is on the left (prevBtn), start is on the right (nextBtn)
					prevBtn.disabled = isAtEnd(carousel);
					nextBtn.disabled = isAtStart(carousel);
				} else {
					// In LTR: start is on the left (prevBtn), end is on the right (nextBtn)
					prevBtn.disabled = isAtStart(carousel);
					nextBtn.disabled = isAtEnd(carousel);
				}
			}
		};

		updateButtonStates();
		carousel.addEventListener('scroll', updateButtonStates, { passive: true });

		carousel._abcsNavPrev = prevBtn;
		carousel._abcsNavNext = nextBtn;
		carousel._abcsUpdateButtonStates = updateButtonStates;
	};

	/**
	 * Creates and inserts pagination markers (dots).
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
				if (slide && children[0]) {
					const targetScroll = slide.offsetLeft - children[0].offsetLeft;
					carousel.scrollTo({
						left: targetScroll,
						behavior: getScrollBehavior('smooth')
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
	 * Tracks the active slide and highlights the corresponding marker dot.
	 */
	const setupActiveMarkerTracking = (carousel, markers, children) => {
		if (!markers.length || !children.length) return;

		const updateActiveMarker = () => {
			if (!children[0]) return;

			let activeIndex = 0;

			if (isAtEnd(carousel)) {
				activeIndex = children.length - 1;
			} else if (isAtStart(carousel)) {
				activeIndex = 0;
			} else {
				const currentScroll = carousel.scrollLeft;
				let minDistance = Infinity;

				children.forEach((slide, idx) => {
					const slideTarget = slide.offsetLeft - children[0].offsetLeft;
					const distance = Math.abs(slideTarget - currentScroll);
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
		};

		// Initial state
		updateActiveMarker();

		// Real-time update on scroll
		carousel.addEventListener('scroll', updateActiveMarker, { passive: true });

		// Fallback IntersectionObserver for observing slides
		if ('IntersectionObserver' in window) {
			const observer = new IntersectionObserver(() => {
				updateActiveMarker();
			}, {
				root: carousel,
				threshold: [0, 0.25, 0.5, 0.75, 1],
				rootMargin: '0px'
			});

			children.forEach(child => {
				observer.observe(child);
			});

			carousel._abcsMarkerObserver = observer;
		}
	};

	/**
	 * Updates navigation icons.
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
					// Ignore
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

	// Out-of-function storage for intervals and statuses
	const autoplayIntervals = new WeakMap();
	const autoplayPaused = new WeakMap();
	const interactionTimeout = new WeakMap();
	const autoplayInitialized = new WeakSet();
	const loopResetSetup = new WeakSet();
	const isAutoScrollingMap = new WeakMap();

	/**
	 * Setup infinite loop reset for autoplay.
	 */
	const setupLoopReset = (carousel) => {
		if (loopResetSetup.has(carousel)) return;

		const isLoopEnabled = carousel.getAttribute('data-abcs-loop') === 'true';
		if (!isLoopEnabled) return;

		if (!carousel.firstElementChild) return;

		let isResetting = false;
		const autoplayDelay = parseInt(carousel.getAttribute('data-abcs-autoplay-delay'), 10) || 3000;

		const resetToStart = () => {
			if (isResetting) return;
			isResetting = true;
			scrollToStart(carousel, 'auto');
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
			// Automatic loop wrapping is now handled deterministically inside scrollToNext()
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

			const scrollToNext = () => {
				const slideWidth = getSlideWidth(carousel);
				if (slideWidth === 0) return;
				const isRtl = isRtlMode(carousel);

				// If the end of the carousel is reached
				if (isAtEnd(carousel)) {
					if (isLoopEnabled) {
						// Smooth loop wrapping back to the beginning
						isAutoScrolling = true;
						isAutoScrollingMap.set(carousel, true);
						scrollToStart(carousel, getScrollBehavior('smooth'));
						setTimeout(() => {
							isAutoScrolling = false;
							isAutoScrollingMap.set(carousel, false);
						}, 700);
					} else if (intervalId) {
						// Without loop, stop autoplay
						clearInterval(intervalId);
						intervalId = null;
						autoplayIntervals.delete(carousel);
					}
					return;
				}

				isAutoScrolling = true;
				isAutoScrollingMap.set(carousel, true);
				carousel.scrollBy({
					left: isRtl ? -slideWidth : slideWidth,
					behavior: getScrollBehavior('smooth')
				});

				setTimeout(() => {
					isAutoScrolling = false;
					isAutoScrollingMap.set(carousel, false);
				}, 700);
			};

			const isMobileOnly = carousel.getAttribute('data-abcs-mobile-only') === 'true' || carousel.classList.contains('abcs-mobile-only');

			const startAutoplay = () => {
				if (intervalId || (!isLoopEnabled && isAtEnd(carousel))) return;
				if (prefersReducedMotion()) return;
				if (isMobileOnly && window.innerWidth >= 782) return;

				intervalId = setInterval(() => {
					if (isMobileOnly && window.innerWidth >= 782) return;
					if (!isPaused && !prefersReducedMotion()) {
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
				if (!isLoopEnabled && isAtEnd(carousel)) return;
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
				if (isLoopEnabled || !isAtEnd(carousel)) {
					resumeAutoplay();
				}
			};

			carousel.addEventListener('mouseenter', handleMouseEnter);
			carousel.addEventListener('mouseleave', handleMouseLeave);
			carousel.addEventListener('scroll', handleInteraction, { passive: true });
			carousel.addEventListener('touchstart', handleInteraction, { passive: true });
			carousel.addEventListener('mousedown', handleInteraction);

			let motionMediaQuery = null;
			let motionListener = null;
			if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
				try {
					motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
					motionListener = (e) => {
						if (e.matches) {
							pauseAutoplay();
						} else if (!isHoverPaused && (isLoopEnabled || !isAtEnd(carousel))) {
							resumeAutoplay();
						}
					};
					if (typeof motionMediaQuery.addEventListener === 'function') {
						motionMediaQuery.addEventListener('change', motionListener);
					} else if (typeof motionMediaQuery.addListener === 'function') {
						motionMediaQuery.addListener(motionListener);
					}
				} catch (e) {
					// Ignore older environments
				}
			}

			startAutoplay();
			autoplayInitialized.add(carousel);

			carousel._abcsAutoplayCleanup = () => {
				if (motionMediaQuery && motionListener) {
					if (typeof motionMediaQuery.removeEventListener === 'function') {
						motionMediaQuery.removeEventListener('change', motionListener);
					} else if (typeof motionMediaQuery.removeListener === 'function') {
						motionMediaQuery.removeListener(motionListener);
					}
				}
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
