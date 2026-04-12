<?php
/**
 * UX Onboarding — WordPress REST Endpoint
 * =========================================
 * Paste this entire file into WPCode (Code Snippets > Add Snippet > PHP Snippet).
 * Set it to run everywhere, or limit it to the page containing the questionnaire.
 *
 * CONFIGURATION — change the email address below, nothing else needs editing.
 */

define( 'UX_ONBOARDING_RECIPIENT', 'your@email.com' ); // <-- SET YOUR EMAIL HERE

/**
 * Register the REST route.
 * Endpoint: POST /wp-json/ux-onboarding/v1/submit
 */
add_action( 'rest_api_init', function () {
    register_rest_route( 'ux-onboarding/v1', '/submit', [
        'methods'             => 'POST',
        'callback'            => 'ux_onboarding_handle_submission',
        'permission_callback' => '__return_true',  // public — validated inside the callback
    ] );
} );

/**
 * Handle the submission: validate, format, email.
 *
 * @param WP_REST_Request $request
 * @return WP_REST_Response
 */
function ux_onboarding_handle_submission( WP_REST_Request $request ) {

    $body = $request->get_json_params();

    // Basic validation — reject requests that don't look like questionnaire data
    if ( empty( $body ) || ! isset( $body['answersFormatted'], $body['mode'], $body['projectProfile'] ) ) {
        return new WP_REST_Response( [ 'error' => 'Invalid payload.' ], 400 );
    }

    // Sanitise top-level fields
    $mode         = sanitize_text_field( $body['mode'] ?? '' );
    $completed_at = sanitize_text_field( $body['completedAt'] ?? '' );
    $site_url     = esc_url_raw( $body['siteUrl'] ?? '' );
    $profile      = $body['projectProfile'] ?? [];
    $chapters     = $body['answersFormatted'] ?? [];

    // Format the completion date for humans
    $date_display = '';
    if ( $completed_at ) {
        $ts           = strtotime( $completed_at );
        $date_display = $ts ? date_i18n( 'F j, Y \a\t H:i', $ts ) : $completed_at;
    }

    // Build email body
    $email_body = ux_onboarding_format_email(
        $mode,
        $date_display,
        $site_url,
        $profile,
        $chapters
    );

    $mode_label = ( $mode === 'B' ) ? 'Deep Dive' : 'Quick Mode';
    $subject    = sprintf(
        '[UX Onboarding] New submission — %s — %s',
        $mode_label,
        $date_display ?: date_i18n( 'F j, Y' )
    );

    $sent = wp_mail(
        UX_ONBOARDING_RECIPIENT,
        $subject,
        $email_body,
        [ 'Content-Type: text/plain; charset=UTF-8' ]
    );

    if ( ! $sent ) {
        // wp_mail returned false — log for debugging, return 500
        error_log( '[ux-onboarding] wp_mail failed. Check your WordPress mail configuration.' );
        return new WP_REST_Response( [ 'error' => 'Mail sending failed.' ], 500 );
    }

    return new WP_REST_Response( [ 'success' => true ], 200 );
}

/**
 * Format the submission as a readable plain-text email.
 *
 * @param string $mode
 * @param string $date_display
 * @param string $site_url
 * @param array  $profile
 * @param array  $chapters
 * @return string
 */
function ux_onboarding_format_email( $mode, $date_display, $site_url, $profile, $chapters ) {

    $mode_label = ( $mode === 'B' ) ? 'Mode B — Deep Dive' : 'Mode A — Quick';
    $sep        = str_repeat( '-', 60 );

    $lines = [];

    $lines[] = 'UX ONBOARDING QUESTIONNAIRE — SUBMISSION';
    $lines[] = $sep;
    $lines[] = '';
    $lines[] = 'Mode:        ' . $mode_label;
    $lines[] = 'Completed:   ' . ( $date_display ?: 'Unknown' );
    $lines[] = 'Origin:      ' . ( $site_url ?: 'Unknown' );
    $lines[] = '';

    // ── Project profile ───────────────────────────────────────────────────────
    $lines[] = $sep;
    $lines[] = 'PROJECT PROFILE';
    $lines[] = $sep;
    $lines[] = '';

    if ( ! empty( $profile['siteType'] ) ) {
        $lines[] = 'Site type:   ' . ux_onboarding_clean( $profile['siteType'] );
    }

    if ( ! empty( $profile['complexity'] ) ) {
        $lines[] = 'Complexity:  ' . ux_onboarding_clean( $profile['complexity'] );
    }

    if ( ! empty( $profile['features'] ) && is_array( $profile['features'] ) ) {
        $features = array_map( 'ux_onboarding_clean', $profile['features'] );
        $lines[]  = 'Features:    ' . implode( ', ', $features );
    }

    if ( ! empty( $profile['tags'] ) && is_array( $profile['tags'] ) ) {
        $tags    = array_map( 'ux_onboarding_clean', $profile['tags'] );
        $lines[] = 'Signals:     ' . implode( ', ', $tags );
    }

    $lines[] = '';

    // ── Answers by chapter ────────────────────────────────────────────────────
    $lines[] = $sep;
    $lines[] = 'ANSWERS';
    $lines[] = $sep;

    if ( is_array( $chapters ) ) {
        foreach ( $chapters as $chapter ) {
            $ch_title = ux_onboarding_clean( $chapter['chapter'] ?? '' );
            $items    = $chapter['items'] ?? [];

            if ( empty( $items ) ) continue;

            $lines[] = '';
            $lines[] = '[ ' . strtoupper( $ch_title ) . ' ]';
            $lines[] = '';

            foreach ( $items as $item ) {
                $question = ux_onboarding_clean( $item['question'] ?? '' );
                $answer   = ux_onboarding_clean( $item['answer'] ?? '—' );

                $lines[] = 'Q: ' . $question;
                $lines[] = 'A: ' . $answer;
                $lines[] = '';
            }
        }
    }

    $lines[] = $sep;
    $lines[] = 'End of submission.';
    $lines[] = '';

    return implode( "\n", $lines );
}

/**
 * Sanitise a single value for plain-text email output.
 *
 * @param mixed $value
 * @return string
 */
function ux_onboarding_clean( $value ) {
    return sanitize_text_field( (string) $value );
}
