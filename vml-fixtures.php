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
		'bayLabel' => __('Bay %s', 'vml-fixtures'),
		'shelfLabel' => __('Shelf %s', 'vml-fixtures'),
		'bayShelf' => __('BAY %s / SHELF %s', 'vml-fixtures'),
		'graphicLayoutBay' => __('Graphic Layout: Bay %s', 'vml-fixtures'),
		'backpanelBay' => __('Backpanel: Bay %s', 'vml-fixtures'),
		'green' => __('GREEN', 'vml-fixtures'),
		'yellow' => __('YELLOW', 'vml-fixtures'),
		'red' => __('RED', 'vml-fixtures'),
		'keyCodeLabel' => __('Key Code:', 'vml-fixtures'),
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
		'loading' => __('Loading...', 'vml-fixtures'),
		'blankPageLeftRightLayout' => __('Display images left / right (unchecked: top / bottom)', 'vml-fixtures'),
		'blankPageTopImage' => __('Top image', 'vml-fixtures'),
		'blankPageBottomImage' => __('Bottom image', 'vml-fixtures'),
		'blankPageLeftImage' => __('Left image', 'vml-fixtures'),
		'blankPageRightImage' => __('Right image', 'vml-fixtures'),
		'executionInstructions' => __('EXECUTION INSTRUCTIONS:', 'vml-fixtures'),
		'executionInstructionStep1Label' => __('Step 1:', 'vml-fixtures'),
		'executionInstructionStep1Body' => __('Remove and set aside products and components from shelf.', 'vml-fixtures'),
		'executionInstructionStep2Label' => __('Step 2:', 'vml-fixtures'),
		'executionInstructionStep2Body' => __('Remove and set aside existing Acrylic. Remove and discard existing Graphic.', 'vml-fixtures'),
		'executionInstructionStep2Note' => __('Do NOT discard Acrylic, this will be reused.', 'vml-fixtures'),
		'executionInstructionStep3Label' => __('Step 3:', 'vml-fixtures'),
		'executionInstructionStep3Body' => __('Insert new/ existing Acrylic and new Graphic into shelf.', 'vml-fixtures'),
		'executionInstructionStep4Label' => __('Step 4:', 'vml-fixtures'),
		'executionInstructionStep4Body' => __('Insert new Graphic into existing Acrylic and insert back into shelf.', 'vml-fixtures'),
		'executionInstructionStep5Label' => __('Step 5:', 'vml-fixtures'),
		'executionInstructionStep5Body' => __('Insert new Graphic into front of shelf.', 'vml-fixtures'),
		'executionInstructionStep6Label' => __('Step 6:', 'vml-fixtures'),
		'executionInstructionStep6Body' => __('Remove and discard existing Graphic', 'vml-fixtures'),
		'executionInstructionStep7Label' => __('Step 7:', 'vml-fixtures'),
		'executionInstructionStep7Body' => __('Remove and discard existing Graphic. Do NOT discard Sign, this will be reused.', 'vml-fixtures'),
		'executionInstructionStep8Label' => __('Step 8:', 'vml-fixtures'),
		'executionInstructionStep8Body' => __('Insert existing products and components back onto shelf.', 'vml-fixtures'),
		'executionInstructionOverview' => __('Refer to the overview on the previous page to ensure graphics are placed in the proper order.', 'vml-fixtures'),
		'editInstructionLine' => __('Edit', 'vml-fixtures'),
		'saveInstructionLine' => __('Save', 'vml-fixtures'),
		'cancelInstructionLine' => __('Cancel', 'vml-fixtures'),
		'resetInstructionLine' => __('Reset Text', 'vml-fixtures'),
		'executionInstructionStepLabelField' => __('Step label', 'vml-fixtures'),
		'executionInstructionStepBodyField' => __('Instruction text', 'vml-fixtures'),
		'executionInstructionsBoldHint' => __('Wrap text in **double asterisks** to make it bold. Each line is a separate instruction.', 'vml-fixtures'),
		'executionInstructionUploadImage' => __('Upload image', 'vml-fixtures'),
		'executionInstructionRemoveImage' => __('Remove image', 'vml-fixtures'),
		'executionInstructionImageAlt' => __('Execution instruction reference image', 'vml-fixtures'),
		'instructionSheetFinalGraphic' => __('Instruction Sheet Final Graphic', 'vml-fixtures'),
		'showSkuLabels' => __('Show SKU labels', 'vml-fixtures'),
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
	$customer = $_SESSION['Customer'] ?? ''; // i.e. LUXSGH

	// Now find that user account to get the brand image
	$user = $customer ? get_user_by('login', $customer) : false;
	$image = $user ? get_field('brand_logo', 'user_' . $user->ID) : '';

	// Footer logo should represent the logged-in VML/admin account rather than
	// the selected brand customer. Fall back to the existing GS upload if the
	// current account does not have an ACF brand_logo set.
	$current_user = wp_get_current_user();
	$footer_logo = !empty($current_user->ID) ? get_field('brand_logo', 'user_' . $current_user->ID) : '';
	if (!$footer_logo) {
		$footer_logo = content_url('uploads/2023/05/GS-logo-black_lg.png');
	}
	
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
			'footerLogo' => $footer_logo,
			'userRoles' => $user_roles
		], 200);
	} else {
		// Handle the case where VIZMERCH_Custom is not available
		return new WP_Error('missing_dependency', 'VIZMERCH Custom class not found', array('status' => 500));
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
