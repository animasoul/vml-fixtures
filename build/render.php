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
    
        <div class="fix-header">
			<div class="fix-header__left">
				<div class="fix-header__customer">
					Customer: <?php echo esc_html( $data['customer'] ); ?>, <? echo esc_html( $data['customerName']); ?>
				</div>
				<div class="fix-header__store">
					Store: <?php echo esc_html( $data['store'] ); ?>, <? echo esc_html( $data['storeName']); ?>
				</div>
			</div>
			<div class="fix-header__right">
				<div class="fix-header__status">
					Fixture: <?php echo esc_html( $data['fixture'] ); ?>
				</div>
				<div class="fix-header__fixture">
					<div class="<?php echo esc_html( $data['customer'] ); ?>-img"></div>
				</div>
			</div>
		</div>

		<?php include_once 'fixtures/'.$data['fixture'].'.php'; ?>
    </div>

