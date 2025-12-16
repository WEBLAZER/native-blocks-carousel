<?php
/**
 * Handles theme-inherited styles for Any Block Carousel Slider.
 *
 * @package AnyBlockCarouselSlider
 */

declare(strict_types=1);

namespace Weblazer\AnyBlockCarouselSlider;

/**
 * Retrieves and injects button colors from the active theme.
 */
class ThemeStyles
{
    /**
     * Injects the theme's button colours into the plugin CSS.
     *
     * Looks for button colours defined in theme.json or compiled styles,
     * then exposes them as CSS variables.
     *
     * @return void
     */
    public function injectButtonColors(): void
    {
        $theme_json = \WP_Theme_JSON_Resolver::get_merged_data();
        $styles = $theme_json->get_stylesheet();
        $settings = $theme_json->get_data();

        $button_bg = '';
        $button_color = '';

        if (isset($settings['styles']['elements']['button']['color']['background'])) {
            $button_bg = $settings['styles']['elements']['button']['color']['background'];
        }

        if (isset($settings['styles']['elements']['button']['color']['text'])) {
            $button_color = $settings['styles']['elements']['button']['color']['text'];
        }

        if (empty($button_bg) && \preg_match('/.wp-element-button[^{]*\{[^}]*background-color:\s*([^;]+)/s', $styles, $matches)) {
            $button_bg = \trim($matches[1]);
        }

        if (empty($button_color) && \preg_match('/.wp-element-button[^{]*\{[^}]*color:\s*([^;]+)/s', $styles, $matches)) {
            $button_color = \trim($matches[1]);
        }

        $button_bg = $this->resolveCssVariable($button_bg, $styles);
        $button_color = $this->resolveCssVariable($button_color, $styles);

        $custom_css = ':root {';

        if (!empty($button_bg)) {
            $custom_css .= '--carousel-button-bg: ' . \esc_attr($button_bg) . ';';
        }

        if (!empty($button_color)) {
            $custom_css .= '--carousel-button-color: ' . \esc_attr($button_color) . ';';
        }

        $custom_css .= '}';

        if (!empty($button_bg) || !empty($button_color)) {
            \wp_add_inline_style('any-block-carousel-slider', $custom_css);
        }
    }

    /**
     * Resolves a CSS variable to its concrete value when possible.
     *
     * @param string $value  Potential CSS variable value.
     * @param string $styles Stylesheet contents to inspect.
     *
     * @return string
     */
    private function resolveCssVariable(string $value, string $styles): string
    {
        if (empty($value) || false === \strpos($value, 'var(')) {
            return $value;
        }

        if (\preg_match('/var\(([^)]+)\)/', $value, $var_match)) {
            $var_name = \trim($var_match[1]);
            if (\preg_match('/' . \preg_quote($var_name, '/') . ':\s*([^;]+)/s', $styles, $color_match)) {
                return \trim($color_match[1]);
            }
        }

        return $value;
    }
}