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