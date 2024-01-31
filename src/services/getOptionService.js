// getOptionService.js

/**
 * Fetch option data from the custom WordPress REST API.
 * @param {string} brand - The brand parameter for the API.
 * @param {string} promo - The promo parameter for the API.
 * @returns {Promise<any>} A promise that resolves to the fetched data.
 */
export const fetchOptionData = async (brand, promo) => {
	try {
		// const apiUrl = `/wp-json/vml-fixtures/v1/get-option/?brand=${encodeURIComponent(
		// 	brand,
		// )}&promo=${encodeURIComponent(promo)}`;

		let apiUrl = `/wp-json/vml-fixtures/v1/get-option/`;

		// Add brand and promo as query parameters if they are passed into the function
		if (brand || promo) {
			apiUrl += `?${new URLSearchParams({ brand, promo }).toString()}`;
		}

		const response = await fetch(apiUrl);

		if (!response.ok) {
			throw new Error(`API request failed with status ${response.status}`);
		}

		return await response.json();
	} catch (err) {
		console.error("Error fetching option data:", err);
		throw err;
	}
};
