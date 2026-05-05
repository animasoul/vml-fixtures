// Desc: Root component for admin app
import Loader from "../components/Loader";
import { useState, useEffect, useMemo } from "@wordpress/element";
import Modal from "react-modal";
import { Tooltip } from "react-tooltip";
import { fetchOptionData } from "../services/getOptionService";
import ShelfRenderer from '../components/ShelfRenderer';
import AdminItem from '../components/AdminItem';
import { getUniqueValues, organizeBayData } from '../utilities/shelfUtils';
import { matchesFixtureType, getRegionsForSelectedFixture } from '../utilities/fixtureUtils';

const RootApp = () => {
	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedFixtureType, setSelectedFixtureType] = useState(null);
	const [selectedRegion, setSelectedRegion] = useState(null);
	const [userRoles, setUserRoles] = useState([]);
	// State for modal
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedImageUrl, setSelectedImageUrl] = useState(null);

	// Image scaling for print output
	const [scaleChange, setScaleChange] = useState(0);
	const scale = 1 + scaleChange;
	const scalePercentage = Math.round(scale * 100);
	const increaseSize = () => setScaleChange((prev) => prev + 0.1);
	const decreaseSize = () => setScaleChange((prev) => prev - 0.1);
	const handlePrint = () => window.print();

	const isAdmin = window.vmlFixturesData?.isAdmin || false;
	const isEditor = window.vmlFixturesData?.isEditor || false;

	// Function to check if user has permission
	const hasAdminPermission = () => {
		// Check if user has the customer role
		const isCustomer = userRoles.includes('customer');

		// Show to everyone except customers
		return !isCustomer;
	};

	useEffect(() => {
		async function fetchData() {
			try {
				const response = await fetchOptionData();
				if (!response?.data) {
					console.log("Please select a Promotion.");
				} else {
					const jsonData = response.data;
					setData(jsonData);

					// Set user roles from the API response
					if (response.userRoles) {
						setUserRoles(response.userRoles);
					}

					const fixtureTypes = getUniqueValues(jsonData, "fixture_type");
					const regions = getUniqueValues(jsonData, "region");

					const initialFixtureType = fixtureTypes[fixtureTypes.length - 1];
					const initialRegion = regions[regions.length - 1];

					setSelectedFixtureType(initialFixtureType);
					setSelectedRegion(initialRegion);
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

	const uniqueFixtureTypes = useMemo(
		() => getUniqueValues(data, "fixture_type"),
		[data],
	);

	const uniqueRegions = useMemo(
		() => selectedFixtureType ? getRegionsForSelectedFixture(data, selectedFixtureType) : [],
		[data, selectedFixtureType],
	);

	// Memoize bays calculation to ensure it recalculates when fixture type or region changes
	const bays = useMemo(() => {
		if (!data || typeof data.final_skus !== "object" || !selectedFixtureType) {
			return {};
		}
		return organizeBayData(data, selectedFixtureType, selectedRegion);
	}, [data, selectedFixtureType, selectedRegion]);

	const openModal = (imageUrl) => {
		setSelectedImageUrl(imageUrl);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedImageUrl(null);
	};

	const processAndDisplayData = () => {
		if (!data || typeof data.final_skus !== "object" || !selectedFixtureType) {
			return <p>No SKU data available. Please select a Promotion.</p>;
		}

		const sortedBayEntries = Object.entries(bays).sort(([a], [b]) => a - b);
		const bayCount = sortedBayEntries.length;
		const isTwoUp = bayCount === 2;

		const hasSidePanels = (shelfP = []) =>
			shelfP.some((i) => ["LS", "CS", "RS"].includes(i.horizontal));
		const hasBackPanels = (shelfP = []) =>
			shelfP.some((i) => i.horizontal === "M");

		const renderBay = ([bayNumber, bayData]) => (
			<div
				key={bayNumber}
				className={`bay-container${isTwoUp ? ' bay-container--two-up' : ''}`}
				id={`bay-${bayNumber}`}
			>
				{bayCount > 1 && (
					<>
						{!isTwoUp && (
							<div className="bay-links">
								{Object.keys(bays)
									.sort((a, b) => a - b)
									.filter(bayNum => bayNum !== bayNumber)
									.map((bayNum) => (
										<a
											key={bayNum}
											href={`#bay-${bayNum}`}
											className="bay-link"
										>
											Go to Bay {bayNum}
										</a>
									))}
							</div>
						)}
					</>
				)}
				<div className="admin-fixture">
					<div className="face-data-display">
						<h3>Bay {bayNumber} Face</h3>
						{Object.entries(bayData.shelves).map(([shelfLabel, positions]) => (
							<ShelfRenderer
								key={shelfLabel}
								positions={positions}
								shelfLabel={shelfLabel}
								bayNumber={bayNumber}
								data={data}
								onImageClick={openModal}
								showTooltip={true}
								scale={scale}
							/>
						))}
					</div>
					{hasSidePanels(bayData.shelfP) && (
						<div className="side-panels-display">
							<h3>Side Panels</h3>
							<ShelfRenderer
								key={`${selectedFixtureType}-${selectedRegion}-${bayNumber}-side`}
								positions={bayData.shelfP}
								shelfLabel="P"
								bayNumber={bayNumber}
								data={data}
								onImageClick={openModal}
								showTooltip={true}
								panelType="side"
								scale={scale}
							/>
						</div>
					)}
					{hasBackPanels(bayData.shelfP) && (
						<div className="back-panels-display">
							<h3>Back Panels</h3>
							<ShelfRenderer
								key={`${selectedFixtureType}-${selectedRegion}-${bayNumber}-back`}
								positions={bayData.shelfP}
								shelfLabel="P"
								bayNumber={bayNumber}
								data={data}
								onImageClick={openModal}
								showTooltip={true}
								panelType="back"
								scale={scale}
							/>
						</div>
					)}
				</div>
			</div>
		);

		const renderTwoUp = () => {
			const [[bay1Number, bay1Data], [bay2Number, bay2Data]] = sortedBayEntries;

			// Union of shelf labels across both bays, numerically sorted (with string fallback)
			const allShelfLabels = [...new Set([
				...Object.keys(bay1Data.shelves),
				...Object.keys(bay2Data.shelves),
			])].sort((a, b) => {
				const an = parseFloat(a);
				const bn = parseFloat(b);
				if (!isNaN(an) && !isNaN(bn)) return an - bn;
				return String(a).localeCompare(String(b));
			});

			// Items wider than this threshold (raw API width) get pulled out and
			// rendered centered across both bay columns at the bottom of the row.
			const WIDE_ITEM_THRESHOLD = 50;
			const itemWidthNum = (i) => parseFloat(i?.width);
			const isWideItem = (i) => {
				const w = itemWidthNum(i);
				return Number.isFinite(w) && w > WIDE_ITEM_THRESHOLD;
			};

			const renderShelfCell = (bayNumber, positions, shelfLabel) => {
				if (!positions || positions.length === 0) {
					return <div className="shelf-cell shelf-cell--empty" />;
				}
				return (
					<div className="shelf-cell">
						<ShelfRenderer
							positions={positions}
							shelfLabel={shelfLabel}
							bayNumber={bayNumber}
							data={data}
							onImageClick={openModal}
							showTooltip={true}
							scale={scale}
						/>
					</div>
				);
			};

			return (
				<div className="bays-two-up">
					<div className="bays-faces-aligned">
						<div className="bay-headers">
							<div className="bay-col-header" id={`bay-${bay1Number}`}>
								<h3>Bay {bay1Number} Face</h3>
							</div>
							<div className="bay-col-header" id={`bay-${bay2Number}`}>
								<h3>Bay {bay2Number} Face</h3>
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

							// Debug: surface any items with a non-parseable width
							const unparseable = [...bay1Items, ...bay2Items].filter(
								(i) => i.width !== undefined && !Number.isFinite(parseFloat(i.width))
							);
							if (unparseable.length > 0) {
								console.warn(
									`Shelf ${shelfLabel}: items with non-numeric width`,
									unparseable.map((i) => ({ code: i.code, width: i.width }))
								);
							}

							return (
								<div key={shelfLabel} className="shelf-row">
									<div className="shelf-row__cells">
										{renderShelfCell(bay1Number, bay1Regular, shelfLabel)}
										{renderShelfCell(bay2Number, bay2Regular, shelfLabel)}
									</div>
									{wideItems.length > 0 && (
										<div className="shelf-row__wide">
											{wideItems.map((item, idx) => (
												<AdminItem
													key={`${item.code}-${idx}`}
													item={item}
													data={data}
													onImageClick={openModal}
													showTooltip={true}
													scale={scale * 2}
												/>
											))}
										</div>
									)}
								</div>
							);
						})}
					</div>
					<div className="bays-panels-row">
						{sortedBayEntries.map(([bayNumber, bayData]) => {
							const showSide = hasSidePanels(bayData.shelfP);
							const showBack = hasBackPanels(bayData.shelfP);
							if (!showSide && !showBack) return null;
							return (
								<div key={bayNumber} className="bay-panels-cell">
									{showSide && (
										<div className="side-panels-display">
											<h3>Bay {bayNumber} Side Panels</h3>
											<ShelfRenderer
												key={`${selectedFixtureType}-${selectedRegion}-${bayNumber}-side`}
												positions={bayData.shelfP}
												shelfLabel="P"
												bayNumber={bayNumber}
												data={data}
												onImageClick={openModal}
												showTooltip={true}
												panelType="side"
												scale={scale}
											/>
										</div>
									)}
									{showBack && (
										<div className="back-panels-display">
											<h3>Bay {bayNumber} Back Panels</h3>
											<ShelfRenderer
												key={`${selectedFixtureType}-${selectedRegion}-${bayNumber}-back`}
												positions={bayData.shelfP}
												shelfLabel="P"
												bayNumber={bayNumber}
												data={data}
												onImageClick={openModal}
												showTooltip={true}
												panelType="back"
												scale={scale}
											/>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			);
		};

		return (
			<>
				<strong>Print</strong>
				<div className="noprint print-toolbar">
					<button
						className="ui-checkboxradio-label ui-corner-all ui-button ui-widget ui-checkboxradio-radio-label"
						onClick={handlePrint}
					>
						Print bays
					</button>
					<div className="scale-controls">
						<span>Enlarge/reduce image sizes to fit printer output: {scalePercentage}%</span>
						<button
							className="ui-checkboxradio-label ui-corner-all ui-button ui-widget ui-checkboxradio-radio-label"
							onClick={decreaseSize}
							aria-label="Decrease image size"
						>
							-
						</button>
						<button
							className="ui-checkboxradio-label ui-corner-all ui-button ui-widget ui-checkboxradio-radio-label"
							onClick={increaseSize}
							aria-label="Increase image size"
						>
							+
						</button>
					</div>
				</div>
				<h2>{selectedFixtureType} - {selectedRegion}</h2>
				{isTwoUp ? renderTwoUp() : sortedBayEntries.map(renderBay)}
				<Modal
					isOpen={isModalOpen}
					onRequestClose={closeModal}
					contentLabel="Image Modal"
					shouldCloseOnEsc={true}
					shouldCloseOnOverlayClick={true}
					style={{
						content: {
							top: "50%",
							left: "50%",
							right: "auto",
							bottom: "auto",
							marginRight: "-50%",
							transform: "translate(-50%, -50%)",
							width: "auto",
							maxHeight: "90%",
							maxWidth: "80%",
							zIndex: "1000",
							borderRadius: "20px",
						},
						overlay: {
							backgroundColor: "#0a090952",
							position: "fixed",
							top: "0",
							left: "0",
							right: "0",
							bottom: "0",
						},
					}}
				>
					<img src={selectedImageUrl} alt="Full Size" />
					<button onClick={closeModal}>Close</button>
				</Modal>
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
			{processAndDisplayData()}
		</div>
	);
};

export default RootApp;
