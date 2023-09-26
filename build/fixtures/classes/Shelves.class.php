<?php
/**
 * Class Shelves
 * Represents a collection of shelves.
 */
class Shelves
{
    private $config;
    private $baseImageUrl;

    /**
     * Shelves constructor.
     *
     * @param array  $config       The configuration for the shelves.
     * @param string $baseImageUrl The base URL for item images.
     */
    public function __construct($config, $baseImageUrl)
    {
        $this->config = $config;
        $this->baseImageUrl = $baseImageUrl;
    }

    /**
     * Generates the HTML for all the shelves.
     *
     * @return string The HTML string.
     */
    public function generate()
    {
        if (!isset($this->config['shelves']) || !is_array($this->config['shelves'])) {
            die('Invalid configuration: Missing or invalid "shelves" key');
        }

        $html = "<div class='endCap'>";
        foreach ($this->config['shelves'] as $shelfIndex => $shelf) {
            $shelfNumber = $shelfIndex + 1;
            $shelfObject = new Shelf($this->baseImageUrl, $shelfNumber, $shelf);
            $html .= $shelfObject->generate();
        }
        $html .= "</div>";
        return $html;
    }
}

/**
 * Class Shelf
 * Represents a shelf.
 */
class Shelf
{
    private $baseImageUrl;
    private $shelfNumber;
    private $shelf;

    /**
     * Shelf constructor.
     *
     * @param string $baseImageUrl The base URL for item images.
     * @param int    $shelfNumber  The number of the shelf.
     * @param array  $shelf        The shelf details.
     */
    public function __construct($baseImageUrl, $shelfNumber, $shelf)
    {
        $this->baseImageUrl = $baseImageUrl;
        $this->shelfNumber = $shelfNumber;
        $this->shelf = $shelf;
    }

    /**
     * Generates the HTML for the shelf.
     *
     * @return string The HTML string.
     */
    public function generate()
    {
        $html = "<h3>Shelf {$this->shelfNumber}</h3><hr />";
        $html .= "<div class='shelf shelf{$this->shelfNumber}'>";
        
        if (!empty($this->shelf['custom'])) {
            foreach ($this->shelf['items'] as $sectionCount => $sectionItems) {
                $sectionCount++;
                $shelfSection = new ShelfSection($this->baseImageUrl, $this->shelfNumber, $sectionCount, $sectionItems);
                $html .= "<div class='shelf{$this->shelfNumber}-{$sectionCount}'>"
                      . $shelfSection->generate()
                      . "</div>";
            }
        } else {
            $shelfSection = new ShelfSection($this->baseImageUrl, $this->shelfNumber, null, $this->shelf['items']);
            $html .= $shelfSection->generate();
        }
        
        $html .= "</div>";
        return $html;
    }
}

/**
 * Class ShelfSection
 * Represents a section of a shelf.
 */
class ShelfSection
{
    private $baseImageUrl;
    private $shelfNumber;
    private $sectionCount;
    private $sectionItems;

    /**
     * ShelfSection constructor.
     *
     * @param string $baseImageUrl The base URL for item images.
     * @param int    $shelfNumber  The number of the shelf.
     * @param int    $sectionCount The count of the section.
     * @param array  $sectionItems The items in the section.
     */
    public function __construct($baseImageUrl, $shelfNumber, $sectionCount, $sectionItems)
    {
        $this->baseImageUrl = $baseImageUrl;
        $this->shelfNumber = $shelfNumber;
        $this->sectionCount = $sectionCount;
        $this->sectionItems = $sectionItems;
    }

    /**
     * Generates the HTML for the shelf section.
     *
     * @return string The HTML string.
     */
    public function generate()
    {
        $html = '';
        foreach ($this->sectionItems as $itemCount => $item) {
            $itemCount++;
            $sectionClass = $this->sectionCount ? "-{$this->sectionCount}" : '';
            $shelfItem = new ShelfItem($this->baseImageUrl, $this->shelfNumber, $sectionClass, $itemCount, $item);
            $html .= $shelfItem->generate();
        }
        return $html;
    }
}

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
