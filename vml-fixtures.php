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
	// Register each block type
	$stores_block = register_block_type(__DIR__ . '/build/stores');
	$admin_block = register_block_type(__DIR__ . '/build/admin');
	$instruction_block = register_block_type(__DIR__ . '/build/instruction');
	
	// Store the script handles for later use
	$GLOBALS['vml_fixtures_script_handles'] = array(
		'stores' => $stores_block->script,
		'admin' => $admin_block->script,
		'instruction' => $instruction_block->script
	);
}
add_action('init', 'create_block_vml_fixtures_block_init');

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
	$noPromo= $request->get_param('noPromo') ?? false;
	
	if ($noPromo) {
		$promo = '';
	} else {
		if (isset($_SESSION['promo_wizard']['PromoCode'])) {
			$promo = $_SESSION['promo_wizard']['PromoCode'];
		} else {
			return new WP_REST_Response([],  200);
		}
	}
	$storeCode = $_SESSION['Store'] ?? null;

	$customer = $_SESSION['Customer']; // i.e. LUXSGH

	// Now find that user account to get the brand image
	$user = get_user_by('login', $customer);
	$image = get_field('brand_logo', 'user_' . $user->ID);
	
	// Ensure that VIZMERCH_Custom class is loaded
	if (class_exists('VIZMERCH_Custom')) {
		$VizMerchCustom = VIZMERCH_Custom::get_instance();
		$promo_wizard = $VizMerchCustom->get_cosmetic_promotion($customer, $promo);

		return new WP_REST_Response(['data'=>$promo_wizard, 'store'=>$storeCode, 'brand'=>$customer, 'logo'=>$image],  200);
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

/**
 * Manually enqueue scripts for the frontend
 * This is a fallback in case the automatic script loading doesn't work
 */
function vml_fixtures_enqueue_frontend_scripts() {
	// Only run on the frontend
	if (is_admin()) {
		return;
	}
	
	// Check if our blocks are present
	$has_stores = has_block('vml-fixtures/stores');
	$has_admin = has_block('vml-fixtures/admin');
	$has_instruction = has_block('vml-fixtures/instruction');
	
	if ($has_stores || $has_admin || $has_instruction) {
		// Ensure React is loaded
		wp_enqueue_script('react');
		wp_enqueue_script('react-dom');
		
		// Ensure wp-element is loaded
		wp_enqueue_script('wp-element');
		
		// Manually enqueue our block scripts if needed
		if ($has_stores && file_exists(__DIR__ . '/build/stores/view.js')) {
			wp_enqueue_script(
				'vml-fixtures-stores-script',
				plugins_url('build/stores/view.js', __FILE__),
				array('wp-element'),
				'0.3.0',
				true
			);
		}
		
		if ($has_admin && file_exists(__DIR__ . '/build/admin/view.js')) {
			wp_enqueue_script(
				'vml-fixtures-admin-script',
				plugins_url('build/admin/view.js', __FILE__),
				array('wp-element'),
				'0.3.0',
				true
			);
		}
		
		if ($has_instruction && file_exists(__DIR__ . '/build/instruction/view.js')) {
			wp_enqueue_script(
				'vml-fixtures-instruction-script',
				plugins_url('build/instruction/view.js', __FILE__),
				array('wp-element'),
				'0.3.0',
				true
			);
		}
		
		// Pass user data to all scripts
		$user_data = array(
			'userRoles' => wp_get_current_user()->roles,
			'isAdmin' => current_user_can('administrator'),
			'isEditor' => current_user_can('editor'),
		);
		
		// Localize to all our scripts
		if ($has_stores) {
			wp_localize_script('vml-fixtures-stores-script', 'vmlFixturesData', $user_data);
		}
		
		if ($has_admin) {
			wp_localize_script('vml-fixtures-admin-script', 'vmlFixturesData', $user_data);
		}
		
		if ($has_instruction) {
			wp_localize_script('vml-fixtures-instruction-script', 'vmlFixturesData', $user_data);
		}
	}
}
add_action('wp_enqueue_scripts', 'vml_fixtures_enqueue_frontend_scripts', 20); // Higher priority to run after blocks are registered

/**
 * Add user role data to automatically loaded scripts
 */
function vml_fixtures_add_user_data_to_scripts() {
	// Only run on the frontend
	if (is_admin()) {
		return;
	}
	
	// Get the script handles
	$script_handles = $GLOBALS['vml_fixtures_script_handles'] ?? array();
	
	// User data to pass to scripts
	$user_data = array(
		'userRoles' => wp_get_current_user()->roles,
		'isAdmin' => current_user_can('administrator'),
		'isEditor' => current_user_can('editor'),
	);
	
	// Add data to each script
	foreach ($script_handles as $block => $handle) {
		if ($handle && wp_script_is($handle, 'enqueued')) {
			wp_localize_script($handle, 'vmlFixturesData', $user_data);
		}
	}
}
add_action('wp_enqueue_scripts', 'vml_fixtures_add_user_data_to_scripts', 30); // Run after scripts are enqueued

/**
 * Enqueue scripts for the editor
 */
function vml_fixtures_enqueue_editor_scripts() {
	// These scripts are only needed in the editor
	wp_enqueue_script(
		'vml-fixtures-editor-script',
		plugins_url('build/stores/index.js', __FILE__),
		array(
			'wp-blocks',
			'wp-element',
			'wp-editor',
			'wp-components',
			'wp-data',
			'wp-i18n'
		),
		'0.3.0',
		true
	);
}
add_action('enqueue_block_editor_assets', 'vml_fixtures_enqueue_editor_scripts');
