=== Any Block Carousel Slider ===
Contributors: weblazer
Tags: carousel, slider, block, gutenberg, woocommerce
Requires at least: 6.0
Tested up to: 6.9.1
Requires PHP: 7.4
Stable tag: 1.0.4.2
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Gutenberg carousel slider block: transform any WordPress block into a responsive carousel with pure CSS. Zero JavaScript.

== Description ==

**Any Block Carousel Slider** is a Gutenberg carousel slider block plugin that instantly converts supported native WordPress blocks (Query Loop/Post Template, Group, Gallery) into a responsive carousel slider without adding a dedicated block or loading a JavaScript library. Simply enable the "Carousel" toggle in the Gutenberg editor: your content stays 100% native, your DOM stays lightweight, and your Lighthouse performance scores remain intact. This includes WooCommerce product listings rendered via the Query Loop/Post Template block, so you can showcase products without relying on the legacy Products block.

Unlike many all-in-one carousel slider blocks that require you to add a dedicated "Carousel" block and rebuild every slide, **Any Block Carousel Slider** hooks straight into the Gutenberg blocks you already use. The result: a Query Loop/Post Template, Group, or Gallery block can become a carousel slider in one click, without content duplication or extra maintenance.

= Why Any Block Carousel Slider instead of a dedicated carousel slider block? =

* **WordPress loops without friction** – Transform Query Loop and Post Template Gutenberg blocks into a "loop slider" without creating a block per slide.
* **Familiar editorial experience** – Content editors keep the Gutenberg interface they know (patterns, global styles, alignments, inner blocks).
* **Zero JavaScript on the frontend** – Native scroll, `scroll-snap`, GPU-friendly, no Swiper/Slick bundle to load.
* **Full compatibility** – Works with classic themes and block themes while respecting the structure of your Query Loop/Post Template, Group, and Gallery blocks.
* **Accessibility + SEO** – Keyboard navigation, respects `prefers-reduced-motion` preferences, clean DOM for crawling.

= What you can do in 30 seconds =

* **Blog / Magazine**: Display your latest posts in a Query Loop carousel with native filters and badges.
* **Portfolios & testimonials**: Keep your Group blocks and make them scrollable without rebuilding every slide.
* **Advanced galleries**: Turn the Gallery block into a responsive slider while keeping all native settings.
* **Landing sections**: Chain complex sections (image, title, buttons, forms) inside the same Group block and scroll them horizontally.
* **WooCommerce highlights**: Use a Query Loop configured for products (featured, on sale, custom taxonomy) and convert it into a CSS-only product carousel.

= Quick comparison =

- **Activation**: Any Block Carousel Slider – toggle an existing Gutenberg block. Classic carousel slider blocks – add a dedicated slider block and rebuild every slide.
- **WordPress loop**: Any Block Carousel Slider – works with Query Loop and Post Template blocks without duplication. Competitor carousels – require one block per slide or custom code.
- **Frontend JavaScript**: Any Block Carousel Slider – zero JavaScript, 100% CSS carousel slider. Competitor carousels – load Swiper/Slick and additional scripts.
- **Performance**: Any Block Carousel Slider – lightweight DOM, no external assets. Competitor carousels – multiply files, reflow, and downloads.
- **Content maintenance**: Any Block Carousel Slider – single Gutenberg block to update. Competitor carousels – duplicate content in dedicated slides.
- **Security & upkeep**: Any Block Carousel Slider – no third-party libraries to monitor. Competitor carousels – depend on external JS libraries like Swiper/Slick.

= Key features =

* **100% CSS** – Smooth carousel slider with `scroll-snap`, `::scroll-button`, and `::scroll-marker`. No script to bundle.
* **Loop functionality** – Enable infinite scrolling with seamless reset to start/end when reaching boundaries.
* **Autoplay support** – Automatic slide progression with configurable delay and pause on hover/interaction.
* **Smart responsive** – Automatically handles visible columns, spacing, and control sizes according to WordPress breakpoints (1280, 1024, 782, 600, 480, 375).
* **Two width modes** – Manual mode (fixed column count) and Auto mode (fixed width like 320px) with automatic detection.
* **Gutenberg block spacing detection** – Respects `gap` and `padding` values defined in the block editor, including presets.
* **Theme colors** – Buttons automatically inherit your theme's colors and radii (via CSS variables).
* **Intact semantics** – Your Gutenberg block's tags and classes remain unchanged: perfect for SEO, schemas, and E2E testing.
* **WooCommerce friendly** – Query Loop can target the `product` post type, so WooCommerce grids become CSS-only carousels without a dedicated Products block integration.

= Native Gutenberg block workflow =

1. Add or edit one of the supported blocks (Gallery, Group, or Query Loop/Post Template).
2. Enable the **Carousel** option in the Gutenberg sidebar panel (Layout or Block section depending on the block).
3. Adjust your usual settings (column count, minimum width, spacing, alignment).
4. Save: your block becomes a touch-friendly, accessible, and SEO-friendly carousel slider.

= Advanced customization =

* **Loop mode** – Enable infinite scrolling: when reaching the end, the carousel seamlessly resets to the beginning (and vice versa). Navigation buttons remain active at all times.
* **Autoplay** – Automatic slide progression with configurable delay (default: 3000ms). Autoplay pauses on hover and user interaction, and stops at the end when loop is disabled.
* **Manual mode (fixed columns)** – Ideal for article carousel sliders: 1 to 6 columns depending on screen sizes.
* **Auto mode (fixed width)** – Perfect for card-based sliders (posts, testimonials, product highlights) with pixel-perfect widths like 280px, 320px, or 360px.
* **Padding and gaps** – Automatic management via CSS vars `--carousel-padding-*`, `--wp--style--block-gap`.
* **Themes & `theme.json`** – Override variables to align controls with your design system.
* **Graceful degradation** – If a browser doesn't support `::scroll-button`, users keep touch and mouse scrolling.

= Technical architecture =

* `render_block` hook to inject variables based on context (block type, columns, gaps).
* Dedicated service for translating labels and help messages.
* Separate editor/frontend styles for a transparent Gutenberg experience.
* Code organized by PSR-4 services (see `ARCHITECTURE.md` for details).

== Installation ==

= Automatic installation =

1. Go to "Plugins" → "Add New".
2. Search for **Any Block Carousel Slider**.
3. Click "Install Now" then "Activate".

= Manual installation =

1. Download the plugin archive.
2. Upload the folder to `/wp-content/plugins/`.
3. Activate it from the "Plugins" menu.

= Usage =

1. Open a page, post, or template in the Gutenberg editor.
2. Select a supported block (Gallery, Group, or Query Loop/Post Template).
3. Enable the **Carousel** button in the block settings.
4. Adjust your columns, minimum width, or spacing.
5. Publish or update: the carousel slider is operational.

== How to use the plugin ==

1. Install and activate **Any Block Carousel Slider** from the Plugins screen (Plugins → Add New → search → Install → Activate).
2. Open the block editor, insert one of the supported blocks (Query Loop/Post Template, Group, Gallery), and toggle the **Carousel** option in the sidebar.
3. Ensure the carousel-enabled block sits inside a parent Group (or similar container) so the wrapper can manage overflow, spacing, and arrow positioning properly.
4. Switch the block layout to **Grid** then adjust the column count to match your design.

== Frequently Asked Questions ==

= How does Any Block Carousel Slider differ from traditional carousel blocks? =

Unlike traditional carousels that force you to insert a dedicated "Carousel" block and rebuild each slide by hand, Any Block Carousel Slider turns the Gutenberg blocks you already have (Query Loop/Post Template, Group, Gallery) into a slider via a simple toggle. With a Query Loop for instance, legacy solutions usually require limiting the loop to one post per slide and duplicating layouts. Here, one block is enough: single action, zero duplication, maximum performance.

= Is it compatible with all themes (block themes, FSE)? =

Yes. The Gutenberg carousel slider block plugin reads style variables generated by your theme (classic or full site editing) and applies the carousel slider without breaking the initial grid.

= Does it require JavaScript on the frontend? =

No. Everything relies on native CSS. Only a few lines of JavaScript executed in the editor handle the toggle interface. This means zero JavaScript bundle to load (unlike plugins using Swiper.js or Slick), resulting in better Lighthouse scores and Core Web Vitals.

= How do I transform a Query Loop into a carousel? =

Enable the Query Loop Gutenberg block (or Post Template), configure your filters and rendering, then check **Carousel**. For Post Template blocks, switch the layout to **Grid** so you can control the number of cards displayed per viewport. Posts are automatically aligned on a scrollable line with snap and CSS arrows. This is the main advantage over traditional carousel slider plugins that don't support Query Loops natively.

= Can I mix images, titles, buttons, and forms in the same carousel? =

Yes. The plugin respects existing inner Gutenberg blocks. A Group block containing image, text, buttons, or forms is transformed as-is in carousel mode.

= How do I control the number of visible columns? =

Switch the block layout to **Grid** in the Gutenberg sidebar (Layout panel) and set the desired column count for each breakpoint. The carousel inherits the same grid settings, so adjusting the Grid controls is the recommended way to decide how many slides remain visible.

= WooCommerce compatible? =

Yes, when your products are rendered via the Query Loop/Post Template block (for example by querying the `product` post type or a WooCommerce pattern). A dedicated integration for the legacy Products block remains on the roadmap, but today you can already build product sliders by using the Query Loop to target WooCommerce content.

= Is there an autoplay mode, infinite loop, or custom arrows? =

The plugin focuses on native scroll and performance. You can add a light custom script if you want autoplay, but most sites get a better Core Web Vitals score by keeping native behavior.

= Can I have multiple carousels on the same page? =

Yes, without limit. Each Gutenberg block manages its own CSS variables for the carousel slider.

= How do I adjust buttons or position markers? =

In your theme or via a CSS snippets plugin, override the variables:

```css
.wp-block-group.is-carousel {
    --carousel-button-bg: var(--wp--preset--color--primary);
    --carousel-marker-size: 0.8rem;
}
```

If the navigation buttons look offset or partially hidden, wrap the carousel-enabled block inside a parent Group (or another container block) so the wrapper can provide the proper padding and overflow context for the controls.

= What happens if the browser doesn't support `::scroll-button`? =

Visual arrows remain visible (disabled state) and users navigate via touch scroll or mouse wheel. The experience remains responsive.

== Screenshots ==

1. "Carousel" option in the Gutenberg block sidebar panel.
2. Query Loop / Post Template carousel slider rendered with 100% CSS.
3. Group block converted into a responsive carousel.
4. Native Gallery block displayed in carousel slider mode.
5. Custom CSS variables to adapt the carousel slider design.

== Changelog ==

= 1.0.3.5 - 2025-11-14 =
* ♻️ Align plugin text domain with official WordPress.org slug.
* 🧼 Renamed local plugin/SVN directories to remove text-domain lint warnings.

= 1.0.3.4 - 2025-11-14 =
* 🏷️ Published the 1.0.3.4 release tag on WordPress.org.

= 1.0.3.3 - 2025-11-13 =
* 🔗 Simplified WordPress Playground link in "Try it now" section.
* 📝 Updated readme.txt to refresh WordPress.org cache.

= 1.0.4.2 - 2026-02-08 =
* 🛠️ Compatibility with WordPress 6.9.1.
* 🏷️ Maintenance release.

= 1.0.4.1 - 2025-01-XX =
* 🐛 Fixed CSS: commented out scroll-snap-stop to prevent blocking behavior.
* 🐛 Fixed CSS: changed scroll-snap-align from center to start for better alignment.

= 1.0.4 - 2025-01-XX =
* ✨ Added Loop functionality: infinite carousel scrolling with seamless reset to start/end.
* ✨ Added Autoplay functionality: automatic slide progression with configurable delay.
* 🎯 Loop keeps navigation buttons visible even at carousel boundaries.
* ⏱️ Autoplay respects configured delay before resetting when loop is enabled.
* 🎨 Improved scroll detection to ignore scroll-snap micro-adjustments.
* 🐛 Fixed premature reset triggers when scrolling towards carousel end.
* 🛠️ Enhanced boundary detection for better loop and autoplay behavior.

= 1.0.3.2 - 2025-11-13 =
* 🎮 Added WordPress Playground demo with pre-configured carousel examples.
* 🔗 Updated "Try it now" section with interactive demo link.

= 1.0.3.1 - 2025-11-13 =
* 📝 Updated readme.txt to refresh WordPress.org cache.

= 1.0.3 - 2025-11-13 =
* 🔄 Plugin rebranded from "Native Blocks Carousel" to "Any Block Carousel Slider".
* 🐛 Fixed dynamic arrow style updates in the Gutenberg editor (now works correctly in iframe contexts).
* 🎨 Improved block detection across editor iframes for better arrow icon synchronization.
* 🛠️ Enhanced multi-context carousel updates for Site Editor and Block Editor compatibility.

= 1.0.2 - 2025-11-13 =
* ✨ Added dedicated toggles in the inspector to show or hide arrows and pagination markers independently.
* 🎯 Introduced `carouselShowArrows` and `carouselShowMarkers` block attributes for fine-grained carousel controls.
* 🎨 Synced editor and frontend behaviors for the `abcs-hide-arrows` and `abcs-hide-markers` classes.
* 🛠️ Bumped plugin version and refreshed asset headers.

= 1.0.1 - 2025-01-24 =
* ✨ Added Auto mode (fixed width) for Post Template and Group blocks.
* ✨ Smart mode selection based on Gutenberg settings.
* 🎨 Complete horizontal/vertical padding management via CSS variables.
* 🎨 Buttons and markers automatically adapt to custom spacing.
* 📱 Fixed width respected even on mobile thanks to `min()` and `clamp()`.
* 💬 Enhanced contextual messages in the editor to guide mode selection.
* 🚀 Optimized editor JavaScript service to limit memory footprint.
* 🐛 Fixed control positioning with asymmetric padding.
* 🛠️ Internal refactor: PSR-4 autoload, modular services, front/editor separation.

= 1.0.0 - 2025-01-10 =
* 🎉 Initial version available on WordPress.org.
* ✅ Support for Gallery, Group, and Query Loop/Post Template blocks.
* 🎯 Automatic column and block spacing detection.
* 📱 WordPress standard breakpoints integrated (1280 → 375).
* 🎨 Responsive buttons and markers (3rem → 1.75rem, 0.66rem → 0.35rem).
* 🚀 No JavaScript dependencies on frontend (100% native CSS).
* ♿ Keyboard navigation, respects `prefers-reduced-motion`.
* 🔄 Multi-carousel compatibility on the same page.

== Upgrade Notice ==

= 1.0.4 =
Recommended update: adds Loop and Autoplay features for enhanced carousel functionality. Loop enables infinite scrolling, and Autoplay provides automatic slide progression with configurable timing.

= 1.0.3 =
Recommended update: fixes dynamic arrow style updates in the editor and improves compatibility with Site Editor iframes.

= 1.0.2 =
Recommended update: manage arrow and marker visibility directly from the editor with consistent styling on both admin and frontend.

== Developer Notes ==

= GitHub Repository =

Source code is available on GitHub: [https://github.com/WEBLAZER/native-blocks-carousel](https://github.com/WEBLAZER/native-blocks-carousel)

= Contributions =

Contributions are welcome! You can:
* Open a GitHub ticket to report a bug or suggest an improvement.
* Propose a Pull Request.
* Help with translation (`.po` files available in `languages/`).

= Available hooks =

The plugin uses the `render_block` hook to dynamically inject CSS variables based on the current block.

= Main CSS Variables =

**Layout & Spacing:**
* `--wp--style--block-gap` – Spacing between elements (responsive).
* `--carousel-min-width` – Minimum width for grids in Auto mode.
* `--carousel-grid-item-width` – Item width in Manual mode.
* `--carousel-padding-left`, `--carousel-padding-right`, `--carousel-padding-top`, `--carousel-padding-bottom` – Detected padding.

**Navigation buttons:**
* `--carousel-button-bg`, `--carousel-button-color` – Colors auto-detected from theme.
* `--carousel-button-size` – Button size (3rem → 1.75rem).
* `--carousel-button-offset` – Lateral offset based on container width.
* `--carousel-shadow` – Shadow applied to controls.

**Markers (dots):**
* `--carousel-marker-size` – Marker size.
* `--carousel-marker-gap` – Horizontal spacing.
* `--carousel-marker-bottom-offset` – Vertical position.

**Miscellaneous:**
* `--carousel-z-index` – Display priority (default 999999).
* `--carousel-transition-duration`, `--carousel-transition-easing` – Animation smoothness.

== Credits ==

Developed with ❤️ by [Arthur Ballan (WEBLAZER)](https://weblazer.github.io/)
