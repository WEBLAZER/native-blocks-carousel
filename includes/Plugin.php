<?php
/**
 * Main class for the Any Block Carousel Slider plugin.
 *
 * @package AnyBlockCarouselSlider
 */

declare(strict_types=1);

namespace Weblazer\AnyBlockCarouselSlider;

if (!defined('ABSPATH')) {
    exit;
}

use Weblazer\AnyBlockCarouselSlider\Contracts\ServiceInterface;
use Weblazer\AnyBlockCarouselSlider\Translations;

/**
 * Entry point coordinating the different plugin services.
 */
class Plugin
{
    /**
     * Singleton instance.
     *
     * @var Plugin|null
     */
    private static ?Plugin $instance = null;

    /**
     * Registered services.
     *
     * @var ServiceInterface[]
     */
    private array $services;

    /**
     * Public constructor.
     *
     * @param ServiceInterface[] $services Plugin services.
     */
    public function __construct(array $services)
    {
        $this->services = $services;
    }

    /**
     * Retrieves the singleton instance of the plugin.
     *
     * @return Plugin
     */
    public static function instance(): Plugin
    {
        if (null === self::$instance) {
            $theme_styles = new ThemeStyles();
            $services = [
                new Translations(),
                new Assets(
                    ANY_BLOCK_CAROUSEL_SLIDER_VERSION,
                    ANY_BLOCK_CAROUSEL_SLIDER_PLUGIN_URL,
                    $theme_styles
                ),
                new Renderer(),
                new ReviewNotice(),
            ];

            self::$instance = new self($services);
        }

        return self::$instance;
    }

    /**
     * Boots the plugin by registering required hooks.
     *
     * @return void
     */
    public function boot(): void
    {
        \add_action('init', [$this, 'init']);
        \add_filter('plugin_row_meta', [$this, 'registerPluginRowMeta'], 10, 2);
    }

    /**
     * Adds custom meta links on the plugins page.
     *
     * @param string[] $links An array of the plugin's metadata links.
     * @param string   $file  Path to the plugin file relative to the plugins directory.
     * @return string[]
     */
    public function registerPluginRowMeta(array $links, string $file): array
    {
        if ($file === \plugin_basename(ANY_BLOCK_CAROUSEL_SLIDER_PLUGIN_FILE)) {
            $links[] = sprintf(
                '<a href="%1$s" target="_blank" rel="noopener noreferrer">%2$s</a>',
                \esc_url('https://ko-fi.com/weblazer'),
                \esc_html__('Buy me a coffee ☕', 'native-blocks-carousel')
            );
        }

        return $links;
    }

    /**
     * Init hook: prepares translations and services.
     *
     * @return void
     */
    public function init(): void
    {
        foreach ($this->services as $service) {
            $service->register();
        }
    }
}