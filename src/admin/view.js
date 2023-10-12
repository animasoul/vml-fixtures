import { render, useEffect, useState } from "@wordpress/element";
import Loader from "../components/Loader";
import FaceDataDisplay from "../components/FaceDataDisplay";
import fetchDataFromServer from "../services/dataService";

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
		return <Loader />;
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
