import { useEffect, useState } from "@wordpress/element";
import Loader from "../components/Loader";
import FaceDataDisplay from "../components/FaceDataDisplay";
import fetchDataFromServer from "../services/dataService";
import PanelDataDisplay from "./PanelDataDisplay";

function FrontendApp({ context }) {
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
		<div className={`${context}-fixture`}>
			<FaceDataDisplay faceData={data.faceData} context={context} />
			<PanelDataDisplay panelData={data.panelData} context={context} />
		</div>
	);
}

export default FrontendApp;
