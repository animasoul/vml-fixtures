import { addToCart } from "../services/addToCart";

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

		if (productId && productCode) {
			productInfoArray.push({
				product_id: productId,
				product_code: productCode,
				qty: 1,
			});
		}
	});

	// If for some reason no valid products were found.
	if (!productInfoArray.length) {
		throw new Error("No valid items found.");
	}

	try {
		const result = await addToCart(productInfoArray);
		return result;
	} catch (error) {
		throw new Error(`Error adding items to cart: ${error.message}`);
	}
}
