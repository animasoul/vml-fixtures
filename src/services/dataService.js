/**
 * Fetches data from the server with specified action and optional parameters.
 *
 * @param {Object} params - The parameters object.
 * @param {string} params.action - The action parameter to be sent to the server.
 * @param {?string} [params.promotion=null] - Optional. The promotion identifier.
 * @param {?string} [params.filter=null] - Optional. The filter criteria.
 * @param {string} [params.return_json='false'] - Determines if the server will return JSON or another format.
 * @returns {Promise<Object>} A promise that resolves with the JSON response from the server.
 * @throws {Error} Throws an error if the fetch operation fails or if the response can't be parsed as JSON.
 */
async function fetchDataFromServer(
	action,
	promotion = null,
	filter = null,
	return_json = "false",
) {
	try {
		const params = new URLSearchParams({ action: action });

		// If the filter is provided and is not null, append it to the params
		if (filter !== null) {
			params.append("filter", filter);
		}
		if (promotion !== null) {
			params.append("promotion", promotion);
		}
		if (return_json !== null) {
			params.append("json", return_json);
		}
		const response = await fetch("/wp-admin/admin-ajax.php", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: params,
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch data. Status code: ${response.status}`);
		}

		return response.json();
	} catch (error) {
		// Logging the error for debugging (optional)
		console.error("Error occurred while fetching data:", error.message);

		// Rethrow the error to be handled by calling function
		throw error;
	}
}

export default fetchDataFromServer;
