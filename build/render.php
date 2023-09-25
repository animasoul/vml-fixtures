<?php
$data = array(
	'customer'     => $_SESSION['Customer'],
	'customerName' => $_SESSION['CustomerName'],
	'store'        => $_SESSION['Store'],
	'storeName'    => $_SESSION['StoreName'],
	'status'       => (isset($_SESSION['Part_Status']) ? $_SESSION['Part_Status'] : 'active'),
	'fixture'      => 'endCap',
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

