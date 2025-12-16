<?php
/**
 * Generic contract for Any Block Carousel Slider services.
 *
 * @package AnyBlockCarouselSlider
 */

declare(strict_types=1);

namespace Weblazer\AnyBlockCarouselSlider\Contracts;

interface ServiceInterface
{
    /**
     * Enregistre les hooks du service.
     *
     * @return void
     */
    public function register(): void;
}