<?php

$jsonString = <<<JSON
{
    "shelves": [
        {
            "items": [
                {"image": "SAI-Fall23-26.jpg"},
                {"image": "SAI-Fall23-26.jpg"},
                {"image": "SAI-Fall23-26.jpg"},
                {"image": "SAI-Fall23-26.jpg"},
                {"image": "SAI-Fall23-26.jpg"},
                {"image": "SAI-Fall23-31.jpg"}
            ]
        },
        {
            "items": [
                {"image": "SAI-Fall23-31.jpg"},
                {"image": "SAI-Fall23-31.jpg"},
                {"image": "SAI-Fall23-31.jpg"},
                {"image": "SAI-Fall23-31.jpg"},
                {"image": "SAI-Fall23-31.jpg"}
            ]
        },
        {
            "items": [
                {"image": "SAI-Fall23-36.jpg"},
                {"image": "SAI-Fall23-36.jpg"},
                {"image": "SAI-Fall23-36.jpg"},
                {"image": "SAI-Fall23-36.jpg"},
                {"image": "SAI-Fall23-36.jpg"}
            ]
        },
        {
            "custom": true,
            "items": [
                [
                    {"image": "SAI-Fall23-37_Thumb.jpg"}
                ],
                [
                    {"image": "SAI-Fall23-36.jpg"},
                    {"image": "SAI-Fall23-36.jpg"},
                    {"image": "SAI-Fall23-36.jpg"},
                    {"image": "SAI-Fall23-36.jpg"}
                ],
                [
                    {"image": "SAI-Fall23-89_Thumb.jpg"}
                ],
                [
                    {"image": "SAI-Fall23-26.jpg"}
                ],
                [
                    {"image": "SAI-Fall23-36.jpg"}
                ]
            ]
        }
    ]
}
JSON;

$config = json_decode($jsonString, true);

// Error handling for JSON decoding
if (json_last_error() !== JSON_ERROR_NONE) {
    die('Error decoding JSON: ' . json_last_error_msg());
}

function generateShelfHeader($shelfNumber) {
    return "<h3>Shelf {$shelfNumber}</h3><hr />";
}

function generateItemImage($baseImageUrl, $shelfNumber, $sectionCount, $itemCount, $item) {
    $altText = "shelf {$shelfNumber}-{$sectionCount}-{$itemCount} for end cap";
    return "<img src='{$baseImageUrl}/Fall23/{$item['image']}' alt='{$altText}' />";
}

function generateItem($baseImageUrl, $shelfNumber, $sectionClass, $itemCount, $item) {
    $class = "shelf{$shelfNumber}{$sectionClass}-{$itemCount}";
    $altText = "shelf {$shelfNumber} section {$sectionClass} item {$itemCount} for end cap";
    $imgSrc = "{$baseImageUrl}/Fall23/{$item['image']}";
    
    return "<div class='{$class}'><img src='{$imgSrc}' alt='{$altText}' /></div>";
}

function generateSection($baseImageUrl, $shelfNumber, $sectionCount, $sectionItems) {
    $html = '';
    foreach ($sectionItems as $itemCount => $item) {
        // Using the array index as item count directly, starting from 1
        $itemCount++;
        $sectionClass = $sectionCount ? "-{$sectionCount}" : '';
        $html .= generateItem($baseImageUrl, $shelfNumber, $sectionClass, $itemCount, $item);
    }
    return $html;
}

function generateShelf($baseImageUrl, $shelfNumber, $shelf) {
    $html = generateShelfHeader($shelfNumber);
    $html .= "<div class='shelf shelf{$shelfNumber}'>";
    
    if (!empty($shelf['custom'])) {
        foreach ($shelf['items'] as $sectionCount => $sectionItems) {
            // Using the array index as section count directly, starting from 1
            $sectionCount++;
            $html .= "<div class='shelf{$shelfNumber}-{$sectionCount}'>"
                  . generateSection($baseImageUrl, $shelfNumber, $sectionCount, $sectionItems)
                  . "</div>";
        }
    } else {
        $html .= generateSection($baseImageUrl, $shelfNumber, null, $shelf['items']);
    }
    
    $html .= "</div>";
    return $html;
}

function generateShelves($config, $baseImageUrl) {
    // Check if the required 'shelves' key exists in the config
    if (!isset($config['shelves']) || !is_array($config['shelves'])) {
        die('Invalid configuration: Missing or invalid "shelves" key');
    }

    $html = "<div class='endCap'>";
    foreach ($config['shelves'] as $shelfIndex => $shelf) {
        $shelfNumber = $shelfIndex + 1;
        $html .= generateShelf($baseImageUrl, $shelfNumber, $shelf);
    }
    $html .= "</div>";
    return $html;
}

// Generate and output shelves HTML
echo generateShelves($config, $baseImageUrl);

