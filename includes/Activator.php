<?php
/**
 * Handles plugin activation and deactivation.
 *
 * @package AnyBlockCarouselSlider
 */

declare(strict_types=1);

namespace Weblazer\AnyBlockCarouselSlider;

/**
 * Checks compatibility during plugin activation.
 */
class Activator
{
    /**
     * Runs on plugin activation.
     *
     * @return void
     */
    public static function activate(): void
    {
        if (\version_compare(\get_bloginfo('version'), '6.0', '<')) {
            \wp_die(
                \esc_html__('This plugin requires WordPress 6.0 or later.', 'native-blocks-carousel'),
                \esc_html__('WordPress version too low', 'native-blocks-carousel')
            );
        }

        if (\version_compare(\PHP_VERSION, '7.4', '<')) {
            \wp_die(
                \esc_html__('This plugin requires PHP 7.4 or later.', 'native-blocks-carousel'),
                \esc_html__('PHP version too low', 'native-blocks-carousel')
            );
        }
    }

    /**
     * Runs on plugin deactivation.
     *
     * @return void
     */
    public static function deactivate(): void
    {
        // Reserved for future cleanup if required.
    }
}