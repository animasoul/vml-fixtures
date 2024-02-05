// Desc: Root component for admin app
import Loader from "../components/Loader";
import React, { useState, useEffect, useMemo } from "@wordpress/element";
import { fetchOptionData } from "../services/getOptionService";
import "./style-index.css";

const InstructApp = () => {
	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedFixtureType, setSelectedFixtureType] = useState(null);
	const [selectedRegion, setSelectedRegion] = useState(null);

	// Get the current URL
	const url = new URL(window.location.href);

	// Get the parameters from the URL
	const brand = url.searchParams.get("brand");
	const promo = url.searchParams.get("promo");
	const initialFixtureType = url.searchParams.get("fixture");
	const initialRegion = url.searchParams.get("region");

	useEffect(() => {
		async function fetchData() {
			try {
				const response = await fetchOptionData(brand, promo);
				if (!response?.data) {
					throw new Error("No data received. Please select a Promotion.");
				} else {
					const jsonData = response.data;
					setData(jsonData);

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

	const processAndDisplayData = () => {
		if (!data || typeof data.final_skus !== "object" || !selectedFixtureType) {
			return <p>No SKU data available. Please select a Fixture.</p>;
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
			const color = "green";

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
											src={`${data.ImageURL}${item.code}.jpg`}
											alt={`SKU ${item.code}`}
											width={item.width * 6}
											height={item.height * 6}
											data-tooltip-id={item.code}
											className={color}
										/>
									</div>
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
						<h3>Graphic Layout:</h3>
						{Object.entries(shelves).map(([shelfLabel, positions]) =>
							renderShelf(positions, shelfLabel),
						)}
					</div>
					<div className="panel-data-display">
						<h3>Backpanel:</h3>
						{shelfP.length > 0 && renderShelf(shelfP, "P")}
					</div>
				</div>
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
			</div>
			{processAndDisplayData()}
		</div>
	);
};

export default InstructApp;
