const API_ENDPOINT = "/wp-admin/admin-ajax.php";

/**
 * Enforces a timeout for a promise.
 *
 * @param {number} duration - The timeout duration in milliseconds.
 * @param {string} message - The error message to reject with after the timeout.
 * @returns {Promise<void>} A promise that will reject with the error after the specified duration.
 */
function timeout(duration, message) {
	return new Promise((resolve, reject) => {
		setTimeout(() => reject(new Error(message)), duration);
	});
}

/**
 * Serializes the product information for the request.
 *
 * @param {Array<Object>} products - Array of product information objects.
 * @returns {string} The serialized product string for the request.
 */
function serializeProducts(products) {
	return products
		.map(
			(product, index) =>
				`products[${index}][product_id]=${product.product_id}&products[${index}][product_code]=${product.product_code}&products[${index}][qty]=${product.qty}`,
		)
		.join("&");
}

/**
 * Adds an array of products to the cart.
 *
 * @param {Array<Object>} productInfoArray - An array of objects containing product information. Each object should have product_id, product_code, and qty properties.
 * @returns {Promise<Object>} A promise that resolves with the result of the add to cart operation.
 * @throws {Error} Throws an error if the request fails or the server responds with an error.
 */
export async function addToCart(productInfoArray) {
	const serializedProducts = serializeProducts(productInfoArray);
	const formData = `action=vizmerch_add_to_cart&${serializedProducts}`;

	try {
		// Using Promise.race to race between fetch and timeout
		const response = await Promise.race([
			fetch(API_ENDPOINT, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: formData,
			}),
			timeout(10000, "Request timed out after 10 seconds, please try again"),
		]);

		const result = await response.json();
		console.log("Request successful, received data:", result);

		if (result.error) {
			throw new Error(result.error);
		}

		// Assuming you have other global side-effects to manage like 'updateCartCount'
		// If they are not global, consider handling them differently
		cart_info.count += productInfoArray.length;
		updateCartCount();

		return result;
	} catch (error) {
		console.error("Request failed:", error);
		throw error; // Rethrow the error to let the caller handle it
	}
}
