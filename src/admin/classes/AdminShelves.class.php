<?php

class AdminShelves {
    private const DESCRIPTION = 'Description';
    private const WIDTH = 'Width';
    private const HEIGHT = 'Height';
    private const PRODUCT_ID = 'ProductID';
    private const THARSTERN_CODE = 'TharsternCode';
    private const HORIZONTAL = 'Horizontal';
    private const VERTICAL = 'Vertical';

    public static function renderFaceData(array $faceData): string {
        return array_reduce($faceData, function ($carry, $shelfGroup) {
            return $carry . self::renderShelfGroups($shelfGroup);
        }, '');
    }

    private static function renderShelfGroups(array $shelfGroups): string {
        return array_reduce(array_keys($shelfGroups), function ($carry, $groupName) use ($shelfGroups) {
            return $carry . self::renderHorizontalGroup($groupName, $shelfGroups[$groupName]);
        }, '');
    }

    private static function renderHorizontalGroup(string $horizontalGroupName, array $horizontalGroupItems): string {
        $shelfNumber = self::extractShelfNumber($horizontalGroupName);
        $items = array_reduce($horizontalGroupItems, function ($carry, $items) {
            return $carry . self::renderItems($items);
        }, '');

        return "<div class='shelf shelf-{$shelfNumber}'><h2>Shelf {$shelfNumber}</h2>{$items}</div>";
    }

    private static function renderItems(array $items): string {
        return array_reduce($items, function ($carry, $itemGroup) {
            return $carry . self::renderItemGroup($itemGroup);
        }, '');
    }

    private static function renderItemGroup($itemGroup): string {
        $items = is_array($itemGroup) ? $itemGroup : [$itemGroup];
        return "<div class='item-group'>" . array_reduce($items, function ($carry, $item) {
            return $carry . self::renderItemDiv($item);
        }, '') . "</div>";
    }

    private static function renderItemDiv(array $item): string {
        $details = self::formatDetails($item);
        $productID = htmlspecialchars($item[self::PRODUCT_ID], ENT_QUOTES);

        return "<div class='item' data-product-id='{$productID}' style='width:{$details[self::WIDTH]}em;height:{$details[self::HEIGHT]}em'>
            <p class='smallp'>{$details[self::DESCRIPTION]}</p>
            <div class='details'>{$details['formatted']}</div>
        </div>";
    }

    private static function formatDetails(array $item): array {
        $fields = [self::DESCRIPTION, self::WIDTH, self::HEIGHT, self::THARSTERN_CODE, self::HORIZONTAL, self::VERTICAL];
        $formattedDetails = [];

        foreach ($fields as $field) {
            $formattedDetails[$field] = htmlspecialchars($item[$field], ENT_QUOTES);
        }

        $details = array_reduce($fields, function ($carry, $field) use ($formattedDetails) {
            return $carry . "<p><strong>{$field}:</strong> {$formattedDetails[$field]}</p>";
        }, '');

        $formattedDetails['formatted'] = $details;
        return $formattedDetails;
    }

    private static function extractShelfNumber(string $horizontalGroupName): string {
        return preg_replace("/\D/", "", $horizontalGroupName);
    }
}
