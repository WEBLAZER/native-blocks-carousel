<?php
/**
 * Logic responsible for injecting CSS variables into rendered blocks.
 *
 * @package AnyBlockCarouselSlider
 */

declare(strict_types=1);

namespace Weblazer\AnyBlockCarouselSlider;

use Weblazer\AnyBlockCarouselSlider\Contracts\ServiceInterface;

/**
 * Adds the CSS variables required for the carousel to operate.
 */
class Renderer implements ServiceInterface
{
    /**
     * Registers the render hook for blocks.
     *
     * @return void
     */
    public function register(): void
    {
        \add_filter('render_block', [$this, 'injectCarouselVariables'], 20, 2);
    }

    /**
     * Injects the CSS variables required by the carousel into the rendered HTML.
     *
     * @param string $block_content Block HTML content.
     * @param array  $block         Block data.
     *
     * @return string
     */
    public function injectCarouselVariables(string $block_content, array $block): string
    {
        $class_name = $block['attrs']['className'] ?? '';
        $has_carousel_class = false !== \strpos($class_name, 'abcs')
            || false !== \strpos($block_content, 'abcs');

        if (!$has_carousel_class) {
            return $block_content;
        }

        $custom_styles = [];

        $this->maybeAddMinWidthVariables($custom_styles, $block, $class_name, $block_content);
        $this->maybeAddBlockGapVariable($custom_styles, $block);
        $this->maybeAddPaddingVariables($custom_styles, $block, $block_content);

        // Get loop and autoplay attributes
        $loop = $block['attrs']['carouselLoop'] ?? false;
        $autoplay = $block['attrs']['carouselAutoplay'] ?? false;
        $autoplay_delay = $block['attrs']['carouselAutoplayDelay'] ?? 3000;

        $has_styles = !empty($custom_styles);
        $has_loop_attrs = $loop;
        $has_autoplay_attrs = $autoplay;

        // If no styles and no loop/autoplay attributes, return early
        if (!$has_styles && !$has_loop_attrs && !$has_autoplay_attrs) {
            return $block_content;
        }

        $styles_string = $has_styles ? $this->buildStylesString($custom_styles) : '';

        if (\class_exists('\\WP_HTML_Tag_Processor')) {
            $processor = new \WP_HTML_Tag_Processor($block_content);

            if ($processor->next_tag(['class_name' => 'abcs'])) {
                if ($has_styles) {
                    $existing_style = $processor->get_attribute('style');
                    $processor->set_attribute('style', $this->mergeStyleAttribute($existing_style, $styles_string));
                }

                // Add loop data attribute
                if ($has_loop_attrs) {
                    $processor->set_attribute('data-abcs-loop', $loop ? 'true' : 'false');
                }

                // Add autoplay data attributes
                if ($has_autoplay_attrs) {
                    $processor->set_attribute('data-abcs-autoplay', $autoplay ? 'true' : 'false');
                    $processor->set_attribute('data-abcs-autoplay-delay', (string) $autoplay_delay);
                }

                $modified_content = $processor->get_updated_html();

                if (\is_string($modified_content)) {
                    return $modified_content;
                }
            }
        }

        // Fallback to regex if WP_HTML_Tag_Processor is not available
        $pattern = '/(<(?:div|ul|figure)\s+[^>]*class="[^"]*\babcs\b[^"]*"[^>]*?)(?:\s+style="([^"]*)")?(\s*>)/i';

        $replacement = function (array $matches) use ($styles_string, $loop, $autoplay, $autoplay_delay, $has_styles, $has_loop_attrs, $has_autoplay_attrs) {
            $tag_start = $matches[1];
            $existing_style = $matches[2] ?? '';
            $tag_end = $matches[3];

            $result = $tag_start;

            // Add style attribute if needed
            if ($has_styles) {
                $existing_style_trimmed = '' !== $existing_style ? \trim($existing_style) : '';
                if ('' !== $existing_style_trimmed && ';' !== \substr($existing_style_trimmed, -1)) {
                    $existing_style_trimmed .= ';';
                }
                $new_style = $existing_style_trimmed . $styles_string;
                $result .= ' style="' . \esc_attr($new_style) . '"';
            } elseif ($existing_style) {
                $result .= ' style="' . \esc_attr($existing_style) . '"';
            }

            // Add loop data attribute
            if ($has_loop_attrs) {
                $result .= ' data-abcs-loop="' . \esc_attr($loop ? 'true' : 'false') . '"';
            }

            // Add autoplay data attributes
            if ($has_autoplay_attrs) {
                $result .= ' data-abcs-autoplay="' . \esc_attr($autoplay ? 'true' : 'false') . '"';
                $result .= ' data-abcs-autoplay-delay="' . \esc_attr((string) $autoplay_delay) . '"';
            }

            $result .= $tag_end;

            return $result;
        };

        $modified_content = \preg_replace_callback($pattern, $replacement, $block_content, 1);

        return $modified_content ?: $block_content;
    }

    /**
     * Adds variables related to minimumColumnWidth mode when needed.
     *
     * @param array  $custom_styles Reference to the styles array to inject.
     * @param array  $block         Block data.
     * @param string $class_name    Block class names.
     * @param string $block_content Block HTML.
     *
     * @return void
     */
    private function maybeAddMinWidthVariables(array &$custom_styles, array $block, string $class_name, string $block_content): void
    {
        if (
            ('core/group' !== ($block['blockName'] ?? '') && 'core/post-template' !== ($block['blockName'] ?? ''))
            || false === \strpos($class_name, 'abcs-min-width')
        ) {
            return;
        }

        $min_width = $block['attrs']['layout']['minimumColumnWidth']
            ?? $block['attrs']['minimumColumnWidth']
            ?? null;

        if (!$min_width && \preg_match('/minmax\(min\(([^,]+),/', $block_content, $matches)) {
            $min_width = \trim($matches[1]);
        }

        if (!$min_width && \preg_match('/grid-template-columns:\s*[^;]*minmax\(min\(([^,]+),/', $block_content, $matches)) {
            $min_width = \trim($matches[1]);
        }

        if ($min_width) {
            $custom_styles['--carousel-min-width'] = $min_width;
        }
    }

    /**
     * Adds the blockGap spacing variable when available.
     *
     * @param array $custom_styles Reference to the styles array to inject.
     * @param array $block         Block data.
     *
     * @return void
     */
    private function maybeAddBlockGapVariable(array &$custom_styles, array $block): void
    {
        $block_gap = $block['attrs']['style']['spacing']['blockGap'] ?? null;

        if ('core/gallery' === ($block['blockName'] ?? '') && \is_array($block_gap)) {
            $block_gap = $block_gap['left'] ?? $block_gap['top'] ?? null;
        }

        if ($block_gap && \is_string($block_gap) && 0 === \strpos($block_gap, 'var:preset|spacing|')) {
            $preset_slug = \str_replace('var:preset|spacing|', '', $block_gap);
            $block_gap = "var(--wp--preset--spacing--{$preset_slug})";
        }

        if (null !== $block_gap && '' !== $block_gap) {
            $custom_styles['--wp--style--block-gap'] = ('0' === $block_gap || 0 === $block_gap) ? '0px' : $block_gap;
        }
    }

    /**
     * Adds the padding variables used by the carousel.
     *
     * @param array  $custom_styles Reference to the styles array to inject.
     * @param array  $block         Block data.
     * @param string $block_content Block HTML.
     *
     * @return void
     */
    private function maybeAddPaddingVariables(array &$custom_styles, array $block, string $block_content): void
    {
        $spacing = $block['attrs']['style']['spacing'] ?? [];
        $padding = $spacing['padding'] ?? null;

        $padding_left = null;
        $padding_right = null;
        $padding_top = null;
        $padding_bottom = null;

        if (\is_array($padding)) {
            $padding_left = $padding['left'] ?? null;
            $padding_right = $padding['right'] ?? null;
            $padding_top = $padding['top'] ?? null;
            $padding_bottom = $padding['bottom'] ?? null;
        } elseif (\is_string($padding) && '' !== $padding) {
            $padding_left = $padding;
            $padding_right = $padding;
            $padding_top = $padding;
            $padding_bottom = $padding;
        }

        if (null === $padding_left && null === $padding_right && null === $padding_top && null === $padding_bottom) {
            if (\preg_match('/(<(?:div|ul|figure)[^>]*class="[^"]*\babcs\b[^"]*"[^>]*?)(?:\s+style="([^"]*)")?/i', $block_content, $carousel_matches)) {
                $style_attr = $carousel_matches[2] ?? '';

                if (!empty($style_attr)) {
                    $padding_left = $this->matchStyleValue($style_attr, 'padding-left');
                    $padding_right = $this->matchStyleValue($style_attr, 'padding-right');
                    $padding_top = $this->matchStyleValue($style_attr, 'padding-top');
                    $padding_bottom = $this->matchStyleValue($style_attr, 'padding-bottom');

                    if (null === $padding_left && null === $padding_right && null === $padding_top && null === $padding_bottom) {
                        $padding_value = $this->matchStyleValue($style_attr, 'padding');
                        if (null !== $padding_value && !\preg_match('/\s/', $padding_value)) {
                            $padding_left = $padding_value;
                            $padding_right = $padding_value;
                            $padding_top = $padding_value;
                            $padding_bottom = $padding_value;
                        }
                    }
                }
            }
        }

        $padding_left = $this->convertSpacingPreset($padding_left);
        $padding_right = $this->convertSpacingPreset($padding_right);
        $padding_top = $this->convertSpacingPreset($padding_top);
        $padding_bottom = $this->convertSpacingPreset($padding_bottom);

        $custom_styles['--carousel-scroll-padding-left'] = $this->ensureUnit($padding_left, '0px');
        $custom_styles['--carousel-scroll-padding-right'] = $this->ensureUnit($padding_right, '0px');
        $custom_styles['--carousel-padding-left'] = $this->ensureUnit($padding_left, '0px');
        $custom_styles['--carousel-padding-right'] = $this->ensureUnit($padding_right, '0px');
        $custom_styles['--carousel-padding-top'] = $this->ensureUnit($padding_top, '1rem');
        $custom_styles['--carousel-padding-bottom'] = $this->ensureUnit($padding_bottom, '1rem');
    }

    /**
     * Builds the inline style string to inject.
     *
     * @param array $custom_styles List of styles to add.
     *
     * @return string
     */
    private function buildStylesString(array $custom_styles): string
    {
        $styles_string = '';

        foreach ($custom_styles as $property => $value) {
            if (\in_array($property, ['--carousel-padding-left', '--carousel-padding-right', '--carousel-scroll-padding-left', '--carousel-scroll-padding-right'], true)
                && ('0' === $value || 0 === $value)
            ) {
                $value = '0px';
            }

            $styles_string .= \esc_attr($property) . ':' . \esc_attr((string) $value) . ';';
        }

        return $styles_string;
    }

    /**
     * Retrieves a CSS value from a style attribute.
     *
     * @param string $style_attr Full style attribute string.
     * @param string $property   CSS property to find.
     *
     * @return string|null
     */
    private function matchStyleValue(string $style_attr, string $property): ?string
    {
        if (\preg_match('/' . \preg_quote($property, '/') . ':\s*([^;]+)/i', $style_attr, $matches)) {
            return \trim($matches[1]);
        }

        return null;
    }

    /**
     * Converts a WordPress preset value into a usable CSS variable.
     *
     * @param string|null $value Value to convert.
     *
     * @return string|null
     */
    private function convertSpacingPreset(?string $value): ?string
    {
        if (null === $value || '' === $value) {
            return $value;
        }

        if (\is_string($value) && 0 === \strpos($value, 'var:preset|spacing|')) {
            $preset_slug = \str_replace('var:preset|spacing|', '', $value);
            return "var(--wp--preset--spacing--{$preset_slug})";
        }

        return $value;
    }

    /**
     * Ensures a value has a CSS unit.
     *
     * @param string|null $value           Original value.
     * @param string      $defaultFallback Fallback value when nothing is defined.
     *
     * @return string
     */
    private function ensureUnit(?string $value, string $defaultFallback): string
    {
        if (null === $value || '' === $value) {
            return $defaultFallback;
        }

        if ('0' === $value || 0 === $value) {
            return '0px';
        }

        return $value;
    }

    /**
     * Merges the existing style attribute with the generated variables.
     *
     * @param string|null $existing_style Original style attribute.
     * @param string      $styles_string  Styles to append.
     *
     * @return string
     */
    private function mergeStyleAttribute(?string $existing_style, string $styles_string): string
    {
        $existing_style = null === $existing_style ? '' : \trim($existing_style);

        if ('' !== $existing_style && ';' !== \substr($existing_style, -1)) {
            $existing_style .= ';';
        }

        return $existing_style . $styles_string;
    }
}