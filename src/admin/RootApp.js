// import React, { useState } from "@wordpress/element";
// import FrontendApp from "../components/FrontEndApp";
// import PromotionsList from "../components/PromotionsList";

// function RootApp() {
// 	const [selectedPromotion, setSelectedPromotion] = useState(null);

// 	return (
// 		<div className="admin-fixture-wrapper">
// 			<PromotionsList
// 				onPromotionSelect={setSelectedPromotion}
// 				selectedPromotion={selectedPromotion}
// 			/>

// 			<FrontendApp context="admin" selectedPromotion={selectedPromotion} />
// 		</div>
// 	);
// }

// export default RootApp;

import React, {
	useState,
	useEffect,
	useMemo,
	useRef,
} from "@wordpress/element";
import { Tooltip } from "react-tooltip";
import { fetchOptionData } from "../services/getOptionService";

const RootApp = () => {
	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedFixtureType, setSelectedFixtureType] = useState(null);
	const [selectedRegion, setSelectedRegion] = useState(null);

	useEffect(() => {
		async function fetchData() {
			try {
				const jsonData = await fetchOptionData();
				setData(jsonData);
				const fixtureTypes = getUniqueValues(jsonData, "fixture_type");
				const regions = getUniqueValues(jsonData, "region");

				// Set the initial selections to the last elements of the arrays
				const initialFixtureType = fixtureTypes[fixtureTypes.length - 1];
				const initialRegion = regions[regions.length - 1];

				setSelectedFixtureType(initialFixtureType);
				setSelectedRegion(initialRegion);
			} catch (error) {
				setError(error.message);
			} finally {
				setIsLoading(false);
			}
		}

		fetchData();
	}, []);

	// Function to get unique values for fixture_type or region
	const getUniqueValues = (jsonData, key) => {
		const values = new Set();
		if (jsonData && jsonData.final_skus) {
			Object.values(jsonData.final_skus).forEach((sku) => {
				sku.positions.forEach((pos) => values.add(pos[key]));
			});
		}
		return Array.from(values).sort();
	};

	const getRegionsForSelectedFixture = () => {
		const regions = new Set();
		if (data && data.final_skus) {
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
			return <p>No SKU data available.</p>;
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
					// Debugging logs
					// console.log("Checking position:", position);
					// console.log(
					// 	"Fixture Type Check:",
					// 	position.fixture_type === selectedFixtureType,
					// );
					// console.log(
					// 	"Region Check:",
					// 	!selectedRegion || position.region === selectedRegion,
					// );
					// console.log("Shelf Check:", position.shelf);
					if (
						position.fixture_type === selectedFixtureType &&
						(!selectedRegion || position.region === selectedRegion)
					) {
						if (position.shelf === "P") {
							shelfP.push({ ...position, ...sku });
							// console.log("Added to shelf P:", position); // Debugging log
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
		// console.log("Shelf P data:", shelfP); // Debugging log

		// Function to render shelf data
		const renderShelf = (positions, shelfLabel) => {
			// Step 1: Group by horizontal value
			let groupedByHorizontal = positions.reduce((acc, item) => {
				let horizontal = item.horizontal;
				if (!acc[horizontal]) {
					acc[horizontal] = [];
				}
				acc[horizontal].push(item);
				return acc;
			}, {});

			// Step 2 & 3: Sort groups by horizontal and items within by vertical
			let sortedGroupKeys = Object.keys(groupedByHorizontal).sort(
				(a, b) => a - b,
			);
			sortedGroupKeys.forEach((horizontal) => {
				groupedByHorizontal[horizontal].sort((a, b) => a.vertical - b.vertical);
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
											<img
												src={`${data.ImageURL}${item.code}.jpg`}
												alt={`SKU ${item.code}`}
												width={item.width * 5}
												height={item.height * 5}
												data-tooltip-id={item.code}
											/>
										</div>
										<Tooltip id={item.code}>
											<p>SKU: {item.code}</p>
											<p>Horizontal: {item.horizontal}</p>
											<p>Vertical: {item.vertical}</p>
											<p>Finishing: {item.finishing}</p>
											<p>Material: {item.material}</p>
											<p>Product ID: {item.product_id}</p>
											<p>Product Type: {item.product_type}</p>
											<p>Width: {item.width}</p>
											<p>Height: {item.height}</p>
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
						<h3>Front</h3>
						{Object.entries(shelves).map(([shelfLabel, positions]) =>
							renderShelf(positions, shelfLabel),
						)}
					</div>
					<div className="panel-data-display">
						<h3>Panel</h3>
						{shelfP.length > 0 && renderShelf(shelfP, "P")}
					</div>
				</div>
			</>
		);
	};
	// Debug: Output raw data and selected values
	console.log("Raw Data:", data);
	// console.log("Selected Fixture Type:", selectedFixtureType);
	// console.log("Selected Region:", selectedRegion);

	if (isLoading) {
		return <p>Loading...</p>;
	}

	if (error) {
		return <p>Error: {error}</p>;
	}

	if (!data) {
		return <p>No data available.</p>;
	}

	return (
		<div className="fixture-select">
			<h4>Select Fixture</h4>
			<ul className="buttons-row">
				{[...uniqueFixtureTypes].reverse().map((type) => (
					<li key={type}>
						<button
							onClick={() => setSelectedFixtureType(type)}
							className={selectedFixtureType === type ? "activeBtn" : ""}
						>
							{type}
						</button>
					</li>
				))}
			</ul>
			{selectedFixtureType && (
				<>
					<h4>Select Region</h4>
					<ul className="buttons-row">
						{[...uniqueRegions].reverse().map((region) => (
							<li key={region}>
								<button
									onClick={() => setSelectedRegion(region)}
									className={selectedRegion === region ? "activeBtn" : ""}
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
