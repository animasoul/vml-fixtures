// Desc: Root component for admin app
import React, { useEffect, useMemo, useState } from "@wordpress/element";
import Loader from "../components/Loader";
import { fetchOptionData } from "../services/getOptionService";
import UploadPdf from "./UploadPdf";
import "./style-index.css";
import { drawLineBetweenMovedItems } from "./svgHelpers";

const InstructApp = () => {
	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedFixtureType, setSelectedFixtureType] = useState(null);
	const [selectedRegion, setSelectedRegion] = useState(null);
	const [brandImage, setBrandImage] = useState(null);

	const [hasAllALL, setHasAllALL] = useState(false);
	const [hasAllUSCA, setHasAllUSCA] = useState(false);

	useEffect(() => {
		if (!data || !selectedFixtureType) {
			setHasAllALL(false);
			setHasAllUSCA(false);
			return;
		}

		let allALL = true;
		let allUSCA = true;

		Object.values(data.final_skus).forEach((sku) => {
			if (
				sku.positions.some(
					(position) => position.fixture_type === selectedFixtureType,
				)
			) {
				const containsALL = sku.code.includes("-ALL-");
				const containsUSCA = sku.code.includes("-USCA-");

				if (!containsALL) allALL = false;
				if (!containsUSCA) allUSCA = false;
			}
		});

		setHasAllALL(allALL);
		setHasAllUSCA(allUSCA);
	}, [data, selectedFixtureType]);

	// to scale images
	const [scaleChange, setScaleChange] = useState(0); // Tracks cumulative scale change

	const increaseSize = () => {
		setScaleChange((prevScaleChange) => prevScaleChange + 0.1);
	};

	const decreaseSize = () => {
		setScaleChange((prevScaleChange) => prevScaleChange - 0.1);
	};
	const scale = 1 + scaleChange;
	const scalePercentage = Math.round((scaleChange + 1) * 100);

	// States for individual input fields
	const [fixtureType, setFixtureType] = useState("");
	const [region, setRegion] = useState("");
	const [updateSeason, setUpdateSeason] = useState("");
	const [executionWeek, setExecutionWeek] = useState("");
	const [branding, setBranding] = useState("");

	// Update dynamic fields based on user selection
	useEffect(() => {
		if (selectedFixtureType) setFixtureType(selectedFixtureType);
		if (selectedRegion) setRegion(selectedRegion);
	}, [selectedFixtureType, selectedRegion]);

	// Handlers for each input field (example for updateSeason)
	const handleUpdateSeasonChange = (event) => {
		setUpdateSeason(event.target.value);
	};

	const handlePrint = () => {
		window.print();
	};

	useEffect(() => {
		async function fetchData() {
			try {
				const response = await fetchOptionData();
				if (!response?.data) {
					console.log("Please select a Promotion.");
				} else {
					setBrandImage(response.logo);
					const jsonData = response.data;
					setData(jsonData);

					const fixtureTypes = getUniqueValues(jsonData, "fixture_type");
					const regions = getUniqueValues(jsonData, "region");

					const initialFixtureType = fixtureTypes[fixtureTypes.length - 1];
					const initialRegion = regions[regions.length - 1];

					setSelectedFixtureType(initialFixtureType);
					setSelectedRegion(initialRegion);
					setUpdateSeason(jsonData.PromoName);
					setExecutionWeek("Execution Dates: " + jsonData.UpDate);
					setBranding("Single Branded");
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

	const calculateFixtureTotals = (data, selectedFixtureType) => {
		// Convert object values to an array for filtering and aggregation
		const storesArray = Object.values(data.final_stores);

		// Filter stores by the selected fixture type
		const filteredStores = storesArray.filter(
			(store) => store.fixture_type === selectedFixtureType,
		);

		// Aggregate counts by region
		const totalsByRegion = filteredStores.reduce((acc, store) => {
			const { region } = store;

			// Increment the region count
			acc[region] = (acc[region] || 0) + 1; // Increment by 1 for each store

			return acc;
		}, {});

		// Calculate the total number of stores across all regions
		const totalAcrossRegions = Object.values(totalsByRegion).reduce(
			(sum, count) => sum + count,
			0,
		);

		return { totalsByRegion, totalAcrossRegions };
	};

	const [totals, setTotals] = useState({
		totalsByRegion: {},
		totalAcrossRegions: 0,
	});

	useEffect(() => {
		if (data && selectedFixtureType) {
			const newTotals = calculateFixtureTotals(data, selectedFixtureType);
			setTotals(newTotals);
		}
	}, [data, selectedFixtureType]); // Recalculate when data or selectedFixtureType changes

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

	const itemCodes = [];
	useEffect(() => {
		// Draw lines between moved items
		itemCodes.forEach(drawLineBetweenMovedItems);

		// Setup resize event listener if necessary
		const handleResize = () => {
			itemCodes.forEach(drawLineBetweenMovedItems);
		};
		window.addEventListener("resize", handleResize);

		// Setup interval to redraw lines every second
		const intervalId = setInterval(() => {
			itemCodes.forEach(drawLineBetweenMovedItems);
		}, 1000);

		// Cleanup
		return () => {
			window.removeEventListener("resize", handleResize);
			clearInterval(intervalId);
		};
	}, [itemCodes, selectedFixtureType, selectedRegion, scaleChange]);

	const processAndDisplayData = () => {
		let shelves = {}; // Object to hold shelves data for non-deleted items
		let shelvesForDeletion = {}; // Object to hold shelves data for deleted items
		let shelvesForMoving = {}; // Object to hold shelves data for moving items
		let shelvesForAdding = {}; // Object to hold shelves data for adding items
		let shelfP = []; // Array to hold shelf 'P' data for non-deleted items
		let shelfPForDeletion = []; // Array to hold shelf 'P' data for deleted items
		let shelfPForMoving = []; // Array to hold shelf 'P' data for moving items
		let shelfPForAdding = []; // Array to hold shelf 'P' data for adding items

		const sortHorizontalValues = (a, b) => {
			const order = ["LS", "M", "RS"];
			return order.indexOf(a) - order.indexOf(b);
		};

		let HighestShelfNumber = 0;
		let updatesExist = false;

		// Single pass to check for updates, determine highestShelfNumber, and process items
		Object.values(data.final_skus).forEach((sku) => {
			if (sku.positions) {
				sku.positions.forEach((position) => {
					if (
						position.fixture_type === selectedFixtureType &&
						(!selectedRegion || position.region === selectedRegion)
					) {
						const shelfNumber = parseInt(position.shelf, 10);
						if (!isNaN(shelfNumber) && position.shelf !== "P") {
							HighestShelfNumber = Math.max(HighestShelfNumber, shelfNumber);
						}
						if (["new", "move", "delete"].includes(position.update)) {
							updatesExist = true;
						}

						// Create an item object combining position and sku data
						let item = { ...position, ...sku };

						// Process "move" update items
						if (position.update === "move" && position.moved_from) {
							// Parse the moved_from property
							const [fromBay, fromShelf, fromHorizontal, fromVertical] =
								position.moved_from.split("|").map(String);

							// Create a copy of the item with moved_from values
							let movedItem = {
								...item,
								bay: fromBay,
								shelf: fromShelf,
								horizontal: fromHorizontal,
								vertical: fromVertical,
								moved_item: true,
								moved_to: `${position.bay}|${position.shelf}|${position.horizontal}|${position.vertical}`,
							};

							if (position.shelf === "P") {
								shelfPForMoving.push(movedItem);
							} else {
								shelvesForMoving[fromShelf] = shelvesForMoving[fromShelf] || [];
								shelvesForMoving[fromShelf].push(movedItem);
							}
						}

						// Handle deletion separately to prevent adding to default shelves
						if (position.update === "delete") {
							if (position.shelf === "P") {
								shelfPForDeletion.push(item);
							} else {
								if (!shelvesForDeletion[position.shelf])
									shelvesForDeletion[position.shelf] = [];

								shelvesForDeletion[position.shelf].push(item);
							}
							return;
						}

						// Handle added and moved items by adding them to their specific and default shelves
						if (position.update === "new" || position.update === "move") {
							let specificShelves =
								position.update === "new" ? shelvesForAdding : shelvesForMoving;
							let specificShelfP =
								position.update === "new" ? shelfPForAdding : shelfPForMoving;

							if (position.shelf === "P") {
								specificShelfP.push(item);
							} else {
								if (!specificShelves[position.shelf])
									specificShelves[position.shelf] = [];

								specificShelves[position.shelf].push(item);
							}
							if (position.update === "move") {
								itemCodes.push(item.code);
							}
						}

						// Add all non-deleted items to default shelves
						if (position.shelf === "P") {
							shelfP.push(item);
						} else {
							if (!shelves[position.shelf]) shelves[position.shelf] = [];
							shelves[position.shelf].push(item);
						}
					}
				});
			}
		});

		// Initialize arrays only if updates exist
		if (updatesExist) {
			for (let i = 1; i <= HighestShelfNumber; i++) {
				let shelfKey = i.toString();
				shelvesForAdding[shelfKey] = shelvesForAdding[shelfKey] || [];
				shelvesForMoving[shelfKey] = shelvesForMoving[shelfKey] || [];
				shelvesForDeletion[shelfKey] = shelvesForDeletion[shelfKey] || [];
			}
		}
		// const ItemBayShelf = ({ item }) => {
		// 	const [fromBay, fromShelf] = item.moved_from.split("|");
		// 	const [toBay, toShelf] = item.moved_to.split("|");

		// 	return (
		// 		<>
		// 			Move from Bay {fromBay}/Shelf {fromShelf}
		// 			<br />
		// 			to Bay {toBay}/Shelf {toShelf}
		// 		</>
		// 	);
		// };
		// Function to render shelf data
		const renderShelf = (positions, shelfLabel, id = "") => {
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
						{shelfLabel === "P" ? null : <>BAY 1/SHELF {shelfLabel}</>}
					</div>
					<div className={`shelf shelf-${shelfLabel}`}>
						{sortedGroupKeys.map((horizontal) => (
							<div className="item-group" key={horizontal}>
								{groupedByHorizontal[horizontal].map((item, index) => (
									<div
										className={`item position-${item.horizontal}-${item.vertical}`}
										key={index}
									>
										{item.moved_item ? (
											<div
												className={`moved-item`}
												style={{
													width: `${item.width * 7 * scale}px`,
													height: `${item.height * 7 * scale}px`,
												}}
												id={`${item.code}-movedFrom`}
											>
												{/* <ItemBayShelf item={item} /> */}
											</div>
										) : (
											<img
												src={`${item.ImageURL || data.ImageURL}${
													item.code
												}.jpg`}
												alt={`SKU ${item.code}`}
												width={item.width * 7 * scale}
												height={item.height * 7 * scale}
												{...(id === "moved" && { id: `${item.code}-movedTo` })}
												className={item.update}
											/>
										)}
										{id === "moved" && item.moved_item && (
											<>
												<svg
													id={`${item.code}-svg-container`}
													style={{
														position: "absolute",
														top: "0",
														left: "0",
														width: "100%",
														height: "100%",
														zIndex: "1000",
													}}
												></svg>
											</>
										)}
									</div>
								))}
							</div>
						))}
					</div>
				</div>
			);
		};

		// Function to generate the layout, duplicated and adjusted for items marked for deletion
		const generateLayout = (
			shelves,
			shelfP,
			titleSuffix = "",
			id = "default",
		) => (
			<>
				<h2 className="noprint">
					{selectedFixtureType} - {selectedRegion}
				</h2>
				<div className="admin-fixture" id={id}>
					<div
						className={`face-data-display ${titleSuffix ? "page-break" : ""}`}
					>
						<div className="print-header">
							<img
								src="https://online.vmlogistics.com/wp-content/uploads/2024/02/Sephora_Logo.png"
								alt="Sephora Logo"
								className="left-image"
							/>
							<p className="header-text">
								{fixtureType} {region}
								<br />
								{updateSeason}
								<br />
								{executionWeek}
								<br />
								{branding}
							</p>
							<img src={brandImage} alt="Brand Logo" className="right-image" />
						</div>
						<h3>Graphic Layout: {titleSuffix}</h3>
						{Object.entries(shelves).map(([shelfLabel, positions]) =>
							renderShelf(positions, shelfLabel, id),
						)}
						<div className="footer-instructions-wrapper">
							<div className="footer-instructions">
								<p>
									<span className="new">GREEN</span> = NEW Graphics
								</p>{" "}
								<p>
									<span className="move">YELLOW</span>= MOVING Graphics
								</p>
								<p>
									<span className="delete">RED</span>= REMOVED Graphics
								</p>
							</div>
							<p className="text">
								This graphic layout shows all of the graphics on your gondola by
								location AFTER the update is complete.
							</p>
							<hr />
							<p className="clean">
								<strong>
									To clean: Use a dry cloth only - No alcohol based products
								</strong>
							</p>
						</div>
					</div>
					{shelfP.length > 0 && (
						<div className="panel-data-display">
							<div className="print-header">
								<img
									src="https://online.vmlogistics.com/wp-content/uploads/2024/02/Sephora_Logo.png"
									alt="Sephora Logo"
									className="left-image"
								/>
								<p className="header-text">
									{fixtureType} {region}
									<br />
									{updateSeason}
									<br />
									{executionWeek}
									<br />
									{branding}
								</p>
								<img
									src={brandImage}
									alt="Brand Logo"
									className="right-image"
								/>
							</div>
							<h3>Backpanel: {titleSuffix}</h3>
							{renderShelf(shelfP, "P")}
							{/* <div className="footer-instructions-wrapper">
								<div className="footer-instructions">
									<p>
										<span className="new">GREEN</span> = NEW Graphics
									</p>{" "}
									<p>
										<span className="move">YELLOW</span>= MOVING Graphics
									</p>
									<p>
										<span className="delete">RED</span>= REMOVED Graphics
									</p>
								</div>
								<p className="text">
									This graphic layout shows all of the graphics on your gondola
									by location AFTER the update is complete.
								</p>
								<hr />
								<p className="clean">
									<strong>
										To clean: Use a dry cloth only - No alcohol based products
									</strong>
								</p>
							</div> */}
						</div>
					)}
				</div>
			</>
		);

		// Render both layouts: one for non-deleted items, and one for deleted items
		return (
			<>
				{generateLayout(shelves, shelfP)}
				{(Object.keys(shelvesForAdding).length > 0 ||
					shelfPForAdding.length > 0) &&
					generateLayout(
						shelvesForAdding,
						shelfPForAdding,
						"(Added Items)",
						"added",
					)}
				{(Object.keys(shelvesForMoving).length > 0 ||
					shelfPForMoving?.length > 0) &&
					generateLayout(
						shelvesForMoving,
						shelfPForMoving,
						"(Moved Items)",
						"moved",
					)}
				{(Object.keys(shelvesForDeletion).length > 0 ||
					shelfPForDeletion.length > 0) &&
					generateLayout(
						shelvesForDeletion,
						shelfPForDeletion,
						"(Removed Items)",
						"deleted",
					)}
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
		return <p>Please select a Promotion</p>;
	}

	return (
		<div className="fixture-select">
			<div className="noprint">
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
					</>
				)}
				<div className="printButton">
					<button
						className="noprint ui-checkboxradio-label ui-corner-all ui-button ui-widget ui-checkboxradio-radio-label"
						onClick={handlePrint}
					>
						Instruction sheet to PDF
					</button>

					<ul>
						{Object.entries(totals.totalsByRegion).map(([region, count]) => (
							<li key={region}>
								{region}: {count} Stores
							</li>
						))}
					</ul>
					<p>Total across all regions: {totals.totalAcrossRegions} Stores</p>
				</div>
				<div className="noprint textInput">
					<p>Enter the header of the PDF information</p>
					{hasAllUSCA && (
						<div className="inputFields">
							<label htmlFor="same">This fixture has same US CA regions</label>
							<button
								className="ui-button ui-widget ui-corner-all ui-button-text-only"
								id="same"
								onClick={() => {
									setRegion("US - CA");
								}}
							>
								Combine?
							</button>
						</div>
					)}
					{hasAllALL && (
						<div className="inputFields">
							<label htmlFor="same">This fixture has same ALL regions</label>
							<button
								className="ui-button ui-widget ui-corner-all ui-button-text-only"
								id="same"
								onClick={() => {
									setRegion("US - CA - QC");
								}}
							>
								Combine?
							</button>
						</div>
					)}
					<div className="inputFields">
						<label htmlFor="fixtureInput">Fixture:</label>
						<input
							type="text"
							value={fixtureType}
							onChange={(e) => setFixtureType(e.target.value)}
							placeholder="Fixture Type"
							className="fixtureType"
							id="fixtureInput"
						/>
					</div>
					<div className="inputFields">
						<label htmlFor="regionInput">Region:</label>
						<input
							type="text"
							value={region}
							onChange={(e) => setRegion(e.target.value)}
							placeholder="Region"
							id="regionInput"
						/>
					</div>
					<div className="inputFields">
						<label htmlFor="seasonInput">Updates:</label>
						<input
							type="text"
							value={updateSeason}
							onChange={handleUpdateSeasonChange}
							placeholder="Update Season"
							id="seasonInput"
						/>
					</div>
					<div className="inputFields">
						<label htmlFor="weekInput">Execution Dates:</label>
						<input
							type="text"
							value={executionWeek}
							onChange={(e) => setExecutionWeek(e.target.value)}
							placeholder="Execution Dates"
							id="weekInput"
						/>
					</div>
					<div className="inputFields">
						<label htmlFor="brandingInput">Type:</label>
						<input
							type="text"
							value={branding}
							onChange={(e) => setBranding(e.target.value)}
							placeholder="Branding"
							id="brandingInput"
						/>
					</div>
				</div>
			</div>
			<UploadPdf />
			<div className="noprint scale">
				<div className="scale-wrapper">
					<p>
						Enlarge/reduce image sizes
						<br /> to fit printer output
						<br />
						{scalePercentage}%
					</p>
					<button
						className="noprint ui-checkboxradio-label ui-corner-all ui-button ui-widget ui-checkboxradio-radio-label"
						onClick={decreaseSize}
					>
						-
					</button>
					<button
						className="noprint ui-checkboxradio-label ui-corner-all ui-button ui-widget ui-checkboxradio-radio-label"
						onClick={increaseSize}
					>
						+
					</button>
				</div>
			</div>
			{processAndDisplayData()}
		</div>
	);
};

export default InstructApp;
