<?php
/**
 * AdminShelves
 * A static utility class responsible for rendering shelf and item data into HTML format.
 */
class AdminShelves {
    // Constants to define the keys used in the product items.
    private const DESCRIPTION = 'Description';
    private const WIDTH = 'Width';
    private const HEIGHT = 'Height';
    private const PRODUCT_ID = 'ProductID';
    private const THARSTERN_CODE = 'TharsternCode';
    private const HORIZONTAL = 'Horizontal';
    private const VERTICAL = 'Vertical';
    private const URL1 = 'URL1';

    /**
     * Safely retrieves the value of a key from the given array or the default value if the key is not set.
     * @param array $array The source array.
     * @param string $key The key to retrieve.
     * @param mixed $default The default value if key is not set.
     * @return mixed The value or the default value.
     */
    private static function safeGet(array $array, string $key, $default = '') {
        return array_key_exists($key, $array) && !empty($array[$key]) ? $array[$key] : $default;
    }

    /**
     * Render the face data into a single string.
     * This function accumulates the renderings of each shelf group.
     *
     * @param array $faceData The data for the face of the shelf.
     * @return string The rendered face data.
     */
    public static function renderFaceData(array $faceData): string {
        return array_reduce($faceData, function ($carry, $shelfGroup) {
            return $carry . self::renderShelfGroups($shelfGroup);
        }, '');
    }

    /**
     * Render individual shelf groups.
     * This function accumulates the renderings of horizontal groups in each shelf.
     *
     * @param array $shelfGroups The groups within a shelf.
     * @return string The rendered shelf groups.
     */
    private static function renderShelfGroups(array $shelfGroups): string {
        return array_reduce(array_keys($shelfGroups), function ($carry, $groupName) use ($shelfGroups) {
            return $carry . self::renderHorizontalGroup($groupName, $shelfGroups[$groupName]);
        }, '');
    }

    /**
     * Render horizontal groups.
     * Generates an HTML block for a horizontal shelf group.
     *
     * @param string $horizontalGroupName The name of the horizontal group.
     * @param array $horizontalGroupItems The items within the horizontal group.
     * @return string The rendered horizontal group.
     */
    private static function renderHorizontalGroup(string $horizontalGroupName, array $horizontalGroupItems): string {
        $shelfNumber = self::extractShelfNumber($horizontalGroupName);
        $items = array_reduce($horizontalGroupItems, function ($carry, $items) {
            return $carry . self::renderItems($items);
        }, '');

        return "<div class='shelf shelf-{$shelfNumber}'><h2>Shelf {$shelfNumber}</h2>{$items}</div>";
    }

    /**
     * Render item groups.
     * This function accumulates the renderings of individual items or item groups.
     *
     * @param array $items The items or item groups.
     * @return string The rendered items.
     */
    private static function renderItems(array $items): string {
        return array_reduce($items, function ($carry, $itemGroup) {
            return $carry . self::renderItemGroup($itemGroup);
        }, '');
    }

    /**
     * Render a group of items.
     * Generates an HTML block for a group of items.
     *
     * @param mixed $itemGroup An item or group of items.
     * @return string The rendered item group.
     */
    private static function renderItemGroup($itemGroup): string {
        $items = is_array($itemGroup) ? $itemGroup : [$itemGroup];
        return "<div class='item-group'>" . array_reduce($items, function ($carry, $item) {
            return $carry . self::renderItemDiv($item);
        }, '') . "</div>";
    }

    /**
     * Render an individual item.
     * Generates an HTML block for a single item.
     *
     * @param array $item The item details.
     * @return string The rendered item.
     */
    private static function renderItemDiv(array $item): string {
        $details = self::formatDetails($item);
        $productID = htmlspecialchars(self::safeGet($item, self::PRODUCT_ID), ENT_QUOTES);
        $image = 'background-image:url('.htmlspecialchars(self::safeGet($item, self::URL1), ENT_QUOTES).');';

        return "<div class='item' data-product-id='{$productID}' style='width:{$details[self::WIDTH]}em;height:{$details[self::HEIGHT]}em;{$image}'>
            <p class='smallp'>{$details[self::DESCRIPTION]}</p>
            <div class='details'>{$details['formatted']}</div>
        </div>";
    }

    /**
     * Format the item details.
     * Converts the details of an item into a string representation.
     *
     * @param array $item The item details.
     * @return array The formatted item details.
     */
    private static function formatDetails(array $item): array {
        $fields = [self::DESCRIPTION, self::WIDTH, self::HEIGHT, self::THARSTERN_CODE, self::HORIZONTAL, self::VERTICAL];
        $formattedDetails = [];

        foreach ($fields as $field) {
            $formattedDetails[$field] = htmlspecialchars(self::safeGet($item, $field), ENT_QUOTES);
        }

        $details = array_reduce($fields, function ($carry, $field) use ($formattedDetails) {
            return $carry . "<p><strong>{$field}:</strong> {$formattedDetails[$field]}</p>";
        }, '');

        $formattedDetails['formatted'] = $details;
        return $formattedDetails;
    }

    /**
     * Extract the shelf number from a horizontal group name.
     * Removes non-digit characters and returns the shelf number.
     *
     * @param string $horizontalGroupName The name of the horizontal group.
     * @return string The extracted shelf number.
     */
    private static function extractShelfNumber(string $horizontalGroupName): string {
        return preg_replace("/\D/", "", $horizontalGroupName);
    }
}
