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
			// Assuming 'filter' is the correct parameter name expected by your API.
			// You might need to adjust it based on the actual API requirement.
			// For example, if filter should be an object with keys and values, you'll need to iterate over the entries and append them to params.
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
