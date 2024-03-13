// Desc: Root component for admin app
import Loader from "../components/Loader";
import React, { useState, useEffect, useMemo } from "@wordpress/element";
import { fetchOptionData } from "../services/getOptionService";
import "./style-index.css";
import UploadPdf from "./UploadPdf";

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

	const processAndDisplayData = () => {
		if (!data || typeof data.final_skus !== "object" || !selectedFixtureType) {
			return <p>No SKU data available. Please select a Fixture.</p>;
		}

		let shelves = {}; // Object to hold shelves data for non-deleted items
		let shelvesForDeletion = {}; // Object to hold shelves data for deleted items
		let shelfP = []; // Array to hold shelf 'P' data for non-deleted items
		let shelfPForDeletion = []; // Array to hold shelf 'P' data for deleted items

		const sortHorizontalValues = (a, b) => {
			const order = ["LS", "M", "RS"];
			return order.indexOf(a) - order.indexOf(b);
		};

		// Iterate over each SKU object in final_skus
		Object.values(data.final_skus).forEach((sku) => {
			if (sku.positions) {
				sku.positions.forEach((position) => {
					// Determine the correct storage based on the `update` status at the `position` level
					const isDeleted = position.update === "delete";
					let targetShelves = isDeleted ? shelvesForDeletion : shelves;
					let targetShelfP = isDeleted ? shelfPForDeletion : shelfP;

					if (
						position.fixture_type === selectedFixtureType &&
						(!selectedRegion || position.region === selectedRegion)
					) {
						if (position.shelf === "P") {
							targetShelfP.push({ ...position, ...sku });
						} else {
							if (!targetShelves[position.shelf]) {
								targetShelves[position.shelf] = [];
							}
							targetShelves[position.shelf].push({ ...position, ...sku });
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
						{shelfLabel === "P" ? null : <>B1S{shelfLabel}</>}
					</div>
					<div className={`shelf shelf-${shelfLabel}`}>
						{sortedGroupKeys.map((horizontal) => (
							<div className="item-group" key={horizontal}>
								{groupedByHorizontal[horizontal].map((item, index) => (
									<div
										className={`item position-${item.horizontal}-${item.vertical}`}
										key={index}
									>
										<img
											src={`${item.ImageURL || data.ImageURL}${item.code}.jpg`}
											alt={`SKU ${item.code}`}
											width={item.width * 7 * scale}
											height={item.height * 7 * scale}
											data-tooltip-id={item.code}
											className={item.update}
										/>
									</div>
								))}
							</div>
						))}
					</div>
				</div>
			);
		};

		// Function to generate the layout, duplicated and adjusted for items marked for deletion
		const generateLayout = (shelves, shelfP, titleSuffix = "") => (
			<>
				<h2 className="noprint">
					{selectedFixtureType} - {selectedRegion}
				</h2>
				<div className="admin-fixture">
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
							renderShelf(positions, shelfLabel),
						)}
						<div className="footer-instructions-wrapper">
							<div className="footer-instructions">
								<p>
									<span className="new">GREEN</span> = NEW Graphics
								</p>{" "}
								<p>
									<span className="move">YELLOW</span>= MOVING Graphics
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
							<div className="footer-instructions-wrapper">
								<div className="footer-instructions">
									<p>
										<span className="new">GREEN</span> = NEW Graphics
									</p>{" "}
									<p>
										<span className="move">YELLOW</span>= MOVING Graphics
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
							</div>
						</div>
					)}
				</div>
			</>
		);

		// Render both layouts: one for non-deleted items, and one for deleted items
		return (
			<>
				{generateLayout(shelves, shelfP)}
				{(Object.keys(shelvesForDeletion).length > 0 ||
					shelfPForDeletion.length > 0) &&
					generateLayout(
						shelvesForDeletion,
						shelfPForDeletion,
						"(Deleted Items)",
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
		return <p>No data available. Please select a Promotion</p>;
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
