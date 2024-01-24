import { addToCart } from "../services/addToCart";

/**
 * Gathers product information from the DOM and calls the API to add products to the cart.
 *
 * @param {Element} parentElement - The parent DOM element containing product data attributes.
 * @returns {Promise<Object>} A promise that resolves with the result of the add to cart operation.
 * @throws {Error} Throws an error if the parent element is invalid, no items are found, or there's an error in the API call.
 */
export async function gatherProductInfoAndCallAPI(parentElement) {
	// Validate if the parentElement is a valid DOM element.
	if (!(parentElement instanceof Element)) {
		throw new Error("Invalid parent element provided.");
	}

	const productElements = parentElement.querySelectorAll(
		"[data-product-id][data-product-code]",
	);

	// Validate if any product elements exist.
	if (!productElements.length) {
		throw new Error("No item elements found.");
	}

	const productInfoArray = [];

	productElements.forEach((element) => {
		const productId = element.getAttribute("data-product-id");
		const productCode = element.getAttribute("data-product-code");

		// Assuming each product has a quantity of 1
		if (productId && productCode) {
			productInfoArray.push({
				product_id: productId,
				product_code: productCode,
				qty: 1, // Default quantity is set to 1
			});
		}
	});

	// If for some reason no valid products were found.
	if (!productInfoArray.length) {
		throw new Error("No valid items found.");
	}
	console.log("productInfoArray", productInfoArray);

	try {
		const result = await addToCart(productInfoArray);
		return result;
	} catch (error) {
		// Propagate the detailed error message up to the caller
		throw new Error(`Error adding items to cart: ${error.message}`);
	}
}
