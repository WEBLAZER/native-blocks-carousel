/**
 * Adds a "Carousel" toggle to Group, Post Template and Gallery blocks
 * to easily enable/disable the .abcs class.
 */
(function (wp) {
  const { addFilter } = wp.hooks;
  const { createHigherOrderComponent } = wp.compose;
  const { Fragment, useEffect, useMemo, createElement, RawHTML } = wp.element;
  const { InspectorControls, BlockListBlock } = wp.blockEditor;
  const { PanelBody, ToggleControl, RangeControl, Tooltip, __experimentalToggleGroupControl: ToggleGroupControl, __experimentalToggleGroupControlOption: ToggleGroupControlOption, __experimentalToggleGroupControlOptionIcon: ToggleGroupControlOptionIcon } = wp.components;
  const { __ } = wp.i18n;

  /**
   * Supported blocks for the carousel.
   */
  const SUPPORTED_BLOCKS = ['core/group', 'core/post-template', 'core/gallery'];

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
    'angles-right-solid-full': 'angles',
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

  const findBlockWrapperElements = (rootDoc, targetClientId) => {
    if (!targetClientId) {
      return [];
    }

    const results = new Set();

    const collectFromDocument = (searchDoc) => {
      if (!searchDoc || typeof searchDoc.querySelectorAll !== 'function') {
        return;
      }
      const matches = searchDoc.querySelectorAll(`[data-block="${targetClientId}"]`);
      matches.forEach((node) => {
        if (node) {
          results.add(node);
        }
      });
    };

    collectFromDocument(rootDoc);

    if (rootDoc === document) {
      const iframeSelectors = [
        '.editor-canvas iframe',
        'iframe[name="editor-canvas"]',
        '.edit-site-visual-editor__editor-canvas',
      ];

      iframeSelectors.forEach((selector) => {
        try {
          const iframe = document.querySelector(selector);
          if (!iframe) {
            return;
          }

          const iframeDoc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document) || null;
          collectFromDocument(iframeDoc);
        } catch (error) {
          // Ignore cross-origin or unavailable iframe documents
        }
      });
    }

    return Array.from(results);
  };

  /**
   * Registers the `carouselEnabled` attribute on supported blocks.
   */
  function addCarouselAttribute(settings, name) {
    if (!SUPPORTED_BLOCKS.includes(name)) {
      return settings;
    }

    return {
      ...settings,
      attributes: {
        ...settings.attributes,
        carouselEnabled: {
          type: 'boolean',
          default: false,
        },
        carouselArrowStyle: {
          type: 'string',
          default: DEFAULT_ARROW_STYLE,
        },
        carouselShowArrows: {
          type: 'boolean',
          default: true,
        },
        carouselShowMarkers: {
          type: 'boolean',
          default: true,
        },
        carouselLoop: {
          type: 'boolean',
          default: false,
        },
        carouselAutoplay: {
          type: 'boolean',
          default: false,
        },
        carouselAutoplayDelay: {
          type: 'number',
          default: 3000,
        },
      },
    };
  }

  /**
   * Adds the toggle to the block inspector.
   */
  const withCarouselControl = createHigherOrderComponent((BlockEdit) => {
    return (props) => {
      const { attributes, setAttributes, name, clientId } = props;

      // Applies only to supported blocks
      if (!SUPPORTED_BLOCKS.includes(name)) {
        return createElement(BlockEdit, props);
      }

      const {
        carouselEnabled,
        carouselArrowStyle = DEFAULT_ARROW_STYLE,
        carouselShowArrows = true,
        carouselShowMarkers = true,
        carouselLoop = false,
        carouselAutoplay = false,
        carouselAutoplayDelay = 3000,
      } = attributes;
      const normalizedArrowStyle = wp.element.useMemo(
        () => normalizeStyleKey(carouselArrowStyle),
        [carouselArrowStyle]
      );

      useEffect(() => {
        if (carouselArrowStyle !== normalizedArrowStyle) {
          setAttributes({ carouselArrowStyle: normalizedArrowStyle });
        }
      }, [carouselArrowStyle, normalizedArrowStyle, setAttributes]);

      const arrowStyleOptions = [
        {
          value: 'chevron',
          label: __('Chevron', 'native-blocks-carousel'),
        },
        {
          value: 'arrow',
          label: __('Arrow', 'native-blocks-carousel'),
        },
        {
          value: 'angles',
          label: __('Angles', 'native-blocks-carousel'),
        },
      ];

      const ArrowOptionComponent = ToggleGroupControlOptionIcon || ToggleGroupControlOption;

      const buildIconElement = (styleKey) => {
        const rightArrow = generateArrowMarkup('right', 'currentColor', styleKey);

        return createElement(
          'span',
          { className: 'abcs-arrow-style-icon' },
          createElement(RawHTML, { children: rightArrow })
        );
      };

      // Memoize the layout serialization to avoid unnecessary re-renders
      const layoutKey = useMemo(
        () => JSON.stringify(attributes.layout),
        [attributes.layout?.type, attributes.layout?.columnCount, attributes.layout?.minimumColumnWidth, attributes.layout?.gridItemPosition]
      );

      /**
       * Toggle the carousel: add/remove the 'carousel' class.
       * For grids, automatically detect the number of columns.
       */
      const toggleCarousel = (enabled) => {
        setAttributes({ carouselEnabled: enabled });

        if (enabled) {
          const normalizedStyle = normalizeStyleKey(attributes.carouselArrowStyle);
          if (normalizedStyle !== attributes.carouselArrowStyle) {
            setAttributes({
              carouselArrowStyle: normalizedStyle,
            });
          }
        }

        // Handle the CSS classes
        const currentClasses = attributes.className || '';
        const classArray = currentClasses.split(' ').filter(Boolean);

        // Remove all existing carousel-* classes (new and legacy)
        const filteredClasses = classArray.filter(
          (cls) =>
            !cls.startsWith('abcs-cols-') &&
            cls !== 'abcs-min-width' &&
            // Remove legacy classes kept for migration purposes
            !cls.startsWith('carousel-cols-') &&
            cls !== 'carousel-min-width' &&
            !cls.startsWith('abcs-icon-') &&
            cls !== 'abcs-hide-arrows' &&
            cls !== 'abcs-hide-markers'
        );

        if (enabled) {
          // Add the 'abcs' class if it is not already present
          if (!filteredClasses.includes('abcs')) {
            filteredClasses.push('abcs');
          }

          // For galleries, detect and add the abcs-cols-X class
          if (name === 'core/gallery') {
            const columnCount = attributes.columns;

            // If a column count is defined (up to 8 columns)
            if (columnCount && columnCount >= 1 && columnCount <= 8) {
              filteredClasses.push(`abcs-cols-${columnCount}`);
            }
            // Otherwise default to 3 columns
            else {
              filteredClasses.push('abcs-cols-3');
            }
          }

          // For grids (Group and Post Template), detect and add the abcs-cols-X class
          if (
            (name === 'core/group' || name === 'core/post-template') &&
            attributes.layout?.type === 'grid'
          ) {
            const columnCount = attributes.layout?.columnCount;
            const minimumColumnWidth = attributes.layout?.minimumColumnWidth;
            const gridItemPosition = attributes.layout?.gridItemPosition;

            // Check whether we are in Auto mode (gridItemPosition === 'auto')
            // or if minimumColumnWidth is defined (implicit Auto mode)
            const isAutoMode = gridItemPosition === 'auto' || (minimumColumnWidth && !columnCount);

            // If a column count is defined (up to 16 columns) and we are not in Auto mode
            if (columnCount && columnCount >= 1 && columnCount <= 16 && !isAutoMode) {
              filteredClasses.push(`abcs-cols-${columnCount}`);
            }
            // If a minimum width is defined or we are in Auto mode
            else if (minimumColumnWidth || isAutoMode) {
              filteredClasses.push('abcs-min-width');
            }
            // Otherwise default to 3 columns
            else {
              filteredClasses.push('abcs-cols-3');
            }
          }
        } else {
          // Remove the 'abcs' class
          const index = filteredClasses.indexOf('abcs');
          if (index > -1) {
            filteredClasses.splice(index, 1);
          }
        }

        setAttributes({
          className: filteredClasses.join(' ').trim(),
        });
      };

      /**
       * Keep the abcs-cols-X class in sync when column counts change.
       */
      useEffect(() => {
        if (!carouselEnabled) {
          return;
        }

        const currentClasses = attributes.className || '';
        const classArray = currentClasses.split(' ').filter(Boolean);

        // Find the current abcs-cols-* class
        const currentColsClass = classArray.find((cls) =>
          cls.startsWith('abcs-cols-')
        );
        const hasMinWidthClass = classArray.includes('abcs-min-width');

        let expectedColsClass = null;
        let shouldHaveMinWidthClass = false;

        // Gallery handling
        if (name === 'core/gallery') {
          const columnCount = attributes.columns;

          // If a column count is defined (up to 8 columns)
          if (columnCount && columnCount >= 1 && columnCount <= 8) {
            expectedColsClass = `abcs-cols-${columnCount}`;
          }
          // Otherwise default to 3 columns
          else {
            expectedColsClass = 'abcs-cols-3';
          }
        }

        // Grid handling (Group and Post Template)
        if (
          (name === 'core/group' || name === 'core/post-template') &&
          attributes.layout?.type === 'grid'
        ) {
          const columnCount = attributes.layout?.columnCount;
          const minimumColumnWidth = attributes.layout?.minimumColumnWidth;
          const gridItemPosition = attributes.layout?.gridItemPosition;

          // IMPORTANT: if columnCount is defined, ignore minimumColumnWidth and gridItemPosition
          // because they may originate from a previous list layout and must not affect manual grids
          if (columnCount && columnCount >= 1 && columnCount <= 16) {
            // Manual grid mode: ignore minimumColumnWidth and gridItemPosition
            expectedColsClass = `abcs-cols-${columnCount}`;
            shouldHaveMinWidthClass = false;
          }
          // If no columnCount, check whether we are in Auto mode
          else {
            // Check if we are in Auto mode (gridItemPosition === 'auto')
            // or if minimumColumnWidth is defined (implicit Auto mode)
            const isAutoMode = gridItemPosition === 'auto' || minimumColumnWidth;

            if (isAutoMode) {
              expectedColsClass = null;
              shouldHaveMinWidthClass = true;
            }
            // Otherwise default to 3 columns
            else {
              expectedColsClass = 'abcs-cols-3';
              shouldHaveMinWidthClass = false;
            }
          }
        }

        // If the classes do not match expectations, update them
        if (currentColsClass !== expectedColsClass || hasMinWidthClass !== shouldHaveMinWidthClass) {
          const filteredClasses = classArray.filter(
            (cls) =>
              !cls.startsWith('abcs-cols-') &&
              cls !== 'abcs-min-width' &&
              // Remove legacy classes kept for migration purposes
              !cls.startsWith('carousel-cols-') &&
              cls !== 'carousel-min-width'
          );

          // Add the new class if needed
          if (expectedColsClass) {
            filteredClasses.push(expectedColsClass);
          }
          if (shouldHaveMinWidthClass) {
            filteredClasses.push('abcs-min-width');
          }

          setAttributes({
            className: filteredClasses.join(' ').trim(),
          });
        }
      }, [
        carouselEnabled,
        name,
        attributes.columns, // For galleries
        layoutKey, // For grids
      ]);

      useEffect(() => {
        const currentClasses = attributes.className || '';
        const classArray = currentClasses.split(' ').filter(Boolean);
        const baseClasses = classArray.filter(
          (cls) =>
            !cls.startsWith('abcs-icon-') &&
            cls !== 'abcs-hide-arrows' &&
            cls !== 'abcs-hide-markers'
        );
        const normalizedStyle = normalizedArrowStyle;
        const desiredClass = `abcs-icon-${normalizedStyle}`;

        let nextClasses = [...baseClasses];

        if (carouselEnabled) {
          if (carouselShowArrows) {
            if (!nextClasses.includes(desiredClass)) {
              nextClasses.push(desiredClass);
            }
          } else if (!nextClasses.includes('abcs-hide-arrows')) {
            nextClasses.push('abcs-hide-arrows');
          }

          if (!carouselShowMarkers && !nextClasses.includes('abcs-hide-markers')) {
            nextClasses.push('abcs-hide-markers');
          }
        }

        const nextClassName = nextClasses.join(' ').trim();
        const currentClassName = classArray.join(' ').trim();

        if (nextClassName !== currentClassName) {
          setAttributes({
            className: nextClassName,
          });
        }

        if (!carouselEnabled || !carouselShowArrows) {
          return;
        }

        if (typeof window !== 'undefined') {
          const doc = document;
          if (doc && typeof requestAnimationFrame === 'function') {
            const runUpdate = () => {
              const blockWrappers = findBlockWrapperElements(doc, clientId);
              if (!blockWrappers.length) {
                return;
              }

              const carouselsByDocument = new Map();

              blockWrappers.forEach((wrapper) => {
                if (!wrapper) {
                  return;
                }

                const potentialTargets = [];

                if (wrapper.classList && wrapper.classList.contains('abcs')) {
                  potentialTargets.push(wrapper);
                }

                const descendants = wrapper.querySelectorAll('.abcs');
                descendants.forEach((node) => {
                  potentialTargets.push(node);
                });

                potentialTargets.forEach((carouselNode) => {
                  if (!carouselNode) {
                    return;
                  }

                  const ownerDocument = carouselNode.ownerDocument || doc;
                  if (!carouselsByDocument.has(ownerDocument)) {
                    carouselsByDocument.set(ownerDocument, new Set());
                  }

                  carouselsByDocument.get(ownerDocument).add(carouselNode);
                });
              });

              if (!carouselsByDocument.size) {
                return;
              }

              carouselsByDocument.forEach((carouselSet, ownerDocument) => {
                const elements = Array.from(carouselSet);
                if (!elements.length) {
                  return;
                }

                const config = {
                  styleKey: normalizedStyle,
                  elements,
                };

                applyArrowIconsToCarousels(null, ownerDocument, config);

                setTimeout(() => {
                  applyArrowIconsToCarousels(null, ownerDocument, config);
                }, 50);
              });
            };

            requestAnimationFrame(() => {
              requestAnimationFrame(runUpdate);
            });
          }
        }
      }, [carouselEnabled, carouselArrowStyle, carouselShowArrows, carouselShowMarkers, clientId, attributes.className]);

      const ensureArrowStyleControlsCss = () => {
        if (typeof document === 'undefined') {
          return;
        }

        const styleId = 'abcs-arrow-style-control-styles';
        if (document.getElementById(styleId)) {
          return;
        }

        const style = document.createElement('style');
        style.id = styleId;
        style.type = 'text/css';
        style.textContent = `
          .abcs-arrow-style-panel .components-base-control__field,
          .abcs-arrow-style-panel .components-toggle-group-control {
            display: grid;
            justify-content: center;
          }
          .abcs-arrow-style-panel .components-toggle-group-control {
            width: 100%;
          }
          .abcs-arrow-style-panel .abcs-arrow-style-group {
            gap: 8px;
          }
          .abcs-arrow-style-group.components-toggle-group-control {
            display: flex;
            flex-wrap: wrap;
          }
          .abcs-arrow-style-group .components-toggle-group-control__option {
            --abcs-arrow-option-size: 44px;
            width: var(--abcs-arrow-option-size);
            height: var(--abcs-arrow-option-size);
            min-width: var(--abcs-arrow-option-size);
            min-height: var(--abcs-arrow-option-size);
            flex: 0 0 var(--abcs-arrow-option-size);
            padding: 0;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
            border: 1px solid rgba(0, 0, 0, 0.08);
            background: #f8f9fa;
            color: #1e1e1e;
            transition: box-shadow .2s ease, transform .2s ease, color .2s ease;
            box-sizing: border-box;
          }
          .abcs-arrow-style-group .components-toggle-group-control__option > span {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            line-height: 0;
          }
          .abcs-arrow-style-group .components-toggle-group-control__option:hover {
            box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
            transform: translateY(-1px);
          }
          .abcs-arrow-style-group .components-toggle-group-control__option.is-selected {
            background: var(--wp-admin-theme-color, #3858e9);
            border-color: var(--wp-admin-theme-color, #3858e9);
            color: #fff;
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
            transform: none;
          }
          .abcs-arrow-style-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
          }
          .abcs-arrow-style-icon svg {
            width: 20px;
            height: 20px;
            display: block;
          }
        `;

        document.head.appendChild(style);
      };

      ensureArrowStyleControlsCss();

      return createElement(
        Fragment,
        null,
        createElement(BlockEdit, props),
        createElement(
          InspectorControls,
          null,
          createElement(
            PanelBody,
            {
              title: __('Carousel', 'native-blocks-carousel'),
              initialOpen: true,
            },
            createElement(ToggleControl, {
              label: __('Enable carousel', 'native-blocks-carousel'),
              checked: carouselEnabled,
              __nextHasNoMarginBottom: true,
              onChange: toggleCarousel,
              help: carouselEnabled
                ? name === 'core/gallery'
                  ? __(
                    'Carousel is enabled. The number of visible columns is detected automatically from the gallery settings.',
                    'native-blocks-carousel'
                  )
                  : (name === 'core/group' || name === 'core/post-template') && attributes.layout?.type === 'grid'
                    ? attributes.layout?.minimumColumnWidth
                      ? __(
                        'Carousel is enabled in Auto mode. Slide width is set by the "Minimum column width" (' + attributes.layout.minimumColumnWidth + ').',
                        'native-blocks-carousel'
                      )
                      : attributes.layout?.columnCount
                        ? __(
                          'Carousel is enabled in Manual mode. The number of visible columns (' + attributes.layout.columnCount + ') is taken from the grid settings.',
                          'native-blocks-carousel'
                        )
                        : __(
                          'Carousel is enabled. Configure the column count or minimum width in the grid settings.',
                          'native-blocks-carousel'
                        )
                    : __(
                      'Carousel is enabled. Items scroll horizontally.',
                      'native-blocks-carousel'
                    )
                : __(
                  'Enable to convert this block into a carousel with navigation. You can then choose Manual mode (column count) or Auto mode (minimum column width).',
                  'native-blocks-carousel'
                ),
            }),
            carouselEnabled
              ? createElement(ToggleControl, {
                label: __('Display navigation arrows', 'native-blocks-carousel'),
                checked: carouselShowArrows,
                __nextHasNoMarginBottom: true,
                onChange: (value) => {
                  setAttributes({ carouselShowArrows: value });
                },
                help: carouselShowArrows
                  ? __(
                    'Navigation arrows are visible on the carousel.',
                    'native-blocks-carousel'
                  )
                  : __(
                    'Arrows are hidden. Users can navigate via swipe or scroll.',
                    'native-blocks-carousel'
                  ),
              })
              : null,
            carouselEnabled
              ? createElement(ToggleControl, {
                label: __('Display pagination markers', 'native-blocks-carousel'),
                checked: carouselShowMarkers,
                __nextHasNoMarginBottom: true,
                onChange: (value) => {
                  setAttributes({ carouselShowMarkers: value });
                },
                help: carouselShowMarkers
                  ? __(
                    'Pagination markers are displayed below the carousel.',
                    'native-blocks-carousel'
                  )
                  : __(
                    'Pagination markers are hidden for a cleaner layout.',
                    'native-blocks-carousel'
                  ),
              })
              : null,
            carouselEnabled
              ? createElement(ToggleControl, {
                label: __('Enable loop', 'native-blocks-carousel'),
                checked: carouselLoop,
                __nextHasNoMarginBottom: true,
                onChange: (value) => {
                  setAttributes({ carouselLoop: value });
                },
                help: carouselLoop
                  ? __(
                    'The carousel will loop infinitely, returning to the first slide after the last.',
                    'native-blocks-carousel'
                  )
                  : __(
                    'Loop is disabled. The carousel stops at the end.',
                    'native-blocks-carousel'
                  ),
              })
              : null,
            carouselEnabled
              ? createElement(ToggleControl, {
                label: __('Enable autoplay', 'native-blocks-carousel'),
                checked: carouselAutoplay,
                __nextHasNoMarginBottom: true,
                onChange: (value) => {
                  setAttributes({ carouselAutoplay: value });
                },
                help: carouselAutoplay
                  ? __(
                    'The carousel will automatically scroll through slides.',
                    'native-blocks-carousel'
                  )
                  : __(
                    'Autoplay is disabled. Users must navigate manually.',
                    'native-blocks-carousel'
                  ),
              })
              : null,
            carouselEnabled && carouselAutoplay
              ? createElement(RangeControl, {
                label: __('Autoplay delay (ms)', 'native-blocks-carousel'),
                value: carouselAutoplayDelay,
                onChange: (value) => {
                  setAttributes({ carouselAutoplayDelay: value || 3000 });
                },
                min: 1000,
                max: 10000,
                step: 100,
                __nextHasNoMarginBottom: true,
                help: __(
                  'Time in milliseconds between each slide transition.',
                  'native-blocks-carousel'
                ),
              })
              : null,
            carouselEnabled && carouselShowArrows
              ? createElement(
                PanelBody,
                {
                  title: __('Arrow style', 'native-blocks-carousel'),
                  initialOpen: true,
                  className: 'abcs-arrow-style-panel',
                },
                createElement(
                  ToggleGroupControl,
                  {
                    className: 'abcs-arrow-style-group',
                    value: normalizedArrowStyle,
                    isBlock: false,
                    __next40pxDefaultSize: true,
                    __nextHasNoMarginBottom: true,
                    onChange: (nextValue) => {
                      const normalizedValue = normalizeStyleKey(nextValue || DEFAULT_ARROW_STYLE);
                      setAttributes({ carouselArrowStyle: normalizedValue });
                    },
                  },
                  arrowStyleOptions.map((option) =>
                    createElement(ArrowOptionComponent, {
                      key: option.value,
                      value: option.value,
                      label: option.label,
                      icon: buildIconElement(option.value),
                      className: 'abcs-arrow-style-option',
                      'aria-label': option.label,
                      showTooltip: true,
                    })
                  )
                )
              )
              : null
          )
        )
      );
    };
  }, 'withCarouselControl');

  /**
   * Wrapper to inject carousel inline styles in the editor
   * (minimumColumnWidth, blockGap, etc.).
   */
  const withCarouselStyles = createHigherOrderComponent((BlockListBlock) => {
    return (props) => {
      const { attributes, name } = props;

      // Applies only to blocks with the carousel enabled
      if (!attributes.carouselEnabled) {
        return createElement(BlockListBlock, props);
      }

      const customStyles = {};

      // Adjust the gap using the computed value directly
      if (typeof window !== 'undefined' && window.getComputedStyle) {
        const node = props?.clientId ? document.querySelector(`[data-block="${props.clientId}"]`) : null;
        const carouselNode = node && node.classList.contains('abcs') ? node : node?.querySelector?.('.abcs');
        if (carouselNode) {
          const computedGap = window.getComputedStyle(carouselNode).gap || window.getComputedStyle(carouselNode).columnGap;
          if (computedGap && computedGap !== 'normal') {
            customStyles['--wp--style--block-gap'] = computedGap;
          }
        }
      }

      // 1. Inject --carousel-min-width for grids using minimumColumnWidth
      if (
        (name === 'core/group' || name === 'core/post-template') &&
        attributes.layout?.type === 'grid' &&
        attributes.layout?.minimumColumnWidth
      ) {
        customStyles['--carousel-min-width'] = attributes.layout.minimumColumnWidth;
      }

      // 2. Inject --wp--style--block-gap for every carousel
      let blockGap = attributes.style?.spacing?.blockGap;

      // Exception for Gallery: use the horizontal gap (left) for the carousel
      if (name === 'core/gallery' && blockGap && typeof blockGap === 'object') {
        blockGap = blockGap.left || blockGap.top || null;
      }

      // If it is a WordPress preset (e.g. "var:preset|spacing|50"), convert it
      if (blockGap && typeof blockGap === 'string' && blockGap.startsWith('var:preset|spacing|')) {
        const presetSlug = blockGap.replace('var:preset|spacing|', '');
        blockGap = `var(--wp--preset--spacing--${presetSlug})`;
      }

      // Inject the gap (even when it is "0" for None)
      if (blockGap !== undefined && blockGap !== null && blockGap !== '' && !customStyles['--wp--style--block-gap']) {
        // Convert "0" to "0px" for CSS calculations
        customStyles['--wp--style--block-gap'] = (blockGap === '0' || blockGap === 0) ? '0px' : blockGap;
      }

      // 3. Inject padding variables from the block attributes
      const spacing = attributes.style?.spacing || {};
      const padding = spacing.padding || null;

      // Helper to convert WordPress presets
      const convertPreset = (value) => {
        if (typeof value === 'string' && value.startsWith('var:preset|spacing|')) {
          const presetSlug = value.replace('var:preset|spacing|', '');
          return `var(--wp--preset--spacing--${presetSlug})`;
        }
        return value;
      };

      // Extract padding-left, padding-right, padding-top and padding-bottom
      let paddingLeft = null;
      let paddingRight = null;
      let paddingTop = null;
      let paddingBottom = null;

      if (padding) {
        if (typeof padding === 'object' && padding !== null) {
          paddingLeft = padding.left || null;
          paddingRight = padding.right || null;
          paddingTop = padding.top || null;
          paddingBottom = padding.bottom || null;
        } else if (typeof padding === 'string' && padding !== '') {
          // If it is a single value (applied to every side)
          paddingLeft = padding;
          paddingRight = padding;
          paddingTop = padding;
          paddingBottom = padding;
        }
      }

      // Inject padding variables
      if (paddingLeft !== null) {
        paddingLeft = convertPreset(paddingLeft);
        customStyles['--carousel-padding-left'] = (paddingLeft === '0' || paddingLeft === 0) ? '0px' : paddingLeft;
        customStyles['--carousel-scroll-padding-left'] = (paddingLeft === '0' || paddingLeft === 0) ? '0px' : paddingLeft;
      } else {
        customStyles['--carousel-padding-left'] = '0px';
        customStyles['--carousel-scroll-padding-left'] = '0px';
      }

      if (paddingRight !== null) {
        paddingRight = convertPreset(paddingRight);
        customStyles['--carousel-padding-right'] = (paddingRight === '0' || paddingRight === 0) ? '0px' : paddingRight;
        customStyles['--carousel-scroll-padding-right'] = (paddingRight === '0' || paddingRight === 0) ? '0px' : paddingRight;
      } else {
        customStyles['--carousel-padding-right'] = '0px';
        customStyles['--carousel-scroll-padding-right'] = '0px';
      }

      if (paddingTop !== null) {
        paddingTop = convertPreset(paddingTop);
        customStyles['--carousel-padding-top'] = (paddingTop === '0' || paddingTop === 0) ? '0px' : paddingTop;
      } else {
        customStyles['--carousel-padding-top'] = '1rem';
      }

      if (paddingBottom !== null) {
        paddingBottom = convertPreset(paddingBottom);
        customStyles['--carousel-padding-bottom'] = (paddingBottom === '0' || paddingBottom === 0) ? '0px' : paddingBottom;
      } else {
        customStyles['--carousel-padding-bottom'] = '1rem';
      }

      // If there is nothing to inject, return the block as-is
      if (Object.keys(customStyles).length === 0) {
        return createElement(BlockListBlock, props);
      }

      // Create the wrapper with inline styles
      const wrapperProps = {
        ...props,
        wrapperProps: {
          ...props.wrapperProps,
          style: {
            ...props.wrapperProps?.style,
            ...customStyles,
          },
          'data-abcs-arrow-style': attributes.carouselArrowStyle || DEFAULT_ARROW_STYLE,
          'data-abcs-loop': attributes.carouselLoop ? 'true' : 'false',
          'data-abcs-autoplay': attributes.carouselAutoplay ? 'true' : 'false',
          'data-abcs-autoplay-delay': attributes.carouselAutoplayDelay || 3000,
        },
      };

      return createElement(BlockListBlock, wrapperProps);
    };
  }, 'withCarouselStyles');

  // Register filters
  addFilter(
    'blocks.registerBlockType',
    'any-block-carousel-slider/add-carousel-attribute',
    addCarouselAttribute
  );

  addFilter(
    'editor.BlockEdit',
    'any-block-carousel-slider/with-carousel-control',
    withCarouselControl
  );

  addFilter(
    'editor.BlockListBlock',
    'any-block-carousel-slider/with-carousel-styles',
    withCarouselStyles
  );

  /**
   * Copies carousel padding variables to the parent element
   * (required for fallback buttons positioned on the parent).
   * Variables are already injected from React attributes via withCarouselStyles.
   */
  /**
   * Resolves the padding value for a carousel element in the editor.
   * Handles Cover blocks by checking block attributes and inline styles first,
   * avoiding the post-reset 0px computed style.
   */
  function resolveEditorPadding(carousel, side) {
    const parent = carousel.parentElement;
    const computedStyle = carousel.ownerDocument.defaultView.getComputedStyle(carousel);
    const parentStyle = parent ? carousel.ownerDocument.defaultView.getComputedStyle(parent) : null;
    const axis = 'padding' + side.charAt(0).toUpperCase() + side.slice(1);
    
    let clientId = carousel.getAttribute('data-block') || 
                   (carousel.id && carousel.id.startsWith('block-') ? carousel.id.substring(6) : null);
                     
    let hasCover = false;
    if (clientId && window.wp && window.wp.data) {
      try {
        const innerBlocks = window.wp.data.select('core/block-editor').getBlocks(clientId);
        if (innerBlocks) {
          hasCover = innerBlocks.some(block => block.name === 'core/cover');
        }
      } catch (err) {}
    }
    if (!hasCover) {
      hasCover = carousel.querySelector('.wp-block-cover, [data-type="core/cover"]') !== null || 
                 carousel.classList.contains('wp-block-cover') || 
                 carousel.getAttribute('data-type') === 'core/cover';
    }

    // 1. Try block attributes in Gutenberg store
    let attrValue = null;
    if (clientId && window.wp && window.wp.data) {
      try {
        const block = window.wp.data.select('core/block-editor').getBlock(clientId);
        if (block && block.attributes && block.attributes.style && block.attributes.style.spacing) {
          const padding = block.attributes.style.spacing.padding;
          if (padding) {
            if (typeof padding === 'object') {
              attrValue = padding[side] || null;
            } else if (typeof padding === 'string' && padding !== '') {
              attrValue = padding;
            }
          }
        }
      } catch (err) {}
    }

    if (attrValue !== null && attrValue !== undefined && attrValue !== '') {
      if (typeof attrValue === 'string' && attrValue.startsWith('var:preset|spacing|')) {
        const presetSlug = attrValue.replace('var:preset|spacing|', '');
        attrValue = `var(--wp--preset--spacing--${presetSlug})`;
      }
      return attrValue === '0' || attrValue === 0 ? '0px' : attrValue;
    }

    // 2. Try inline styles on the carousel element itself
    let inlineVal = carousel.style[axis];
    if (inlineVal && inlineVal.trim() !== '') {
      return inlineVal.trim();
    }

    // 3. Try shorthand inline padding on the carousel element
    if (carousel.style.padding && carousel.style.padding.trim() !== '') {
      const parts = carousel.style.padding.trim().split(/\s+/);
      if (parts.length === 1) {
        return parts[0];
      } else if (parts.length === 2 || parts.length === 3) {
        return parts[1];
      } else if (parts.length === 4) {
        return side === 'left' ? parts[3] : parts[1];
      }
    }

    // 4. Try inline styles on the parent element
    if (parent) {
      let parentInlineVal = parent.style[axis];
      if (parentInlineVal && parentInlineVal.trim() !== '' && parentInlineVal.indexOf('--carousel') === -1) {
        return parentInlineVal.trim();
      }
    }

    // 5. Fallback to computed styles (only if not a Cover block)
    if (!hasCover) {
      const computedVal = computedStyle ? computedStyle[axis] : null;
      if (computedVal && computedVal !== '0px') {
        return computedVal;
      }
      const parentVal = parentStyle ? parentStyle[axis] : null;
      if (parentVal && parentVal !== '0px') {
        return parentVal;
      }
    }

    return '0px';
  }

  /**
   * Copies carousel padding variables to the parent element
   * (required for fallback buttons positioned on the parent).
   * Variables are already injected from React attributes via withCarouselStyles.
   */
  function copyPaddingVariablesToParent() {
    const docsToSearch = new Set();
    docsToSearch.add(document);

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

    docsToSearch.forEach((doc) => {
      try {
        const carousels = doc.querySelectorAll('.abcs');
        carousels.forEach(function (carousel) {
          const paddingLeftValue = resolveEditorPadding(carousel, 'left');
          const paddingRightValue = resolveEditorPadding(carousel, 'right');

          carousel.style.setProperty('--carousel-padding-left', paddingLeftValue);
          carousel.style.setProperty('--carousel-padding-right', paddingRightValue);

          const parent = carousel.parentElement;
          if (parent) {
            parent.style.setProperty('--carousel-padding-left', paddingLeftValue);
            parent.style.setProperty('--carousel-padding-right', paddingRightValue);
          }
        });
      } catch (e) {
        // Ignorer les contextes non accessibles
      }
    });
  }

  /**
   * Initialise copying of padding variables inside the editor.
   */
  function applyScrollPaddingInEditor() {

    // Run after the initial render using requestAnimationFrame
    function runUpdate() {
      requestAnimationFrame(function () {
        requestAnimationFrame(copyPaddingVariablesToParent);
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runUpdate);
    } else {
      runUpdate();
    }

    // Observe DOM mutations in the editor to copy variables when they change
    if (window.MutationObserver) {
      let timeout;
      const observedTargets = new WeakSet();

      const observer = new MutationObserver(function () {
        // Try to attach observers to any new iframes that may have loaded
        attachObservers();

        clearTimeout(timeout);
        timeout = setTimeout(function () {
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              copyPaddingVariablesToParent();
              applyArrowIconsToCarousels(null, document);
            });
          });
        }, 50);
      });

      function attachObservers() {
        const docsToObserve = new Set();
        docsToObserve.add(document);

        const iframeSelectors = [
          '.editor-canvas iframe',
          'iframe[name="editor-canvas"]',
          '.edit-site-visual-editor__editor-canvas',
        ];

        iframeSelectors.forEach((selector) => {
          try {
            const iframe = document.querySelector(selector);
            if (iframe && iframe.contentDocument) {
              docsToObserve.add(iframe.contentDocument);
            }
          } catch (e) {
            // Ignore cross-origin access issues
          }
        });

        docsToObserve.forEach((doc) => {
          try {
            const target = doc.querySelector('.editor-styles-wrapper') || doc.body;
            if (target && !observedTargets.has(target)) {
              observer.observe(target, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class']
              });
              observedTargets.add(target);
            }
          } catch (e) {
            // Ignore issues accessing elements
          }
        });
      }

      attachObservers();
    }
  }

  // Initialise for the editor
  // Use a WordPress hook to ensure blocks are rendered
  if (wp && wp.domReady) {
    wp.domReady(applyScrollPaddingInEditor);
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyScrollPaddingInEditor);
  } else {
    // Wait briefly so WordPress can apply styles
    setTimeout(applyScrollPaddingInEditor, 100);
  }

  // Listen to block changes in the editor with debounce
  // Copy variables to the parent whenever attributes change
  if (wp && wp.data && wp.data.subscribe) {
    let debounceTimeout;
    wp.data.subscribe(function () {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(function () {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            copyPaddingVariablesToParent();
            applyArrowIconsToCarousels(null, document);
          });
        });
      }, 300);
    });
  }

  /**
   * Injects CSS variables into a <style> tag instead of inline style attribute.
   * This is a better practice than using element.style.setProperty() on documentElement.
   *
   * @param {Object} variables - Object with CSS variable names as keys and values as values
   * @param {Document|HTMLElement} docContext - Document context (for iframe support)
   */
  function injectCssVariablesInStyleTag(variables, docContext) {
    const doc = docContext && docContext.ownerDocument ? docContext.ownerDocument : (docContext || document);
    const head = doc.head || doc.getElementsByTagName('head')[0];

    if (!head) return;

    // Find or create the style tag for carousel variables
    let styleTag = doc.getElementById('carousel-dynamic-variables');

    if (!styleTag) {
      styleTag = doc.createElement('style');
      styleTag.id = 'carousel-dynamic-variables';
      styleTag.type = 'text/css';
      head.appendChild(styleTag);
    }

    // Build CSS with all variables
    let css = ':root {';
    for (const [key, value] of Object.entries(variables)) {
      if (value !== null && value !== undefined && value !== '') {
        css += `\n  ${key}: ${value} !important;`;
      }
    }
    css += '\n}';

    styleTag.textContent = css;
  }

  /**
   * Checks if a color value matches WordPress core default button colors.
   * This helps avoid applying core defaults when theme has no custom button styles.
   *
   * @param {string} color - Color value to check (can be rgb, rgba, hex, etc.)
   * @returns {boolean} True if the color matches core defaults
   */




  // Utility to convert a color to hexadecimal
  function convertColorToHexForSvg(color, docContext) {
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

    if (docContext) {
      const temp = docContext.createElement('div');
      temp.style.color = color;
      docContext.body.appendChild(temp);
      const computedColor = docContext.defaultView.getComputedStyle(temp).color;
      docContext.body.removeChild(temp);

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
    }

    return '#ffffff';
  }

  function resolveCarouselArrowStyleFromElement(element) {
    if (!element || !element.classList) {
      return DEFAULT_ARROW_STYLE;
    }

    if (element.dataset && element.dataset.abcsCarouselArrowStyle) {
      const normalizedDatasetStyle = normalizeStyleKey(element.dataset.abcsCarouselArrowStyle);
      if (isValidArrowStyle(normalizedDatasetStyle)) {
        return normalizedDatasetStyle;
      }
    }

    const parentWithData = element.closest('[data-abcs-arrow-style]');
    if (parentWithData && parentWithData.dataset && parentWithData.dataset.abcsCarouselArrowStyle) {
      const normalizedParentStyle = normalizeStyleKey(parentWithData.dataset.abcsCarouselArrowStyle);
      if (isValidArrowStyle(normalizedParentStyle)) {
        return normalizedParentStyle;
      }
    }

    const iconClass = Array.from(element.classList).find((cls) => cls.startsWith('abcs-icon-'));

    if (iconClass) {
      const styleKey = normalizeStyleKey(iconClass.replace('abcs-icon-', ''));
      if (isValidArrowStyle(styleKey)) {
        return styleKey;
      }
    }

    return DEFAULT_ARROW_STYLE;
  }

  function resolveArrowColor(color, docContext) {
    const doc = docContext || document;
    if (!doc) {
      return '#ffffff';
    }

    const root = doc.documentElement || doc;
    let baseColor = color;

    if (!baseColor || baseColor === 'rgba(0, 0, 0, 0)' || baseColor === 'transparent') {
      baseColor = (root.style && root.style.getPropertyValue('--carousel-button-color')) || '';

      if (!baseColor && doc.defaultView && doc.defaultView.getComputedStyle) {
        baseColor = doc.defaultView.getComputedStyle(root).getPropertyValue('--carousel-button-color');
      }
    }

    return convertColorToHexForSvg(baseColor || '#ffffff', doc);
  }

  function getSlideWidth(carousel) {
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
          const rootFontSize = parseFloat(window.getComputedStyle(carousel.ownerDocument.documentElement).fontSize) || 16;
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
  }

  function cleanOrphanedEditorNavigation(searchDoc) {
    if (!searchDoc || typeof searchDoc.querySelectorAll !== 'function') {
      return;
    }

    const prevButtons = searchDoc.querySelectorAll('.abcs-nav-btn--prev');
    const nextButtons = searchDoc.querySelectorAll('.abcs-nav-btn--next');
    const markersContainers = searchDoc.querySelectorAll('.abcs-markers');

    const cleanElement = (el) => {
      const parent = el.parentElement;
      if (parent) {
        const hasCarousel = parent.querySelector('.abcs');
        if (!hasCarousel) {
          el.remove();
        }
      }
    };

    prevButtons.forEach(cleanElement);
    nextButtons.forEach(cleanElement);
    markersContainers.forEach(cleanElement);
  }

  function updateEditorCarouselNavigation(carousel, baseDoc) {
    if (!carousel) {
      return;
    }

    const parent = carousel.parentElement;
    if (!parent) {
      return;
    }

    // 0. Compute and copy padding variables (syncing with frontend)
    const paddingLeftValue = resolveEditorPadding(carousel, 'left');
    const paddingRightValue = resolveEditorPadding(carousel, 'right');

    carousel.style.setProperty('--carousel-padding-left', paddingLeftValue);
    carousel.style.setProperty('--carousel-padding-right', paddingRightValue);

    if (parent) {
      parent.style.setProperty('--carousel-padding-left', paddingLeftValue);
      parent.style.setProperty('--carousel-padding-right', paddingRightValue);
    }

    const hideArrows = carousel.classList.contains('abcs-hide-arrows') || carousel.closest('.abcs-hide-arrows');
    const hideMarkers = carousel.classList.contains('abcs-hide-markers') || carousel.closest('.abcs-hide-markers');
    
    const styleKey = resolveCarouselArrowStyleFromElement(carousel);

    const computedStyle = carousel.ownerDocument.defaultView.getComputedStyle(carousel);
    let arrowColor = '#ffffff';
    if (typeof window !== 'undefined') {
      const textVar = computedStyle.getPropertyValue('--carousel-button-color').trim();
      if (textVar) {
        arrowColor = convertColorToHexForSvg(textVar, carousel.ownerDocument);
      }
    }

    // 1. Manage Navigation Arrows
    const existingPrev = parent.querySelector(':scope > .abcs-nav-btn--prev');
    const existingNext = parent.querySelector(':scope > .abcs-nav-btn--next');

    if (hideArrows) {
      if (existingPrev) existingPrev.remove();
      if (existingNext) existingNext.remove();
    } else {
      const isUpToDate = existingPrev && existingNext && 
                         existingPrev.dataset.abcsArrowStyle === styleKey &&
                         existingPrev.dataset.abcsArrowColor === arrowColor;

      if (!isUpToDate) {
        if (existingPrev) existingPrev.remove();
        if (existingNext) existingNext.remove();

        const prevBtn = document.createElement('button');
        prevBtn.className = 'abcs-nav-btn abcs-nav-btn--prev';
        prevBtn.setAttribute('type', 'button');
        prevBtn.setAttribute('aria-label', 'Previous slide');
        prevBtn.dataset.abcsArrowStyle = styleKey;
        prevBtn.dataset.abcsArrowColor = arrowColor;
        prevBtn.innerHTML = generateArrowMarkup('left', arrowColor, styleKey);

        const nextBtn = document.createElement('button');
        nextBtn.className = 'abcs-nav-btn abcs-nav-btn--next';
        nextBtn.setAttribute('type', 'button');
        nextBtn.setAttribute('aria-label', 'Next slide');
        nextBtn.dataset.abcsArrowStyle = styleKey;
        nextBtn.dataset.abcsArrowColor = arrowColor;
        nextBtn.innerHTML = generateArrowMarkup('right', arrowColor, styleKey);

        // Insert as siblings immediately after carousel
        parent.insertBefore(nextBtn, carousel.nextSibling);
        parent.insertBefore(prevBtn, carousel.nextSibling);

        // Click handlers
        prevBtn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          const slideWidth = getSlideWidth(carousel);
          carousel.scrollBy({ left: -slideWidth, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          const slideWidth = getSlideWidth(carousel);
          carousel.scrollBy({ left: slideWidth, behavior: 'smooth' });
        });
      }
    }

    // 2. Manage Pagination Markers
    const existingMarkers = parent.querySelector(':scope > .abcs-markers');

    if (hideMarkers) {
      if (existingMarkers) existingMarkers.remove();
    } else {
      const children = Array.from(carousel.children).filter(child => {
        return !child.classList.contains('abcs-nav-btn') && 
               !child.classList.contains('abcs-markers') &&
               !child.classList.contains('block-editor-block-list__insertion-point') &&
               !child.classList.contains('block-list-appender');
      });

      const existingDots = existingMarkers ? existingMarkers.querySelectorAll('.abcs-marker') : [];
      const needsReconstruction = !existingMarkers || existingDots.length !== children.length;

      if (needsReconstruction) {
        if (existingMarkers) existingMarkers.remove();

        if (children.length > 0) {
          const markersContainer = document.createElement('div');
          markersContainer.className = 'abcs-markers';
          markersContainer.setAttribute('role', 'tablist');

          const markers = [];
          for (let i = 0; i < children.length; i++) {
            const marker = document.createElement('button');
            marker.className = 'abcs-marker';
            marker.setAttribute('role', 'tab');
            marker.setAttribute('type', 'button');
            marker.setAttribute('aria-label', 'Slide ' + (i + 1));

            if (i === 0) {
              marker.classList.add('is-active');
            }

            (function (slideIndex) {
              marker.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                const slide = children[slideIndex];
                if (slide) {
                  carousel.scrollTo({
                    left: slide.offsetLeft - carousel.offsetLeft,
                    behavior: 'smooth'
                  });
                }
              });
            })(i);

            markers.push(marker);
            markersContainer.appendChild(marker);
          }

          parent.appendChild(markersContainer);

          const onScroll = function () {
            const scrollLeft = carousel.scrollLeft;
            let activeIndex = 0;
            let minDistance = Infinity;

            children.forEach((slide, idx) => {
              const slidePos = slide.offsetLeft - carousel.offsetLeft;
              const distance = Math.abs(slidePos - scrollLeft);
              if (distance < minDistance) {
                minDistance = distance;
                activeIndex = idx;
              }
            });

            markers.forEach((m, idx) => {
              if (idx === activeIndex) {
                m.classList.add('is-active');
                m.setAttribute('aria-selected', 'true');
              } else {
                m.classList.remove('is-active');
                m.setAttribute('aria-selected', 'false');
              }
            });
          };

          carousel.addEventListener('scroll', onScroll);
          carousel._abcsEditorOnScroll = onScroll;
        }
      }
    }
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
          cleanOrphanedEditorNavigation(searchDoc);
          const found = Array.from(searchDoc.querySelectorAll('.abcs'));
          if (found.length) {
            found.forEach((node) => {
              if (node) {
                carousels.push(node);
              }
            });
          }
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

    carousels.forEach((carousel) => {
      if (!carousel) {
        return;
      }

      const parent = carousel.parentElement;
      if (!parent) {
        return;
      }

      const carouselDoc = carousel?.ownerDocument || baseDoc;
      let arrowColor = arrowColorCache.get(carouselDoc);
      if (!arrowColor) {
        arrowColor = resolveArrowColor(color, carouselDoc);
        arrowColorCache.set(carouselDoc, arrowColor);
      }
      
      const overrideStyle = overrideConfig && overrideConfig.styleKey ? normalizeStyleKey(overrideConfig.styleKey) : null;
      const styleKey = overrideStyle && isValidArrowStyle(overrideStyle)
        ? overrideStyle
        : resolveCarouselArrowStyleFromElement(carousel);

      if (carousel.dataset) {
        carousel.dataset.abcsCarouselArrowStyle = styleKey;
        carousel.dataset.abcsArrowStyle = styleKey;
      }

      if (parent && parent.dataset) {
        parent.dataset.abcsCarouselArrowStyle = styleKey;
        parent.dataset.abcsArrowStyle = styleKey;
      }

      updateEditorCarouselNavigation(carousel, carouselDoc);
    });
  }

  /**
   * Initialises dynamic color syncing within the Site Editor.
   * Observes changes to <style> tags under .editor-styles-wrapper.
   */
  let lastButtonBg = '';
  let lastButtonColor = '';
  let referenceButton = null;
  let colorSyncObserver = null;

  // Helper to retrieve the preview iframe in the Site Editor
  function getPreviewIframe() {
    // Try to find the iframe specifically used by Site Editor (FSE)
    const iframeElement = document.querySelector('iframe[name="editor-canvas"]') || 
                          document.querySelector('.edit-site-visual-editor__editor-canvas') ||
                          document.querySelector('.editor-canvas iframe');
 
    if (!iframeElement) return null;
 
    if (iframeElement.contentDocument) {
      return iframeElement.contentDocument;
    } else if (iframeElement.contentWindow) {
      try {
        return iframeElement.contentWindow.document;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  // Helper to create or keep a reference button that represents GLOBAL styles
  function getReferenceButtonInAnyContext() {
    // Try iframe first (Site Editor) then main page
    const contexts = [];
    const iframeDoc = getPreviewIframe();
    if (iframeDoc) contexts.push(iframeDoc);
    contexts.push(document);

    for (const doc of contexts) {
      const editorWrapper = doc.querySelector('.editor-styles-wrapper');
      if (!editorWrapper) continue;

      // Search for our specific, clean reference button by ID
      let button = doc.getElementById('abcs-global-theme-ref-button');
      
      // If not found, create a hidden one at the ROOT of the editor styles
      // This ensures we get theme.json styles without picking up block-level overrides
      if (!button) {
        button = doc.createElement('button');
        button.id = 'abcs-global-theme-ref-button';
        button.className = 'wp-element-button';
        button.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;top:-9999px;left:-9999px;';
        button.textContent = 'Global Ref';
        
        // Prepend to editor-styles-wrapper to avoid being affected by local block containers
        editorWrapper.prepend(button);
      }

      if (button) return { button, doc };
    }
    return null;
  }

  // Update routine with change detection
  function checkAndUpdateColors() {
    const iframeDoc = getPreviewIframe();
    const contexts = iframeDoc ? [iframeDoc, document] : [document];
    
    let currentBg = '';
    let currentColor = '';
    let activeDoc = document;

    // Direct method: Read variables from the wrapper (Source of truth in FSE)
    for (const doc of contexts) {
      const wrapper = doc.querySelector('.editor-styles-wrapper');
      if (wrapper) {
        const styles = doc.defaultView.getComputedStyle(wrapper);
        const bgVar = styles.getPropertyValue('--wp--style--elements--button--color--background').trim();
        const textVar = styles.getPropertyValue('--wp--style--elements--button--color--text').trim();
        
        if (bgVar && bgVar !== 'rgba(0, 0, 0, 0)') {
          currentBg = bgVar;
          currentColor = textVar;
          activeDoc = doc;
          break; 
        }
      }
    }

    // Legacy fallback: Use our specific hidden reference button if variables are missing
    if (!currentBg) {
      const buttonData = getReferenceButtonInAnyContext();
      if (buttonData && buttonData.button) {
        const buttonStyles = buttonData.doc.defaultView.getComputedStyle(buttonData.button);
        currentBg = buttonStyles.backgroundColor;
        currentColor = buttonStyles.color;
        activeDoc = buttonData.doc;
      }
    }

    if (!currentBg || currentBg === 'rgba(0, 0, 0, 0)' || currentBg === 'transparent') {
      return;
    }

    // Check whether the colors changed
    const bgChanged = currentBg !== lastButtonBg &&
      currentBg !== 'rgba(0, 0, 0, 0)' &&
      currentBg !== 'transparent' &&
      currentBg !== '';
    const colorChanged = currentColor !== lastButtonColor &&
      currentColor !== 'rgba(0, 0, 0, 0)' &&
      currentColor !== '';

    // Update if a change is detected
    if (bgChanged || colorChanged || !lastButtonBg) {
      lastButtonBg = currentBg;
      lastButtonColor = currentColor;

      // Apply colors inside the appropriate document (iframe or main page)
      const variables = {};

      if (currentBg) {
        variables['--carousel-button-bg'] = currentBg;
      }

      if (currentColor) {
        variables['--carousel-button-color'] = currentColor;

        // Generate arrow SVGs using the button text color
        const arrowColor = convertColorToHexForSvg(currentColor, activeDoc);
        const leftArrowSvg = generateArrowSvg('left', arrowColor, DEFAULT_ARROW_STYLE);
        const rightArrowSvg = generateArrowSvg('right', arrowColor, DEFAULT_ARROW_STYLE);

        variables['--carousel-button-arrow-left'] = `url("${leftArrowSvg}")`;
        variables['--carousel-button-arrow-right'] = `url("${rightArrowSvg}")`;
      }

      // Inject all variables at once in a style tag
      if (Object.keys(variables).length > 0) {
        injectCssVariablesInStyleTag(variables, activeDoc);
        // Also inject in main document if activeDoc was iframe, to be safe
        if (activeDoc !== document) {
          injectCssVariablesInStyleTag(variables, document);
        }
      }

      applyArrowIconsToCarousels(currentColor, activeDoc);
    }
  }

  // Observe .editor-styles-wrapper inside the iframe and the main page
  function observeEditorWrapper(doc) {
    const editorWrapper = doc.querySelector('.editor-styles-wrapper');
    if (editorWrapper && colorSyncObserver) {
      colorSyncObserver.observe(editorWrapper, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });

      // Also observe every existing <style> tag
      const styleTags = editorWrapper.querySelectorAll('style');
      styleTags.forEach(function (styleTag) {
        colorSyncObserver.observe(styleTag, {
          childList: true,
          subtree: true,
          characterData: true
        });
      });
    }
  }

  function initThemeEditorColorSync() {
    // Initial update after a short delay so WordPress can load styles
    setTimeout(function () {
      checkAndUpdateColors();
    }, 500);

    // Observe <style> tags in .editor-styles-wrapper
    // WordPress updates those tags whenever styles change
    if (window.MutationObserver) {
      colorSyncObserver = new MutationObserver(function (mutations) {
        let shouldUpdate = false;

        mutations.forEach(function (mutation) {
          // If a <style> tag has been added or modified
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(function (node) {
              if (node.nodeName === 'STYLE' || (node.nodeType === 1 && node.tagName === 'STYLE')) {
                shouldUpdate = true;
              }
              if (node.nodeType === 1 && node.classList && node.classList.contains('abcs')) {
                shouldUpdate = true;
              }
            });
          }

          // If the contents of a <style> tag change
          if (mutation.type === 'characterData' ||
            (mutation.type === 'characterData' || (mutation.type === 'attributes' && (mutation.target.tagName === 'STYLE' || mutation.attributeName === 'class')))) {
            shouldUpdate = true;
          }
        });

        if (shouldUpdate) {
          // Wait briefly for WordPress to finish applying styles
          setTimeout(function () {
            requestAnimationFrame(function () {
              requestAnimationFrame(checkAndUpdateColors);
            });
          }, 50);
        }
      });

      // Watch the iframe (Site Editor)
      const iframeDoc = getPreviewIframe();
      if (iframeDoc) {
        observeEditorWrapper(iframeDoc);
      }

      // Watch the main page (regular Block Editor)
      observeEditorWrapper(document);

      // Observe the iframe itself to detect reloads
      const iframeElement = document.querySelector('.edit-site-visual-editor__editor-canvas, iframe[name="editor-canvas"]');
      if (iframeElement) {
        iframeElement.addEventListener('load', function () {
          setTimeout(function () {
            const newIframeDoc = getPreviewIframe();
            if (newIframeDoc) {
              observeEditorWrapper(newIframeDoc);
              checkAndUpdateColors();
            }
          }, 500);
        });
      }
    }

    // Fallback polling every 200ms (less aggressive)
    const pollingInterval = setInterval(function () {
      requestAnimationFrame(checkAndUpdateColors);
    }, 200);

    // Clear the interval when leaving the page
    window.addEventListener('beforeunload', function () {
      clearInterval(pollingInterval);
    });
  }

  // Initialise color synchronisation in the Site Editor
  // Use multiple mechanisms to keep it reliable

  // Method 1: via wp.domReady
  if (wp && wp.domReady) {
    wp.domReady(initThemeEditorColorSync);
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeEditorColorSync);
  } else {
    setTimeout(initThemeEditorColorSync, 200);
  }

  // Method 2: listen to changes through wp.data (Redux store)
  // WordPress relies on Redux to manage editor state
  if (wp && wp.data && wp.data.subscribe) {
    let settingsCheckInterval = null;

    // Wait for the store to be ready
    const initDataListener = function () {
      try {
        const select = wp.data.select('core/block-editor');
        if (select && select.getSettings) {
          let lastStylesString = '';

          // Check the settings periodically
          settingsCheckInterval = setInterval(function () {
            try {
              const settings = select.getSettings();
              if (settings && settings.styles) {
                // Convert styles to string for comparison
                const currentStylesString = JSON.stringify(settings.styles.elements?.button || {});

                if (currentStylesString !== lastStylesString) {
                  lastStylesString = currentStylesString;

                  // Trigger an update
                  requestAnimationFrame(function () {
                    requestAnimationFrame(checkAndUpdateColors);
                  });
                }
              }
            } catch (e) {
              // Ignore errors
            }
          }, 150);
        }
      } catch (e) {
        // Store not ready yet; retry later
        setTimeout(initDataListener, 500);
      }
    };

    // Start after a delay so WordPress can initialise
    setTimeout(initDataListener, 1000);
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
  }
})(window.wp);
