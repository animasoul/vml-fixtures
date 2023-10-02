<?php
/**
 * Class Dialog
 * Handles the generation and behavior of dialogs.
 */
class Dialog {
    private $dialogId;
    private $largeImgSrc;
    private $altText;
    private $details;
    private $productCode;
    private $productId;

    public function __construct($dialogId, $largeImgSrc, $altText, $details, $productCode, $productId) {
        $this->dialogId = $dialogId;
        $this->largeImgSrc = $largeImgSrc;
        $this->altText = $altText;
        $this->details = $details;
        $this->productCode = $productCode;
        $this->productId = $productId;
    }

    /**
     * Generates the HTML for the dialog.
     *
     * @return string The HTML string.
     */
    public function generate() {
        return "
            <dialog id='{$this->dialogId}'>
                <img src='{$this->largeImgSrc}' alt='{$this->altText}' />
                <div>{$this->details}</div>
                <div class='dialog-buttons'>
                    <button onclick='closeDialog(\"{$this->dialogId}\")' class='close-dialog'>Close</button>
                    <button type='submit' class='add-cart' onclick='handleAddToCart(event)' data-product-code='{$this->productCode}' data-product-id='{$this->productId}'>
                        <span class='btnSubmit-text'>Add item to cart</span>
                        <span class='js-loadingMsg' aria-live='assertive' data-loading-msg='Adding to cart, wait...'></span>
                    </button>
                </div>
                <div class='addToCart-success' style='display:none'>Item added to cart successfully!</div>
                <div class='addToCart-fail' style='display:none'>There has been a problem, Item not added!!!</div>
            </dialog>
            <script>
                function openDialog(id) {
                    document.getElementById(id).showModal();
                }

                function closeDialog(id) {
                    document.getElementById(id).close();
                }

                /* Handle clicks on the backdrop */
                document.addEventListener('click', function(e) {
                    if (e.target instanceof HTMLDialogElement && e.target.open) {
                        closeDialog(e.target.id);
                    }
                }, false);
            </script>
        ";
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
        // Check to see if array key exists for URL2 and not empty then loop through all available JSON data, else use default settings
        if (array_key_exists('URL2', $this->item) && !empty($this->item['URL2'])) {
            $altText = $this->item['Description'];
            $imgSrc = "{$this->item['URL2']}";
            $largeImgSrc = "{$this->item['URL1']}";
        } else {
            $altText = "shelf {$this->shelfNumber} section {$this->sectionClass} item {$this->itemCount} for end cap";
            $imgSrc = "{$this->item['image']}";
            $largeImgSrc = str_replace('_Thumb', '', $imgSrc);
            $imgSrc = str_replace('_Thumb', '', $imgSrc);
        }

        // Prepare the details for the dialog
        $details = '';
        foreach ($this->item as $key => $value) {
            if (!in_array($key, ['URL1', 'URL2', 'image'])) {
                $details .= "<p><strong>{$key}:</strong> {$value}</p>";
            }
        }

        // Create a unique identifier for this dialog
        $dialogId = "dialog{$this->shelfNumber}{$this->sectionClass}-{$this->itemCount}";

        $productCode = isset($this->item['Code']) ? $this->item['Code'] : '';
        $productId = isset($this->item['ProductID']) ? $this->item['ProductID'] : '';

        $dialog = new Dialog($dialogId, $largeImgSrc, $altText, $details, $productCode, $productId);

        // Return the HTML
        return "
            <div class='{$class}'>
                <img src='{$imgSrc}' alt='{$altText}' onclick='openDialog(\"{$dialogId}\")' />
                {$dialog->generate()}
            </div>
        ";
    }
}
