// Desc: Root component for admin app
import Loader from "../components/Loader";
import React, { useState, useEffect, useMemo } from "@wordpress/element";
import Modal from "react-modal";
import { Tooltip } from "react-tooltip";
import { fetchOptionData } from "../services/getOptionService";

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

		let shelves = {}; // Object to hold shelves data
		let shelfP = []; // Array to hold shelf 'P' data

		const sortHorizontalValues = (a, b) => {
			const order = ["LS", "M", "RS"];
			return order.indexOf(a) - order.indexOf(b);
		};

		// Iterate over each SKU object in final_skus
		Object.values(data.final_skus).forEach((sku) => {
			if (sku.positions) {
				sku.positions.forEach((position) => {
					// Skip the position if it's marked for deletion
					if (position.update === "delete") {
						return;
					}

					if (
						position.fixture_type === selectedFixtureType &&
						(!selectedRegion || position.region === selectedRegion)
					) {
						if (position.shelf === "P") {
							shelfP.push({ ...position, ...sku });
						} else {
							if (!shelves[position.shelf]) {
								shelves[position.shelf] = [];
							}
							shelves[position.shelf].push({ ...position, ...sku });
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
						{shelfLabel === "P" ? null : <h3>Shelf {shelfLabel}</h3>}
					</div>
					<div className={`shelf shelf-${shelfLabel}`}>
						{sortedGroupKeys.map((horizontal) => (
							<div className="item-group" key={horizontal}>
								{groupedByHorizontal[horizontal].map((item, index) => (
									<>
										<div
											className={`item position-${item.horizontal}-${item.vertical}`}
											key={index}
										>
											<a
												href="#"
												onClick={() =>
													openModal(
														`${item.ImageURL || data.ImageURL}${item.code}.jpg`,
													)
												}
											>
												<img
													src={`${item.ImageURL || data.ImageURL}${
														item.code
													}.jpg`}
													alt={`SKU ${item.code}`}
													width={item.width * 5}
													height={item.height * 5}
													data-tooltip-id={item.code}
												/>
											</a>
										</div>
										<Tooltip id={item.code}>
											<p>SKU: {item.code}</p>
											<p>Product Type: {item.product_type}</p>
											<p>Material: {item.material}</p>
											<p>Finishing: {item.finishing}</p>
											<p>Width: {item.width}</p>
											<p>Height: {item.height}</p>
											<p>
												Horizontal: {item.horizontal}, Vertical: {item.vertical}
											</p>
										</Tooltip>
									</>
								))}
							</div>
						))}
					</div>
				</div>
			);
		};

		return (
			<>
				<h2>
					{selectedFixtureType} - {selectedRegion}
				</h2>
				<div className="admin-fixture">
					<div className="face-data-display">
						<h3>Face</h3>
						{Object.entries(shelves).map(([shelfLabel, positions]) =>
							renderShelf(positions, shelfLabel),
						)}
					</div>
					<div className="panel-data-display">
						<h3>Panel</h3>
						{shelfP.length > 0 && renderShelf(shelfP, "P")}
					</div>
				</div>
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
			{processAndDisplayData()}
		</div>
	);
};

export default RootApp;
