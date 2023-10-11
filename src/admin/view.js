import { render, useEffect, useState } from "@wordpress/element";
import PropagateLoader from "react-spinners/PropagateLoader";
import FaceDataDisplay from "./components/FaceDataDisplay";

const override = {
	display: "block",
	margin: "0 auto",
	width: "max-content",
	padding: "20px 0",
};

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

function FrontendApp() {
	const [data, setData] = useState({ panelData: [], faceData: [] });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchDataFromServer()
			.then((fetchedData) => {
				setData(fetchedData);
				setLoading(false);
			})
			.catch((err) => {
				console.error("Error fetching data:", err);
				setLoading(false);
				setError(err);
			});
	}, []);

	if (loading) {
		return (
			<div className="loading">
				Loading fixture...
				<PropagateLoader color="#008fca" cssOverride={override} />
			</div>
		);
	}

	if (error) {
		return <div>Error loading data. Please try again later.</div>;
	}

	return (
		<div>
			<FaceDataDisplay faceData={data.faceData} />
		</div>
	);
}

const appRoot = document.querySelector(".wp-block-vml-fixtures-admin");
if (appRoot) {
	render(
		<React.StrictMode>
			<FrontendApp />
		</React.StrictMode>,
		appRoot,
	);
}
