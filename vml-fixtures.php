<?php
/**
 * Plugin Name:       VM Logistics Fixtures Dynamic Block
 * Description:       Add VM Logistics Fixtures to a page or post.
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.3.0
 * Author:            Abel Rogers
 * Author URI:        https://www.ajpartnersltd.com/
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       vml-fixtures
 *
 * @package           create-block
 */

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function create_block_vml_fixtures_block_init() {
	register_block_type( __DIR__ . '/build/stores' );
	register_block_type( __DIR__ . '/build/admin' );
}
add_action( 'init', 'create_block_vml_fixtures_block_init' );

// Register the AJAX action for authenticated users
add_action('wp_ajax_get_sorted_data', 'wp_ajax_get_sorted_data_callback');

function wp_ajax_get_sorted_data_callback() {
    // Ensure the API and organizer classes are included
    //require_once 'Api.class.php';
    require_once plugin_dir_path(__FILE__) . '/build/helpers/ApiDataOrganiser.class.php';

    // Retrieve the 'promotion' value from the POST data
    $promotion = isset($_POST['promotion']) ? sanitize_text_field($_POST['promotion']) : '';

    // Create an instance of the ApiDataOrganiser class
    $organiser = new ApiDataOrganiser();

    // Get the sorted data
    $params = $organiser->getDataParams($promotion);
    $sortedData = $organiser->sortApiData($params);

    // Return the sorted data as a JSON response
    wp_send_json($sortedData);
}

// function vml_enqueue_block_editor_assets() {
//     wp_enqueue_script('vml-block-script', 'vml_fixtures_block.js', array('wp-blocks', 'wp-element'));

//     // Assuming your session data is stored like this
//     session_start();
//     $session_data = array(
//         'brand' => $_SESSION['promo_wizard']['Customer'],
//         'promo' => $_SESSION['promo_wizard']['PromoCode']
//     );

//     wp_localize_script('vml-block-script', 'vmlBlockData', array(
//         'sessionData' => $session_data
//     ));
// }
// add_action('enqueue_block_editor_assets', 'vml_enqueue_block_editor_assets');

add_action('rest_api_init', function () {
    register_rest_route('vml-fixtures/v1', '/get-option/', array(
        'methods' => 'GET',
        'callback' => 'vml_fixtures_get_option',
        'permission_callback' => '__return_true' // Allows unauthenticated access
    ));
});


function vml_fixtures_get_option($request) {
    // Option A: Using session variables (current implementation)
    $brand = $_SESSION['promo_wizard']['Customer'];
    $promo = $_SESSION['promo_wizard']['PromoCode'];

    // Option B: Using URL parameters (uncomment to use)
    // $brand = sanitize_text_field($request->get_param('brand'));
    // $promo = sanitize_text_field($request->get_param('promo'));

    if (!$brand || !$promo) {
        return new WP_Error('missing_params', 'Missing brand or promo parameters', array('status' => 400));
    }

    $option_name = 'cosmetic_promo_' . $brand . '_' . $promo;

    // Fetch the option value
    $option_value = get_option($option_name);

    if (false === $option_value) {
        return new WP_Error('no_option', 'No option found for the given parameters', array('status' => 404));
    }

    // Return the option value
    return new WP_REST_Response($option_value, 200);
}

