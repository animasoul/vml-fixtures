const API_ENDPOINT = "/wp-admin/admin-ajax.php";

// Helper function for timeout
function timeout(duration, message) {
	return new Promise((resolve, reject) => {
		setTimeout(() => reject(new Error(message)), duration);
	});
}

export async function addToCart(productInfoArray) {
	const data = {
		action: "vizmerch_add_to_cart",
		products: productInfoArray,
	};

	console.log("Sending request with data:", data);

	try {
		// Using Promise.race to race between fetch and timeout
		const response = await Promise.race([
			fetch(API_ENDPOINT, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams(data).toString(),
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
