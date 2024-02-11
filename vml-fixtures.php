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
    register_block_type( __DIR__ . '/build/instruction' );
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


function vml_fixtures_get_option(WP_REST_Request $request) {
    // Extract the brand parameter from the request
    $brand = $request->get_param('brand') ?? $_SESSION['Customer'] ?? null;
    $promo = $request->get_param('promo') ?? '';
    $storeCode = $_SESSION['Store'] ?? null;

    $customer = $_SESSION['Customer']; // i.e. LUXSGH
    // Now find that user account to get the brand image
    $user = get_user_by('login', $customer);
    $image = get_field('brand_logo', 'user_' . $user->ID);
    
    // Ensure that VIZMERCH_Custom class is loaded
    if (class_exists('VIZMERCH_Custom')) {
        $VizMerchCustom = VIZMERCH_Custom::get_instance();
        $promo_wizard = $VizMerchCustom->get_cosmetic_promotion($brand, $promo);

        return new WP_REST_Response(['data'=>$promo_wizard, 'store'=>$storeCode, 'brand'=>$brand, 'logo'=>$image],  200);
    } else {
        // Handle the case where VIZMERCH_Custom is not available
        return new WP_Error('missing_dependency', 'VIZMERCH Custom class not found', array('status' => 500));
    }

    // return new WP_REST_Response($promo_wizard, 200);
}

function register_custom_routes() {
    register_rest_route('vml-fixtures/v1', '/upload-pdf', array(
        'methods' => 'POST',
        'callback' => 'handle_pdf_upload',
        'permission_callback' => '__return_true',
        // Removed 'args' for direct $_FILES checking
    ));
}
add_action('rest_api_init', 'register_custom_routes');

function handle_pdf_upload($request) {
    // Assuming a file was uploaded via a form with the name 'file'
    $file = $_FILES['file'];

    // Specify the custom directory relative to WordPress's upload directory
    $upload_dir = wp_upload_dir();
    $custom_dir = $upload_dir['basedir'] . '/instruction_pdfs';

    // Ensure the directory exists
    if (!file_exists($custom_dir)) {
        wp_mkdir_p($custom_dir);
    }

    // Construct the path where file should be saved
    $target_file = $custom_dir . '/' . basename($file['name']);

    // Move the uploaded file
    if (move_uploaded_file($file['tmp_name'], $target_file)) {
        // Return the URL to access the uploaded file
        $file_url = $upload_dir['baseurl'] . '/instruction_pdfs/' . basename($file['name']);
        return new WP_REST_Response(array('url' => $file_url), 200);
    } else {
        return new WP_Error('upload_failed', 'Failed to move uploaded file.', array('status' => 500));
    }
}


