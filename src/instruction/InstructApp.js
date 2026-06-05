// Desc: Root component for instruction sheet app
import { Fragment, createPortal, useEffect, useMemo, useState } from "@wordpress/element";
import Loader from "../components/Loader";
import { fetchOptionData } from "../services/getOptionService";
import "./style-index.css";
import {
	getUniqueValues,
	sortHorizontalValues
} from '../utilities/shelfUtils';
import { getRegionsForSelectedFixture, matchesFixtureType } from '../utilities/fixtureUtils';
import {
	buildInstructionViewModel,
	hasBackPanels,
	hasSidePanels,
} from "./instructionViewModel";
import { formatText, t } from "./translations";
import InstructionItem from "../components/InstructionItem";

const getLogoUrl = (logo) => {
	if (!logo) return "";
	if (typeof logo === "string") return logo;
	if (typeof logo === "object") {
		return logo.url || logo.sizes?.medium || logo.sizes?.thumbnail || "";
	}
	return "";
};

const finalInstructionImageUrl =
	"/wp-content/plugins/vml-fixtures/build/images/Instruction-sheet-pdf-image.jpg";
const kohlsFinalInstructionImageUrl =
	"/wp-content/plugins/vml-fixtures/build/images/Instruction-sheet-pdf-image-khols.jpg";
const kohlsHeaderLogoUrl =
	"https://online.vmlogistics.com/wp-content/uploads/2023/03/TWR28.png";

const parseExecutionInstructionBoldSegments = (text) => {
	const segments = [];
	const pattern = /\*\*(.+?)\*\*/g;
	let lastIndex = 0;
	let match = pattern.exec(text);

	while (match) {
		if (match.index > lastIndex) {
			segments.push({ text: text.slice(lastIndex, match.index), bold: false });
		}
		segments.push({ text: match[1], bold: true });
		lastIndex = match.index + match[0].length;
		match = pattern.exec(text);
	}

	if (lastIndex < text.length) {
		segments.push({ text: text.slice(lastIndex), bold: false });
	}

	if (segments.length === 0) {
		segments.push({ text, bold: false });
	}

	return segments;
};

const renderExecutionInstructionBoldText = (text) =>
	parseExecutionInstructionBoldSegments(text).map((segment, index) =>
		segment.bold ? (
			<strong key={`bold-${index}`}>{segment.text}</strong>
		) : (
			<Fragment key={`text-${index}`}>{segment.text}</Fragment>
		)
	);

const getExecutionInstructionsSheetKey = (entry) => {
	const entryKey = entry.panelType || entry.shelf;
	return `${entry.bay}-${entryKey}`;
};

const EXECUTION_INSTRUCTION_LINES = [
	{ labelKey: "executionInstructionStep1Label", bodyKey: "executionInstructionStep1Body" },
	{ labelKey: "executionInstructionStep2Label", bodyKey: "executionInstructionStep2Body" },
	{ bodyKey: "executionInstructionStep2Note" },
	{ labelKey: "executionInstructionStep3Label", bodyKey: "executionInstructionStep3Body" },
	{ labelKey: "executionInstructionStep4Label", bodyKey: "executionInstructionStep4Body" },
	{ labelKey: "executionInstructionStep5Label", bodyKey: "executionInstructionStep5Body" },
	{ labelKey: "executionInstructionStep6Label", bodyKey: "executionInstructionStep6Body" },
	{ labelKey: "executionInstructionStep7Label", bodyKey: "executionInstructionStep7Body" },
	{ labelKey: "executionInstructionStep8Label", bodyKey: "executionInstructionStep8Body" },
	{ bodyKey: "executionInstructionOverview", isOverview: true },
];

const InstructApp = () => {
	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedFixtureType, setSelectedFixtureType] = useState(null);
	const [selectedRegion, setSelectedRegion] = useState(null);
	const [brandImage, setBrandImage] = useState(null);
	const [footerLogo, setFooterLogo] = useState("");

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
	const [executionInstructionsOverrides, setExecutionInstructionsOverrides] = useState({});
	const [executionInstructionsImages, setExecutionInstructionsImages] = useState({});
	const [blankPageImages, setBlankPageImages] = useState({ first: null, second: null });
	const [blankPageImageScales, setBlankPageImageScales] = useState({ first: 0, second: 0 });
	const [blankPageHorizontalLayout, setBlankPageHorizontalLayout] = useState(false);

	const BLANK_PAGE_IMAGE_SCALE_STEP = 0.1;
	const BLANK_PAGE_IMAGE_SCALE_MIN = 0.5;
	const BLANK_PAGE_IMAGE_SCALE_MAX = 2;

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

	const handleBlankPageImageChange = (slot, event) => {
		const file = event.target.files?.[0];
		if (!file || !file.type.startsWith("image/")) {
			return;
		}

		const reader = new FileReader();
		reader.onload = (loadEvent) => {
			const imageUrl = loadEvent.target?.result;
			if (typeof imageUrl !== "string") {
				return;
			}

			setBlankPageImages((prev) => ({
				...prev,
				[slot]: imageUrl,
			}));
		};
		reader.readAsDataURL(file);
	};

	const removeBlankPageImage = (slot) => {
		setBlankPageImages((prev) => ({
			...prev,
			[slot]: null,
		}));
		setBlankPageImageScales((prev) => ({
			...prev,
			[slot]: 0,
		}));
	};

	const getBlankPageImageScale = (slot) => 1 + (blankPageImageScales[slot] || 0);

	const getBlankPageImageScalePercent = (slot) =>
		Math.round(getBlankPageImageScale(slot) * 100);

	const adjustBlankPageImageScale = (slot, delta) => {
		setBlankPageImageScales((prev) => {
			const currentScale = 1 + (prev[slot] || 0);
			const nextScale = Math.min(
				BLANK_PAGE_IMAGE_SCALE_MAX,
				Math.max(BLANK_PAGE_IMAGE_SCALE_MIN, currentScale + delta)
			);

			return {
				...prev,
				[slot]: nextScale - 1,
			};
		});
	};

	const getDefaultExecutionInstructionsText = () =>
		EXECUTION_INSTRUCTION_LINES.map((line) => {
			const body = t(line.bodyKey);
			if (line.isOverview) {
				return `**${body}**`;
			}
			if (line.labelKey) {
				return `**${t(line.labelKey)}** ${body}`;
			}
			return body;
		}).join("\n");

	const getExecutionInstructionsText = (sheetKey) =>
		executionInstructionsOverrides[sheetKey] ?? getDefaultExecutionInstructionsText();

	const handleExecutionInstructionsChange = (sheetKey, value) => {
		setExecutionInstructionsOverrides((prev) => ({
			...prev,
			[sheetKey]: value,
		}));
	};

	const resetExecutionInstructions = (sheetKey) => {
		setExecutionInstructionsOverrides((prev) => {
			const next = { ...prev };
			delete next[sheetKey];
			return next;
		});
	};

	const handleExecutionInstructionsImageChange = (sheetKey, event) => {
		const file = event.target.files?.[0];
		if (!file || !file.type.startsWith("image/")) {
			return;
		}

		const reader = new FileReader();
		reader.onload = (loadEvent) => {
			const imageUrl = loadEvent.target?.result;
			if (typeof imageUrl !== "string") {
				return;
			}

			setExecutionInstructionsImages((prev) => ({
				...prev,
				[sheetKey]: imageUrl,
			}));
		};
		reader.readAsDataURL(file);
	};

	const removeExecutionInstructionsImage = (sheetKey) => {
		setExecutionInstructionsImages((prev) => {
			const next = { ...prev };
			delete next[sheetKey];
			return next;
		});
	};

	const renderExecutionInstructionsContent = (sheetKey) => {
		const displayText = getExecutionInstructionsText(sheetKey);
		const displayLines = displayText.split("\n");
		const hasOverride = executionInstructionsOverrides[sheetKey] !== undefined;
		const imageUrl = executionInstructionsImages[sheetKey];

		return (
			<>
				<div className="print-only execution-instructions-page__content-display">
					{displayLines.map((line, index) => (
						<p key={`${index}-${line}`} className="execution-instructions-page__line">
							{renderExecutionInstructionBoldText(line)}
						</p>
					))}
				</div>
				<div className="execution-instructions-page__content-edit noprint">
					<p className="execution-instructions-page__content-hint">
						{t("executionInstructionsBoldHint")}
					</p>
					<textarea
						className="execution-instructions-page__content-textarea"
						value={displayText}
						onChange={(event) =>
							handleExecutionInstructionsChange(sheetKey, event.target.value)
						}
						rows={12}
					/>
					{hasOverride && (
						<div className="execution-instructions-page__content-actions">
							<button
								type="button"
								className="ui-button ui-widget ui-corner-all ui-button-text-only"
								onClick={() => resetExecutionInstructions(sheetKey)}
							>
								{t("resetInstructionLine")}
							</button>
						</div>
					)}
					<div className="execution-instructions-page__image-upload">
						<label className="execution-instructions-page__image-upload-label">
							<span className="execution-instructions-page__image-upload-text">
								{t("executionInstructionUploadImage")}
							</span>
							<input
								type="file"
								accept="image/*"
								className="execution-instructions-page__image-input"
								onChange={(event) =>
									handleExecutionInstructionsImageChange(sheetKey, event)
								}
							/>
						</label>
						{imageUrl && (
							<button
								type="button"
								className="ui-button ui-widget ui-corner-all ui-button-text-only"
								onClick={() => removeExecutionInstructionsImage(sheetKey)}
							>
								{t("executionInstructionRemoveImage")}
							</button>
						)}
					</div>
				</div>
				{imageUrl && (
					<div className="execution-instructions-page__image-section">
						<div className="execution-instructions-page__image-frame">
							<img
								src={imageUrl}
								alt={t("executionInstructionImageAlt")}
								className="execution-instructions-page__image"
							/>
						</div>
					</div>
				)}
			</>
		);
	};

	// Render the footer as a direct child of <body> via a portal. On the
	// frontend the app is wrapped by theme/Elementor elements that establish a
	// containing block (transform/contain), which would otherwise capture this
	// position:fixed footer and prevent it from anchoring to each printed page.
	const renderPrintFooter = () => {
		if (typeof document === "undefined") {
			return null;
		}

		return createPortal(
			<div className="vml-print-page-footer">
				<div className="vml-print-page-footer-inner">
					{footerLogo && (
						<img
							src={footerLogo}
							alt="Graphic Systems"
							className="vml-print-page-footer-logo"
						/>
					)}
				</div>
			</div>,
			document.body
		);
	};

	useEffect(() => {
		async function fetchData() {
			try {
				const response = await fetchOptionData();

				if (!response.data) {
					throw new Error(t("noDataPromotion"));
				} else {
					const jsonData = response.data;

					setBrandImage(getLogoUrl(response.logo));
					setFooterLogo(getLogoUrl(response.footerLogo));

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

	const uniqueFixtureTypes = useMemo(
		() => getUniqueValues(data, "fixture_type"),
		[data],
	);
	const uniqueRegions = useMemo(
		() => selectedFixtureType ? getRegionsForSelectedFixture(data, selectedFixtureType) : [],
		[data, selectedFixtureType]
	);

	const instructionViewModel = useMemo(() => {
		if (!data || typeof data.final_skus !== "object" || !selectedFixtureType) {
			return null;
		}

		return buildInstructionViewModel(data, selectedFixtureType, selectedRegion);
	}, [data, selectedFixtureType, selectedRegion]);

	const processAndDisplayData = () => {
		if (!instructionViewModel) {
			console.log("InstructApp - Early return condition met:", {
				dataExists: !!data,
				finalSkusIsObject: data ? typeof data.final_skus === "object" : false,
				selectedFixtureTypeExists: !!selectedFixtureType
			});
			return <p>{t("noSkuData")}</p>;
		}

		const { bays, beforeAfterPrintSequence, multipleBays } = instructionViewModel;

		console.log("InstructApp - Finished processing data. Bays object:", bays, "Bay count:", Object.keys(bays).length);

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
		const renderShelf = (positions, shelfLabel, id = "", bayNumber, hideTitle = false, panelType = null) => {
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

				if (panelType === "side") {
					sortedGroupKeys = sortedGroupKeys.filter((key) =>
						["LS", "CS", "RS"].includes(key)
					);
				} else if (panelType === "back") {
					sortedGroupKeys = sortedGroupKeys.filter((key) => key === "M");
				}
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
										showSku={showSku}
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
											showSku={showSku}
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
										showSku={showSku}
									/>
								))}
							</div>
						))}
					</div>
				</div>
			);
		};

		const headerFixtureValue = [fixtureType, region].filter(Boolean).join("; ");
		const renderHeaderRow = (label, value) =>
			value ? (
				<div className="print-header__row">
					<span className="print-header__label">{label}</span>
					<span className="print-header__value" data-no-translation>{value}</span>
				</div>
			) : null;

		// Shared print header (logos + PDF info fields).
		const renderPrintHeader = ({ rightLogo = brandImage, rightLogoAlt = t("brandLogo") } = {}) => (
			<div className="print-header">
				<div className="print-header__logo print-header__logo--left">
					<img
						src="https://online.vmlogistics.com/wp-content/uploads/2024/02/Sephora_Logo.png"
						alt={t("sephoraLogo")}
						className="left-image"
					/>
				</div>
				<div className="header-text">
					{renderHeaderRow(t("fixture"), headerFixtureValue)}
					{renderHeaderRow(t("updates"), updateSeason)}
					{renderHeaderRow(t("executionDatesLabel"), executionWeek)}
					{renderHeaderRow(t("type"), branding)}
				</div>
				<div className="print-header__logo print-header__logo--right">
					{rightLogo && (
						<img src={rightLogo} alt={rightLogoAlt} className="right-image" />
					)}
				</div>
			</div>
		);

		const renderBlankPageSlotControls = (slot, label, imageUrl) => (
			<div className="noprint instruction-print-blank-page__slot-controls">
				<label className="instruction-print-blank-page__upload-label">
					<span className="instruction-print-blank-page__upload-text">{label}</span>
					<input
						type="file"
						accept="image/*"
						className="instruction-print-blank-page__upload-input"
						onChange={(event) => handleBlankPageImageChange(slot, event)}
					/>
				</label>
				{imageUrl && (
					<>
						<div className="instruction-print-blank-page__scale">
							<button
								type="button"
								className="ui-button ui-widget ui-corner-all ui-button-text-only"
								onClick={() =>
									adjustBlankPageImageScale(slot, -BLANK_PAGE_IMAGE_SCALE_STEP)
								}
							>
								-
							</button>
							<span className="instruction-print-blank-page__scale-value">
								{getBlankPageImageScalePercent(slot)}%
							</span>
							<button
								type="button"
								className="ui-button ui-widget ui-corner-all ui-button-text-only"
								onClick={() =>
									adjustBlankPageImageScale(slot, BLANK_PAGE_IMAGE_SCALE_STEP)
								}
							>
								+
							</button>
						</div>
						<button
							type="button"
							className="ui-button ui-widget ui-corner-all ui-button-text-only"
							onClick={() => removeBlankPageImage(slot)}
						>
							{t("executionInstructionRemoveImage")}
						</button>
					</>
				)}
			</div>
		);

		const renderBlankPageImage = (slot, imageUrl, label) => {
			const scale = getBlankPageImageScale(slot);
			const imageStyle = blankPageHorizontalLayout
				? {
						width: "auto",
						height: "auto",
						maxHeight: `${scale * 12}cm`,
						maxWidth: `${scale * 100}%`,
					}
				: {
						width: `${scale * 100}%`,
						height: "auto",
						maxWidth: `${scale * 100}%`,
						maxHeight: `${scale * 12}cm`,
					};

			return (
				<img
					src={imageUrl}
					alt={label}
					className="instruction-print-blank-page__image"
					style={imageStyle}
				/>
			);
		};

		const renderBlankPage = () => {
			const hasImages = blankPageImages.first || blankPageImages.second;
			const layoutClass = blankPageHorizontalLayout
				? "instruction-print-blank-page--horizontal"
				: "instruction-print-blank-page--vertical";
			const firstImageLabel = blankPageHorizontalLayout
				? t("blankPageLeftImage")
				: t("blankPageTopImage");
			const secondImageLabel = blankPageHorizontalLayout
				? t("blankPageRightImage")
				: t("blankPageBottomImage");

			return (
				<div
					className={`instruction-print-blank-page ${layoutClass}${hasImages ? "" : " instruction-print-blank-page--no-images"}`}
				>
					{renderPrintHeader()}
					<div className="instruction-print-blank-page__body">
						<div className="instruction-print-blank-page__slot">
							{blankPageImages.first &&
								renderBlankPageImage(
									"first",
									blankPageImages.first,
									firstImageLabel
								)}
							{renderBlankPageSlotControls(
								"first",
								firstImageLabel,
								blankPageImages.first
							)}
						</div>
						<hr className="instruction-print-blank-page__divider" aria-hidden="true" />
						<div className="instruction-print-blank-page__slot">
							{blankPageImages.second &&
								renderBlankPageImage(
									"second",
									blankPageImages.second,
									secondImageLabel
								)}
							{renderBlankPageSlotControls(
								"second",
								secondImageLabel,
								blankPageImages.second
							)}
						</div>
					</div>
					<div className="noprint instruction-print-blank-page__layout-control">
						<label className="instruction-print-blank-page__layout-toggle">
							<input
								type="checkbox"
								checked={blankPageHorizontalLayout}
								onChange={(event) =>
									setBlankPageHorizontalLayout(event.target.checked)
								}
							/>
							<span>{t("blankPageLeftRightLayout")}</span>
						</label>
					</div>
				</div>
			);
		};

		const renderGraphicKeyCode = (modifier = "") => (
			<div className={`graphic-key-code${modifier ? ` graphic-key-code--${modifier}` : ""}`}>
				<span className="graphic-key-code__label">{t("keyCodeLabel")}</span>
				<span className="graphic-key-code__item">
					<span className="graphic-key-code__swatch graphic-key-code__swatch--new" />
					<span>{t("newGraphics")}</span>
				</span>
				<span className="graphic-key-code__item">
					<span className="graphic-key-code__swatch graphic-key-code__swatch--move" />
					<span>{t("movingGraphics")}</span>
				</span>
				<span className="graphic-key-code__item">
					<span className="graphic-key-code__swatch graphic-key-code__swatch--discard" />
					<span>{t("discardLabel")}</span>
				</span>
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
						<div className="shelf-update-card__name" data-no-translation>
							{itemLabel}
						</div>
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

		const renderShelfUpdateTitleBar = (pageTitle, type) => {
			const statusLabel = type === "before" ? "BEFORE" : "AFTER";
			const titleBase = pageTitle.replace(/\s[-–]\s(?:BEFORE|AFTER)$/i, "");

			return (
				<div className="shelf-update__title-row">
					<h2 className="shelf-update__title">
						<span className="shelf-update__title-text">{titleBase} - </span>
						<span className="shelf-update__title-status">{statusLabel}</span>
					</h2>
					{renderGraphicKeyCode("shelf-update")}
				</div>
			);
		};

		const getBeforeAfterPageTitle = (entry, type) => {
			const isBefore = type === "before";

			if (entry.panelType === "side") {
				const titleKey = multipleBays
					? isBefore ? "baySidePanelsBefore" : "baySidePanelsAfter"
					: isBefore ? "sidePanelsBefore" : "sidePanelsAfter";
				return multipleBays ? formatText(titleKey, [entry.bay]) : t(titleKey);
			}

			if (entry.panelType === "back") {
				const titleKey = multipleBays
					? isBefore ? "bayBackPanelsBefore" : "bayBackPanelsAfter"
					: isBefore ? "backPanelsBefore" : "backPanelsAfter";
				return multipleBays ? formatText(titleKey, [entry.bay]) : t(titleKey);
			}

			const titleKey = multipleBays
				? isBefore ? "bayShelfBefore" : "bayShelfAfter"
				: isBefore ? "shelfBefore" : "shelfAfter";
			const titleArgs = multipleBays ? [entry.bay, entry.shelf] : [entry.shelf];
			return formatText(titleKey, titleArgs);
		};

		const getCompletedPreviewTitle = (entry) => {
			if (entry.panelType === "side") {
				return t("completedSidePanels");
			}
			if (entry.panelType === "back") {
				return t("completedBackPanels");
			}
			return formatText("completedShelf", [entry.shelf]);
		};

		const renderShelfUpdatePreview = (entry, type) => {
			const isBefore = type === "before";
			const previewItems = isBefore ? entry.beforeItems : entry.afterItems;

			if (previewItems.length === 0) return null;

			return (
				<div className={`shelf-update__preview shelf-update__preview--${type}`}>
					{!isBefore && (
						<h3 className="shelf-update__preview-title">
							{getCompletedPreviewTitle(entry)}
						</h3>
					)}
					{renderShelf(
						previewItems,
						entry.shelf,
						`shelf-update-${type}-${entry.panelType || entry.shelf}`,
						entry.bay,
						true,
						entry.panelType || null
					)}
				</div>
			);
		};

		const renderShelfBeforeAfterPage = (entry, type) => {
			const isBefore = type === "before";
			const pageTitle = getBeforeAfterPageTitle(entry, type);
			const entryKey = entry.panelType || entry.shelf;

			const leftCol = isBefore
				? { title: t("discardLabel"), items: entry.discard, modifier: "discard" }
				: { title: t("newComponents"), items: entry.newComponents, modifier: "new-components" };
			const rightCol = isBefore
				? { title: t("movingOffShelf"), items: entry.movingOff, modifier: "moving-off" }
				: { title: t("movingToShelf"), items: entry.movingTo, modifier: "moving-to" };

			return (
				<div
					className={`shelf-update shelf-update--${type}`}
					key={`shelf-update-${type}-${entry.bay}-${entryKey}`}
					data-bay={entry.bay}
					data-shelf={entry.shelf}
					data-panel-type={entry.panelType || undefined}
					data-type={type}
				>
					{renderPrintHeader()}
					{renderShelfUpdateTitleBar(pageTitle, type)}
					<div className="shelf-update__body">
						{isBefore && renderShelfUpdatePreview(entry, type)}
						<div className="shelf-update__columns">
							{renderBeforeAfterColumn(leftCol.title, leftCol.items, leftCol.modifier)}
							{renderBeforeAfterColumn(rightCol.title, rightCol.items, rightCol.modifier)}
						</div>
						{!isBefore && renderShelfUpdatePreview(entry, type)}
					</div>
				</div>
			);
		};

		const renderShelfBeforeAfterPages = () => {
			if (beforeAfterPrintSequence.length === 0) return null;

			return (
				<div className="shelf-update-pages">
					{beforeAfterPrintSequence.map((entry) => {
						const sheetKey = getExecutionInstructionsSheetKey(entry);
						return (
							<Fragment key={`shelf-update-${sheetKey}`}>
								{renderShelfBeforeAfterPage(entry, "before")}
								{renderShelfBeforeAfterPage(entry, "after")}
								{renderExecutionInstructionsPage(entry)}
							</Fragment>
						);
					})}
				</div>
			);
		};

		const renderExecutionInstructionsPage = (entry) => {
			const sheetKey = getExecutionInstructionsSheetKey(entry);

			return (
				<div className="execution-instructions-page">
					{renderPrintHeader()}
					<div className="execution-instructions-page__heading-row">
						<h2 className="execution-instructions-page__title">
							{t("executionInstructions")}
						</h2>
						{renderGraphicKeyCode("execution-instructions")}
					</div>
					<div className="execution-instructions-page__content">
						{renderExecutionInstructionsContent(sheetKey)}
					</div>
				</div>
			);
		};

		const renderFinalInstructionImagePage = () => (
			<div className="final-instruction-image-page">
				{renderPrintHeader()}
				<div className="final-instruction-image-page__image-frame">
					<img
						src={finalInstructionImageUrl}
						alt={t("instructionSheetFinalGraphic")}
						className="final-instruction-image-page__image"
					/>
				</div>
				<div className="print-only-flex final-instruction-image-page__custom-footer final-instruction-image-page__custom-footer--kohls">
					<span className="final-instruction-image-page__custom-footer-text">
						{t("cleanInstructions")}
					</span>
				</div>
			</div>
		);

		const renderKohlsFinalInstructionImagePage = () => (
			<div className="final-instruction-image-page final-instruction-image-page--kohls">
				{renderPrintHeader({
					rightLogo: kohlsHeaderLogoUrl,
					rightLogoAlt: "Kohl's",
				})}
				<div className="final-instruction-image-page__image-frame">
					<img
						src={kohlsFinalInstructionImageUrl}
						alt="Kohl's instruction sheet reference"
						className="final-instruction-image-page__image"
					/>
				</div>
				<div className="print-only-flex final-instruction-image-page__custom-footer final-instruction-image-page__custom-footer--kohls">
					<span className="final-instruction-image-page__custom-footer-text">
						{t("cleanInstructions")}
					</span>
				</div>
			</div>
		);

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
							showSku={showSku}
						/>
					))}
				</div>
			);

			return (
				<div className="bays-two-up">
					<div className="bays-faces-aligned">
						<div className="bay-headers">
							<div className="bay-col-header">
								<h3 className="graphic-layout-heading">
									{formatText("graphicLayoutBay", [bay1Number])} {titleSuffix}
								</h3>
							</div>
							<div className="bay-col-header">
								<h3 className="graphic-layout-heading">
									{formatText("graphicLayoutBay", [bay2Number])} {titleSuffix}
								</h3>
							</div>
						</div>
						{renderGraphicKeyCode()}
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

		// Panel section: keep side and back panels inside the same printable
		// block so print preview can place them side-by-side on one page.
		const renderBayPanels = (bayNumber, bayData, id, titleSuffix, includeHeader = true) => {
			const showSide = hasSidePanels(bayData.shelfP);
			const showBack = hasBackPanels(bayData.shelfP);
			if (!showSide && !showBack) return null;

			return (
				<div
					className="panel-data-display bay-panels-cell"
					key={`panels-${bayNumber}`}
				>
					{includeHeader && renderPrintHeader()}
					{/* <h3>
						{formatText("backpanelBay", [bayNumber])} {titleSuffix}
					</h3> */}
					<div className="bay-panels-flex">
						{showSide && (
							<div className="side-panels-display">
								<h3>{formatText("bayLabel", [bayNumber])} {titleSuffix} - Side Panel</h3>
								{renderShelf(bayData.shelfP, "P", id, bayNumber, false, "side")}
							</div>
						)}
						{showBack && (
							<div className="back-panels-display">
								<h3>{formatText("bayLabel", [bayNumber])} {titleSuffix} - Back Panel</h3>
								{renderShelf(bayData.shelfP, "P", id, bayNumber, false, "back")}
							</div>
						)}
					</div>
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
							</div>
							<div className="bays-panels-row">
								{renderPrintHeader()}
								{sortedBayEntries.map(([bayNumber, bayData]) =>
									renderBayPanels(bayNumber, bayData, id, titleSuffix, false)
								)}
							</div>
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
								<h3 className="graphic-layout-heading">
									{formatText("graphicLayoutBay", [bayNumber])} {titleSuffix}
								</h3>
								{renderGraphicKeyCode()}
								{Object.entries(bayData.shelves).map(([shelfLabel, positions]) =>
									renderShelf(positions, shelfLabel, id, bayNumber)
								)}
							</div>
							{renderBayPanels(bayNumber, bayData, id, titleSuffix)}
						</div>
					))}
				</>
			);
		};

		// Return the static first print page, then the layouts followed by
		// per-shelf BEFORE/AFTER pages.
		return (
			<>
				{renderBlankPage()}
				{generateLayout(bays)}
				{renderShelfBeforeAfterPages()}
				{renderFinalInstructionImagePage()}
				{renderKohlsFinalInstructionImagePage()}
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
			{renderPrintFooter()}
		</div>
	);
};

export default InstructApp;
