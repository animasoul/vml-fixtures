<?php

require_once 'fixtures/classes/Shelves.class.php';
require_once 'fixtures/classes/ShelvesMapper.class.php';
require_once 'fixtures/classes/Api.class.php';

class FixtureRenderer {
    private $api;
    
    public function __construct() {
        $this->api = new Api();
    }
    
    public function getDataParams() {
        $data = array(
            'customer'     => $_SESSION['Customer'],
            'customerName' => $_SESSION['CustomerName'],
            'store'        => $_SESSION['Store'],
            'storeName'    => $_SESSION['StoreName'],
            'status'       => (isset($_SESSION['Part_Status']) ? $_SESSION['Part_Status'] : 'active'),
            'fixture'      => 'ENDCAP',
            'promotion'    => 'Fall23',
        );

        $params = array(
            'storeRoot' => $data['customer'],
            'storeCode' => $data['store'],
            'promotion' => $data['promotion'],
        );
        
        return [$data, $params];
    }
    
    public function fetchApiData($params) {
        return $this->api->make_api_call('GetSephoraProducts', $params, true, 30);
    }

    public function fetchShelvesData() {
        $json_url = plugins_url( 'fixtures/jsonConfig/ENDCAP.json', __FILE__ );
        $shelvesData = file_get_contents($json_url);
        return json_decode($shelvesData, true);
    }
}

$renderer = new FixtureRenderer();
list($data, $params) = $renderer->getDataParams();
$apiData = $renderer->fetchApiData($params);
$shelvesData = $renderer->fetchShelvesData();

$shelvesMapper = new ShelvesMapper();
$updatedShelvesData = $shelvesMapper->mapDataToShelves($shelvesData, $apiData);

if (json_last_error() !== JSON_ERROR_NONE) {
    die('Error decoding JSON: ' . json_last_error_msg());
}

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
		<div class="shelves-container">
			<div class="shelves-container__left">
				<div class="<?php echo esc_html( $data['customer'] ); ?>-img"></div>
			</div>
			<div class="shelves-container__right">
				<?php $shelves = new Shelves($shelvesData);
						echo $shelves->generate();
				?>
			</div>
		</div>
    </div>

