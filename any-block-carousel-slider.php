<?php
/**
 * Plugin Name: Any Block Carousel Slider
 * Plugin URI: https://github.com/WEBLAZER/any-block-carousel-slider
 * Description: Transform any WordPress block into a performant carousel with pure CSS. Zero JavaScript, works with Gallery, Grid, Post Template, and Group blocks.
 * Version: 1.0.3.3
 * Author: weblazer35
 * Author URI: https://weblazer.fr
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: any-block-carousel-slider
 * Domain Path: /languages
 * Requires at least: 6.0
 * Tested up to: 6.8
 * Requires PHP: 7.4
 *
 * @package AnyBlockCarouselSlider
 */

declare(strict_types=1);

use Weblazer\AnyBlockCarouselSlider\Activator;
use Weblazer\AnyBlockCarouselSlider\Autoloader;
use Weblazer\AnyBlockCarouselSlider\Plugin;

if (!defined('ABSPATH')) {
    exit;
}

define('ANY_BLOCK_CAROUSEL_SLIDER_VERSION', '1.0.3.3');
define('ANY_BLOCK_CAROUSEL_SLIDER_PLUGIN_FILE', __FILE__);
define('ANY_BLOCK_CAROUSEL_SLIDER_PLUGIN_URL', plugin_dir_url(__FILE__));
define('ANY_BLOCK_CAROUSEL_SLIDER_PLUGIN_PATH', plugin_dir_path(__FILE__));
require_once __DIR__ . '/includes/Autoloader.php';

Autoloader::register(__DIR__ . '/includes/');

register_activation_hook(__FILE__, [Activator::class, 'activate']);
register_deactivation_hook(__FILE__, [Activator::class, 'deactivate']);

Plugin::instance()->boot();