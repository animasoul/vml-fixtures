import { render, useEffect, useState } from "@wordpress/element";
import PropagateLoader from "react-spinners/PropagateLoader";
import FaceDataDisplay from "../components/FaceDataDisplay";
import fetchDataFromServer from "../services/dataService";

const override = {
	display: "block",
	margin: "0 auto",
	width: "max-content",
	padding: "20px 0",
};

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
