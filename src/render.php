<?php
$current_user = wp_get_current_user();
$upload_dir = wp_upload_dir();
$data = array(
	'customer'     => $_SESSION['Customer'],
	'customerName' => $_SESSION['CustomerName'],
	'store'        => $_SESSION['Store'],
	'storeName'    => $_SESSION['StoreName'],
	'status'       => (isset($_SESSION['Part_Status']) ? $_SESSION['Part_Status'] : 'active'),
	'fixture'      => 'endCap',
	'uploadsBaseurl' => $upload_dir['baseurl'],
);

$baseImageUrl= "https://api-test.graphicsystems.com/gsimages/".$data['customer'];

?>
<div <?php echo get_block_wrapper_attributes(); ?>>
	<?php esc_html_e( 'Vml Fixtures – hello from a dynamic block!', 'vml-fixtures' ); ?>
    
        Hi, <?php echo esc_html( $data['customer'] ); ?>, <? echo esc_html( $data['customerName']); ?> ...

		<?php include_once 'fixtures/'.$data['fixture'].'.php'; ?>
    </div>

