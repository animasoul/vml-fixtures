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

const getLogoUrl = (logo) => {
	if (!logo) return "";
	if (typeof logo === "string") return logo;
	if (typeof logo === "object") {
		return logo.url || logo.sizes?.medium || logo.sizes?.thumbnail || "";
	}
	return "";
};

const RootApp = () => {
	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedFixtureType, setSelectedFixtureType] = useState(null);
	const [selectedRegion, setSelectedRegion] = useState(null);
	const [userRoles, setUserRoles] = useState([]);
	const [brandLogo, setBrandLogo] = useState("");
	const [footerLogo, setFooterLogo] = useState("");
	// State for modal
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedImageUrl, setSelectedImageUrl] = useState(null);

	// Image scaling for print output
	const [scaleChange, setScaleChange] = useState(0);
	const scale = 1 + scaleChange;
	const scalePercentage = Math.round(scale * 100);
	const increaseSize = () => setScaleChange((prev) => prev + 0.1);
	const decreaseSize = () => setScaleChange((prev) => prev - 0.1);
	const handlePrint = (target) => {
		const printClass = `vml-print-${target}`;
		document.body.classList.add(printClass);

		const cleanupPrintClass = () => {
			document.body.classList.remove(printClass);
			window.removeEventListener("afterprint", cleanupPrintClass);
		};

		window.addEventListener("afterprint", cleanupPrintClass);
		window.print();
		setTimeout(cleanupPrintClass, 1000);
	};

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
					setBrandLogo(getLogoUrl(response.logo));
					setFooterLogo(getLogoUrl(response.footerLogo));

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

		// Print-only header rendered at the top of every major printable section.
		// Marked `display: table-header-group` in print CSS so browsers repeat it on
		// each printed page when the parent section spans multiple pages.
		const renderPrintHeader = (bayHeaderContent = null) => (
			<div className="print-only print-page-header">
				<div className="print-page-header-info">
					{brandLogo && (
						<img
							src={brandLogo}
							alt="Brand logo"
							className="print-page-logo"
						/>
					)}
					<div className="print-page-promo">
						{[selectedFixtureType, selectedRegion, data.PromoCode, data.PromoName].filter(Boolean).join(" - ")}
					</div>
				</div>
				{bayHeaderContent && (
					<div className="print-page-bay-headers">{bayHeaderContent}</div>
				)}
			</div>
		);

		const renderPrintFooter = () => (
			<div className="print-only print-page-footer">
				<div className="print-page-footer-inner">
					{footerLogo && (
						<img
							src={footerLogo}
							alt="Graphic Systems"
							className="print-page-footer-logo"
						/>
					)}
				</div>
			</div>
		);

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
						{renderPrintHeader(
							<div className="print-page-bay-header">Bay {bayNumber} Face</div>
						)}
						<h3 className="noprint">Bay {bayNumber} Face</h3>
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
					{(hasSidePanels(bayData.shelfP) || hasBackPanels(bayData.shelfP)) && (
						<div className="bay-panels-cell bay-panels-cell--single">
							{renderPrintHeader(
								<div className="print-page-bay-header">Bay {bayNumber} Panels</div>
							)}
							<div className="bay-panels-flex">
								{hasSidePanels(bayData.shelfP) && (
									<div className="side-panels-display">
										<h3 className="noprint">Side Panels</h3>
										<ShelfRenderer
											key={`${selectedFixtureType}-${selectedRegion}-${bayNumber}-side`}
											positions={bayData.shelfP}
											shelfLabel="P"
											bayNumber={bayNumber}
											data={data}
											onImageClick={openModal}
											showTooltip={true}
											panelType="side"
											scale={scale * 0.75}
										/>
									</div>
								)}
								{hasBackPanels(bayData.shelfP) && (
									<div className="back-panels-display">
										<h3 className="noprint">Back Panels</h3>
										<ShelfRenderer
											key={`${selectedFixtureType}-${selectedRegion}-${bayNumber}-back`}
											positions={bayData.shelfP}
											shelfLabel="P"
											bayNumber={bayNumber}
											data={data}
											onImageClick={openModal}
											showTooltip={true}
											panelType="back"
											scale={scale * 0.75}
										/>
									</div>
								)}
							</div>
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

			// In the 2-bay face view, any shelf+vertical row whose combined
			// returned data width is over this threshold spans both bay columns.
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

			const renderShelfCell = (bayNumber, positions, shelfLabel, hideTitle = false) => {
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
							hideTitle={hideTitle}
						/>
					</div>
				);
			};

			const renderFullWidthVerticalRow = (items, shelfLabel, vertical) => (
				<div
					key={`${shelfLabel}-${vertical}-full`}
					className="shelf-row__wide shelf-row__wide--vertical"
				>
					{sortItemsByBayAndHorizontal(items).map((item, idx) => (
						<AdminItem
							key={`${item.code}-${item.bay}-${item.shelf}-${item.vertical}-${idx}`}
							item={item}
							data={data}
							onImageClick={openModal}
							showTooltip={true}
							scale={scale * 1.5}
						/>
					))}
				</div>
			);

			const twoUpBayHeaderContent = (
				<>
					<div className="print-page-bay-header">Bay {bay1Number} Face</div>
					<div className="print-page-bay-header">Bay {bay2Number} Face</div>
				</>
			);

			return (
				<div className="bays-two-up">
					<div className="bays-faces-aligned">
						{renderPrintHeader(twoUpBayHeaderContent)}
						<div className="bay-headers">
							<div className="bay-col-header" id={`bay-${bay1Number}`}>
								<h3 className="noprint">Bay {bay1Number} Face</h3>
							</div>
							<div className="bay-col-header" id={`bay-${bay2Number}`}>
								<h3 className="noprint">Bay {bay2Number} Face</h3>
							</div>
						</div>
						{allShelfLabels.map((shelfLabel) => {
							const bay1Items = bay1Data.shelves[shelfLabel] || [];
							const bay2Items = bay2Data.shelves[shelfLabel] || [];
							const allVerticals = getSortedVerticals([...bay1Items, ...bay2Items]);

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
									<div className="shelf-row__cells shelf-row__labels">
										<div className="shelf-cell shelf-cell--label">
											<div className="shelf-title common-container">
												BAY {bay1Number}/SHELF {shelfLabel}
											</div>
										</div>
										<div className="shelf-cell shelf-cell--label">
											<div className="shelf-title common-container">
												BAY {bay2Number}/SHELF {shelfLabel}
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
												{renderShelfCell(bay1Number, bay1VerticalItems, shelfLabel, true)}
												{renderShelfCell(bay2Number, bay2VerticalItems, shelfLabel, true)}
											</div>
										);
									})}
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
									{renderPrintHeader(
										<div className="print-page-bay-header">Bay {bayNumber} Panels</div>
									)}
									<div className="bay-panels-flex">
										{showSide && (
											<div className="side-panels-display">
												<h3 className="noprint">Bay {bayNumber} Side Panels</h3>
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
												<h3 className="noprint">Bay {bayNumber} Back Panels</h3>
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
						})}
					</div>
				</div>
			);
		};

		return (
			<>
				<strong>Print</strong>
				<div className="noprint print-toolbar">
					<div className="print-target-controls">
						<button
							className="ui-checkboxradio-label ui-corner-all ui-button ui-widget ui-checkboxradio-radio-label"
							onClick={() => handlePrint("faces")}
						>
							Print faces
						</button>
						<button
							className="ui-checkboxradio-label ui-corner-all ui-button ui-widget ui-checkboxradio-radio-label"
							onClick={() => handlePrint("panels")}
						>
							Print side/back panels
						</button>
					</div>
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
				<h2 className="noprint promo-print-heading">
					{selectedFixtureType} - {selectedRegion}
				</h2>
				{isTwoUp ? renderTwoUp() : sortedBayEntries.map(renderBay)}
				{renderPrintFooter()}
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
