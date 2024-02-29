// Desc: Root component for store app
import Loader from "../components/Loader";
import React, {
	useState,
	useEffect,
	useRef,
	useMemo,
} from "@wordpress/element";
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

	const [showButton, setShowButton] = useState(true);
	const [message, setMessage] = useState("");
	const [isError, setIsError] = useState(false);

	const [isDivVisible, setIsDivVisible] = useState(false);

	const toggleDiv = () => {
		setIsDivVisible(!isDivVisible);
	};

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
					const store = response.store;
					setSelectedStore(store);
					const brand = response.brand;
					// console.log("Store:", store);
					// console.log("Brand:", brand);
					// Strip letters from the store code
					const storeNumber = parseInt(store.replace(/\D/g, ""), 10);

					// console.log("Store Number:", storeNumber);
					// if storeNumber is null or undefined, return error saying that a store must be selected
					if (!storeNumber) {
						throw new Error("Please select a store.");
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

	// Function to get unique values for fixture_type or region
	const getUniqueValues = (jsonData, key) => {
		const values = new Set();
		if (jsonData?.final_skus) {
			Object.values(jsonData.final_skus).forEach((sku) => {
				sku.positions.forEach((pos) => values.add(pos[key]));
			});
		}
		return Array.from(values).sort();
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
	console.log("Raw Data:", data);

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
			<button
				style={{ position: "absolute", top: "-10px", right: "0" }}
				onClick={toggleDiv}
				className={`ui-checkboxradio-label ui-corner-all ui-button ui-widget ui-checkboxradio-radio-label ${
					isDivVisible ? " ui-checkboxradio-checked ui-state-active" : ""
				}`}
			>
				{isDivVisible ? "↑" : "↓"} Change Fixture/Region
			</button>
			<div className={`store-fixture-wrapper`}>
				{isDivVisible && (
					<div className="fixture-select">
						<strong>Select Fixture</strong>
						<ul className="buttons-row">
							{[...uniqueFixtureTypes].reverse().map((type) => (
								<li key={type}>
									<button
										onClick={() => setSelectedFixtureType(type)}
										className={`ui-checkboxradio-label ui-corner-all ui-button ui-widget ui-checkboxradio-radio-label${
											selectedFixtureType === type
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
												className={`ui-checkboxradio-label ui-corner-all ui-button ui-widget ui-checkboxradio-radio-label ${
													selectedRegion === region
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
