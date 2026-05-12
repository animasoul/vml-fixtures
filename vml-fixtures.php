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

	$GLOBALS['vml_fixtures_instruction_view_script_handles'] = $instruction_block->view_script_handles;
}
add_action('init', 'create_block_vml_fixtures_block_init');

function vml_fixtures_get_instruction_text_strings() {
	return array(
		'noDataPromotion' => __('No data: Please select a Promotion.', 'vml-fixtures'),
		'noSkuData' => __('No SKU data available.', 'vml-fixtures'),
		'pleaseSelectPromotion' => __('Please select a Promotion', 'vml-fixtures'),
		'sephoraLogo' => __('Sephora Logo', 'vml-fixtures'),
		'brandLogo' => __('Brand Logo', 'vml-fixtures'),
		'skuAlt' => __('SKU %s', 'vml-fixtures'),
		'bayShelf' => __('BAY %s/SHELF %s', 'vml-fixtures'),
		'graphicLayoutBay' => __('Graphic Layout: Bay %s', 'vml-fixtures'),
		'backpanelBay' => __('Backpanel: Bay %s', 'vml-fixtures'),
		'green' => __('GREEN', 'vml-fixtures'),
		'yellow' => __('YELLOW', 'vml-fixtures'),
		'red' => __('RED', 'vml-fixtures'),
		'newGraphics' => __('NEW Graphics', 'vml-fixtures'),
		'movingGraphics' => __('MOVING Graphics', 'vml-fixtures'),
		'removedGraphics' => __('REMOVED Graphics', 'vml-fixtures'),
		'layoutDescription' => __('This graphic layout shows all of the graphics on your gondola by location AFTER the update is complete.', 'vml-fixtures'),
		'cleanInstructions' => __('To clean: Use a dry cloth only - No alcohol based products', 'vml-fixtures'),
		'selectFixture' => __('Select Fixture', 'vml-fixtures'),
		'selectRegion' => __('Select Region', 'vml-fixtures'),
		'instructionSheetToPdf' => __('Instruction sheet to PDF', 'vml-fixtures'),
		'stores' => __('Stores', 'vml-fixtures'),
		'totalAcrossRegions' => __('Total across all regions: %s Stores', 'vml-fixtures'),
		'headerInformation' => __('Enter the header of the PDF information', 'vml-fixtures'),
		'sameUsCaRegions' => __('This fixture has same US CA regions', 'vml-fixtures'),
		'sameAllRegions' => __('This fixture has same ALL regions', 'vml-fixtures'),
		'combine' => __('Combine?', 'vml-fixtures'),
		'fixture' => __('Fixture:', 'vml-fixtures'),
		'fixtureType' => __('Fixture Type', 'vml-fixtures'),
		'region' => __('Region', 'vml-fixtures'),
		'regionLabel' => __('Region:', 'vml-fixtures'),
		'updates' => __('Updates:', 'vml-fixtures'),
		'updateSeason' => __('Update Season', 'vml-fixtures'),
		'executionDates' => __('Execution Dates', 'vml-fixtures'),
		'executionDatesLabel' => __('Execution Dates:', 'vml-fixtures'),
		'type' => __('Type:', 'vml-fixtures'),
		'branding' => __('Branding', 'vml-fixtures'),
		'enlargeReduceImageSizes' => __('Enlarge/reduce image sizes', 'vml-fixtures'),
		'toFitPrinterOutput' => __('to fit printer output', 'vml-fixtures'),
		'uploadPdfFirstPage' => __('Upload PDF of the first page', 'vml-fixtures'),
		'uploadPdf' => __('Upload PDF', 'vml-fixtures'),
		'loading' => __('Loading...', 'vml-fixtures'),
	);
}

function vml_fixtures_render_instruction_text_seed() {
	$strings = vml_fixtures_get_instruction_text_strings();
	$html = '<div class="vml-fixtures-instruction-translation-seed" aria-hidden="true" style="position:absolute;left:-99999px;top:auto;width:1px;height:1px;overflow:hidden;">';

	foreach ($strings as $key => $text) {
		$html .= sprintf(
			'<span data-vml-fixtures-instruction-key="%s">%s</span>',
			esc_attr($key),
			esc_html($text)
		);
	}

	$html .= '</div>';

	return $html;
}

function vml_fixtures_add_instruction_text_seed($block_content, $block) {
	if (!isset($block['blockName']) || $block['blockName'] !== 'vml-fixtures/instruct') {
		return $block_content;
	}

	return $block_content . vml_fixtures_render_instruction_text_seed();
}
add_filter('render_block', 'vml_fixtures_add_instruction_text_seed', 10, 2);

function vml_fixtures_localize_instruction_view_script() {
	$handles = isset($GLOBALS['vml_fixtures_instruction_view_script_handles'])
		? $GLOBALS['vml_fixtures_instruction_view_script_handles']
		: array();

	foreach ((array) $handles as $handle) {
		wp_localize_script($handle, 'vmlFixturesInstructionText', vml_fixtures_get_instruction_text_strings());
	}
}
add_action('wp_enqueue_scripts', 'vml_fixtures_localize_instruction_view_script', 20);

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
	$noPromo = $request->get_param('noPromo') ?? false;
	
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
	
	// Get user roles with fallbacks
	$user_roles = [];
	
	// Try to get user from session
	if (isset($_SESSION['user_login'])) {
		$session_user = get_user_by('login', $_SESSION['user_login']);
		if ($session_user) {
			$user_roles = $session_user->roles;
		}
	}
	
	// Fallback to current user if session didn't work
	if (empty($user_roles)) {
		$current_user = wp_get_current_user();
		if (!empty($current_user->ID)) {
			$user_roles = $current_user->roles;
		}
	}
	
	// Fallback to customer role detection based on session
	if (empty($user_roles) && isset($_SESSION['Customer'])) {
		// If we have a Customer in session but no roles, they're likely a customer
		$user_roles = ['customer'];
	}
	
	// Ensure that VIZMERCH_Custom class is loaded
	if (class_exists('VIZMERCH_Custom')) {
		$VizMerchCustom = VIZMERCH_Custom::get_instance();
		$promo_wizard = $VizMerchCustom->get_cosmetic_promotion($customer, $promo);

		return new WP_REST_Response([
			'data' => $promo_wizard, 
			'store' => $storeCode, 
			'brand' => $customer, 
			'logo' => $image,
			'userRoles' => $user_roles
		], 200);
	} else {
		// Handle the case where VIZMERCH_Custom is not available
		return new WP_Error('missing_dependency', 'VIZMERCH Custom class not found', array('status' => 500));
	}
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

function vml_fixtures_enqueue_api_settings() {
	wp_enqueue_script('wp-api');
	wp_localize_script('wp-api', 'wpApiSettings', array(
		'root' => esc_url_raw(rest_url()),
		'nonce' => wp_create_nonce('wp_rest')
	));
}
add_action('wp_enqueue_scripts', 'vml_fixtures_enqueue_api_settings');

add_action('rest_api_init', function () {
	register_rest_route('vml-fixtures/v1', '/user-roles/', array(
		'methods' => 'GET',
		'callback' => 'vml_fixtures_get_user_roles',
		'permission_callback' => function () {
			return is_user_logged_in();
		}
	));
});

function vml_fixtures_get_user_roles() {
	$current_user = wp_get_current_user();
	return new WP_REST_Response([
		'userRoles' => $current_user->roles
	], 200);
}
