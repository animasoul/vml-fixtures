<?php
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

        $html = "<div class='endCap'>";
        foreach ($this->config['shelves'] as $shelfIndex => $shelf) {
            $shelfNumber = $shelfIndex + 1;
            $shelfObject = new Shelf($shelfNumber, $shelf);
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
        $html = "<h4>Shelf {$this->shelfNumber}</h4><hr />";
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

/**
 * Class ShelfItem
 * Represents a single item on a shelf.
 */
class ShelfItem
{
    private $shelfNumber;
    private $sectionClass;
    private $itemCount;
    private $item;

    /**
     * ShelfItem constructor.
     *
     * @param int    $shelfNumber  The number of the shelf.
     * @param string $sectionClass The class for the shelf section.
     * @param int    $itemCount    The count of the item within the section.
     * @param array  $item         The item details.
     */
    public function __construct($shelfNumber, $sectionClass, $itemCount, $item)
    {
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
        //check to see if array key exists for URL2 and not empty then loop through all available json data, else use default settings
        // Check to see if array key exists for URL2 and not empty then loop through all available JSON data, else use default settings
        if (array_key_exists('URL2', $this->item) && !empty($this->item['URL2'])) {
            $altText = $this->item['Description'];
            $imgSrc = "{$this->item['URL2']}";
            $largeImgSrc = "{$this->item['URL1']}";
        } else {
            $altText = "shelf {$this->shelfNumber} section {$this->sectionClass} item {$this->itemCount} for end cap";
            $imgSrc = "{$this->item['image']}";
            $largeImgSrc = str_replace('_Thumb', '', $imgSrc);
        }

        // Prepare the details for the dialog
        $details = '';
        foreach ($this->item as $key => $value) {
            if (!in_array($key, ['URL1', 'URL2', 'image'])) {
                $details .= "<p><strong>{$key}:</strong> {$value}</p>";
            }
        }

        // Create a unique identifier for this dialog
        $dialogId = "dialog-{$this->shelfNumber}-{$this->sectionClass}-{$this->itemCount}";

        // Return the HTML
        return "
            <div class='{$class}'>
                <img src='{$imgSrc}' alt='{$altText}' onclick='openDialog(\"{$dialogId}\")' />
                <dialog id='{$dialogId}'>
                    <img src='{$largeImgSrc}' alt='{$altText}' />
                    <div>{$details}</div>
                    <button onclick='closeDialog(\"{$dialogId}\")'>Close</button>
                </dialog>
            </div>
            <script>
                function openDialog(id) {
                    document.getElementById(id).showModal();
                }
                function closeDialog(id) {
                    document.getElementById(id).close();
                }
            </script>
        ";
    }
}
