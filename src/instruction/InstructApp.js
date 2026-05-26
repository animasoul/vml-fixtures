// Desc: Root component for admin app
import { Fragment, useEffect, useMemo, useState } from "@wordpress/element";
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

	// Toggle for the SKU label rendered under each item image.
	const [showSku, setShowSku] = useState(true);

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

		// Build per-shelf BEFORE/AFTER categorisation used for the printed
		// "Shelf X - BEFORE" / "Shelf X - AFTER" pages.
		//   - DISCARD          : positions with update === "delete"
		//   - MOVING OFF SHELF : positions with update === "move" AND
		//                        moved_item truthy (the old-location placeholder)
		//   - NEW COMPONENTS   : positions with update === "new"
		//   - MOVING TO SHELF  : positions with update === "move" AND
		//                        moved_item falsy (the new-location image)
		// Panel positions (shelf === "P") are excluded — the pages are per
		// shelf only, panel changes can be added later if needed.
		const beforeAfterByBayShelf = {};
		const addUniquePreviewItem = (items, item) => {
			const key = [
				item.code,
				item.bay,
				item.shelf,
				item.horizontal,
				item.vertical,
			].join("|");

			if (!items.some((existingItem) => [
				existingItem.code,
				existingItem.bay,
				existingItem.shelf,
				existingItem.horizontal,
				existingItem.vertical,
			].join("|") === key)) {
				items.push(item);
			}
		};

		Object.values(data.final_skus).forEach((sku) => {
			if (!sku.positions || !Array.isArray(sku.positions)) return;

			sku.positions.forEach((position) => {
				const fixtureMatches = matchesFixtureType(
					position.fixture_type,
					selectedFixtureType
				);

				let regionMatches = false;
				if (!selectedRegion) {
					regionMatches = true;
				} else if (Array.isArray(position.region)) {
					regionMatches = position.region.includes(selectedRegion);
				} else if (selectedRegion.includes("-")) {
					const selectedRegions = selectedRegion
						.split("-")
						.map((r) => r.trim());
					regionMatches = selectedRegions.includes(position.region);
				} else {
					regionMatches = position.region === selectedRegion;
				}

				if (!fixtureMatches || !regionMatches) return;

				const bay = position.bay || 1;
				const shelf = position.shelf;
				if (shelf === "P") return;

				const key = `${bay}|${shelf}`;
				if (!beforeAfterByBayShelf[key]) {
					beforeAfterByBayShelf[key] = {
						bay,
						shelf,
						beforeItems: [],
						afterItems: [],
						discard: [],
						movingOff: [],
						newComponents: [],
						movingTo: [],
					};
				}

				const itemData = { ...position, ...sku };
				const target = beforeAfterByBayShelf[key];
				const isMoveFromPosition = position.update === "move" && position.moved_item;
				const isMoveToPosition = position.update === "move" && !position.moved_item;

				if (position.update !== "new" && !isMoveToPosition) {
					addUniquePreviewItem(target.beforeItems, {
						...itemData,
						update:
							position.update === "delete" || isMoveFromPosition
								? position.update
								: "keep",
						moved_item: false,
					});
				}

				if (position.update !== "delete" && !isMoveFromPosition) {
					addUniquePreviewItem(target.afterItems, {
						...itemData,
						update:
							position.update === "new" || isMoveToPosition
								? position.update
								: "keep",
						moved_item: false,
					});
				}

				if (position.update === "delete") {
					target.discard.push(itemData);
				} else if (position.update === "new") {
					target.newComponents.push(itemData);
				} else if (position.update === "move") {
					if (position.moved_item) {
						target.movingOff.push(itemData);
					} else {
						target.movingTo.push(itemData);
					}
				}
			});
		});

		const multipleBays = Object.keys(bays).length > 1;

		// Function to render shelf data. Matches the admin RootApp /
		// ShelfRenderer grouping logic:
		//   - panel shelves (shelfLabel === "P") keep horizontal grouping,
		//   - regular shelves are grouped by VERTICAL row so vertical 8 renders
		//     first and vertical 1 renders last (top-down ordering),
		//   - horizontal=8 items stay together inside their vertical row but
		//     sort to the end of that row so they form a full-width strip,
		//   - items inside a row are placed left-to-right by horizontal.
		// Each item is rendered through InstructionItem so it carries the SKU
		// label (.item-sku) using the same useFitText hook as AdminItem.
		const renderShelf = (positions, shelfLabel, id = "", bayNumber, hideTitle = false) => {
			const isHorizontalEight = (item) => String(item.horizontal) === "8";

			const getGroupKey = (item) => {
				if (shelfLabel === "P") {
					return item.horizontal;
				}
				const vertical = String(item.vertical);
				return isHorizontalEight(item) ? `8-${vertical}` : `v-${vertical}`;
			};

			let groupedByHorizontal = positions.reduce((acc, item) => {
				const groupKey = getGroupKey(item);
				if (!acc[groupKey]) {
					acc[groupKey] = [];
				}
				acc[groupKey].push(item);
				return acc;
			}, {});

			const getNumericValue = (value) => {
				const numeric = Number(value);
				return Number.isFinite(numeric) ? numeric : 0;
			};

			const getGroupSortValue = (groupKey) => {
				if (shelfLabel === "P") {
					return getNumericValue(groupKey);
				}
				const items = groupedByHorizontal[groupKey] || [];
				const vertical = getNumericValue(items[0]?.vertical);
				const hasHorizontalEight = items.some(isHorizontalEight);
				return {
					vertical,
					hasHorizontalEight,
					horizontal: getNumericValue(items[0]?.horizontal),
				};
			};

			const sortRegularShelfGroups = (a, b) => {
				const groupA = getGroupSortValue(a);
				const groupB = getGroupSortValue(b);

				if (groupA.vertical !== groupB.vertical) {
					return groupB.vertical - groupA.vertical;
				}

				if (groupA.hasHorizontalEight !== groupB.hasHorizontalEight) {
					return groupA.hasHorizontalEight ? 1 : -1;
				}

				return groupA.horizontal - groupB.horizontal;
			};

			let sortedGroupKeys = Object.keys(groupedByHorizontal).sort((a, b) => {
				if (shelfLabel === "P") {
					return getGroupSortValue(a) - getGroupSortValue(b);
				}
				return sortRegularShelfGroups(a, b);
			});

			sortedGroupKeys.forEach((groupKey) => {
				if (shelfLabel === "P") {
					groupedByHorizontal[groupKey].sort((a, b) => a.vertical - b.vertical);
				} else {
					// Within a vertical row, place items left-to-right by horizontal.
					groupedByHorizontal[groupKey].sort((a, b) => a.horizontal - b.horizontal);
				}
			});

			if (shelfLabel === "P") {
				sortedGroupKeys.sort(sortHorizontalValues);
			}

			const getItemGroupClassName = (groupKey) => {
				if (shelfLabel === "P") {
					return groupKey == 8 ? "item-group group-position-8" : "item-group";
				}
				const isEightRow = (groupedByHorizontal[groupKey] || []).some(isHorizontalEight);
				return isEightRow
					? "item-group item-group-vertical-row group-position-8"
					: "item-group item-group-vertical-row";
			};

			const renderShelfTitle = () => {
				if (hideTitle) return null;
				return (
					<div className="shelf-title common-container">
						{shelfLabel === "P" ? null : formatText("bayShelf", [bayNumber, shelfLabel])}
					</div>
				);
			};

			// Special handling for panel rendering with CS horizontal value
			if (shelfLabel === "P" && groupedByHorizontal["CS"]) {
				sortedGroupKeys = sortedGroupKeys.filter((key) => key !== "CS");

				return (
					<div className={`face-shelf face-shelf-${shelfLabel}`} key={shelfLabel}>
						{renderShelfTitle()}
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

							{sortedGroupKeys.map((groupKey) => (
								<div className={getItemGroupClassName(groupKey)} key={groupKey}>
									{groupedByHorizontal[groupKey].map((item, index) => (
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
					{renderShelfTitle()}
					<div className={`shelf shelf-${shelfLabel}`}>
						{sortedGroupKeys.map((groupKey) => (
							<div className={getItemGroupClassName(groupKey)} key={groupKey}>
								{groupedByHorizontal[groupKey].map((item, index) => (
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
				<p className="header-text" data-no-translation>
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

		// Render a single item card on a Shelf BEFORE / AFTER page. Card
		// shows the item image (with the same coloured update border used
		// elsewhere), product label, and a QTY line.
		const renderBeforeAfterCard = (item, idx) => {
			const imageUrl = `${item.ImageURL || data.ImageURL}${data.Customer}-${item.code}.jpg`;
			const itemLabel = item.product_type || item.description || item.name || item.code || "";
			const qty = item.quantity || 1;

			return (
				<div
					className={`shelf-update-card${item.update ? ` is-${item.update}` : ""}`}
					key={`${item.code}-${item.bay}-${item.shelf}-${item.horizontal}-${item.vertical}-${idx}`}
					data-sku={item.code}
					data-bay={item.bay}
					data-shelf={item.shelf}
					data-horizontal={item.horizontal}
					data-vertical={item.vertical}
					data-update={item.update}
				>
					<div className="shelf-update-card__image-wrapper">
						<img
							src={imageUrl}
							alt={formatText("skuAlt", [item.code])}
							className={`shelf-update-card__image ${item.update || ""}`}
						/>
					</div>
					<div className="shelf-update-card__details">
						{/* <div className="shelf-update-card__name" data-no-translation>
							{itemLabel}
						</div> */}
						<div className="shelf-update-card__sku" data-no-translation>
							{item.code}
						</div>
					</div>
				</div>
			);
		};

		const renderBeforeAfterColumn = (title, items, modifier) => (
			<div className={`shelf-update__column shelf-update__column--${modifier}`}>
				<h3 className="shelf-update__column-title">{title}</h3>
				<div className="shelf-update__items">
					{items.length > 0 ? (
						items.map((item, idx) => renderBeforeAfterCard(item, idx))
					) : (
						<p className="shelf-update__na" data-no-translation>
							{t("naLabel")}
						</p>
					)}
				</div>
			</div>
		);

		const renderShelfUpdatePreview = (entry, type) => {
			const isBefore = type === "before";
			const previewItems = isBefore ? entry.beforeItems : entry.afterItems;

			if (previewItems.length === 0) return null;

			return (
				<div className={`shelf-update__preview shelf-update__preview--${type}`}>
					{!isBefore && (
						<h3 className="shelf-update__preview-title">
							{formatText("completedShelf", [entry.shelf])}
						</h3>
					)}
					{renderShelf(previewItems, entry.shelf, `shelf-update-${type}`, entry.bay, true)}
				</div>
			);
		};

		const renderShelfBeforeAfterPage = (entry, type) => {
			const isBefore = type === "before";
			const titleKey = multipleBays
				? isBefore ? "bayShelfBefore" : "bayShelfAfter"
				: isBefore ? "shelfBefore" : "shelfAfter";
			const titleArgs = multipleBays
				? [entry.bay, entry.shelf]
				: [entry.shelf];
			const pageTitle = formatText(titleKey, titleArgs);

			const leftCol = isBefore
				? { title: t("movingOffShelf"), items: entry.movingOff, modifier: "moving-off" }
				: { title: t("newComponents"), items: entry.newComponents, modifier: "new-components" };
			const rightCol = isBefore
				? { title: t("discardLabel"), items: entry.discard, modifier: "discard" }
				: { title: t("movingToShelf"), items: entry.movingTo, modifier: "moving-to" };

			return (
				<div
					className={`shelf-update shelf-update--${type}`}
					key={`shelf-update-${type}-${entry.bay}-${entry.shelf}`}
					data-bay={entry.bay}
					data-shelf={entry.shelf}
					data-type={type}
				>
					{renderPrintHeader()}
					<h2 className="shelf-update__title">{pageTitle}</h2>
					{isBefore && renderShelfUpdatePreview(entry, type)}
					<div className="shelf-update__columns">
						{renderBeforeAfterColumn(leftCol.title, leftCol.items, leftCol.modifier)}
						{renderBeforeAfterColumn(rightCol.title, rightCol.items, rightCol.modifier)}
					</div>
					{!isBefore && renderShelfUpdatePreview(entry, type)}
				</div>
			);
		};

		const renderShelfBeforeAfterPages = () => {
			const sortedEntries = Object.values(beforeAfterByBayShelf).sort((a, b) => {
				const bayDiff = (parseFloat(a.bay) || 0) - (parseFloat(b.bay) || 0);
				if (bayDiff !== 0) return bayDiff;
				const an = parseFloat(a.shelf);
				const bn = parseFloat(b.shelf);
				if (Number.isFinite(an) && Number.isFinite(bn)) return an - bn;
				return String(a.shelf).localeCompare(String(b.shelf));
			});

			const visibleEntries = sortedEntries.filter(
				(entry) =>
					entry.discard.length > 0 ||
					entry.movingOff.length > 0 ||
					entry.newComponents.length > 0 ||
					entry.movingTo.length > 0
			);

			if (visibleEntries.length === 0) return null;

			return (
				<div className="shelf-update-pages">
					{visibleEntries.map((entry) => (
						<Fragment key={`shelf-update-${entry.bay}-${entry.shelf}`}>
							{renderShelfBeforeAfterPage(entry, "before")}
							{renderShelfBeforeAfterPage(entry, "after")}
						</Fragment>
					))}
				</div>
			);
		};

		const renderInstructionShelfCell = (positions, shelfLabel, id, bayNumber, hideTitle = false) => {
			if (!positions || positions.length === 0) {
				return <div className="shelf-cell shelf-cell--empty" />;
			}
			return (
				<div className="shelf-cell">
					{renderShelf(positions, shelfLabel, id, bayNumber, hideTitle)}
				</div>
			);
		};

		// Two-up face grid (mirrors admin RootApp two-up logic):
		//   - Bay header row at top + per-shelf rows below.
		//   - For each shelf row, items are grouped by vertical (8 → 1) so the
		//     rows line up across both bays.
		//   - If a vertical row contains any horizontal=8 item OR has a combined
		//     width over FULL_WIDTH_ROW_THRESHOLD, that vertical renders as a
		//     centered full-width strip spanning both bay columns.
		//   - Otherwise the vertical splits into two bay cells side-by-side.
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

			// Any shelf+vertical row whose combined returned data width is over
			// this threshold spans both bay columns as a single wide row.
			const FULL_WIDTH_ROW_THRESHOLD = 40;
			const itemWidthNum = (i) => parseFloat(i?.width);
			const isHorizontalEight = (i) => String(i?.horizontal) === "8";
			const getItemsWidth = (items) => items.reduce((total, item) => {
				const w = itemWidthNum(item);
				return total + (Number.isFinite(w) ? w : 0);
			}, 0);

			const getSortedVerticals = (items) => [...new Set(
				items.map((item) => String(item.vertical))
			)].sort((a, b) => {
				const an = parseFloat(a);
				const bn = parseFloat(b);
				if (Number.isFinite(an) && Number.isFinite(bn)) return bn - an;
				return String(b).localeCompare(String(a));
			});

			const getItemsForVertical = (items, vertical) =>
				items.filter((item) => String(item.vertical) === String(vertical));

			const shouldRenderFullWidthVertical = (items) =>
				items.some(isHorizontalEight) || getItemsWidth(items) > FULL_WIDTH_ROW_THRESHOLD;

			const sortItemsByBayAndHorizontal = (items) => [...items].sort((a, b) => {
				const bayDiff = (parseFloat(a?.bay) || 0) - (parseFloat(b?.bay) || 0);
				if (bayDiff !== 0) return bayDiff;
				return (parseFloat(a?.horizontal) || 0) - (parseFloat(b?.horizontal) || 0);
			});

			const renderFullWidthVerticalRow = (items, shelfLabel, vertical) => (
				<div
					key={`${shelfLabel}-${vertical}-full`}
					className="shelf-row__wide shelf-row__wide--vertical"
				>
					{sortItemsByBayAndHorizontal(items).map((item, idx) => (
						<InstructionItem
							key={`${item.code}-${item.bay}-${item.shelf}-${item.vertical}-${idx}`}
							item={item}
							data={data}
							scale={scale * 1.5}
							id={id}
						/>
					))}
				</div>
			);

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
							const allVerticals = getSortedVerticals([...bay1Items, ...bay2Items]);

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
									<div className="shelf-row__cells shelf-row__labels">
										<div className="shelf-cell shelf-cell--label">
											<div className="shelf-title common-container">
												{formatText("bayShelf", [bay1Number, shelfLabel])}
											</div>
										</div>
										<div className="shelf-cell shelf-cell--label">
											<div className="shelf-title common-container">
												{formatText("bayShelf", [bay2Number, shelfLabel])}
											</div>
										</div>
									</div>
									{allVerticals.map((vertical) => {
										const bay1VerticalItems = getItemsForVertical(bay1Items, vertical);
										const bay2VerticalItems = getItemsForVertical(bay2Items, vertical);
										const verticalItems = [...bay1VerticalItems, ...bay2VerticalItems];

										if (shouldRenderFullWidthVertical(verticalItems)) {
											return renderFullWidthVerticalRow(verticalItems, shelfLabel, vertical);
										}

										return (
											<div
												key={`${shelfLabel}-${vertical}-cells`}
												className="shelf-row__cells shelf-row__vertical-cells"
											>
												{renderInstructionShelfCell(bay1VerticalItems, shelfLabel, id, bay1Number, true)}
												{renderInstructionShelfCell(bay2VerticalItems, shelfLabel, id, bay2Number, true)}
											</div>
										);
									})}
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

		// Return the layouts followed by per-shelf BEFORE/AFTER pages.
		return (
			<>
				{generateLayout(bays)}
				{renderShelfBeforeAfterPages()}
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
		<div className={`fixture-select${showSku ? "" : " hide-item-sku"}`}>
			<div className="noprint">
				<strong>{t("selectFixture")}</strong>
				<ul className="buttons-row" data-no-translation>
					{[...uniqueFixtureTypes].reverse().map((type) => (
						<li key={type}>
							<button
								data-no-translation
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
						<ul className="buttons-row" data-no-translation>
							{[...uniqueRegions].reverse().map((region) => (
								<li key={region}>
									<button
										data-no-translation
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
					<div className="noprint inputFields show-sku-toggle">
						<input
							type="checkbox"
							id="showSkuToggle"
							checked={showSku}
							onChange={(e) => setShowSku(e.target.checked)}
						/>
						<label htmlFor="showSkuToggle">{t("showSkuLabels")}</label>
					</div>
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
