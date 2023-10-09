<?php

require_once 'Api.class.php';

/**
 * ApiDataOrganiser
 * Responsible for data management, extraction from API, and pre-processing
 * for rendering.
 */
class ApiDataOrganiser {
    private const PANEL_KEY = 'Panel';
    private const SHELF_KEY = 'Shelf';
    private const HORIZONTAL_KEY = 'Horizontal';
    private const VERTICAL_KEY = 'Vertical';
    
    private Api $api;

    public function __construct() {
        $this->api = new Api();
    }

    /**
     * Retrieve the necessary data parameters for API requests.
     *
     * @return array Associative array of data parameters.
     */
    public function getDataParams(): array {
        return [
            'storeRoot' => $_SESSION['Customer'] ?? '',
            'storeCode' => $_SESSION['Store'] ?? '',
            'promotion' => 'Fall23',
        ];
    }

    /**
     * Process raw API data into structured format.
     * Organizes the data into panels and face groups, sorts items,
     * and structures face data by shelves and horizontals.
     *
     * @param array $params The data parameters.
     * @return array Processed and structured data.
     */
    public function sortApiData(array $params): array {
        // Fetch data from the API.
        $data = $this->api->make_api_call('GetSephoraProducts', $params, false, 30);

        if (isset($data['error'])) {
            // Handle the error (e.g. return an error message)
            return ['error' => $data['error'], 'panelData' => [], 'faceData' => []];
        }

        if (!is_array($data)) {
            // Handle the error (e.g. return an empty array or throw an exception)
            return ['panelData' => [], 'faceData' => []];
        }

        // Split the data into panelData and faceDataGroups.
        [$panelData, $faceDataGroups] = $this->splitData($data);

        // Sort panelData.
        $this->sortPanelData($panelData);

        // Organize faceData by Shelf and Horizontal.
        return [
            'panelData' => $panelData,
            'faceData' => $this->organizeFaceData($faceDataGroups),
        ];
    }

    /**
     * Splits the provided data into panel data and face data groups.
     *
     * The function processes the given data and categorizes it into:
     * 1. Panel data: Items where the "Panel" attribute is true.
     * 2. Face data groups: Organized by shelf key and then by horizontal key.
     *
     * @param array $data The data to be processed.
     * @return array An array containing the split data: [panelData, faceDataGroups].
     */
    private function splitData(array $data): array {
        $panelData = [];
        $faceDataGroups = [];

        foreach ($data as $item) {
            // quick error check
            $isPanel = $item[self::PANEL_KEY] ?? null;
            if ($isPanel === true) {
                // Item is a panel, so we add it to the panelData array.
                $panelData[] = $item;
            } else {
                // Item is not a panel, so we group it by shelf and horizontal.
                $shelf = $item[self::SHELF_KEY] ?? '';
                $horizontal = $item[self::HORIZONTAL_KEY] ?? '';

                // Special case for shelf 8, vertical 2. which goes at the top of the array
                $vertical = $item[self::VERTICAL_KEY] ?? '';
                if ($horizontal === '8' && $vertical === '2') {
                    $faceDataGroups[$shelf][0.5][] = $item;
                } else {
                    $faceDataGroups[$shelf][$horizontal][] = $item;
                }
            }
        }

        return [$panelData, $faceDataGroups];
    }

    /**
     * Sorts the panel data based on shelf and horizontal keys.
     *
     * The function sorts the provided panel data first by the shelf key and
     * then (if the shelf keys are the same) by the horizontal key.
     *
     * @param array $panelData The panel data to be sorted (passed by reference).
     */
    private function sortPanelData(array &$panelData): void {
        usort($panelData, function ($a, $b) {
            // Primary sorting is done by shelf.
            $aShelf = $a[self::SHELF_KEY] ?? null;
            $bShelf = $b[self::SHELF_KEY] ?? null;
            if ($aShelf !== $bShelf) {
                return $aShelf <=> $bShelf;
            }
            // If shelves are the same, sort by horizontal.
            $aHorizontal = $a[self::HORIZONTAL_KEY] ?? null;
            $bHorizontal = $b[self::HORIZONTAL_KEY] ?? null;

            return $aHorizontal <=> $bHorizontal;
        });
    }

    /**
     * Organizes face data by shelf and horizontal groupings.
     *
     * The function processes the given face data groups and organizes them by:
     * 1. Shelf.
     * 2. Horizontal groupings within each shelf.
     * 3. The items within each horizontal grouping are then sorted by their vertical key in descending order.
     *
     * @param array $faceDataGroups The face data groups to be organized.
     * @return array The organized face data.
     */
    private function organizeFaceData(array $faceDataGroups): array {
        $formattedFaceData = [];
        
        // Sort the faceDataGroups by shelf keys.
        ksort($faceDataGroups);

        foreach ($faceDataGroups as $shelf => $horizontals) {
            $shelfGroup = [];
            
            // Sort horizontal groupings.
            ksort($horizontals);

            foreach ($horizontals as $items) {
                // Sort the items within the horizontal grouping by vertical key (in descending order).
                usort($items, function ($a, $b) {
                    $aVertical = $a[self::VERTICAL_KEY] ?? null;
                    $bVertical = $b[self::VERTICAL_KEY] ?? null;
                    // reverse order, so that the largest numbered verticals are first
                    return $bVertical <=> $aVertical;
                });
                
                // Append items to the shelfGroup with their count as a label.
                $shelfGroup[] = ['Horizontal: ' . count($items) => $items];
            }

            // Append the organized shelf group to the final output.
            $formattedFaceData[] = ['Shelf: ' . $shelf => $shelfGroup];
        }

        return $formattedFaceData;
    }
}
