// Desc: Root component for admin app
import Loader from "../components/Loader";
import React, { useState, useEffect, useRef } from "@wordpress/element";
import { fetchOptionData } from "../services/getOptionService";
import Item from "../components/Item";
import { gatherProductInfoAndCallAPI } from "../utilities/gatherAndCallAPI";
import AddButton from "../components/AddButton";

const RootApp = () => {
	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedFixtureType, setSelectedFixtureType] = useState(null);
	const [selectedRegion, setSelectedRegion] = useState(null);
	const shelfRef = useRef(null);
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

	const handleAddAllShelfItems = async () => {
		try {
			const shelfElement = shelfRef.current;
			if (shelfElement) {
				await gatherProductInfoAndCallAPI(shelfElement);
			} else {
				throw new Error(
					`Unable to locate items for shelf ${shelfLabel} to add to cart.`,
				);
			}
		} catch (error) {
			console.error("Error in handleAddAllShelfItems:", error);
			// Handle or show error message as required
		}
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
					console.log("Store:", store);
					// Strip letters from the store code
					const storeNumber = parseInt(store.replace(/\D/g, ""), 10);

					console.log("Store Number:", storeNumber);
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

		const sortHorizontalValues = (a, b) => {
			const order = ["LS", "M", "RS"];
			return order.indexOf(a) - order.indexOf(b);
		};

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

		// Function to render shelf data
		const renderShelf = (positions, shelfLabel) => {
			// Group by horizontal value
			let groupedByHorizontal = positions.reduce((acc, item) => {
				let horizontal = item.horizontal;
				if (!acc[horizontal]) {
					acc[horizontal] = [];
				}
				acc[horizontal].push(item);
				return acc;
			}, {});

			// Sort groups by horizontal and reverse sort items within by vertical
			let sortedGroupKeys = Object.keys(groupedByHorizontal).sort(
				(a, b) => a - b,
			);
			sortedGroupKeys.forEach((horizontal) => {
				groupedByHorizontal[horizontal].sort((a, b) => b.vertical - a.vertical); // Reverse sorting by vertical
			});
			// Adjust sorting for 'P' shelf if horizontal values are not numeric
			if (shelfLabel === "P") {
				sortedGroupKeys.sort(sortHorizontalValues);
			}

			// Step 4: Render
			return (
				<div className={`face-shelf face-shelf-${shelfLabel}`} key={shelfLabel}>
					<div className="shelf-title common-container">
						{shelfLabel === "P" ? null : (
							<>
								<h3>Shelf {shelfLabel}</h3>
								<AddButton
									onClickHandler={handleAddAllShelfItems}
									text={`Add All Shelf ${shelfLabel} items to cart`}
								/>
							</>
						)}
					</div>
					<div className={`shelf shelf-${shelfLabel}`} ref={shelfRef}>
						{sortedGroupKeys.map((horizontal) => (
							<div className="item-group" key={horizontal}>
								{groupedByHorizontal[horizontal].map((item, index) => (
									<Item
										item={item}
										key={item.product_id}
										context="store"
										type="face"
										imageUrl={`${data.ImageURL}${item.code}.jpg`}
									/>
								))}
							</div>
						))}
					</div>
				</div>
			);
		};

		return (
			<>
				<h2>
					{selectedFixtureType} - {selectedRegion}
				</h2>
				<div className="store-fixture">
					<div className="face-data-display" ref={faceDisplayRef}>
						<h3>Face</h3>
						{Object.entries(shelves).map(([shelfLabel, positions]) =>
							renderShelf(positions, shelfLabel),
						)}
						<div className="footer-btn">
							<AddButton
								onClickHandler={handleAddAllFixtureClick}
								text="Add All Shelf items to cart"
							/>
						</div>
					</div>
					<div className="panel-data-display" ref={panelDisplayRef}>
						<h3>Panel</h3>
						{shelfP.length > 0 && (
							<>
								{renderShelf(shelfP, "P")}
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
