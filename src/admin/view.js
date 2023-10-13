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

	return <FaceDataDisplay faceData={data.faceData} />;
}

const appRoot = document.querySelector(".wp-block-vml-fixtures-admin");
if (appRoot) {
	render(
		<div className="admin-fixture">
			<React.StrictMode>
				<FrontendApp />
			</React.StrictMode>
			<div className="panel-data-display">
				<h2>Panel</h2>
			</div>
		</div>,
		appRoot,
	);
}
