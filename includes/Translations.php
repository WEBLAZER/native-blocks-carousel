<?php
/**
 * Service de chargement des traductions pour Any Block Carousel Slider.
 *
 * @package AnyBlockCarouselSlider
 */

declare(strict_types=1);

namespace Weblazer\AnyBlockCarouselSlider;

if (!defined('ABSPATH')) {
    exit;
}

use Weblazer\AnyBlockCarouselSlider\Contracts\TranslationServiceInterface;

class Translations implements TranslationServiceInterface
{
    /**
     * {@inheritdoc}
     */
    public function register(): void
    {
        // Since WordPress 4.6, translation files for plugins hosted on WordPress.org
        // are loaded automatically based on the plugin headers. No action is required here.
    }

    /**
     * {@inheritdoc}
     */
    public function loadTranslations(): void
    {
        // Intentionally left blank: WordPress loads translations automatically.
    }
}