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
import { formatText, t } from "./translations";
import InstructionItem from "../components/InstructionItem";

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
					throw new Error(t("noDataPromotion"));
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

										// Use exact fixture type matching
										if (matchesFixtureType(pos.fixture_type, initialFixtureType)) {
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

		// Filter stores by the selected fixture type using exact matching
		const filteredStores = storesArray.filter((store) => {
			return matchesFixtureType(store.fixture_type, selectedFixtureType);
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
			return <p>{t("noSkuData")}</p>;
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

				// Check if this position matches the fixture type using exact matching
				const fixtureMatches = matchesFixtureType(position.fixture_type, selectedFixtureType);

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

		// Function to render shelf data. Matches the admin RootApp /
		// ShelfRenderer grouping logic:
		//   - items at horizontal=8, vertical=2 are pulled into a synthetic
		//     "8-2-top" group that sorts first (top of the shelf),
		//   - items at horizontal=8 (other verticals) sort last (bottom),
		//   - everything else sorts by horizontal numerically in between.
		// Each item is rendered through InstructionItem so it carries the
		// SKU label (.item-sku) using the same useFitText hook as AdminItem.
		const renderShelf = (positions, shelfLabel, id = "", bayNumber) => {
			const topShelfGroupKey = "8-2-top";
			const isTopShelfPosition = (item) =>
				item.horizontal == 8 && item.vertical == 2;

			let groupedByHorizontal = positions.reduce((acc, item) => {
				const horizontal = isTopShelfPosition(item)
					? topShelfGroupKey
					: item.horizontal;
				if (!acc[horizontal]) {
					acc[horizontal] = [];
				}
				acc[horizontal].push(item);
				return acc;
			}, {});

			const getGroupSortValue = (horizontal) => {
				if (horizontal === topShelfGroupKey) return 0;
				if (horizontal == 8) return Number.MAX_SAFE_INTEGER;
				return Number(horizontal);
			};

			let sortedGroupKeys = Object.keys(groupedByHorizontal).sort(
				(a, b) => getGroupSortValue(a) - getGroupSortValue(b),
			);

			sortedGroupKeys.forEach((horizontal) => {
				if (shelfLabel === "P") {
					groupedByHorizontal[horizontal].sort((a, b) => a.vertical - b.vertical);
				} else {
					groupedByHorizontal[horizontal].sort((a, b) => b.vertical - a.vertical);
				}
			});

			if (shelfLabel === "P") {
				sortedGroupKeys.sort(sortHorizontalValues);
			}

			const getItemGroupClassName = (horizontal) => {
				if (horizontal === topShelfGroupKey) {
					return "item-group group-position-8 group-position-8-2";
				}
				return horizontal == 8 ? "item-group group-position-8" : "item-group";
			};

			// Special handling for panel rendering with CS horizontal value
			if (shelfLabel === "P" && groupedByHorizontal["CS"]) {
				sortedGroupKeys = sortedGroupKeys.filter((key) => key !== "CS");

				return (
					<div className={`face-shelf face-shelf-${shelfLabel}`} key={shelfLabel}>
						<div className="shelf-title common-container">
							{shelfLabel === "P" ? null : formatText("bayShelf", [bayNumber, shelfLabel])}
						</div>
						<div className={`shelf shelf-${shelfLabel}`}>
							<div className="item-group cs-row">
								{groupedByHorizontal["CS"].map((item, index) => (
									<InstructionItem
										key={`cs-${index}`}
										item={item}
										data={data}
										scale={scale}
										id={id}
									/>
								))}
							</div>

							{sortedGroupKeys.map((horizontal) => (
								<div className={getItemGroupClassName(horizontal)} key={horizontal}>
									{groupedByHorizontal[horizontal].map((item, index) => (
										<InstructionItem
											key={index}
											item={item}
											data={data}
											scale={scale}
											id={id}
										/>
									))}
								</div>
							))}
						</div>
					</div>
				);
			}

			return (
				<div className={`face-shelf face-shelf-${shelfLabel}`} key={shelfLabel}>
					<div className="shelf-title common-container">
						{shelfLabel === "P" ? null : formatText("bayShelf", [bayNumber, shelfLabel])}
					</div>
					<div className={`shelf shelf-${shelfLabel}`}>
						{sortedGroupKeys.map((horizontal) => (
							<div className={getItemGroupClassName(horizontal)} key={horizontal}>
								{groupedByHorizontal[horizontal].map((item, index) => (
									<InstructionItem
										key={index}
										item={item}
										data={data}
										scale={scale}
										id={id}
									/>
								))}
							</div>
						))}
					</div>
				</div>
			);
		};

		// Shared print header (logos + PDF info fields).
		const renderPrintHeader = () => (
			<div className="print-header">
				<img
					src="https://online.vmlogistics.com/wp-content/uploads/2024/02/Sephora_Logo.png"
					alt={t("sephoraLogo")}
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
				<img src={brandImage} alt={t("brandLogo")} className="right-image" />
			</div>
		);

		// Shared GREEN/YELLOW/RED legend + clean instructions footer.
		const renderFooterInstructions = () => (
			<div className="footer-instructions-wrapper">
				<div className="footer-instructions">
					<p>
						<span className="new">{t("green")}</span> = {t("newGraphics")}
					</p>{" "}
					<p>
						<span className="move">{t("yellow")}</span>= {t("movingGraphics")}
					</p>
					<p>
						<span className="delete">{t("red")}</span>= {t("removedGraphics")}
					</p>
				</div>
				<p className="text">{t("layoutDescription")}</p>
				<hr />
				<p className="clean">
					<strong>{t("cleanInstructions")}</strong>
				</p>
			</div>
		);

		// Items wider than this raw API width are pulled out of normal shelf
		// cells and rendered centered across both bay columns at the bottom
		// of the shelf row (mirrors admin RootApp two-up behaviour). Items
		// with the same horizontal value but a regular width stay in their
		// normal grid position (e.g. horizontal 8 vertical 2 at the top).
		const WIDE_ITEM_THRESHOLD = 50;
		const itemWidthNum = (i) => parseFloat(i?.width);
		const isWideItem = (i) => {
			const w = itemWidthNum(i);
			return Number.isFinite(w) && w > WIDE_ITEM_THRESHOLD;
		};

		// Wide-row item: reuses InstructionItem so SKU label + sizing logic
		// stay identical to in-cell items, just at a larger scale.
		const renderInstructionItem = (item, index, id, scaleMultiplier = 1) => (
			<InstructionItem
				key={`${item.code}-${index}`}
				item={item}
				data={data}
				scale={scale * scaleMultiplier}
				id={id}
			/>
		);

		const renderInstructionShelfCell = (positions, shelfLabel, id, bayNumber) => {
			if (!positions || positions.length === 0) {
				return <div className="shelf-cell shelf-cell--empty" />;
			}
			return (
				<div className="shelf-cell">
					{renderShelf(positions, shelfLabel, id, bayNumber)}
				</div>
			);
		};

		// Two-up face grid (mirrors admin RootApp): bay header row + per-shelf
		// rows containing each bay's regular items and a centered wide row.
		const renderTwoUpFaces = (sortedBayEntries, id, titleSuffix) => {
			const [[bay1Number, bay1Data], [bay2Number, bay2Data]] = sortedBayEntries;

			// Union of shelf labels across both bays, numerically sorted (with
			// string fallback) so shelf rows line up across the two columns.
			const allShelfLabels = [...new Set([
				...Object.keys(bay1Data.shelves),
				...Object.keys(bay2Data.shelves),
			])].sort((a, b) => {
				const an = parseFloat(a);
				const bn = parseFloat(b);
				if (!isNaN(an) && !isNaN(bn)) return an - bn;
				return String(a).localeCompare(String(b));
			});

			return (
				<div className="bays-two-up">
					<div className="bays-faces-aligned">
						<div className="bay-headers">
							<div className="bay-col-header">
								<h3>
									{formatText("graphicLayoutBay", [bay1Number])} {titleSuffix}
								</h3>
							</div>
							<div className="bay-col-header">
								<h3>
									{formatText("graphicLayoutBay", [bay2Number])} {titleSuffix}
								</h3>
							</div>
						</div>
						{allShelfLabels.map((shelfLabel) => {
							const bay1Items = bay1Data.shelves[shelfLabel] || [];
							const bay2Items = bay2Data.shelves[shelfLabel] || [];

							const bay1Regular = bay1Items.filter((i) => !isWideItem(i));
							const bay2Regular = bay2Items.filter((i) => !isWideItem(i));
							const wideItems = [
								...bay1Items.filter(isWideItem),
								...bay2Items.filter(isWideItem),
							];

							// Surface any items with a non-parseable width for debugging.
							const unparseable = [...bay1Items, ...bay2Items].filter(
								(i) => i.width !== undefined && !Number.isFinite(parseFloat(i.width))
							);
							if (unparseable.length > 0) {
								console.warn(
									`InstructApp shelf ${shelfLabel}: items with non-numeric width`,
									unparseable.map((i) => ({ code: i.code, width: i.width }))
								);
							}

							return (
								<div key={shelfLabel} className="shelf-row">
									<div className="shelf-row__cells">
										{renderInstructionShelfCell(bay1Regular, shelfLabel, id, bay1Number)}
										{renderInstructionShelfCell(bay2Regular, shelfLabel, id, bay2Number)}
									</div>
									{wideItems.length > 0 && (
										<div className="shelf-row__wide">
											{wideItems.map((item, idx) =>
												renderInstructionItem(item, idx, id, 2)
											)}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			);
		};

		// Single-bay panel-data-display (backpanel) section.
		const renderBayPanels = (bayNumber, bayData, id, titleSuffix) => {
			if (!bayData.shelfP || bayData.shelfP.length === 0) return null;
			return (
				<div className="panel-data-display" key={`panels-${bayNumber}`}>
					{renderPrintHeader()}
					<h3>
						{formatText("backpanelBay", [bayNumber])} {titleSuffix}
					</h3>
					{renderShelf(bayData.shelfP, "P", id, bayNumber)}
				</div>
			);
		};

		const generateLayout = (bays, titleSuffix = "", id = "default") => {
			const sortedBayEntries = Object.entries(bays).sort(([a], [b]) => a - b);
			const isTwoUp = sortedBayEntries.length === 2;

			if (isTwoUp) {
				return (
					<>
						<h2 className="noprint">
							{selectedFixtureType} - {selectedRegion}
						</h2>
						<div className="admin-fixture admin-fixture--two-up" id={id}>
							<div className={`face-data-display ${titleSuffix ? "page-break" : ""}`}>
								{renderPrintHeader()}
								{renderTwoUpFaces(sortedBayEntries, id, titleSuffix)}
								{renderFooterInstructions()}
							</div>
							{sortedBayEntries.map(([bayNumber, bayData]) =>
								renderBayPanels(bayNumber, bayData, id, titleSuffix)
							)}
						</div>
					</>
				);
			}

			return (
				<>
					<h2 className="noprint">
						{selectedFixtureType} - {selectedRegion}
					</h2>
					{sortedBayEntries.map(([bayNumber, bayData]) => (
						<div className="admin-fixture" id={id} key={bayNumber}>
							<div className={`face-data-display ${titleSuffix ? "page-break" : ""}`}>
								{renderPrintHeader()}
								<h3>
									{formatText("graphicLayoutBay", [bayNumber])} {titleSuffix}
								</h3>
								{Object.entries(bayData.shelves).map(([shelfLabel, positions]) =>
									renderShelf(positions, shelfLabel, id, bayNumber)
								)}
								{renderFooterInstructions()}
							</div>
							{renderBayPanels(bayNumber, bayData, id, titleSuffix)}
						</div>
					))}
				</>
			);
		};

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
		return <Loader text={t("loading")} />;
	}

	if (error) {
		return <p>{error}</p>;
	}

	if (!data) {
		return <p>{t("pleaseSelectPromotion")}</p>;
	}

	return (
		<div className="fixture-select">
			<div className="noprint">
				<strong>{t("selectFixture")}</strong>
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
						<strong>{t("selectRegion")}</strong>
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
						{t("instructionSheetToPdf")}
					</button>

					<ul>
						{Object.entries(totals.totalsByRegion).map(([region, count]) => (
							<li key={region}>
								{region}: {count} {t("stores")}
							</li>
						))}
					</ul>
					<p>{formatText("totalAcrossRegions", [totals.totalAcrossRegions])}</p>
				</div>
				<div className="noprint textInput">
					<p>{t("headerInformation")}</p>
					{hasAllUSCA && (
						<div className="inputFields">
							<label htmlFor="same">{t("sameUsCaRegions")}</label>
							<button
								className="ui-button ui-widget ui-corner-all ui-button-text-only"
								id="same"
								onClick={() => {
									setRegion("US - CA");
								}}
							>
								{t("combine")}
							</button>
						</div>
					)}
					{hasAllALL && (
						<div className="inputFields">
							<label htmlFor="same">{t("sameAllRegions")}</label>
							<button
								className="ui-button ui-widget ui-corner-all ui-button-text-only"
								id="same"
								onClick={() => {
									setRegion("US - CA - QC");
								}}
							>
								{t("combine")}
							</button>
						</div>
					)}
					<div className="inputFields">
						<label htmlFor="fixtureInput">{t("fixture")}</label>
						<input
							type="text"
							value={fixtureType}
							onChange={(e) => setFixtureType(e.target.value)}
							placeholder={t("fixtureType")}
							className="fixtureType"
							id="fixtureInput"
						/>
					</div>
					<div className="inputFields">
						<label htmlFor="regionInput">{t("regionLabel")}</label>
						<input
							type="text"
							value={region}
							onChange={(e) => setRegion(e.target.value)}
							placeholder={t("region")}
							id="regionInput"
						/>
					</div>
					<div className="inputFields">
						<label htmlFor="seasonInput">{t("updates")}</label>
						<input
							type="text"
							value={updateSeason}
							onChange={handleUpdateSeasonChange}
							placeholder={t("updateSeason")}
							id="seasonInput"
						/>
					</div>
					<div className="inputFields">
						<label htmlFor="weekInput">{t("executionDatesLabel")}</label>
						<input
							type="text"
							value={executionWeek}
							onChange={(e) => setExecutionWeek(e.target.value)}
							placeholder={t("executionDates")}
							id="weekInput"
						/>
					</div>
					<div className="inputFields">
						<label htmlFor="brandingInput">{t("type")}</label>
						<input
							type="text"
							value={branding}
							onChange={(e) => setBranding(e.target.value)}
							placeholder={t("branding")}
							id="brandingInput"
						/>
					</div>
				</div>
			</div>
			<UploadPdf />
			<div className="noprint scale">
				<div className="scale-wrapper">
					<p>
						{t("enlargeReduceImageSizes")}
						<br /> {t("toFitPrinterOutput")}
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
