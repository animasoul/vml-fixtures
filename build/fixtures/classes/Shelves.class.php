<?php
require_once 'ShelfItem.class.php';

/**
 * Class Shelves
 * Represents a collection of shelves.
 */
class Shelves
{
    private $config;

    /**
     * Shelves constructor.
     *
     * @param array  $config       The configuration for the shelves.
     */
    public function __construct($config)
    {
        $this->config = $config;
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

        $html = "<div class='fixture endCap'>";
        foreach ($this->config['shelves'] as $shelfIndex => $shelf) {
            $shelfNumber = $shelfIndex + 1;
            $shelfObject = new Shelf($shelfNumber, $shelf);
            $html .= $shelfObject->generate();
        }
        $html .= "<button class='fixture-tocart__btn'>Add ALL Shelf items to Cart</button>";
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
    private $shelfNumber;
    private $shelf;

    /**
     * Shelf constructor.
     *
     * @param int    $shelfNumber  The number of the shelf.
     * @param array  $shelf        The shelf details.
     */
    public function __construct( $shelfNumber, $shelf)
    {
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
        $html = "<div class='shelf-title'>";
        $html .= "<h3>Shelf {$this->shelfNumber}</h3>";
        $html .= "<button class='shelf-tocart__btn shelf{$this->shelfNumber}__btn'>Add ALL Shelf {$this->shelfNumber} items to Cart</button>";
        $html .= "</div>";
        $html .= "<div class='shelf shelf{$this->shelfNumber}'>";
        
        if (!empty($this->shelf['custom'])) {
            foreach ($this->shelf['items'] as $sectionCount => $sectionItems) {
                $sectionCount++;
                $shelfSection = new ShelfSection($this->shelfNumber, $sectionCount, $sectionItems);
                $html .= "<div class='shelf{$this->shelfNumber}-{$sectionCount}'>"
                      . $shelfSection->generate()
                      . "</div>";
            }
        } else {
            $shelfSection = new ShelfSection($this->shelfNumber, null, $this->shelf['items']);
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
    private $shelfNumber;
    private $sectionCount;
    private $sectionItems;

    /**
     * ShelfSection constructor.
     *
     * @param int    $shelfNumber  The number of the shelf.
     * @param int    $sectionCount The count of the section.
     * @param array  $sectionItems The items in the section.
     */
    public function __construct( $shelfNumber, $sectionCount, $sectionItems)
    {
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
            $shelfItem = new ShelfItem($this->shelfNumber, $sectionClass, $itemCount, $item);
            $html .= $shelfItem->generate();
        }
        return $html;
    }
}
