<?php
/**
 * Class Dialog
 * Handles the generation of dialogs.
 */
class Dialog {
    private string $dialogId;
    private string $largeImgSrc;
    private string $altText;
    private string $details;
    private string $productCode;
    private string $productId;

    public function __construct(
        string $dialogId,
        string $largeImgSrc,
        string $altText,
        string $details,
        string $productCode,
        string $productId
    ) {
        $this->dialogId = htmlspecialchars($dialogId);
        $this->largeImgSrc = htmlspecialchars($largeImgSrc);
        $this->altText = htmlspecialchars($altText);
        $this->details = $details;
        $this->productCode = htmlspecialchars($productCode);
        $this->productId = htmlspecialchars($productId);
    }

    /**
     * Generates the HTML for the dialog.
     *
     * @return string The HTML string.
     */
    public function generate(): string
    {
        return '
            <dialog id="' . $this->dialogId . '">
                <img src="' . $this->largeImgSrc . '" alt="' . $this->altText . '" />
                <div>' . $this->details . '</div>
                <div class="dialog-buttons common-container">
                    <button onclick="closeDialog(\'' . $this->dialogId . '\')" class="close-dialog">Close</button>
                    <button type="submit" class="add-cart" onclick="handleAddToCart(event)" data-product-code="' . $this->productCode . '" data-product-id="' . $this->productId . '">
                        <span class="btnSubmit-text">Add item to cart</span>
                        <span class="js-loadingMsg" aria-live="assertive" data-loading-msg="Adding to cart, wait..."></span>
                    </button>
                    <div class="addToCart-success" style="display:none">Item added to cart successfully!</div>
                    <div class="addToCart-fail" style="display:none">There has been a problem, Item not added!!!</div>
                </div>
            </dialog>';
    }
}

/**
 * Class ShelfItem
 * Represents a single item on a shelf.
 */
class ShelfItem {
    private int $shelfNumber;
    private string $sectionClass;
    private int $itemCount;
    private array $item;

    /**
     * ShelfItem constructor.
     *
     * @param int    $shelfNumber  The number of the shelf.
     * @param string $sectionClass The class for the shelf section.
     * @param int    $itemCount    The count of the item within the section.
     * @param array  $item         The item details.
     */
    public function __construct(int $shelfNumber, string $sectionClass, int $itemCount, array $item) {
        $this->shelfNumber = $shelfNumber;
        $this->sectionClass = $sectionClass;
        $this->itemCount = $itemCount;
        $this->item = $item;
    }

    /**
     * Generates the HTML for the shelf item.
     *
     * @return string The HTML string.
     * @throws InvalidArgumentException If mandatory data is missing or invalid.
     */
    public function generate(): string
    {
        $class = "shelf{$this->shelfNumber}{$this->sectionClass}-{$this->itemCount}";

        if (array_key_exists('URL2', $this->item) && !empty($this->item['URL2'])) {
            $altText = $this->item['Description'];
            $imgSrc = "{$this->item['URL2']}";
            $largeImgSrc = "{$this->item['URL1']}";
        } else {
            $altText = "shelf {$this->shelfNumber} section {$this->sectionClass} item {$this->itemCount} for end cap";
            $imgSrc = $this->item['image'] ?? '';
            $largeImgSrc = str_replace('_Thumb', '', $imgSrc);
            $imgSrc = str_replace('_Thumb', '', $imgSrc);
        }

        $details = '';
        foreach ($this->item as $key => $value) {
            if (!in_array($key, ['URL1', 'URL2', 'image'])) {
                $details .= "<p><strong>{$key}:</strong> {$value}</p>";
            }
        }

        $dialogId = "dialog{$this->shelfNumber}{$this->sectionClass}-{$this->itemCount}";
        $productCode = $this->item['Code'] ?? '';
        $productId = $this->item['ProductID'] ?? '';

        if(empty($imgSrc)) {
            throw new InvalidArgumentException('Image source cannot be empty.');
        }

        $dialog = new Dialog($dialogId, $largeImgSrc, $altText, $details, $productCode, $productId);

        return "
            <div class='{$class}'>
                <img src='{$imgSrc}' alt='{$altText}' onclick='openDialog(\"{$dialogId}\")' />
                {$dialog->generate()}
            </div>
        ";
    }
}
