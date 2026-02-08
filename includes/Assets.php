<?php
/**
 * Handles asset loading for Any Block Carousel Slider.
 *
 * @package AnyBlockCarouselSlider
 */

declare(strict_types=1);

namespace Weblazer\AnyBlockCarouselSlider;

if (!defined('ABSPATH')) {
    exit;
}

use Weblazer\AnyBlockCarouselSlider\Contracts\ServiceInterface;

/**
 * Loads the plugin styles and scripts.
 */
class Assets implements ServiceInterface
{
    /**
     * Plugin version.
     *
     * @var string
     */
    private string $version;

    /**
     * Base plugin URL.
     *
     * @var string
     */
    private string $pluginUrl;

    /**
     * Service in charge of theme-inherited styles.
     *
     * @var ThemeStyles
     */
    private ThemeStyles $themeStyles;

    /**
     * Constructor.
     *
     * @param string      $version     Plugin version.
     * @param string      $plugin_url  Base plugin URL.
     * @param ThemeStyles $themeStyles Theme styles service.
     */
    public function __construct(string $version, string $plugin_url, ThemeStyles $themeStyles)
    {
        $this->version = $version;
        $this->pluginUrl = $plugin_url;
        $this->themeStyles = $themeStyles;
    }

    /**
     * Registers hooks used to load assets.
     *
     * @return void
     */
    public function register(): void
    {
        \add_action('enqueue_block_assets', [$this, 'enqueueBlockAssets']);
        \add_action('enqueue_block_editor_assets', [$this, 'enqueueEditorAssets']);
    }

    /**
     * Enqueues shared styles and scripts (frontend + editor).
     *
     * @return void
     */
    public function enqueueBlockAssets(): void
    {
        $this->registerScripts();

        \wp_enqueue_style(
            'any-block-carousel-slider',
            $this->pluginUrl . 'assets/css/carousel.css',
            [],
            $this->version
        );

        \wp_enqueue_script('any-block-carousel-slider-shared');

        if (!\is_admin()) {
            \wp_enqueue_script('any-block-carousel-slider-frontend');
        }

        $this->themeStyles->injectButtonColors();
    }

    /**
     * Enqueues Gutenberg editor specific scripts.
     *
     * @return void
     */
    public function enqueueEditorAssets(): void
    {
        $this->registerScripts();

        \wp_enqueue_style('any-block-carousel-slider');

        $editorStylesPath = ANY_BLOCK_CAROUSEL_SLIDER_PLUGIN_PATH . 'assets/css/carousel-editor.css';
        if (\file_exists($editorStylesPath)) {
            $editorStyles = \file_get_contents($editorStylesPath);
            if ($editorStyles) {
                \wp_add_inline_style('any-block-carousel-slider', $editorStyles);
            }
        }

        \wp_enqueue_script('any-block-carousel-slider-shared');

        \wp_enqueue_script('any-block-carousel-slider-editor');
    }

    /**
     * Registers plugin scripts with dependencies.
     *
     * @return void
     */
    private function registerScripts(): void
    {
        if (!\wp_script_is('any-block-carousel-slider-shared', 'registered')) {
            \wp_register_script(
                'any-block-carousel-slider-shared',
                $this->pluginUrl . 'assets/js/carousel-shared.js',
                [],
                $this->version,
                true
            );
        }

        if (!\wp_script_is('any-block-carousel-slider-frontend', 'registered')) {
            \wp_register_script(
                'any-block-carousel-slider-frontend',
                $this->pluginUrl . 'assets/js/carousel-frontend-init.js',
                ['any-block-carousel-slider-shared'],
                $this->version,
                true
            );
        }

        if (!\wp_script_is('any-block-carousel-slider-editor', 'registered')) {
            \wp_register_script(
                'any-block-carousel-slider-editor',
                $this->pluginUrl . 'assets/js/carousel-editor.js',
                [
                    'any-block-carousel-slider-shared',
                    'wp-blocks',
                    'wp-element',
                    'wp-editor',
                    'wp-components',
                    'wp-data',
                    'wp-compose',
                    'wp-hooks',
                    'wp-i18n',
                ],
                $this->version,
                true
            );
        }
    }
}