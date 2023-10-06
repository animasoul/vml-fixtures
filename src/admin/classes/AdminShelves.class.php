<?php
class AdminShelves {

    public static function renderFaceData(array $faceData): string {
        $output = '';

        // Loop through each shelf group
        foreach ($faceData as $shelfGroups) {
            $output .= self::renderShelfGroups($shelfGroups);
        }

        return $output;
    }

    private static function renderShelfGroups(array $shelfGroups): string {
        $output = '';

        foreach ($shelfGroups as $horizontalGroupName => $horizontalGroupItems) {
            $output .= self::renderHorizontalGroup($horizontalGroupName, $horizontalGroupItems);
        }

        return $output;
    }

    private static function renderHorizontalGroup(string $horizontalGroupName, array $horizontalGroupItems): string {
        $shelfNumber = preg_replace("/\D/", "", $horizontalGroupName); // Extracting shelf number
        $output = "<div class='shelf shelf-{$shelfNumber}'><h2>Shelf {$shelfNumber}</h2>";

        foreach ($horizontalGroupItems as $items) {
            foreach ($items as $itemGroup) {
                $output .= self::renderItemGroup($itemGroup);
            }
        }

        $output .= "</div>";

        return $output;
    }

    private static function renderItemGroup($itemGroup): string {
        if (!is_array($itemGroup)) {
            $itemGroup = [$itemGroup];
        }

        $output = '';
        $output .= "<div class='item-group'>";
        foreach ($itemGroup as $item) {
            $output .= self::renderItemDiv($item);
        }
        $output .= "</div>";
        return $output;
    }

    private static function renderItemDiv(array $item): string {
        $description = htmlspecialchars($item['Description'], ENT_QUOTES);
        $width = htmlspecialchars($item['Width'], ENT_QUOTES);
        $height = htmlspecialchars($item['Height'], ENT_QUOTES);
        $productID = htmlspecialchars($item['ProductID'], ENT_QUOTES);
        $tharsternCode = htmlspecialchars($item['TharsternCode'], ENT_QUOTES);
        $horizontal = htmlspecialchars($item['Horizontal'], ENT_QUOTES);
        $vertical = htmlspecialchars($item['Vertical'], ENT_QUOTES);

        return "
            <div class='item' data-product-id='{$productID}' style='width:{$width}em;height:{$height}em'>
                <p class='smallp'>{$description}</p>
                <div class='details'>
                    <p><strong>Description:</strong> {$description}</p>
                    <p><strong>Width:</strong> {$width}</p>
                    <p><strong>Height:</strong> {$height}</p>
                    <p><strong>TharsternCode:</strong> {$tharsternCode}</p>
                    <p><strong>Horizontal:</strong> {$horizontal}</p>
                    <p><strong>Vertical:</strong> {$vertical}</p>
                </div>
            </div>";
    }
}
