<?php
require_once 'Shelf.class.php';

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
