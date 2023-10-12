async function fetchDataFromServer() {
	try {
		const response = await fetch("/wp-admin/admin-ajax.php", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				action: "get_sorted_data",
			}),
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
