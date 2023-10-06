<?php

include_once plugin_dir_path(__FILE__) . '../helpers/Api.class.php';
include_once 'classes/AdminShelves.class.php';

class AdminFixtureRenderer {
    private const PANEL_KEY = 'Panel';
    private const SHELF_KEY = 'Shelf';
    private const HORIZONTAL_KEY = 'Horizontal';
    private const VERTICAL_KEY = 'Vertical';
    private Api $api;

    public function __construct() {
        $this->api = new Api();
    }

    public function getDataParams(): array {
        return [
            'storeRoot' => $_SESSION['Customer'],
            'storeCode' => $_SESSION['Store'],
            'promotion' => 'Fall23',
        ];
    }

    public function sortApiData(array $params): array {
        $data = $this->api->make_api_call('GetSephoraProducts', $params, false, 30);

        // Split the data into panelData and faceDataGroups based on the Panel attribute.
        [$panelData, $faceDataGroups] = $this->splitData($data);

        // Sort panelData by Shelf and then by Horizontal.
        $this->sortPanelData($panelData);

        // Organize faceData by Shelf and, if applicable, by Horizontal.
        $formattedFaceData = $this->organizeFaceData($faceDataGroups);

        return [
            'panelData' => $panelData,
            'faceData' => $formattedFaceData,
        ];
    }

    private function splitData(array $data): array {
        $panelData = [];
        $faceDataGroups = [];

        foreach ($data as $item) {
            if ($item[self::PANEL_KEY] === true) {
                $panelData[] = $item;
            } else {
                $faceDataGroups[$item[self::SHELF_KEY]][$item[self::HORIZONTAL_KEY]][] = $item;
            }
        }

        return [$panelData, $faceDataGroups];
    }

    private function sortPanelData(array &$panelData): void {
        usort($panelData, function ($a, $b) {
            if ($a[self::SHELF_KEY] !== $b[self::SHELF_KEY]) {
                return $a[self::SHELF_KEY] <=> $b[self::SHELF_KEY];
            }
            return $a[self::HORIZONTAL_KEY] <=> $b[self::HORIZONTAL_KEY];
        });
    }

    private function organizeFaceData(array $faceDataGroups): array {
        $formattedFaceData = [];
        ksort($faceDataGroups);

        foreach ($faceDataGroups as $shelf => $horizontals) {
            $shelfGroup = [];
            ksort($horizontals);

            foreach ($horizontals as $items) {
                usort($items, function ($a, $b) {
                    return $a[self::VERTICAL_KEY] <=> $b[self::VERTICAL_KEY];
                });
                $shelfGroup[] = ['Horizontal: ' . count($items) => $items];
            }

            $formattedFaceData[] = ['Shelf: ' . $shelf => $shelfGroup];
        }

        return $formattedFaceData;
    }
}

$renderer = new AdminFixtureRenderer();
$params = $renderer->getDataParams();
$apiData = $renderer->sortApiData($params);
$faceDataHtml = AdminShelves::renderFaceData($apiData['faceData']);
?>

<div <?php echo get_block_wrapper_attributes(); ?>>
    <?php echo $faceDataHtml; ?>
</div>
