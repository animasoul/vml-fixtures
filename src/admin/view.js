import { render, useEffect, useState } from "@wordpress/element";
import FaceDataDisplay from "./components/FaceDataDisplay";

function FrontendApp() {
	console.log("FrontendApp");
	const [data, setData] = useState({ panelData: [], faceData: [] });
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
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
					throw new Error("Network response was not ok");
				}

				const fetchedData = await response.json();
				setData(fetchedData);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching data:", error);
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) {
		return <div>Loading content...</div>;
	}

	return (
		<div>
			<FaceDataDisplay faceData={data.faceData} />
		</div>
	);
}

// When the script runs, look for your block's placeholder and mount your React component.
const appRoot = document.querySelector(".wp-block-vml-fixtures-admin");
if (appRoot) {
	render(
		<React.StrictMode>
			<FrontendApp />
		</React.StrictMode>,
		appRoot,
	);
}
