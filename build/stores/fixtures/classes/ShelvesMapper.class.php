<?php

class ShelvesMapper
{
    /**
     * Maps data from the API to the shelves configuration.
     *
     * @param array $shelvesData The shelves configuration data.
     * @param array $apiData The data fetched from the API.
     * @return array The updated shelves data.
     */
    public function mapDataToShelves(array $shelvesData, array $apiData): array
    {
        // Create an associative array for easy mapping of API data to shelves.
        $apiDataMappedByShelf = [];
        foreach ($apiData as $apiEntry) {
            $shelfNumber = $apiEntry['Shelf'];
            if (!isset($apiDataMappedByShelf[$shelfNumber])) {
                $apiDataMappedByShelf[$shelfNumber] = [];
            }
            $apiDataMappedByShelf[$shelfNumber][] = $apiEntry;
        }

        // Iterate through each shelf.
        foreach ($shelvesData['shelves'] as $shelfIndex => $shelf) {
            $shelfNumber = $shelf['Shelf'];

            // Check if there's corresponding data in the API data.
            if (isset($apiDataMappedByShelf[$shelfNumber])) {
                foreach ($apiDataMappedByShelf[$shelfNumber] as $apiEntryIndex => $apiEntry) {
                    $shelvesData['shelves'][$shelfIndex]['items'][$apiEntryIndex]['brand'] = $apiEntry['Brand'];
                    $shelvesData['shelves'][$shelfIndex]['items'][$apiEntryIndex]['promotion'] = $apiEntry['Promotion'];
                    $shelvesData['shelves'][$shelfIndex]['items'][$apiEntryIndex]['store'] = $apiEntry['Store'];
                    $shelvesData['shelves'][$shelfIndex]['items'][$apiEntryIndex]['fixture'] = $apiEntry['Fixture'];
                    $shelvesData['shelves'][$shelfIndex]['items'][$apiEntryIndex]['code'] = $apiEntry['Code'];
                    $shelvesData['shelves'][$shelfIndex]['items'][$apiEntryIndex]['productID'] = $apiEntry['ProductID'];
                    $shelvesData['shelves'][$shelfIndex]['items'][$apiEntryIndex]['tharsternCode'] = $apiEntry['TharsternCode'];
                    $shelvesData['shelves'][$shelfIndex]['items'][$apiEntryIndex]['description'] = $apiEntry['Description'];
                    $shelvesData['shelves'][$shelfIndex]['items'][$apiEntryIndex]['stockQty'] = $apiEntry['StockQty'];
                    $shelvesData['shelves'][$shelfIndex]['items'][$apiEntryIndex]['category'] = $apiEntry['Category'];
                    $shelvesData['shelves'][$shelfIndex]['items'][$apiEntryIndex]['bay'] = $apiEntry['Bay'];
                    $shelvesData['shelves'][$shelfIndex]['items'][$apiEntryIndex]['horizontal'] = $apiEntry['Horizontal'];
                    $shelvesData['shelves'][$shelfIndex]['items'][$apiEntryIndex]['vertical'] = $apiEntry['Vertical'];
                    $shelvesData['shelves'][$shelfIndex]['items'][$apiEntryIndex]['url1'] = $apiEntry['URL1'];
                    $shelvesData['shelves'][$shelfIndex]['items'][$apiEntryIndex]['url2'] = $apiEntry['URL2'];
                }
            }
        }

        return $shelvesData;
    }
}
