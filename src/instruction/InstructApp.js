// Desc: Root component for admin app
import React, { useEffect, useMemo, useState } from "@wordpress/element";
import Loader from "../components/Loader";
import { fetchOptionData } from "../services/getOptionService";
import UploadPdf from "./UploadPdf";
import "./style-index.css";
import { drawLineBetweenMovedItems } from "./svgHelpers";
import {
	organizeAllBayTypes,
	sortHorizontalValues
} from '../utilities/shelfUtils';
import { matchesFixtureType, getRegionsForSelectedFixture } from '../utilities/fixtureUtils';

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

				if (!response.data) {
					throw new Error("No data: Please select a Promotion.");
				} else {
					const jsonData = response.data;

					if (response.logo) {
						setBrandImage(response.logo);
					}

					console.log("InstructApp - Fetched data:", {
						hasData: !!jsonData,
						hasFinalSkus: !!jsonData?.final_skus,
						skuCount: jsonData?.final_skus ? Object.keys(jsonData.final_skus).length : 0
					});

					setData(jsonData);

					// Check how fixture type and region are being set
					const fixtureTypes = getUniqueValues(jsonData, "fixture_type");
					console.log("InstructApp - Available fixture types:", fixtureTypes);

					if (fixtureTypes.length > 0) {
						const initialFixtureType = fixtureTypes[fixtureTypes.length - 1];
						console.log("InstructApp - Setting initial fixture type:", initialFixtureType);
						setSelectedFixtureType(initialFixtureType);

						// Get regions for this fixture type
						const regions = new Set();
						if (jsonData?.final_skus) {
							console.log("InstructApp - Analyzing regions for fixture type:", initialFixtureType);

							// Track US regions specifically
							let usRegionPositions = [];
							// Define regionCounts variable
							const regionCounts = {};

							Object.values(jsonData.final_skus).forEach((sku) => {
								if (sku.positions) {
									sku.positions.forEach((pos) => {
										// Specifically track positions with US region
										if (pos.region === "US" || (Array.isArray(pos.region) && pos.region.includes("US"))) {
											usRegionPositions.push({
												sku: sku.code,
												fixture_type: pos.fixture_type,
												region: pos.region,
												update: pos.update,
												matches_selected_fixture: pos.fixture_type === initialFixtureType
											});
										}

										// Count regions
										if (pos.region) {
											const regionKey = Array.isArray(pos.region) ? JSON.stringify(pos.region) : pos.region;
											regionCounts[regionKey] = (regionCounts[regionKey] || 0) + 1;
										}

										// Use the same flexible fixture type matching here
										const baseFixtureType = pos.fixture_type.split('(')[0];
										const baseSelectedFixtureType = initialFixtureType.split('(')[0];
										const fixtureMatches = baseFixtureType === baseSelectedFixtureType;

										if (fixtureMatches) {
											if (Array.isArray(pos.region)) {
												console.log(`InstructApp - Adding array regions for SKU ${sku.code}:`, pos.region);
												pos.region.forEach(r => regions.add(r));
											} else {
												// console.log(`InstructApp - Adding region for SKU ${sku.code}:`, pos.region);
												regions.add(pos.region);
											}
										}
									});
								}
							});

							// console.log("InstructApp - Positions with US region:", usRegionPositions);
							console.log("InstructApp - Selected fixture type:", initialFixtureType);
							// console.log("InstructApp - Region counts:", regionCounts);
						}

						const regionArray = Array.from(regions).sort();
						console.log("InstructApp - Available regions for fixture type:", regionArray);

						if (regionArray.length > 0) {
							console.log("InstructApp - Setting initial region:", regionArray[regionArray.length - 1]);
							// console.log("InstructApp - All available regions (sorted):", regionArray);
							setSelectedRegion(regionArray[regionArray.length - 1]);
						} else {
							console.warn("InstructApp - No regions found for fixture type:", initialFixtureType);
						}
					} else {
						console.warn("InstructApp - No fixture types found in data");
					}
				}
			} catch (error) {
				console.error("InstructApp - Fetch Error:", error);
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

		// Filter stores by the selected fixture type using flexible matching
		const filteredStores = storesArray.filter((store) => {
			// Use the same flexible fixture type matching here
			const baseFixtureType = store.fixture_type.split('(')[0];
			const baseSelectedFixtureType = selectedFixtureType.split('(')[0];
			return baseFixtureType === baseSelectedFixtureType;
		});

		console.log("Filtered stores for fixture type:", selectedFixtureType, filteredStores);

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
			0
		);

		console.log("Store totals by region:", totalsByRegion, "Total:", totalAcrossRegions);

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

	const uniqueFixtureTypes = useMemo(
		() => getUniqueValues(data, "fixture_type"),
		[data],
	);
	const uniqueRegions = useMemo(
		() => selectedFixtureType ? getRegionsForSelectedFixture(data, selectedFixtureType) : [],
		[data, selectedFixtureType]
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
		if (!data || typeof data.final_skus !== "object" || !selectedFixtureType) {
			console.log("InstructApp - Early return condition met:", {
				dataExists: !!data,
				finalSkusIsObject: data ? typeof data.final_skus === "object" : false,
				selectedFixtureTypeExists: !!selectedFixtureType
			});
			return <p>No SKU data available.</p>;
		}

		// Create a map to store the best position for each unique location
		const bestPositionsMap = new Map();

		// First pass: Find the best position for each unique location
		Object.values(data.final_skus).forEach((sku) => {
			if (!sku.positions || !Array.isArray(sku.positions)) {
				return;
			}

			sku.positions.forEach((position) => {
				// Skip deleted positions
				if (position.update === "delete") {
					return;
				}

				// Check if this position matches the fixture type
				const baseFixtureType = position.fixture_type.split('(')[0];
				const baseSelectedFixtureType = selectedFixtureType.split('(')[0];
				const fixtureMatches = baseFixtureType === baseSelectedFixtureType;

				// Check if this position matches the region
				let regionMatches = false;
				if (!selectedRegion) {
					regionMatches = true;
				} else if (Array.isArray(position.region)) {
					regionMatches = position.region.includes(selectedRegion);
				} else if (selectedRegion.includes('-')) {
					const selectedRegions = selectedRegion.split('-').map(r => r.trim());
					regionMatches = selectedRegions.includes(position.region);
				} else {
					regionMatches = position.region === selectedRegion;
				}

				// If this position matches both fixture type and region
				if (fixtureMatches && regionMatches) {
					// Create a unique key for this location
					const bay = position.bay || 1;
					const shelf = position.shelf;
					const horizontal = position.horizontal;
					const vertical = position.vertical;
					const locationKey = `${bay}-${shelf}-${horizontal}-${vertical}`;

					// Check if we already have a position for this location
					if (bestPositionsMap.has(locationKey)) {
						const existingPosition = bestPositionsMap.get(locationKey);

						// If the existing position is for a different SKU, log a warning
						if (existingPosition.sku.code !== sku.code) {
							console.warn(`InstructApp - Multiple SKUs at same location:`, {
								location: locationKey,
								existingSku: existingPosition.sku.code,
								newSku: sku.code
							});
							// Keep the existing position in this case
							return;
						}

						// If this is the same SKU but different fixture type, choose the best one
						const exactMatchCurrent = position.fixture_type === selectedFixtureType;
						const exactMatchExisting = existingPosition.position.fixture_type === selectedFixtureType;

						// Prefer exact fixture type matches
						if (exactMatchCurrent && !exactMatchExisting) {
							// Replace with the current position
							bestPositionsMap.set(locationKey, { position, sku });
							console.log(`InstructApp - Replaced with exact fixture type match: ${position.fixture_type}`);
						}
						// Otherwise keep the existing one
					} else {
						// This is the first position for this location
						bestPositionsMap.set(locationKey, { position, sku });
					}
				}
			});
		});

		// Now build the bays object using only the best positions
		let bays = {};

		bestPositionsMap.forEach(({ position, sku }, locationKey) => {
			const bay = position.bay || 1;

			// Initialize bay if it doesn't exist
			if (!bays[bay]) {
				bays[bay] = {
					shelves: {},
					shelfP: []
				};
			}

			// Add to appropriate shelf
			if (position.shelf === "P") {
				bays[bay].shelfP.push({ ...position, ...sku });
			} else {
				if (!bays[bay].shelves[position.shelf]) {
					bays[bay].shelves[position.shelf] = [];
				}
				bays[bay].shelves[position.shelf].push({ ...position, ...sku });
			}
		});

		console.log("InstructApp - Finished processing data. Bays object:", bays, "Bay count:", Object.keys(bays).length);

		// Function to render shelf data
		const renderShelf = (positions, shelfLabel, id = "", bayNumber) => {
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
				// Only reverse sort by vertical if it's NOT a panel shelf
				if (shelfLabel === "P") {
					// For panel shelf, use normal (ascending) vertical order
					groupedByHorizontal[horizontal].sort((a, b) => a.vertical - b.vertical);
				} else {
					// For regular shelves, use reverse (descending) vertical order
					groupedByHorizontal[horizontal].sort((a, b) => b.vertical - a.vertical);
				}
			});
			// Adjust sorting for 'P' shelf if horizontal values are not numeric
			if (shelfLabel === "P") {
				sortedGroupKeys.sort(sortHorizontalValues);
			}

			// Special handling for panel rendering with CS horizontal value
			if (shelfLabel === "P" && groupedByHorizontal["CS"]) {
				// Remove CS from the sortedGroupKeys to handle it separately
				sortedGroupKeys = sortedGroupKeys.filter(key => key !== "CS");

				// Step 4: Render with CS at the top
				return (
					<div className={`face-shelf face-shelf-${shelfLabel}`} key={shelfLabel}>
						<div className="shelf-title common-container">
							{shelfLabel === "P" ? null : <>BAY {bayNumber}/SHELF {shelfLabel}</>}
						</div>
						<div className={`shelf shelf-${shelfLabel}`}>
							{/* Render CS items as a row at the top */}
							<div className="item-group cs-row">
								{groupedByHorizontal["CS"].map((item, index) => (
									<div
										className={`item position-${item.horizontal}-${item.vertical}`}
										key={`cs-${index}`}
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
												{<ItemBayShelf item={item} />}
											</div>
										) : (
											<img
												src={`${item.ImageURL || data.ImageURL}${data.Customer}-${item.code}.jpg`}
												alt={`SKU ${item.code}`}
												width={item.width * 7 * scale}
												height={item.height * 7 * scale}
												{...(id === "moved" && { id: `${item.code}-movedTo` })}
												className={item.update}
												data-bay={item.bay}
												data-shelf={item.shelf}
												data-horizontal={item.horizontal}
												data-vertical={item.vertical}
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

							{/* Render other items as columns */}
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
													{<ItemBayShelf item={item} />}
												</div>
											) : (
												<img
													src={`${item.ImageURL || data.ImageURL}${data.Customer}-${item.code}.jpg`}
													alt={`SKU ${item.code}`}
													width={item.width * 7 * scale}
													height={item.height * 7 * scale}
													{...(id === "moved" && { id: `${item.code}-movedTo` })}
													className={item.update}
													data-bay={item.bay}
													data-shelf={item.shelf}
													data-horizontal={item.horizontal}
													data-vertical={item.vertical}
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
			}

			// Step 4: Render (original code for non-CS case)
			return (
				<div className={`face-shelf face-shelf-${shelfLabel}`} key={shelfLabel}>
					<div className="shelf-title common-container">
						{shelfLabel === "P" ? null : <>BAY {bayNumber}/SHELF {shelfLabel}</>}
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
												{<ItemBayShelf item={item} />}
											</div>
										) : (
											<img
												src={`${item.ImageURL || data.ImageURL}${data.Customer}-${item.code}.jpg`}
												alt={`SKU ${item.code}`}
												width={item.width * 7 * scale}
												height={item.height * 7 * scale}
												{...(id === "moved" && { id: `${item.code}-movedTo` })}
												className={item.update}
												data-bay={item.bay}
												data-shelf={item.shelf}
												data-horizontal={item.horizontal}
												data-vertical={item.vertical}
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

		// Modify generateLayout to handle bays
		const generateLayout = (bays, titleSuffix = "", id = "default") => (
			<>
				<h2 className="noprint">
					{selectedFixtureType} - {selectedRegion}
				</h2>
				{Object.entries(bays).sort(([a], [b]) => a - b).map(([bayNumber, bayData]) => (
					<div className="admin-fixture" id={id} key={bayNumber}>
						<div className={`face-data-display ${titleSuffix ? "page-break" : ""}`}>
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
							<h3>Graphic Layout: Bay {bayNumber} {titleSuffix}</h3>
							{Object.entries(bayData.shelves).map(([shelfLabel, positions]) =>
								renderShelf(positions, shelfLabel, id, bayNumber)
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
						{bayData.shelfP.length > 0 && (
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
								<h3>Backpanel: Bay {bayNumber} {titleSuffix}</h3>
								{renderShelf(bayData.shelfP, "P", id, bayNumber)}
							</div>
						)}
					</div>
				))}
			</>
		);

		// Return the layouts
		return (
			<>
				{generateLayout(bays)}
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
