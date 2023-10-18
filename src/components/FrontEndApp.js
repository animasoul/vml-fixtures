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
			{data.faceData.length > 0 ? (
				<FaceDataDisplay faceData={data.faceData} context={context} />
			) : (
				<div>No Face Data available.</div>
			)}

			{data.panelData.length > 0 ? (
				<PanelDataDisplay panelData={data.panelData} context={context} />
			) : (
				<div>No Panel Data available.</div>
			)}
		</div>
	);
}

export default FrontendApp;
