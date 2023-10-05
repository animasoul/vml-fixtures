<?php

require_once 'ShelfItem.class.php';

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
