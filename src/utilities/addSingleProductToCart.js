import { addToCart } from "../services/addToCart";

export async function addSingleProductToCart(itemDetails) {
	// Validate the input.
	if (!itemDetails?.ProductID || !itemDetails?.Code) {
		throw new Error("Invalid item details provided.");
	}

	const productInfo = {
		product_id: itemDetails.ProductID,
		product_code: itemDetails.Code,
		qty: 1,
	};

	try {
		const result = await addToCart([productInfo]); // Passing as an array since `addToCart` likely expects an array.
		return result;
	} catch (error) {
		throw new Error(`Error adding single item to cart: ${error.message}`);
	}
}
