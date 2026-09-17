<?php
/**
 * Non-intrusive admin notice requesting a 5-star review on WordPress.org.
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
 * Handles the review notice display and dismissal state.
 */
class ReviewNotice implements ServiceInterface
{
    /**
     * Number of days after activation before showing notice.
     */
    private const DISPLAY_DELAY_DAYS = 14;

    /**
     * Number of days to snooze notice when clicking "Remettre à plus tard".
     */
    private const SNOOZE_DELAY_DAYS = 14;

    /**
     * Registers WordPress admin hooks.
     *
     * @return void
     */
    public function register(): void
    {
        \add_action('admin_notices', [$this, 'maybeRenderNotice']);
        \add_action('admin_init', [$this, 'handleNoticeActions']);
        \add_action('wp_ajax_abcs_dismiss_review_notice', [$this, 'handleAjaxDismissal']);
    }

    /**
     * Renders the admin notice if conditions are met.
     *
     * @return void
     */
    public function maybeRenderNotice(): void
    {
        if (!\current_user_can('manage_options')) {
            return;
        }

        // Allow instant testing via URL query parameter ?abcs_test_review_notice=1 or constant ABCS_TEST_REVIEW_NOTICE
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only URL parameter for conditional notice rendering.
        $test_notice = isset($_GET['abcs_test_review_notice']) ? \sanitize_text_field(\wp_unslash($_GET['abcs_test_review_notice'])) : '';
        $is_testing = (defined('ABCS_TEST_REVIEW_NOTICE') && ABCS_TEST_REVIEW_NOTICE)
            || ('1' === $test_notice);

        if (!$is_testing && !$this->shouldShowNotice()) {
            return;
        }

        $nonce = \wp_create_nonce('abcs_review_notice_nonce');
        $review_url = 'https://wordpress.org/support/plugin/native-blocks-carousel/reviews/#new-post';

        $action_base = \admin_url('admin-post.php?action=abcs_dismiss_review_notice&_wpnonce=' . $nonce);
        $done_url = \add_query_arg(['mode' => 'done', 'redirect_to' => \urlencode($review_url)], $action_base);
        $later_url = \add_query_arg(['mode' => 'later'], $action_base);
        $never_url = \add_query_arg(['mode' => 'never'], $action_base);

        ?>
        <div class="notice notice-info is-dismissible abcs-review-notice" data-nonce="<?php echo \esc_attr($nonce); ?>" style="padding: 12px 14px; border-left-color: #2271b1; position: relative;">
            <?php if ($is_testing) : ?>
                <div style="background: #fcf8e3; color: #8a6d3b; border: 1px solid #faebcc; padding: 3px 8px; margin-bottom: 8px; border-radius: 3px; font-weight: 600; font-size: 11px; display: inline-block;">
                    ⚡ MODE TEST ACTIVÉ (?abcs_test_review_notice=1)
                </div>
            <?php endif; ?>
            
            <div style="margin-top: 2px;">
                <div style="font-size: 14px; font-weight: 600; color: #1d2327; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <span><?php \esc_html_e('Vous aimez Any Block Carousel Slider ?', 'native-blocks-carousel'); ?></span>
                    <span style="color: #f59e0b; font-size: 13px; letter-spacing: 1px;">⭐⭐⭐⭐⭐</span>
                </div>
                <p style="margin: 0 0 10px 0; font-size: 13px; line-height: 1.5; color: #50575e; max-width: 900px;">
                    <?php \esc_html_e('Merci d\'utiliser notre extension ! Si elle vous fait gagner du temps dans la création de vos carrousels Gutenberg, pourriez-vous prendre 1 minute pour lui laisser une note de 5 étoiles sur WordPress.org ? Cela aide énormément le développement indépendant !', 'native-blocks-carousel'); ?>
                </p>
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <a href="<?php echo \esc_url($done_url); ?>" target="_blank" rel="noopener noreferrer" class="button button-primary">
                        ⭐ <?php \esc_html_e('Laisser un avis 5 étoiles', 'native-blocks-carousel'); ?>
                    </a>
                    <a href="<?php echo \esc_url($later_url); ?>" class="button button-secondary">
                        ⏰ <?php \esc_html_e('Remettre à plus tard (14j)', 'native-blocks-carousel'); ?>
                    </a>
                    <a href="<?php echo \esc_url($never_url); ?>" class="button-link" style="color: #646970; text-decoration: underline; font-size: 12px; margin-left: 4px;">
                        <?php \esc_html_e('Déjà fait / Ne plus afficher', 'native-blocks-carousel'); ?>
                    </a>
                </div>
            </div>
        </div>

        <script>
        jQuery(document).ready(function($) {
            $(document).on('click', '.abcs-review-notice .notice-dismiss', function() {
                var nonce = $(this).closest('.abcs-review-notice').data('nonce');
                $.post(ajaxurl, {
                    action: 'abcs_dismiss_review_notice',
                    mode: 'later',
                    _wpnonce: nonce
                });
            });
        });
        </script>
        <?php
    }

    /**
     * Handles non-AJAX URL actions for notice dismissal.
     *
     * @return void
     */
    public function handleNoticeActions(): void
    {
        // Handle reset testing parameter ?abcs_reset_review_notice=1
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Admin test parameter for resetting notice state.
        $reset_notice = isset($_GET['abcs_reset_review_notice']) ? \sanitize_text_field(\wp_unslash($_GET['abcs_reset_review_notice'])) : '';
        if (\current_user_can('manage_options') && '1' === $reset_notice) {
            \delete_option('abcs_review_notice_dismissed');
            \update_option('abcs_first_activated', \time() - (self::DISPLAY_DELAY_DAYS + 1) * \DAY_IN_SECONDS, false);
            $redirect = \remove_query_arg('abcs_reset_review_notice');
            \wp_safe_redirect($redirect);
            exit;
        }

        $action = isset($_GET['action']) ? \sanitize_text_field(\wp_unslash($_GET['action'])) : '';
        if ('abcs_dismiss_review_notice' !== $action) {
            return;
        }

        if (!\current_user_can('manage_options')) {
            return;
        }

        $raw_nonce = isset($_GET['_wpnonce']) ? \sanitize_text_field(\wp_unslash($_GET['_wpnonce'])) : '';
        if (!\wp_verify_nonce($raw_nonce, 'abcs_review_notice_nonce')) {
            \wp_die('Invalid security nonce');
        }

        $mode = isset($_GET['mode']) ? \sanitize_text_field(\wp_unslash($_GET['mode'])) : 'never';
        $this->saveDismissalState($mode);

        $redirect_to = isset($_GET['redirect_to']) ? \esc_url_raw(\wp_unslash($_GET['redirect_to'])) : '';

        if (!empty($redirect_to)) {
            \add_filter('allowed_redirect_hosts', function (array $hosts): array {
                $hosts[] = 'wordpress.org';
                return $hosts;
            });
            \wp_safe_redirect($redirect_to);
            exit;
        }

        $referer = \wp_get_referer() ?: \admin_url('index.php');
        \wp_safe_redirect($referer);
        exit;
    }

    /**
     * Handles AJAX dismissal from standard WP notice dismiss button.
     *
     * @return void
     */
    public function handleAjaxDismissal(): void
    {
        \check_ajax_referer('abcs_review_notice_nonce', '_wpnonce');

        if (!\current_user_can('manage_options')) {
            \wp_send_json_error('Unauthorized');
        }

        $mode = isset($_POST['mode']) ? \sanitize_text_field(\wp_unslash($_POST['mode'])) : 'later';
        $this->saveDismissalState($mode);

        \wp_send_json_success();
    }

    /**
     * Determines whether the notice should be displayed to the user.
     *
     * @return bool
     */
    private function shouldShowNotice(): bool
    {
        $dismissed_state = \get_option('abcs_review_notice_dismissed', false);

        if ('never' === $dismissed_state || 'done' === $dismissed_state) {
            return false;
        }

        if (\is_numeric($dismissed_state) && \time() < (int) $dismissed_state) {
            return false;
        }

        $first_activated = (int) \get_option('abcs_first_activated', 0);

        if (0 === $first_activated) {
            \update_option('abcs_first_activated', \time(), false);
            return false;
        }

        $threshold_time = $first_activated + (self::DISPLAY_DELAY_DAYS * \DAY_IN_SECONDS);

        return \time() >= $threshold_time;
    }

    /**
     * Saves the dismissal state depending on the selected action mode.
     *
     * @param string $mode Mode: 'done', 'never', or 'later'.
     *
     * @return void
     */
    private function saveDismissalState(string $mode): void
    {
        if ('done' === $mode || 'never' === $mode) {
            \update_option('abcs_review_notice_dismissed', 'never', false);
        } elseif ('later' === $mode) {
            $snooze_until = \time() + (self::SNOOZE_DELAY_DAYS * \DAY_IN_SECONDS);
            \update_option('abcs_review_notice_dismissed', (string) $snooze_until, false);
        }
    }
}
