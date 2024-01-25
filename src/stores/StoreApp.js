// Desc: Root component for admin app
import Loader from "../components/Loader";
import React, { useState, useEffect, useRef } from "@wordpress/element";
import { fetchOptionData } from "../services/getOptionService";
import { gatherProductInfoAndCallAPI } from "../utilities/gatherAndCallAPI";
import AddButton from "../components/AddButton";
import StoreShelf from "./StoreShelf";

const RootApp = () => {
	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedFixtureType, setSelectedFixtureType] = useState(null);
	const [selectedRegion, setSelectedRegion] = useState(null);

	// Create a ref for the face data display div
	const faceDisplayRef = useRef(null);
	// Create a ref for the panel data display div
	const panelDisplayRef = useRef(null);

	/**
	 * Handle the addition of all fixtures to cart
	 */
	const handleAddAllPanelFixtureClick = async () => {
		// Use the ref to get the panelDisplayElement
		const panelDisplayElement = panelDisplayRef.current;

		if (panelDisplayElement) {
			return gatherProductInfoAndCallAPI(panelDisplayElement);
		}
		throw new Error("Unable to locate panel data for addition to cart.");
	};

	/**
	 * Handle the addition of all fixtures to cart
	 */
	const handleAddAllFixtureClick = async () => {
		// Use the ref to get the faceDisplayElement
		const faceDisplayElement = faceDisplayRef.current;

		if (faceDisplayElement) {
			return gatherProductInfoAndCallAPI(faceDisplayElement);
		}
		throw new Error("Unable to locate face data for addition to cart.");
	};

	useEffect(() => {
		async function fetchData() {
			try {
				const response = await fetchOptionData();
				if (!response.data) {
					throw new Error("No data received for this store/fixture.");
				} else {
					const jsonData = response.data;
					const store = response.store;
					// console.log("Store:", store);
					// Strip letters from the store code
					const storeNumber = parseInt(store.replace(/\D/g, ""), 10);

					// console.log("Store Number:", storeNumber);
					// if storeNumber is null or undefined, return error saying that a store must be selected
					if (!storeNumber) {
						throw new Error("A store must be selected.");
					}
					// Retrieve fixture_type and region using storeNumber

					if (jsonData?.final_stores) {
						const storeData = jsonData.final_stores[storeNumber];
						const initialFixtureType = storeData.fixture_type;
						const initialRegion = storeData.region;

						setData(jsonData);
						setSelectedFixtureType(initialFixtureType);
						setSelectedRegion(initialRegion);
					} else {
						// Handle case where storeData is not found
						console.error(
							"Store data not found for store number:",
							storeNumber,
						);
						throw new Error("Store data not found.");
					}
				}
			} catch (error) {
				console.error("Fetch Error:", error);
				setError(error.toString());
			} finally {
				setIsLoading(false);
			}
		}

		fetchData();
	}, []);

	const processAndDisplayData = () => {
		if (!data || typeof data.final_skus !== "object" || !selectedFixtureType) {
			return <p>No SKU data available.</p>;
		}

		let shelves = {}; // Object to hold shelves data
		let shelfP = []; // Array to hold shelf 'P' data

		// Iterate over each SKU object in final_skus
		Object.values(data.final_skus).forEach((sku) => {
			if (sku.positions) {
				sku.positions.forEach((position) => {
					if (
						position.fixture_type === selectedFixtureType &&
						(!selectedRegion || position.region === selectedRegion)
					) {
						if (position.shelf === "P") {
							shelfP.push({ ...position, ...sku });
						} else {
							if (!shelves[position.shelf]) {
								shelves[position.shelf] = [];
							}
							shelves[position.shelf].push({ ...position, ...sku });
						}
					}
				});
			}
		});

		return (
			<>
				<h2>
					{selectedFixtureType} - {selectedRegion}
				</h2>
				<div className="store-fixture">
					<div className="face-data-display" ref={faceDisplayRef}>
						<h3>Face</h3>
						{Object.entries(shelves).map(([shelfLabel, positions]) => (
							<StoreShelf
								positions={positions}
								shelfLabel={shelfLabel}
								data={data}
								key={shelfLabel}
							/>
						))}
						<div className="footer-btn">
							<AddButton
								onClickHandler={handleAddAllFixtureClick}
								text="Add All Face items to cart"
							/>
						</div>
					</div>
					<div className="panel-data-display" ref={panelDisplayRef}>
						<h3>Panel</h3>
						{shelfP.length > 0 && (
							<>
								<StoreShelf positions={shelfP} shelfLabel="P" data={data} />
								<div className="footer-btn">
									<AddButton
										onClickHandler={handleAddAllPanelFixtureClick}
										text="Add All Panel items to cart"
									/>
								</div>
							</>
						)}
					</div>
				</div>
			</>
		);
	};
	// Debug: Output raw data and selected values
	// console.log("Raw Data:", data);

	if (isLoading) {
		return <Loader />;
	}

	if (error) {
		return <p>{error}</p>;
	}

	if (!data) {
		return <p>No data available for your store fixture.</p>;
	}

	return <div className="store-fixture-wrapper">{processAndDisplayData()}</div>;
};

export default RootApp;
