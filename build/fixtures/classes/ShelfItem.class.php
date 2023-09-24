<?php
/**
 * Class ShelfItem
 * Represents a single item on a shelf.
 */
class ShelfItem
{
    private $baseImageUrl;
    private $shelfNumber;
    private $sectionClass;
    private $itemCount;
    private $item;

    /**
     * ShelfItem constructor.
     *
     * @param string $baseImageUrl The base URL for item images.
     * @param int    $shelfNumber  The number of the shelf.
     * @param string $sectionClass The class for the shelf section.
     * @param int    $itemCount    The count of the item within the section.
     * @param array  $item         The item details.
     */
    public function __construct($baseImageUrl, $shelfNumber, $sectionClass, $itemCount, $item)
    {
        $this->baseImageUrl = $baseImageUrl;
        $this->shelfNumber = $shelfNumber;
        $this->sectionClass = $sectionClass;
        $this->itemCount = $itemCount;
        $this->item = $item;
    }

    
    /**
     * Generates the HTML for the shelf item.
     *
     * @return string The HTML string.
     */public function generate()
    {
        $class = "shelf{$this->shelfNumber}{$this->sectionClass}-{$this->itemCount}";
        $altText = "shelf {$this->shelfNumber} section {$this->sectionClass} item {$this->itemCount} for end cap";
        $imgSrc = "{$this->baseImageUrl}/Fall23/{$this->item['image']}";
        
        return "<div class='{$class}'><img src='{$imgSrc}' alt='{$altText}' /></div>";
    }
}
