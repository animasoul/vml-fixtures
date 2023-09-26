<?php
$data = array(
	'customer'     => $_SESSION['Customer'],
	'customerName' => $_SESSION['CustomerName'],
	'store'        => $_SESSION['Store'],
	'storeName'    => $_SESSION['StoreName'],
	'status'       => (isset($_SESSION['Part_Status']) ? $_SESSION['Part_Status'] : 'active'),
	'fixture'      => 'ENDCAP',
	'promotion'	   => 'Fall23',
);

$baseImageUrl= "https://api-test.graphicsystems.com/gsimages/".$data['customer'];


// call the API to get the fixture data
// require_once 'fixtures/classes/Api.class.php';

// Instantiate the VIZMERCH_Custom class
// $getProducts = new Api();

// $params = array(
// 	'storeRoot' => $data['customer'],
// 	'storeCode' => $data['store'],
// 	'promotion' => $data['promotion'],
//   );
// $reponse = $getProducts->make_api_call('GetSephoraProducts', $params, true, 30);
// var_dump('GetSephoraProducts');
// var_dump($reponse);
?>
<div <?php echo get_block_wrapper_attributes(); ?>>
    
        <div class="fix-header">
			<div class="fix-header__left">
				<h3 class="fix-header__customer">
					Customer: <br />
					<strong><?php echo esc_html( $data['customer'] ); ?>, <? echo esc_html( $data['customerName']); ?></strong>
				</h3>
				<h3 class="fix-header__store">
					Store: <br />
					<strong><?php echo esc_html( $data['store'] ); ?>, <? echo esc_html( $data['storeName']); ?></strong>
				</h3>
			</div>
			<div class="fix-header__right">
				<h4 class="fix-header__status">
					Fixture: <?php echo esc_html( $data['fixture'] ); ?>
				</h4>
				<div class="fix-header__fixture">
					<div class="<?php echo esc_html( $data['customer'] ); ?>-img"></div>
				</div>
			</div>
		</div>
		<hr />
		<div class="fix-instructions">
			<h3 class="fix-instructions__title">Instructions:</h3>
			<p class="fix-instructions__text">
				Click on the image to the to view the fixture graphic and order.
			</p>
		</div>

		<?php include_once 'fixtures/'.$data['fixture'].'.php'; ?>
    </div>

