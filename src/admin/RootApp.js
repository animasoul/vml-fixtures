// Desc: Root component for admin app
import Loader from "../components/Loader";
import React, { useState, useEffect, useMemo } from "@wordpress/element";
import Modal from "react-modal";
import { Tooltip } from "react-tooltip";
import { fetchOptionData } from "../services/getOptionService";
import ShelfRenderer from '../components/ShelfRenderer';
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

		const renderTwoUp = () => (
			<div className="bays-two-up">
				<div className="bays-faces-row">
					{sortedBayEntries.map(([bayNumber, bayData]) => (
						<div
							key={bayNumber}
							className="bay-face-cell"
							id={`bay-${bayNumber}`}
						>
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
						</div>
					))}
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
