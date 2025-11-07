/**
 * Ajoute un bouton "Carousel" dans les paramètres des blocs Group, Post Template et Gallery
 * pour activer/désactiver facilement la classe .nbc-carousel
 */
(function (wp) {
  const { addFilter } = wp.hooks;
  const { createHigherOrderComponent } = wp.compose;
  const { Fragment, useEffect, useMemo, createElement } = wp.element;
  const { InspectorControls, BlockListBlock } = wp.blockEditor;
  const { PanelBody, ToggleControl, ButtonGroup, Button, Tooltip, Dashicon } = wp.components;
  const { __ } = wp.i18n;

  /**
   * Blocs supportés pour le carousel
   */
  const SUPPORTED_BLOCKS = ['core/group', 'core/post-template', 'core/gallery'];

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
    arrowfull: 'arrow',
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
   * Ajoute l'attribut 'carouselEnabled' aux blocs supportés
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
      },
    };
  }

  /**
   * Ajoute le contrôle Toggle dans l'Inspector
   */
  const withCarouselControl = createHigherOrderComponent((BlockEdit) => {
    return (props) => {
      const { attributes, setAttributes, name, clientId } = props;

      // Ne s'applique qu'aux blocs supportés
      if (!SUPPORTED_BLOCKS.includes(name)) {
        return createElement(BlockEdit, props);
      }

      const { carouselEnabled, carouselArrowStyle = DEFAULT_ARROW_STYLE } = attributes;
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
          label: __('Flèche', 'native-blocks-carousel'),
        },
      ];

      const buildIconSvg = (styleKey) => {
        const normalizedKey = normalizeStyleKey(styleKey);
        const icon = ARROW_ICONS[normalizedKey] || ARROW_ICONS[DEFAULT_ARROW_STYLE];
        const pathConfig = icon.paths.right || icon.paths[Object.keys(icon.paths)[0]];
        const attributes = [`fill='currentColor'`, `d='${pathConfig.d}'`];

        if (pathConfig.transform) {
          attributes.push(`transform='${pathConfig.transform}'`);
        }

        return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${icon.viewBox}' aria-hidden='true'><path ${attributes.join(' ')} /></svg>`;
      };

      // Mémoriser la sérialisation du layout pour éviter les re-renders inutiles
      const layoutKey = useMemo(
        () => JSON.stringify(attributes.layout),
        [attributes.layout?.type, attributes.layout?.columnCount, attributes.layout?.minimumColumnWidth, attributes.layout?.gridItemPosition]
      );

      /**
       * Toggle le carousel : ajoute/retire la classe 'carousel'
       * Pour les grilles, détecte automatiquement le nombre de colonnes
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

        // Gérer la classe CSS
        const currentClasses = attributes.className || '';
        const classArray = currentClasses.split(' ').filter(Boolean);

        // Retirer toutes les classes carousel-* existantes (nouvelles ET anciennes)
        const filteredClasses = classArray.filter(
          (cls) =>
            !cls.startsWith('nbc-carousel-cols-') &&
            cls !== 'nbc-carousel-min-width' &&
            // Retirer aussi les anciennes classes pour migration
            !cls.startsWith('carousel-cols-') &&
            cls !== 'carousel-min-width' &&
            !cls.startsWith('nbc-carousel-icon-')
        );

        if (enabled) {
          // Ajouter la classe 'nbc-carousel' si elle n'existe pas
          if (!filteredClasses.includes('nbc-carousel')) {
            filteredClasses.push('nbc-carousel');
          }

          // Pour les galeries, détecter et ajouter la classe nbc-carousel-cols-X
          if (name === 'core/gallery') {
            const columnCount = attributes.columns;

            // Si un nombre de colonnes est défini (jusqu'à 8 colonnes)
            if (columnCount && columnCount >= 1 && columnCount <= 8) {
              filteredClasses.push(`nbc-carousel-cols-${columnCount}`);
            }
            // Sinon, utiliser 3 colonnes par défaut
            else {
              filteredClasses.push('nbc-carousel-cols-3');
            }
          }

          // Pour les grilles (Group et Post Template), détecter et ajouter la classe nbc-carousel-cols-X
          if (
            (name === 'core/group' || name === 'core/post-template') &&
            attributes.layout?.type === 'grid'
          ) {
            const columnCount = attributes.layout?.columnCount;
            const minimumColumnWidth = attributes.layout?.minimumColumnWidth;
            const gridItemPosition = attributes.layout?.gridItemPosition;

            // Vérifier si on est en mode Auto (gridItemPosition === 'auto')
            // ou si minimumColumnWidth est défini (mode Auto implicite)
            const isAutoMode = gridItemPosition === 'auto' || (minimumColumnWidth && !columnCount);

            // Si un nombre de colonnes est défini (jusqu'à 16 colonnes) ET qu'on n'est pas en mode Auto
            if (columnCount && columnCount >= 1 && columnCount <= 16 && !isAutoMode) {
              filteredClasses.push(`nbc-carousel-cols-${columnCount}`);
            }
            // Si une largeur minimale est définie OU qu'on est en mode Auto
            else if (minimumColumnWidth || isAutoMode) {
              filteredClasses.push('nbc-carousel-min-width');
            }
            // Sinon, utiliser 3 colonnes par défaut
            else {
              filteredClasses.push('nbc-carousel-cols-3');
            }
          }
        } else {
          // Retirer la classe 'nbc-carousel'
          const index = filteredClasses.indexOf('nbc-carousel');
          if (index > -1) {
            filteredClasses.splice(index, 1);
          }
        }

        setAttributes({
          className: filteredClasses.join(' ').trim(),
        });
      };

      /**
       * Synchroniser automatiquement la classe nbc-carousel-cols-X
       * quand le nombre de colonnes change
       */
      useEffect(() => {
        if (!carouselEnabled) {
          return;
        }

        const currentClasses = attributes.className || '';
        const classArray = currentClasses.split(' ').filter(Boolean);

        // Trouver la classe nbc-carousel-cols-* actuelle
        const currentColsClass = classArray.find((cls) =>
          cls.startsWith('nbc-carousel-cols-')
        );
        const hasMinWidthClass = classArray.includes('nbc-carousel-min-width');

        let expectedColsClass = null;
        let shouldHaveMinWidthClass = false;

        // Gestion des galeries
        if (name === 'core/gallery') {
          const columnCount = attributes.columns;

          // Si un nombre de colonnes est défini (jusqu'à 8 colonnes)
          if (columnCount && columnCount >= 1 && columnCount <= 8) {
            expectedColsClass = `nbc-carousel-cols-${columnCount}`;
          }
          // Sinon, utiliser 3 colonnes par défaut
          else {
            expectedColsClass = 'nbc-carousel-cols-3';
          }
        }

        // Gestion des grilles (Group et Post Template)
        if (
          (name === 'core/group' || name === 'core/post-template') &&
          attributes.layout?.type === 'grid'
        ) {
          const columnCount = attributes.layout?.columnCount;
          const minimumColumnWidth = attributes.layout?.minimumColumnWidth;
          const gridItemPosition = attributes.layout?.gridItemPosition;

          // Vérifier si on est en mode Auto (gridItemPosition === 'auto')
          // ou si minimumColumnWidth est défini (mode Auto implicite)
          const isAutoMode = gridItemPosition === 'auto' || (minimumColumnWidth && !columnCount);

          // Si un nombre de colonnes est défini (jusqu'à 16 colonnes) ET qu'on n'est pas en mode Auto
          if (columnCount && columnCount >= 1 && columnCount <= 16 && !isAutoMode) {
            expectedColsClass = `nbc-carousel-cols-${columnCount}`;
            shouldHaveMinWidthClass = false;
          }
          // Si une largeur minimale est définie OU qu'on est en mode Auto
          else if (minimumColumnWidth || isAutoMode) {
            expectedColsClass = null;
            shouldHaveMinWidthClass = true;
          }
          // Sinon, utiliser 3 colonnes par défaut
          else {
            expectedColsClass = 'nbc-carousel-cols-3';
            shouldHaveMinWidthClass = false;
          }
        }

        // Si les classes ne correspondent pas, les mettre à jour
        if (currentColsClass !== expectedColsClass || hasMinWidthClass !== shouldHaveMinWidthClass) {
          const filteredClasses = classArray.filter(
            (cls) =>
              !cls.startsWith('nbc-carousel-cols-') &&
              cls !== 'nbc-carousel-min-width' &&
              // Retirer aussi les anciennes classes pour migration
              !cls.startsWith('carousel-cols-') &&
              cls !== 'carousel-min-width'
          );

          // Ajouter la nouvelle classe si nécessaire
          if (expectedColsClass) {
            filteredClasses.push(expectedColsClass);
          }
          if (shouldHaveMinWidthClass) {
            filteredClasses.push('nbc-carousel-min-width');
          }

          setAttributes({
            className: filteredClasses.join(' ').trim(),
          });
        }
      }, [
        carouselEnabled,
        name,
        attributes.columns, // Pour les galeries
        layoutKey, // Pour les grids
      ]);

      useEffect(() => {
        const currentClasses = attributes.className || '';
        const classArray = currentClasses.split(' ').filter(Boolean);
        const withoutIconClasses = classArray.filter((cls) => !cls.startsWith('nbc-carousel-icon-'));
        const normalizedStyle = normalizedArrowStyle;
        const desiredClass = `nbc-carousel-icon-${normalizedStyle}`;

        let nextClasses = withoutIconClasses;

        if (carouselEnabled) {
          if (!withoutIconClasses.includes(desiredClass)) {
            nextClasses = [...withoutIconClasses, desiredClass];
          }
        }

        const nextClassName = nextClasses.join(' ').trim();
        const currentClassName = classArray.join(' ').trim();

        if (nextClassName !== currentClassName) {
          setAttributes({
            className: nextClassName,
          });
        }

        if (typeof window !== 'undefined') {
          const doc = document;
          if (doc && typeof requestAnimationFrame === 'function') {
            const runUpdate = () => {
              const blockWrapper = doc.querySelector(`[data-block="${clientId}"]`);
              let targetCarousel = null;

              if (blockWrapper) {
                if (blockWrapper.classList && blockWrapper.classList.contains('nbc-carousel')) {
                  targetCarousel = blockWrapper;
                } else {
                  targetCarousel = blockWrapper.querySelector('.nbc-carousel');
                }
              }

              if (!targetCarousel) {
                return;
              }

              const config = {
                styleKey: normalizedStyle,
                elements: [targetCarousel],
              };

              applyArrowIconsToCarousels(null, doc, config);

              setTimeout(() => {
                applyArrowIconsToCarousels(null, doc, config);
              }, 50);
            };

            requestAnimationFrame(() => {
              requestAnimationFrame(runUpdate);
            });
          }
        }
      }, [carouselEnabled, carouselArrowStyle, clientId, attributes.className]);

      const ensureArrowStyleControlsCss = () => {
        if (typeof document === 'undefined') {
          return;
        }

        const styleId = 'nbc-arrow-style-control-styles';
        if (document.getElementById(styleId)) {
          return;
        }

        const style = document.createElement('style');
        style.id = styleId;
        style.type = 'text/css';
        style.textContent = `
          .nbc-arrow-style-panel .nbc-arrow-style-group {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .nbc-arrow-style-group .components-button {
            margin: 0 !important;
          }
          .nbc-arrow-style-group .components-button + .components-button {
            margin-left: 0 !important;
          }
          .nbc-arrow-style-button.components-button {
            width: 48px;
            height: 48px;
            padding: 0;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
            border: 1px solid rgba(0, 0, 0, 0.08);
            background: #f8f9fa;
            color: #1e1e1e;
            transition: box-shadow .2s ease, transform .2s ease;
          }
          .nbc-arrow-style-button.components-button.is-primary {
            background: var(--wp-admin-theme-color, #3858e9);
            border-color: var(--wp-admin-theme-color, #3858e9);
            color: #fff;
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
          }
          .nbc-arrow-style-button.components-button.is-secondary:hover {
            box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
            transform: translateY(-1px);
          }
          .nbc-arrow-style-button.components-button.is-primary:hover {
            filter: brightness(1.05);
            transform: translateY(-1px);
          }
          .nbc-arrow-style-button__icon svg {
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
              label: __('Activer le carousel', 'native-blocks-carousel'),
              checked: carouselEnabled,
              onChange: toggleCarousel,
              help: carouselEnabled
                ? name === 'core/gallery'
                  ? __(
                    'Le carousel est activé. Le nombre de colonnes visibles est détecté automatiquement depuis les paramètres de la galerie.',
                    'native-blocks-carousel'
                  )
                  : (name === 'core/group' || name === 'core/post-template') && attributes.layout?.type === 'grid'
                    ? attributes.layout?.minimumColumnWidth
                      ? __(
                        'Le carousel est activé en mode Auto. La largeur des slides est définie par la "Largeur minimale de colonne" (' + attributes.layout.minimumColumnWidth + ').',
                        'native-blocks-carousel'
                      )
                      : attributes.layout?.columnCount
                        ? __(
                          'Le carousel est activé en mode Manual. Le nombre de colonnes visibles (' + attributes.layout.columnCount + ') est détecté depuis les paramètres de la grille.',
                          'native-blocks-carousel'
                        )
                        : __(
                          'Le carousel est activé. Configurez le nombre de colonnes ou la largeur minimale dans les paramètres de la grille.',
                          'native-blocks-carousel'
                        )
                    : __(
                      'Le carousel est activé. Les éléments défilent horizontalement.',
                      'native-blocks-carousel'
                    )
                : __(
                  'Activez pour transformer ce bloc en carousel avec navigation. Vous pouvez ensuite choisir entre le mode Manual (nombre de colonnes) ou Auto (largeur minimale de colonne).',
                  'native-blocks-carousel'
                ),
            })
            ,
            carouselEnabled
              ? createElement(
                PanelBody,
                {
                  title: __('Style de flèches', 'native-blocks-carousel'),
                  initialOpen: true,
                  className: 'nbc-arrow-style-panel',
                },
                createElement(
                  ButtonGroup,
                  {
                    className: 'nbc-arrow-style-group',
                  },
                  arrowStyleOptions.map((option) =>
                    createElement(
                      Tooltip,
                      { key: option.value, text: option.label },
                      createElement(
                        Button,
                        {
                          className: 'nbc-arrow-style-button',
                          variant: normalizedArrowStyle === option.value ? 'primary' : 'secondary',
                          onClick: () => {
                            const nextValue = normalizeStyleKey(option.value || DEFAULT_ARROW_STYLE);
                            setAttributes({
                              carouselArrowStyle: nextValue,
                            });
                          },
                          'aria-pressed': normalizedArrowStyle === option.value,
                        },
                        createElement(
                          'span',
                          {
                            className: 'nbc-arrow-style-button__icon',
                            dangerouslySetInnerHTML: { __html: buildIconSvg(option.value) },
                            role: 'img',
                            'aria-hidden': true,
                          }
                        )
                      )
                    )
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
   * Wrapper pour injecter les styles inline du carousel dans l'éditeur
   * (minimumColumnWidth, blockGap, etc.)
   */
  const withCarouselStyles = createHigherOrderComponent((BlockListBlock) => {
    return (props) => {
      const { attributes, name } = props;

      // Ne s'applique qu'aux blocs avec carousel activé
      if (!attributes.carouselEnabled) {
        return createElement(BlockListBlock, props);
      }

      const customStyles = {};

      // Corriger le gap en utilisant la valeur calculée en direct
      if (typeof window !== 'undefined' && window.getComputedStyle) {
        const node = props?.clientId ? document.querySelector(`[data-block="${props.clientId}"]`) : null;
        const carouselNode = node && node.classList.contains('nbc-carousel') ? node : node?.querySelector?.('.nbc-carousel');
        if (carouselNode) {
          const computedGap = window.getComputedStyle(carouselNode).gap || window.getComputedStyle(carouselNode).columnGap;
          if (computedGap && computedGap !== 'normal') {
            customStyles['--wp--style--block-gap'] = computedGap;
          }
        }
      }

      // 1. Injecter --carousel-min-width pour les Grids avec minimumColumnWidth
      if (
        (name === 'core/group' || name === 'core/post-template') &&
        attributes.layout?.type === 'grid' &&
        attributes.layout?.minimumColumnWidth
      ) {
        customStyles['--carousel-min-width'] = attributes.layout.minimumColumnWidth;
      }

      // 2. Injecter --wp--style--block-gap pour tous les carousels
      let blockGap = attributes.style?.spacing?.blockGap;

      // Exception pour Gallery : utiliser le gap horizontal (left) pour le carousel
      if (name === 'core/gallery' && blockGap && typeof blockGap === 'object') {
        blockGap = blockGap.left || blockGap.top || null;
      }

      // Si c'est un preset WordPress (ex: "var:preset|spacing|50"), le convertir
      if (blockGap && typeof blockGap === 'string' && blockGap.startsWith('var:preset|spacing|')) {
        const presetSlug = blockGap.replace('var:preset|spacing|', '');
        blockGap = `var(--wp--preset--spacing--${presetSlug})`;
      }

      // Injecter le gap (même si c'est "0" pour None)
      if (blockGap !== undefined && blockGap !== null && blockGap !== '' && !customStyles['--wp--style--block-gap']) {
        // Convertir "0" en "0px" pour les calculs CSS
        customStyles['--wp--style--block-gap'] = (blockGap === '0' || blockGap === 0) ? '0px' : blockGap;
      }

      // 3. Injecter les variables de padding depuis les attributs du bloc
      const spacing = attributes.style?.spacing || {};
      const padding = spacing.padding || null;

      // Fonction pour convertir les presets WordPress
      const convertPreset = (value) => {
        if (typeof value === 'string' && value.startsWith('var:preset|spacing|')) {
          const presetSlug = value.replace('var:preset|spacing|', '');
          return `var(--wp--preset--spacing--${presetSlug})`;
        }
        return value;
      };

      // Extraire padding-left, padding-right, padding-top et padding-bottom
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
          // Si c'est une valeur unique (appliquée à tous les côtés)
          paddingLeft = padding;
          paddingRight = padding;
          paddingTop = padding;
          paddingBottom = padding;
        }
      }

      // Injecter les variables de padding
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

      // Si aucun style à injecter, retourner le bloc tel quel
      if (Object.keys(customStyles).length === 0) {
        return createElement(BlockListBlock, props);
      }

      // Créer le wrapper avec les styles inline
      const wrapperProps = {
        ...props,
        wrapperProps: {
          ...props.wrapperProps,
          style: {
            ...props.wrapperProps?.style,
            ...customStyles,
          },
          'data-nbc-carousel-arrow-style': attributes.carouselArrowStyle || DEFAULT_ARROW_STYLE,
        },
      };

      return createElement(BlockListBlock, wrapperProps);
    };
  }, 'withCarouselStyles');

  // Enregistrer les filtres
  addFilter(
    'blocks.registerBlockType',
    'native-blocks-carousel/add-carousel-attribute',
    addCarouselAttribute
  );

  addFilter(
    'editor.BlockEdit',
    'native-blocks-carousel/with-carousel-control',
    withCarouselControl
  );

  addFilter(
    'editor.BlockListBlock',
    'native-blocks-carousel/with-carousel-styles',
    withCarouselStyles
  );

  /**
   * Copie les variables CSS de padding du carousel vers le parent
   * (nécessaire pour les boutons fallback qui sont sur le parent)
   * Les variables sont déjà injectées depuis les attributs React via withCarouselStyles
   */
  function copyPaddingVariablesToParent() {
    const carousels = document.querySelectorAll('.nbc-carousel');
    carousels.forEach(function (carousel) {
      const computedStyle = window.getComputedStyle(carousel);

      // Lire les variables CSS déjà injectées depuis les attributs React
      const paddingLeft = computedStyle.getPropertyValue('--carousel-padding-left').trim() || '0px';
      const paddingRight = computedStyle.getPropertyValue('--carousel-padding-right').trim() || '0px';

      // Copier les variables sur le parent pour les boutons fallback
      const parent = carousel.parentElement;
      if (parent) {
        parent.style.setProperty('--carousel-padding-left', paddingLeft);
        parent.style.setProperty('--carousel-padding-right', paddingRight);
      }
    });
  }

  /**
   * Initialise la copie des variables de padding dans l'éditeur
   */
  function applyScrollPaddingInEditor() {

    // Exécuter après le rendu initial avec requestAnimationFrame
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

    // Observer les mutations DOM dans l'éditeur pour copier les variables quand elles changent
    if (window.MutationObserver) {
      let timeout;
      const observer = new MutationObserver(function () {
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

      // Observer le body de l'éditeur
      const editorBody = document.querySelector('.editor-styles-wrapper') || document.body;
      if (editorBody) {
        observer.observe(editorBody, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class']
        });
      }
    }
  }

  // Initialiser pour l'éditeur
  // Utiliser un hook WordPress pour s'assurer que les blocs sont rendus
  if (wp && wp.domReady) {
    wp.domReady(applyScrollPaddingInEditor);
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyScrollPaddingInEditor);
  } else {
    // Attendre un peu pour que WordPress applique les styles
    setTimeout(applyScrollPaddingInEditor, 100);
  }

  // Écouter les changements de blocs dans l'éditeur WordPress avec debounce
  // Pour copier les variables sur le parent quand les attributs changent
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
   * Met à jour dynamiquement les couleurs des boutons depuis les styles calculés
   * Reproduit le comportement de WordPress qui lit directement les styles calculés
   */
  function updateButtonColorsFromTheme() {
    const root = document.documentElement;
    let buttonBg = '';
    let buttonColor = '#fff';

    // Méthode principale : Lire depuis un bouton WordPress réel dans l'éditeur
    // C'est la méthode la plus fiable car elle lit exactement ce que WordPress applique
    const editorWrapper = document.querySelector('.editor-styles-wrapper');
    if (editorWrapper) {
      // Chercher un bouton existant dans l'éditeur
      let referenceButton = editorWrapper.querySelector('.wp-element-button, button.wp-element-button');

      // Si pas de bouton trouvé, en créer un temporaire dans le contexte de l'éditeur
      if (!referenceButton) {
        referenceButton = document.createElement('button');
        referenceButton.className = 'wp-element-button';
        referenceButton.style.position = 'absolute';
        referenceButton.style.visibility = 'hidden';
        referenceButton.style.pointerEvents = 'none';
        referenceButton.style.top = '-9999px';
        referenceButton.style.left = '-9999px';
        referenceButton.textContent = 'Button'; // Nécessaire pour que les styles s'appliquent
        editorWrapper.appendChild(referenceButton);
      }

      // Lire les styles calculés (comme WordPress le fait)
      const buttonComputedStyle = window.getComputedStyle(referenceButton);
      const computedBg = buttonComputedStyle.backgroundColor;
      const computedColor = buttonComputedStyle.color;

      // Utiliser les couleurs calculées si elles sont valides
      if (computedBg && computedBg !== 'rgba(0, 0, 0, 0)' && computedBg !== 'transparent') {
        buttonBg = computedBg;
      }

      if (computedColor && computedColor !== 'rgba(0, 0, 0, 0)') {
        buttonColor = computedColor;
      }

      // Nettoyer le bouton temporaire si on l'a créé
      if (referenceButton.parentNode === editorWrapper && referenceButton.style.position === 'absolute') {
        editorWrapper.removeChild(referenceButton);
      }
    } else {
      // Fallback : chercher dans tout le document
      const existingButton = document.querySelector('.wp-element-button, button.wp-element-button');
      if (existingButton) {
        const buttonComputedStyle = window.getComputedStyle(existingButton);
        const computedBg = buttonComputedStyle.backgroundColor;
        const computedColor = buttonComputedStyle.color;

        if (computedBg && computedBg !== 'rgba(0, 0, 0, 0)' && computedBg !== 'transparent') {
          buttonBg = computedBg;
        }

        if (computedColor && computedColor !== 'rgba(0, 0, 0, 0)') {
          buttonColor = computedColor;
        }
      }
    }

    // Appliquer les couleurs trouvées aux variables CSS du carousel
    if (buttonBg && buttonBg !== 'rgba(0, 0, 0, 0)' && buttonBg !== 'transparent' && buttonBg !== '') {
      root.style.setProperty('--carousel-button-bg', buttonBg);
    }

    const docContext = root.ownerDocument || document;

    if (buttonColor && buttonColor !== 'rgba(0, 0, 0, 0)' && buttonColor !== '') {
      root.style.setProperty('--carousel-button-color', buttonColor);

      // Générer les SVG des flèches avec la couleur du texte des boutons
      const arrowColor = convertColorToHexForSvg(buttonColor, docContext);
      const defaultLeftArrow = generateArrowSvg('left', arrowColor, DEFAULT_ARROW_STYLE);
      const defaultRightArrow = generateArrowSvg('right', arrowColor, DEFAULT_ARROW_STYLE);

      root.style.setProperty('--carousel-button-arrow-left', `url("${defaultLeftArrow}")`);
      root.style.setProperty('--carousel-button-arrow-right', `url("${defaultRightArrow}")`);
    }

    applyArrowIconsToCarousels(buttonColor, docContext);
  }

  // Fonction utilitaire pour convertir une couleur en hexadécimal
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

    if (element.dataset && element.dataset.nbcCarouselArrowStyle && ARROW_ICONS[element.dataset.nbcCarouselArrowStyle]) {
      return element.dataset.nbcCarouselArrowStyle;
    }

    const parentWithData = element.closest('[data-nbc-carousel-arrow-style]');
    if (parentWithData && parentWithData.dataset && ARROW_ICONS[parentWithData.dataset.nbcCarouselArrowStyle]) {
      return parentWithData.dataset.nbcCarouselArrowStyle;
    }

    const iconClass = Array.from(element.classList).find((cls) => cls.startsWith('nbc-carousel-icon-'));

    if (iconClass) {
      const styleKey = iconClass.replace('nbc-carousel-icon-', '');
      if (ARROW_ICONS[styleKey]) {
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

      // Lorsque le script s'exécute dans le back-office, les blocs sont rendus dans une iframe
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
          if (found.length) {
            found.forEach((node) => {
              if (node) {
                carousels.push(node);
              }
            });
          }
        } catch (e) {
          // Ignorer les contextes non accessibles (CORS, etc.)
        }
      });
    }

    if (!carousels.length) {
      return;
    }

    // Supprimer les doublons éventuels
    carousels = Array.from(new Set(carousels));

    const arrowColorCache = new WeakMap();

    carousels.forEach((carousel) => {
      const carouselDoc = carousel?.ownerDocument || baseDoc;
      let arrowColor = arrowColorCache.get(carouselDoc);
      if (!arrowColor) {
        arrowColor = resolveArrowColor(color, carouselDoc);
        arrowColorCache.set(carouselDoc, arrowColor);
      }
      const styleKey = overrideConfig && overrideConfig.styleKey && ARROW_ICONS[overrideConfig.styleKey]
        ? overrideConfig.styleKey
        : resolveCarouselArrowStyleFromElement(carousel);
      const leftArrowSvg = generateArrowSvg('left', arrowColor, styleKey);
      const rightArrowSvg = generateArrowSvg('right', arrowColor, styleKey);

      if (carousel.dataset) {
        carousel.dataset.nbcCarouselArrowStyle = styleKey;
      }

      carousel.style.setProperty('--carousel-button-arrow-left', `url("${leftArrowSvg}")`);
      carousel.style.setProperty('--carousel-button-arrow-right', `url("${rightArrowSvg}")`);

      const parent = carousel.parentElement;
      if (parent) {
        if (parent.dataset) {
          parent.dataset.nbcCarouselArrowStyle = styleKey;
        }
        parent.style.setProperty('--carousel-button-arrow-left', `url("${leftArrowSvg}")`);
        parent.style.setProperty('--carousel-button-arrow-right', `url("${rightArrowSvg}")`);
      }
    });
  }

  // Fonction utilitaire pour générer le SVG d'une flèche
  function generateArrowSvg(direction, color, iconKey) {
    const icon = ARROW_ICONS[iconKey] || ARROW_ICONS[DEFAULT_ARROW_STYLE];
    const directionKey = direction === 'left' ? 'left' : 'right';
    const pathConfig = icon.paths[directionKey] || icon.paths.right;
    const attributes = [`fill='${color}'`, `d='${pathConfig.d}'`];

    if (pathConfig.transform) {
      attributes.push(`transform='${pathConfig.transform}'`);
    }

    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${icon.viewBox}'><path ${attributes.join(' ')} /></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  /**
   * Initialise la mise à jour dynamique des couleurs dans l'éditeur de thème (Site Editor)
   * Observe les changements dans les balises <style> de .editor-styles-wrapper
   */
  function initThemeEditorColorSync() {
    let lastButtonBg = '';
    let lastButtonColor = '';
    let referenceButton = null;

    // Fonction pour obtenir l'iframe de l'aperçu dans le Site Editor
    function getPreviewIframe() {
      const iframeElement = document.querySelector('.edit-site-visual-editor__editor-canvas, iframe[name="editor-canvas"]');
      if (iframeElement && iframeElement.contentDocument) {
        return iframeElement.contentDocument;
      } else if (iframeElement && iframeElement.contentWindow) {
        try {
          return iframeElement.contentWindow.document;
        } catch (e) {
          // Erreur CORS
          return null;
        }
      }
      return null;
    }

    // Fonction pour créer/maintenir un bouton de référence
    function getReferenceButton() {
      // D'abord essayer dans l'iframe (Site Editor)
      let doc = getPreviewIframe();
      let editorWrapper = null;

      if (doc) {
        editorWrapper = doc.querySelector('.editor-styles-wrapper');
      } else {
        // Fallback : page principale (Block Editor normal)
        doc = document;
        editorWrapper = document.querySelector('.editor-styles-wrapper');
      }

      if (!editorWrapper) {
        return null;
      }

      // Chercher un bouton existant
      if (!referenceButton || !editorWrapper.contains(referenceButton)) {
        referenceButton = editorWrapper.querySelector('.wp-element-button, button.wp-element-button');

        // Si pas trouvé, en créer un
        if (!referenceButton) {
          referenceButton = doc.createElement('button');
          referenceButton.className = 'wp-element-button';
          referenceButton.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;top:-9999px;left:-9999px;';
          referenceButton.textContent = 'Button';
          editorWrapper.appendChild(referenceButton);
        }
      }

      return { button: referenceButton, doc: doc };
    }

    // Fonction de mise à jour avec détection de changement
    function checkAndUpdateColors() {
      const buttonData = getReferenceButton();
      if (!buttonData || !buttonData.button) {
        return;
      }

      const button = buttonData.button;
      const doc = buttonData.doc;
      const root = doc.documentElement;

      // Lire les styles calculés actuels
      const buttonComputedStyle = doc.defaultView.getComputedStyle(button);
      const currentBg = buttonComputedStyle.backgroundColor;
      const currentColor = buttonComputedStyle.color;

      // Vérifier si les couleurs ont changé
      const bgChanged = currentBg !== lastButtonBg &&
        currentBg !== 'rgba(0, 0, 0, 0)' &&
        currentBg !== 'transparent' &&
        currentBg !== '';
      const colorChanged = currentColor !== lastButtonColor &&
        currentColor !== 'rgba(0, 0, 0, 0)' &&
        currentColor !== '';

      // Mettre à jour si changement détecté
      if (bgChanged || colorChanged || !lastButtonBg) {
        lastButtonBg = currentBg;
        lastButtonColor = currentColor;

        // Appliquer les nouvelles couleurs dans le bon document (iframe ou page principale)
        if (currentBg && currentBg !== 'rgba(0, 0, 0, 0)' && currentBg !== 'transparent') {
          root.style.setProperty('--carousel-button-bg', currentBg);
        }

        if (currentColor && currentColor !== 'rgba(0, 0, 0, 0)') {
          root.style.setProperty('--carousel-button-color', currentColor);

          // Générer les SVG des flèches avec la couleur du texte des boutons
          const arrowColor = convertColorToHexForSvg(currentColor, doc);
          const leftArrowSvg = generateArrowSvg('left', arrowColor, DEFAULT_ARROW_STYLE);
          const rightArrowSvg = generateArrowSvg('right', arrowColor, DEFAULT_ARROW_STYLE);

          root.style.setProperty('--carousel-button-arrow-left', `url("${leftArrowSvg}")`);
          root.style.setProperty('--carousel-button-arrow-right', `url("${rightArrowSvg}")`);
        }

        applyArrowIconsToCarousels(currentColor, doc);
      }
    }


    // Mise à jour initiale après un court délai pour laisser WordPress charger les styles
    setTimeout(function () {
      updateButtonColorsFromTheme();
      checkAndUpdateColors();
    }, 500);

    // Observer spécifiquement les balises <style> dans .editor-styles-wrapper
    // WordPress met à jour ces balises quand les styles changent
    if (window.MutationObserver) {
      const observer = new MutationObserver(function (mutations) {
        let shouldUpdate = false;

        mutations.forEach(function (mutation) {
          // Si une balise <style> a été ajoutée/modifiée
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(function (node) {
              if (node.nodeName === 'STYLE' || (node.nodeType === 1 && node.tagName === 'STYLE')) {
                shouldUpdate = true;
              }
              if (node.nodeType === 1 && node.classList && node.classList.contains('nbc-carousel')) {
                shouldUpdate = true;
              }
            });
          }

          // Si le contenu d'une balise <style> a changé
          if (mutation.type === 'characterData' ||
            (mutation.type === 'attributes' && (mutation.target.tagName === 'STYLE' || mutation.attributeName === 'class'))) {
            shouldUpdate = true;
          }
        });

        if (shouldUpdate) {
          // Attendre un peu pour que WordPress finisse d'appliquer les styles
          setTimeout(function () {
            requestAnimationFrame(function () {
              requestAnimationFrame(checkAndUpdateColors);
            });
          }, 50);
        }
      });

      // Observer .editor-styles-wrapper dans l'iframe ET dans la page principale
      function observeEditorWrapper(doc) {
        const editorWrapper = doc.querySelector('.editor-styles-wrapper');
        if (editorWrapper) {
          observer.observe(editorWrapper, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ['style', 'class']
          });

          // Observer aussi toutes les balises <style> existantes
          const styleTags = editorWrapper.querySelectorAll('style');
          styleTags.forEach(function (styleTag) {
            observer.observe(styleTag, {
              childList: true,
              subtree: true,
              characterData: true
            });
          });
        }
      }

      // Observer dans l'iframe (Site Editor)
      const iframeDoc = getPreviewIframe();
      if (iframeDoc) {
        observeEditorWrapper(iframeDoc);
      }

      // Observer aussi dans la page principale (Block Editor normal)
      observeEditorWrapper(document);

      // Observer aussi l'iframe lui-même pour détecter quand il se recharge
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

    // Polling de secours toutes les 200ms (moins agressif)
    const pollingInterval = setInterval(function () {
      requestAnimationFrame(checkAndUpdateColors);
    }, 200);

    // Nettoyer l'intervalle quand on quitte la page
    window.addEventListener('beforeunload', function () {
      clearInterval(pollingInterval);
    });
  }

  // Initialiser la synchronisation des couleurs dans l'éditeur de thème
  // Utiliser plusieurs méthodes pour s'assurer que ça fonctionne

  // Méthode 1 : Via wp.domReady
  if (wp && wp.domReady) {
    wp.domReady(initThemeEditorColorSync);
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeEditorColorSync);
  } else {
    setTimeout(initThemeEditorColorSync, 200);
  }

  // Méthode 2 : Écouter les changements via wp.data (store Redux)
  // WordPress utilise Redux pour gérer l'état de l'éditeur
  if (wp && wp.data && wp.data.subscribe) {
    let settingsCheckInterval = null;

    // Attendre que le store soit prêt
    const initDataListener = function () {
      try {
        const select = wp.data.select('core/block-editor');
        if (select && select.getSettings) {
          let lastStylesString = '';

          // Vérifier périodiquement les settings
          settingsCheckInterval = setInterval(function () {
            try {
              const settings = select.getSettings();
              if (settings && settings.styles) {
                // Convertir les styles en string pour comparer
                const currentStylesString = JSON.stringify(settings.styles.elements?.button || {});

                if (currentStylesString !== lastStylesString) {
                  lastStylesString = currentStylesString;

                  // Déclencher une mise à jour
                  requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                      const button = document.querySelector('.editor-styles-wrapper .wp-element-button, .editor-styles-wrapper button.wp-element-button');
                      if (button) {
                        const computedStyle = window.getComputedStyle(button);
                        const bg = computedStyle.backgroundColor;
                        const color = computedStyle.color;

                        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                          document.documentElement.style.setProperty('--carousel-button-bg', bg);
                        }
                        if (color && color !== 'rgba(0, 0, 0, 0)') {
                          document.documentElement.style.setProperty('--carousel-button-color', color);

                          applyArrowIconsToCarousels(color, document);
                        }
                      }
                    });
                  });
                }
              }
            } catch (e) {
              // Ignorer les erreurs
            }
          }, 150);
        }
      } catch (e) {
        // Le store n'est pas encore disponible, réessayer plus tard
        setTimeout(initDataListener, 500);
      }
    };

    // Démarrer après un délai pour laisser WordPress initialiser
    setTimeout(initDataListener, 1000);
  }

  if (typeof window !== 'undefined') {
    window.nbcCarousel = window.nbcCarousel || {};
    window.nbcCarousel.applyArrowIconsToCarousels = (color, context, overrideConfig) => {
      const normalizedConfig = overrideConfig ? {
        ...overrideConfig,
        styleKey: normalizeStyleKey(overrideConfig.styleKey),
      } : overrideConfig;
      applyArrowIconsToCarousels(color, context || document, normalizedConfig);
    };
  }
})(window.wp);
