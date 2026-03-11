<?php
/**
 * Contrat pour les services responsables du chargement des traductions.
 *
 * @package AnyBlockCarouselSlider
 */

declare(strict_types=1);

namespace Weblazer\AnyBlockCarouselSlider\Contracts;

if (!defined('ABSPATH')) {
    exit;
}

interface TranslationServiceInterface extends ServiceInterface
{
    /**
     * Charge les fichiers de traduction du plugin.
     *
     * @return void
     */
    public function loadTranslations(): void;
}