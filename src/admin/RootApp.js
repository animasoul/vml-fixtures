// Desc: Root component for admin app
import Loader from "../components/Loader";
import React, { useState, useEffect, useMemo } from "@wordpress/element";
import Modal from "react-modal";
import { Tooltip } from "react-tooltip";
import { fetchOptionData } from "../services/getOptionService";
import ShelfRenderer from '../components/ShelfRenderer';
import { getUniqueValues, organizeBayData } from '../utilities/shelfUtils';

const RootApp = () => {
	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedFixtureType, setSelectedFixtureType] = useState(null);
	const [selectedRegion, setSelectedRegion] = useState(null);
	// State for modal
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedImageUrl, setSelectedImageUrl] = useState(null);

	useEffect(() => {
		async function fetchData() {
			try {
				const response = await fetchOptionData();
				if (!response?.data) {
					console.log("Please select a Promotion.");
				} else {
					const jsonData = response.data;
					setData(jsonData);
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

	// Function to get unique values for fixture_type or region
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

		const bays = organizeBayData(data, selectedFixtureType, selectedRegion);

		return (
			<>
				<h2>{selectedFixtureType} - {selectedRegion}</h2>
				{Object.entries(bays).sort(([a], [b]) => a - b).map(([bayNumber, bayData]) => (
					<div key={bayNumber} className="bay-container" id={`bay-${bayNumber}`}>
						{Object.keys(bays).length > 1 && (
							<>
								<h2>Bay {bayNumber}</h2>
								<div className="bay-links">
									{Object.keys(bays)
										.sort((a, b) => a - b)
										.filter(bayNum => bayNum !== bayNumber)  // Filter out current bay
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
							</>
						)}
						<div className="admin-fixture">
							<div className="face-data-display">
								<h3>Face</h3>
								{Object.entries(bayData.shelves).map(([shelfLabel, positions]) => (
									<ShelfRenderer
										key={shelfLabel}
										positions={positions}
										shelfLabel={shelfLabel}
										bayNumber={bayNumber}
										data={data}
										onImageClick={openModal}
										showTooltip={true}
									/>
								))}
							</div>
							<div className="panel-data-display">
								<h3>Panel</h3>
								{bayData.shelfP.length > 0 && (
									<ShelfRenderer
										positions={bayData.shelfP}
										shelfLabel="P"
										bayNumber={bayNumber}
										data={data}
										onImageClick={openModal}
										showTooltip={true}
									/>
								)}
							</div>
						</div>
					</div>
				))}
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
