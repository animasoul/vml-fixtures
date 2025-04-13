// Desc: Root component for store app
import Loader from "../components/Loader";
const React = window.React || require('react');
const { useState, useEffect, useRef, useMemo } = window.React || require('react');
import { fetchOptionData } from "../services/getOptionService";
import { gatherProductInfoAndCallAPI } from "../utilities/gatherAndCallAPI";
import AddButton from "../components/AddButton";
import StoreShelf from "./StoreShelf";

const StoreApp = () => {
	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedFixtureType, setSelectedFixtureType] = useState(null);
	const [selectedRegion, setSelectedRegion] = useState(null);
	const [selectedStore, setSelectedStore] = useState(null);
	const [userRoles, setUserRoles] = useState([]);

	const [showButton, setShowButton] = useState(true);
	const [message, setMessage] = useState("");
	const [isError, setIsError] = useState(false);

	const [isDivVisible, setIsDivVisible] = useState(false);

	// Function to check if user has permission to change fixture/region
	const canChangeFixtureRegion = () => {
		// Check if user has the customer role
		const isCustomer = userRoles.includes('customer');

		// Show to everyone except customers
		return !isCustomer;
	};

	const toggleDiv = () => {
		setIsDivVisible(!isDivVisible);
	};

	// Create a ref for the face data display div
	const faceDisplayRef = useRef(null);
	// Create refs for the panel data display divs
	const sidePanelsDisplayRef = useRef(null);
	const backPanelsDisplayRef = useRef(null);

	/**
	 * Handle the addition of all fixtures to cart
	 */
	const handleAddAllSidePanelFixtureClick = async () => {
		// Use the ref to get the sidePanelsDisplayElement
		const sidePanelsDisplayElement = sidePanelsDisplayRef.current;

		if (sidePanelsDisplayElement) {
			return gatherProductInfoAndCallAPI(sidePanelsDisplayElement);
		}
		throw new Error("Unable to locate side panel data for addition to cart.");
	};

	/**
	 * Handle the addition of all fixtures to cart
	 */
	const handleAddAllBackPanelFixtureClick = async () => {
		// Use the ref to get the backPanelsDisplayElement
		const backPanelsDisplayElement = backPanelsDisplayRef.current;

		if (backPanelsDisplayElement) {
			return gatherProductInfoAndCallAPI(backPanelsDisplayElement);
		}
		throw new Error("Unable to locate back panel data for addition to cart.");
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

	/**
	 * Handle click to make permanent for fixture type and region selection
	 */

	const handleMakePermanentClick = async () => {
		// gather all the required data for example..

		const makePermanent = {
			action: "vizmerch_cosmetic_switch_fixture",
			brand: data.Customer,
			promo: data.PromoCode,
			store: selectedStore,
			fixture: selectedFixtureType,
			region: selectedRegion,
		};

		const formData = new URLSearchParams(makePermanent).toString();
		const API_ENDPOINT = "/wp-admin/admin-ajax.php?";

		try {
			const response = await fetch(API_ENDPOINT, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: formData,
			});
			const result = await response.json();
			if (result.error) {
				throw new Error(result.error);
			}
			// Success
			if (result.success) {
				setShowButton(false);
				setMessage(
					"Request successful, New fixture/Region assigned to this store.",
				);
				setIsError(false);
			} else {
				setShowButton(true);
				setMessage(
					"Something went wrong and cannot make permanent, please try again.",
				);
				setIsError(true);
			}
		} catch (error) {
			// Error
			setMessage(error.message);
			setIsError(true);
			setShowButton(true); // Show the button again for retry
		}
	};

	useEffect(() => {
		async function fetchData() {
			try {
				const noPromo = true;
				const response = await fetchOptionData(noPromo);
				if (!response.data) {
					throw new Error("No data received for this store/fixture.");
				} else {
					const jsonData = response.data;
					setData(jsonData);

					// Set user roles from the API response
					if (response.userRoles) {
						setUserRoles(response.userRoles);
					}

					const store = response.store;
					setSelectedStore(store);
					const brand = response.brand;

					// Strip letters from the store code
					const storeNumber = parseInt(store.replace(/\D/g, ""), 10);


					if (jsonData?.final_stores) {
						// Check if storeNumber exists and is valid
						if (storeNumber && jsonData.final_stores[storeNumber]) {
							const storeData = jsonData.final_stores[storeNumber];
							const initialFixtureType = storeData.fixture_type;
							const initialRegion = storeData.region;

							setSelectedFixtureType(initialFixtureType);
							setSelectedRegion(initialRegion);
						} else {
							// If storeNumber is missing or invalid but we have fixture data,
							// use the first available fixture type and region from the SKUs
							console.warn("Store number missing or invalid, using default fixture data");

							// Get first available fixture type and region from SKUs
							if (jsonData?.final_skus) {
								let foundFixture = false;
								Object.values(jsonData.final_skus).some((sku) => {
									if (sku.positions && sku.positions.length > 0) {
										// Get the first fixture type and region from the SKUs
										const firstPosition = sku.positions[0];
										setSelectedFixtureType(firstPosition.fixture_type);
										setSelectedRegion(firstPosition.region);
										foundFixture = true;
										return true;
									}
									return false;
								});

								if (!foundFixture) {
									throw new Error("No fixture data found in SKUs.");
								}
							} else {
								throw new Error("No fixture data available.");
							}
						}
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

	// Function to get unique values for fixture_type or region
	const getUniqueValues = (jsonData, key) => {
		const values = new Set();
		if (jsonData?.final_skus) {
			Object.values(jsonData.final_skus).forEach((sku) => {
				sku.positions.forEach((pos) => values.add(pos[key]));
			});
		}
		// Return the values in the order they were added, without sorting
		return Array.from(values);
	};

	const getRegionsForSelectedFixture = () => {
		const regions = new Set();
		if (data?.final_skus) {
			Object.values(data.final_skus).forEach((sku) => {
				sku.positions.forEach((pos) => {
					if (pos.fixture_type === selectedFixtureType) {
						regions.add(pos.region);
					}
				});
			});
		}
		return Array.from(regions).sort();
	};

	const uniqueFixtureTypes = useMemo(
		() => getUniqueValues(data, "fixture_type"),
		[data],
	);
	const uniqueRegions = useMemo(
		() => getRegionsForSelectedFixture(),
		[data, selectedFixtureType],
	);

	// Set default fixture type if none is selected
	useEffect(() => {
		// Only set the default fixture type if we have fixture types and no fixture type is selected
		// AND we're not in the initial loading state
		if (uniqueFixtureTypes.length > 0 && !selectedFixtureType && !isLoading) {
			// Create a reversed copy of the array and select the first one
			const reversedTypes = [...uniqueFixtureTypes].reverse();
			setSelectedFixtureType(reversedTypes[0]);
		}
	}, [uniqueFixtureTypes, selectedFixtureType, isLoading]);

	// Force select the first fixture type after the component has fully loaded
	useEffect(() => {
		// Only run this effect once after the component has fully loaded
		if (!isLoading && uniqueFixtureTypes.length > 0) {
			// Create a reversed copy of the array and select the first one
			const reversedTypes = [...uniqueFixtureTypes].reverse();
			setSelectedFixtureType(reversedTypes[0]);
		}
	}, [isLoading, uniqueFixtureTypes]);

	const processAndDisplayData = () => {
		if (!data || typeof data.final_skus !== "object" || !selectedFixtureType) {
			return <p>No SKU data available.</p>;
		}

		// Organize data by bays
		let bays = {};

		// Iterate over each SKU object in final_skus
		Object.values(data.final_skus).forEach((sku) => {
			if (sku.positions) {
				sku.positions.forEach((position) => {
					// Skip the position if it's marked for deletion
					if (position.update === "delete") {
						return;
					}

					if (
						position.fixture_type === selectedFixtureType &&
						(!selectedRegion || position.region === selectedRegion)
					) {
						// Get bay number, default to 1 if not specified
						const bayNumber = position.bay || 1;

						// Initialize bay if it doesn't exist
						if (!bays[bayNumber]) {
							bays[bayNumber] = {
								shelves: {},
								sidePanels: [],
								backPanels: []
							};
						}

						// Add to appropriate shelf
						if (position.shelf === "P") {
							// Separate panels into side panels (LS, RS, CS) and back panels (M)
							if (position.horizontal === "LS" || position.horizontal === "RS" || position.horizontal === "CS") {
								bays[bayNumber].sidePanels.push({ ...position, ...sku });
							} else if (position.horizontal === "M") {
								bays[bayNumber].backPanels.push({ ...position, ...sku });
							} else {
								// For any other panel positions, add to back panels
								bays[bayNumber].backPanels.push({ ...position, ...sku });
							}
						} else {
							if (!bays[bayNumber].shelves[position.shelf]) {
								bays[bayNumber].shelves[position.shelf] = [];
							}
							bays[bayNumber].shelves[position.shelf].push({ ...position, ...sku });
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

				{Object.entries(bays).sort(([a], [b]) => a - b).map(([bayNumber, bayData]) => (
					<div key={bayNumber} className="bay-container" id={`bay-${bayNumber}`}>
						{Object.keys(bays).length > 1 && (
							<h2>Bay {bayNumber}</h2>
						)}
						<div className="store-fixture three-column-layout">
							<div className="face-data-display" ref={faceDisplayRef}>
								<h3>Face</h3>
								{Object.entries(bayData.shelves).map(([shelfLabel, positions]) => (
									<StoreShelf
										positions={positions}
										shelfLabel={shelfLabel}
										data={data}
										key={shelfLabel}
										bayNumber={bayNumber}
									/>
								))}
								<div className="footer-btn">
									<AddButton
										onClickHandler={handleAddAllFixtureClick}
										text="Add All Face items to cart"
									/>
								</div>
							</div>
							<div className="side-panels-display" ref={sidePanelsDisplayRef}>
								<h3>Side Panels</h3>
								{bayData.sidePanels.length > 0 && (
									<>
										<StoreShelf
											positions={bayData.sidePanels}
											shelfLabel="P"
											data={data}
											bayNumber={bayNumber}
											panelType="side"
										/>
										<div className="footer-btn">
											<AddButton
												onClickHandler={handleAddAllSidePanelFixtureClick}
												text="Add All Side Panel items to cart"
											/>
										</div>
									</>
								)}
							</div>
							<div className="back-panels-display" ref={backPanelsDisplayRef}>
								<h3>Back Panels</h3>
								{bayData.backPanels.length > 0 && (
									<>
										<StoreShelf
											positions={bayData.backPanels}
											shelfLabel="P"
											data={data}
											bayNumber={bayNumber}
											panelType="back"
										/>
										<div className="footer-btn">
											<AddButton
												onClickHandler={handleAddAllBackPanelFixtureClick}
												text="Add All Back Panel items to cart"
											/>
										</div>
									</>
								)}
							</div>
						</div>
					</div>
				))}
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

	return (
		<div style={{ position: "relative" }}>
			{/* Only render the button if user has permission */}
			{canChangeFixtureRegion() && (
				<button
					style={{ position: "absolute", top: "-10px", right: "0" }}
					onClick={toggleDiv}
					className={`ui-checkboxradio-label ui-corner-all ui-button ui-widget ui-checkboxradio-radio-label ${isDivVisible ? " ui-checkboxradio-checked ui-state-active" : ""}`}
				>
					{isDivVisible ? "↑" : "↓"} Change Fixture/Region
				</button>
			)}
			<div className={`store-fixture-wrapper`}>
				{/* Only show the fixture selection UI if the user has permission */}
				{isDivVisible && canChangeFixtureRegion() && (
					<div className="fixture-select">
						<strong>Select Fixture</strong>
						<ul className="buttons-row">
							{[...uniqueFixtureTypes].reverse().map((type) => (
								<li key={type}>
									<button
										onClick={() => setSelectedFixtureType(type)}
										className={`ui-checkboxradio-label ui-corner-all ui-button ui-widget ui-checkboxradio-radio-label${selectedFixtureType === type
											? " ui-checkboxradio-checked ui-state-active"
											: ""
											}`}
									>
										{type}
									</button>
								</li>
							))}
						</ul>
						{selectedFixtureType && (
							<>
								<strong>Select Region</strong>
								<ul className="buttons-row">
									{[...uniqueRegions].reverse().map((region) => (
										<li key={region}>
											<button
												onClick={() => setSelectedRegion(region)}
												className={`ui-checkboxradio-label ui-corner-all ui-button ui-widget ui-checkboxradio-radio-label ${selectedRegion === region
													? " ui-checkboxradio-checked ui-state-active"
													: ""
													}`}
											>
												{region}
											</button>
										</li>
									))}
								</ul>
								<div className="new-selection">
									<h4>Do you want to make the new selection permanent?</h4>
									{showButton && (
										<button
											style={{ margin: "0.5em" }}
											className="ui-checkboxradio-label ui-corner-all ui-button ui-widget ui-checkboxradio-radio-label"
											onClick={handleMakePermanentClick}
										>
											Make Permanent
										</button>
									)}
									{message && (
										<div style={{ color: isError ? "red" : "green" }}>
											{message}
										</div>
									)}
								</div>
							</>
						)}
					</div>
				)}
				{processAndDisplayData()}
			</div>
		</div>
	);
};

export default StoreApp;
