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


function vml_fixtures_get_option() {
    // Check if promo_wizard key exists and is an array
    $promoWizard = isset($_SESSION['promo_wizard']) && is_array($_SESSION['promo_wizard'])
                   ? $_SESSION['promo_wizard']
                   : null;

    // Extract if available
    $brand = $promoWizard['Customer'] ?? null;
    $storeCode = $_SESSION['Store'] ?? null;
    
    // Ensure that VIZMERCH_Custom class is loaded
    if (class_exists('VIZMERCH_Custom')) {
        $VizMerchCustom = VIZMERCH_Custom::get_instance();
        $promo_wizard = $VizMerchCustom->get_cosmetic_promotion($brand, '');

        return new WP_REST_Response(['data'=>$promo_wizard, 'store'=>$storeCode, 'brand'=>$brand],  200);
    } else {
        // Handle the case where VIZMERCH_Custom is not available
        return new WP_Error('missing_dependency', 'VIZMERCH Custom class not found', array('status' => 500));
    }

    // return new WP_REST_Response($promo_wizard, 200);
}

