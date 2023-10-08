<?php
include_once plugin_dir_path(__FILE__) . '../helpers/ApiDataOrganiser.class.php';
include_once 'classes/AdminShelves.class.php';

// Instantiate and retrieve data.
$renderer = new ApiDataOrganiser();
$params = $renderer->getDataParams();
$apiData = $renderer->sortApiData($params);

// Render the face data.
$faceDataHtml = '';
if (isset($apiData['error'])) {
    // Render an error message for the frontend user
    $faceDataHtml = '<div class="api-error">There was a problem fetching data: ' . htmlspecialchars($apiData['error']) . '</div>';
} else {
    // Render the face data.
    $faceDataHtml = AdminShelves::renderFaceData($apiData['faceData']);
}
?>

<!-- Render the HTML content. -->
<div <?php echo get_block_wrapper_attributes(); ?>>
    <?php echo $faceDataHtml; ?>
</div>
