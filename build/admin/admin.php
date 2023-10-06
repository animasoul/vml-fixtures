<?php
include_once plugin_dir_path(__FILE__) . '../helpers/Api.class.php';
include_once 'classes/AdminShelves.class.php';

class AdminFixtureRenderer
{
    private Api $api;

    public function __construct()
    {
        $this->api = new Api();
    }

    public function getDataParams(): array
    {
        return [
            'storeRoot' => $_SESSION['Customer'],
            'storeCode' => $_SESSION['Store'],
            'promotion' => 'Fall23',
        ];
    }

    public function sortApiData(array $params): array {
        // Fetch data from the API
        $data = $this->api->make_api_call('GetSephoraProducts', $params, false, 30);
    
        $panelData = [];
        $faceDataGroups = [];
    
        // 1. Split the data into panelData and faceDataGroups based on the Panel attribute.
        foreach ($data as $item) {
            if ($item['Panel'] === true) {
                $panelData[] = $item;
            } else {
                // Group faceData items by Shelf and then by Horizontal.
                $faceDataGroups[$item['Shelf']][$item['Horizontal']][] = $item;
            }
        }
    
        // 2. Sort panelData by Shelf and then by Horizontal.
        usort($panelData, function ($a, $b) {
            // First compare by Shelf
            if ($a['Shelf'] !== $b['Shelf']) {
                return $a['Shelf'] <=> $b['Shelf'];
            }
            // Then compare by Horizontal if Shelf values are the same
            return $a['Horizontal'] <=> $b['Horizontal'];
        });
    
        // 3. Organize faceData by Shelf and, if applicable, by Horizontal.
        $formattedFaceData = [];
        ksort($faceDataGroups); // Sort shelves in ascending order
        foreach ($faceDataGroups as $shelf => $horizontals) {
            $shelfGroup = [];
            ksort($horizontals); // Sort horizontal values in ascending order
            foreach ($horizontals as $items) {
                // Sort items by Vertical within the Horizontal group.
                usort($items, function ($a, $b) {
                    return $a['Vertical'] <=> $b['Vertical'];
                });
                
                // If there's more than one item with the same Horizontal, group them.
                // if (count($items) > 1) {
                    $shelfGroup[] = ['Horizontal: ' . count($items) => $items];
                // } else {
                //     // Otherwise, just append the individual items.
                //     $shelfGroup = array_merge($shelfGroup, $items);
                // }
            }
            // Append the entire Shelf group.
            $formattedFaceData[] = ['Shelf: ' . $shelf => $shelfGroup];
        }
    
        // Return the organized data
        return [
            'panelData' => $panelData,
            'faceData' => $formattedFaceData,
        ];
    }
}

$renderer = new AdminFixtureRenderer();
$params = $renderer->getDataParams();
$apiData = $renderer->sortApiData($params);
$faceDataHtml = AdminShelves::renderFaceData($apiData['faceData']);
// var_dump(json_encode($apiData));
?>
<div <?php echo get_block_wrapper_attributes(); ?>>

<?php echo $faceDataHtml; ?>
</div>
