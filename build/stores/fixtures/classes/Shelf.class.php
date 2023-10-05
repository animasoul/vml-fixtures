<?php

require_once 'ShelfSection.class.php';

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
