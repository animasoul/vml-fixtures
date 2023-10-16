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

    // Create an instance of the ApiDataOrganiser class
    $organiser = new ApiDataOrganiser();

    // Get the sorted data
    $params = $organiser->getDataParams();
    $sortedData = $organiser->sortApiData($params);

    // Return the sorted data as a JSON response
    wp_send_json($sortedData);
}
