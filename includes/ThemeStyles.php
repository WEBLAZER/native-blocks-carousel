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
        // Step 1: Get merged data (includes core + theme + user styles)
        // This is needed to get user styles (custom styles from site-editor)
        $merged_data = \WP_Theme_JSON_Resolver::get_merged_data();
        $styles = $merged_data->get_stylesheet();
        $merged_settings = $merged_data->get_data();
        
        // Get theme data separately (to check if theme has custom styles)
        $theme_data = \WP_Theme_JSON_Resolver::get_theme_data();
        $theme_settings = $theme_data->get_data();
        
        // Get user data separately (to check if user has custom styles)
        $user_data = \WP_Theme_JSON_Resolver::get_user_data();
        $user_settings = $user_data->get_data();

        // Initialize variables to store detected colors
        $button_bg = '';
        $button_color = '';

        // Step 2: Priority 1 - Check user styles (custom styles from site-editor)
        // User styles have the highest priority and should be used if they exist
        // Path: styles.elements.button.color.background
        if (isset($user_settings['styles']['elements']['button']['color']['background'])) {
            $button_bg = $user_settings['styles']['elements']['button']['color']['background'];
        }

        if (isset($user_settings['styles']['elements']['button']['color']['text'])) {
            $button_color = $user_settings['styles']['elements']['button']['color']['text'];
        }

        // Step 3: Priority 2 - Check theme styles (from theme.json)
        // Only use theme styles if user styles are not defined
        // Path: styles.elements.button.color.background
        if (empty($button_bg) && isset($theme_settings['styles']['elements']['button']['color']['background'])) {
            $button_bg = $theme_settings['styles']['elements']['button']['color']['background'];
        }

        if (empty($button_color) && isset($theme_settings['styles']['elements']['button']['color']['text'])) {
            $button_color = $theme_settings['styles']['elements']['button']['color']['text'];
        }

        // Step 4: Priority 3 - Fallback method - extract colors from compiled CSS
        // IMPORTANT: Only use this fallback if theme OR user has explicitly defined button styles
        // We check if theme or user has button element styles to avoid using WordPress core defaults
        // If neither theme nor user has button styles defined, we skip the fallback to avoid core defaults
        $has_custom_button_styles = (
            (isset($theme_settings['styles']['elements']['button']) && !empty($theme_settings['styles']['elements']['button']))
            || (isset($user_settings['styles']['elements']['button']) && !empty($user_settings['styles']['elements']['button']))
        );
        
        // This regex searches for .wp-element-button class and extracts background-color value
        // Pattern: .wp-element-button { ... background-color: VALUE; ... }
        // Only extract if theme or user has defined button styles (to avoid core defaults)
        if (empty($button_bg) && $has_custom_button_styles && \preg_match('/.wp-element-button[^{]*\{[^}]*background-color:\s*([^;]+)/s', $styles, $matches)) {
            $button_bg = \trim($matches[1]);
        }

        // Extract text color from compiled CSS if not found in theme.json or user styles
        // Pattern: .wp-element-button { ... color: VALUE; ... }
        // Only extract if theme or user has defined button styles
        if (empty($button_color) && $has_custom_button_styles && \preg_match('/.wp-element-button[^{]*\{[^}]*color:\s*([^;]+)/s', $styles, $matches)) {
            $button_color = \trim($matches[1]);
        }

        // Step 5: Resolve CSS variables to concrete values
        // If the color is a CSS variable (e.g., var(--wp--preset--color--primary)),
        // try to resolve it to its actual value (e.g., #007cba)
        $button_bg = $this->resolveCssVariable($button_bg, $styles);
        $button_color = $this->resolveCssVariable($button_color, $styles);

        // Step 5.5: Filter out WordPress core default colors
        // IMPORTANT: Only filter if colors don't come from user styles
        // If user has explicitly set colors in site-editor, we should respect them
        // even if they match core defaults (user might want to use core defaults intentionally)
        $colors_from_user = !empty($user_settings['styles']['elements']['button'] ?? []);
        
        if (!$colors_from_user) {
            // Only filter core defaults if colors don't come from user styles
            // This prevents using core defaults that might be stored in theme styles
            $button_bg = $this->filterCoreDefaultColors($button_bg);
            $button_color = $this->filterCoreDefaultColors($button_color);
        }

        // Step 6: Build CSS custom properties block
        // Create :root selector to define global CSS variables
        $custom_css = ':root {';

        // Add background color variable if found
        // esc_attr() sanitizes the value for safe output
        if (!empty($button_bg)) {
            $custom_css .= '--carousel-button-bg: ' . \esc_attr($button_bg) . ';';
        }

        // Add text color variable if found
        if (!empty($button_color)) {
            $custom_css .= '--carousel-button-color: ' . \esc_attr($button_color) . ';';
        }

        $custom_css .= '}';

        // Step 7: Inject the CSS into WordPress stylesheet
        // Only inject if at least one color was successfully detected
        // wp_add_inline_style() appends CSS to the specified stylesheet handle
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
        // If value is empty or not a CSS variable, return as-is
        // CSS variables use the format: var(--variable-name)
        if (empty($value) || false === \strpos($value, 'var(')) {
            return $value;
        }

        // Extract the variable name from var(--variable-name) format
        // Example: var(--wp--preset--color--primary) → --wp--preset--color--primary
        if (\preg_match('/var\(([^)]+)\)/', $value, $var_match)) {
            $var_name = \trim($var_match[1]);
            
            // Search for the variable definition in the compiled stylesheet
            // Pattern: --variable-name: VALUE;
            // preg_quote() escapes special regex characters in the variable name
            if (\preg_match('/' . \preg_quote($var_name, '/') . ':\s*([^;]+)/s', $styles, $color_match)) {
                // Return the resolved concrete value (e.g., #007cba instead of var(--wp--preset--color--primary))
                return \trim($color_match[1]);
            }
        }

        // If variable couldn't be resolved, return original value
        // This allows CSS to handle the variable at runtime
        return $value;
    }

    /**
     * Filters out WordPress core default button colors.
     *
     * Even if colors are detected from theme or user styles, ignore them
     * if they match WordPress core defaults. This prevents using core defaults
     * that might be stored in user global styles.
     *
     * @param string $color Color value to check (can be rgb, rgba, hex, etc.)
     * @return string Empty string if color matches core defaults, original value otherwise
     */
    private function filterCoreDefaultColors(string $color): string
    {
        if (empty($color)) {
            return $color;
        }

        // WordPress core default button colors
        // Background: rgb(50, 55, 60) = #32373c
        // Text: rgb(255, 255, 255) = #fff = #ffffff
        $core_defaults = [
            'rgb(50, 55, 60)',
            'rgba(50, 55, 60, 1)',
            'rgba(50, 55, 60,1)',
            '#32373c',
            'rgb(255, 255, 255)',
            'rgba(255, 255, 255, 1)',
            'rgba(255, 255, 255,1)',
            '#ffffff',
            '#fff',
        ];

        // Normalize the color for comparison
        $normalized_color = \strtolower(\trim($color));

        // Check if color matches any core default
        foreach ($core_defaults as $default) {
            $normalized_default = \strtolower(\trim($default));
            if ($normalized_color === $normalized_default) {
                // Return empty string to indicate this is a core default and should be ignored
                return '';
            }
        }

        // Also check for rgb/rgba values that might have different formatting
        // e.g., "rgb(50,55,60)" or "rgb( 50 , 55 , 60 )"
        if (\preg_match('/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i', $color, $matches)) {
            $r = (int) $matches[1];
            $g = (int) $matches[2];
            $b = (int) $matches[3];

            // Check if it matches core background default
            if ($r === 50 && $g === 55 && $b === 60) {
                return '';
            }

            // Check if it matches core text default
            if ($r === 255 && $g === 255 && $b === 255) {
                return '';
            }
        }

        return $color;
    }
}