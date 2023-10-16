const API_ENDPOINT = "/wp-admin/admin-ajax.php";

// Helper function for timeout
function timeout(duration, message) {
	return new Promise((resolve, reject) => {
		setTimeout(() => reject(new Error(message)), duration);
	});
}

export async function addToCart(productInfoArray) {
	function serializeProducts(products) {
		return products
			.map(
				(product, index) =>
					`products[${index}][product_id]=${product.product_id}&products[${index}][product_code]=${product.product_code}&products[${index}][qty]=${product.qty}`,
			)
			.join("&");
	}

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
