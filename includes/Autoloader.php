<?php
/**
 * Basic autoloader for Any Block Carousel Slider classes.
 *
 * @package AnyBlockCarouselSlider
 */

declare(strict_types=1);

namespace Weblazer\AnyBlockCarouselSlider;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Minimal PSR-4 autoloader for the plugin namespace.
 */
class Autoloader
{
    /**
     * Base directory that contains the classes.
     *
     * @var string
     */
    private string $baseDir;

    /**
     * Private constructor.
     *
     * @param string $baseDir Base directory.
     */
    private function __construct(string $baseDir)
    {
        $this->baseDir = rtrim($baseDir, '/\\') . '/';
    }

    /**
     * Registers the autoloader and returns the created instance.
     *
     * @param string $baseDir Base directory for classes.
     *
     * @return self
     */
    public static function register(string $baseDir): self
    {
        $autoloader = new self($baseDir);
        spl_autoload_register([$autoloader, 'autoload'], true, true);

        return $autoloader;
    }

    /**
     * Loads the file corresponding to the requested class if it belongs to the plugin namespace.
     *
     * @param string $class Fully-qualified class name.
     *
     * @return void
     */
    private function autoload(string $class): void
    {
        if (strpos($class, __NAMESPACE__ . '\\') !== 0) {
            return;
        }

        $relativeClass = substr($class, strlen(__NAMESPACE__) + 1);
        $relativePath = str_replace('\\', '/', $relativeClass) . '.php';
        $file = $this->baseDir . $relativePath;

        if (is_readable($file)) {
            require_once $file;
        }
    }
}