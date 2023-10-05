<?php

require_once 'fixtures/classes/Shelves.class.php';
require_once 'fixtures/classes/ShelvesMapper.class.php';
require_once plugin_dir_path(__FILE__) . '../helpers/Api.class.php';

class FixtureRenderer
{
    private Api $api;

    public function __construct()
    {
        $this->api = new Api();
    }

    public function getDataParams(): array
    {
        $data = [
            'customer'     => $_SESSION['Customer'],
            'customerName' => $_SESSION['CustomerName'],
            'store'        => $_SESSION['Store'],
            'storeName'    => $_SESSION['StoreName'],
            'status'       => $_SESSION['Part_Status'] ?? 'active',
            'fixture'      => 'ENDCAP',
            'promotion'    => 'Fall23',
        ];

        $params = [
            'storeRoot' => $data['customer'],
            'storeCode' => $data['store'],
            'promotion' => $data['promotion'],
        ];

        return [$data, $params];
    }

    public function fetchApiData(array $params): array
    {
        return $this->api->make_api_call('GetSephoraProducts', $params, false, 30);
    }

    public function fetchShelvesData(): array
    {
        $json_url = plugins_url('fixtures/jsonConfig/ENDCAP.json', __FILE__);
        $shelvesData = file_get_contents($json_url);
        if ($shelvesData === false) {
            throw new RuntimeException("Failed to fetch data from $json_url");
        }

        $decodedData = json_decode($shelvesData, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new RuntimeException('Error decoding JSON: ' . json_last_error_msg());
        }

        return $decodedData;
    }
}

$renderer = new FixtureRenderer();
list($data, $params) = $renderer->getDataParams();
$apiData = $renderer->fetchApiData($params);
$shelvesData = $renderer->fetchShelvesData();

usort($apiData, fn($a, $b) => $a['Shelf'] <=> $b['Shelf']);

$shelvesMapper = new ShelvesMapper();
$updatedShelvesData = $shelvesMapper->mapDataToShelves($shelvesData, $apiData);

?>
<div <?php echo get_block_wrapper_attributes(); ?>>

    <div class="fix-instructions">
        <h3 class="fix-header__status">
            Fixture: <?php echo esc_html($data['fixture']); ?>
        </h3>
        <h3 class="fix-instructions__title">Instructions:</h3>
        <p class="fix-instructions__text">
            Click on a specific image to view the fixture graphic and order new/replacement.
        </p>
    </div>
    <div class="shelves-container" id="topdf" data-ajax-url="<?php echo admin_url('admin-ajax.php'); ?>">
        <div class="shelves-container__left">
            <?php
            $shelves = new Shelves($shelvesData);
            echo $shelves->generate();
            ?>
        </div>
        <div class="shelves-container__right">
            <div class="<?php echo esc_html($data['customer']); ?>-img"></div>
        </div>
    </div>
</div>
