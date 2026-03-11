(function (global) {
  'use strict';

  const shared = global.AnyBlockCarouselSliderShared || {};

  const DEFAULT_ARROW_STYLE = 'chevron';

  const ICON_BASE = {
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

  const ICON_ALIASES = {
    classic: 'chevron',
    'solid-full': 'arrow',
    arrowfull: 'arrow',
    'angles-right-solid-full': 'angles'
  };

  const ARROW_ICONS = {
    ...ICON_BASE,
    classic: ICON_BASE.chevron,
    'solid-full': ICON_BASE.arrow,
    angles: ICON_BASE.angles
  };

  const hasOwn = Object.prototype.hasOwnProperty;

  function normalizeStyleKey(styleKey) {
    if (!styleKey) {
      return DEFAULT_ARROW_STYLE;
    }

    if (hasOwn.call(ICON_BASE, styleKey)) {
      return styleKey;
    }

    if (hasOwn.call(ICON_ALIASES, styleKey)) {
      return ICON_ALIASES[styleKey];
    }

    return DEFAULT_ARROW_STYLE;
  }

  function getIconDefinition(styleKey) {
    const normalized = normalizeStyleKey(styleKey);
    return ARROW_ICONS[normalized] || ARROW_ICONS[DEFAULT_ARROW_STYLE];
  }

  function buildSvgElement(direction, color, styleKey, fillAttr) {
    const icon = getIconDefinition(styleKey);
    const directionKey = direction === 'left' ? 'left' : 'right';
    const pathConfig = icon.paths[directionKey] || icon.paths.right;
    const attributes = [`${fillAttr}='${color}'`, `d='${pathConfig.d}'`];

    if (pathConfig.transform) {
      attributes.push(`transform='${pathConfig.transform}'`);
    }

    return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${icon.viewBox}' aria-hidden='true'><path ${attributes.join(' ')} /></svg>`;
  }

  function generateArrowSvg(direction, color, styleKey) {
    const svg = buildSvgElement(direction, color, styleKey, 'fill');
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  function generateArrowMarkup(direction, color, styleKey) {
    return buildSvgElement(direction, color, styleKey, 'fill');
  }

  shared.DEFAULT_ARROW_STYLE = DEFAULT_ARROW_STYLE;
  shared.normalizeStyleKey = normalizeStyleKey;
  shared.getIconDefinition = getIconDefinition;
  shared.generateArrowSvg = generateArrowSvg;
  shared.generateArrowMarkup = generateArrowMarkup;

  global.AnyBlockCarouselSliderShared = shared;
})(window);

