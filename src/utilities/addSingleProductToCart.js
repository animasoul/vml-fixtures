import { addToCart } from "../services/addToCart";

/**
 * Adds a single product to the cart.
 *
 * @param {Object} itemDetails - An object containing details about the item. Must include `ProductID` and `Code`.
 * @returns {Promise<Object>} A promise that resolves with the result of the add to cart operation.
 * @throws {Error} Throws an error if the input is invalid or if there is an error in adding the product to the cart.
 */
export async function addSingleProductToCart(itemDetails) {
	// Validate the input.
	if (!itemDetails?.ProductID || !itemDetails?.Code) {
		throw new Error("Invalid item details provided.");
	}

	const productInfo = {
		product_id: itemDetails.ProductID,
		product_code: itemDetails.Code,
		qty: 1, // Quantity is set to 1 since this is for a single product
	};

	try {
		const result = await addToCart([productInfo]); // Passing as an array since `addToCart` likely expects an array.
		return result;
	} catch (error) {
		// Here, we include the original error message for more detailed information about the failure
		throw new Error(`Error adding single item to cart: ${error.message}`);
	}
}
