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

import React, { useState, useEffect, useMemo } from "@wordpress/element";
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
				const firstFixtureType = getUniqueValues(jsonData, "fixture_type")[0];
				setSelectedFixtureType(firstFixtureType);
				const firstRegion = getUniqueValues(jsonData, "region")[0];
				setSelectedRegion(firstRegion);
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
		const renderShelf = (positions, shelfLabel) => (
			<div key={shelfLabel}>
				{shelfLabel === "P" ? null : <h4>Shelf {shelfLabel}</h4>}

				{positions.map((item, index) => (
					<div key={index}>
						<p>SKU: {item.code}</p>
						<img
							src={`${data.ImageURL}${item.code}.jpg`}
							alt={`SKU ${item.code}`}
							width={item.width * 30}
							height={item.height * 30}
						/>
						{/* Render other item properties as needed */}
					</div>
				))}
			</div>
		);

		return (
			<div>
				<h2>{selectedFixtureType}</h2>
				<h3>Front</h3>
				{Object.entries(shelves).map(([shelfLabel, positions]) =>
					renderShelf(positions, shelfLabel),
				)}
				<h3>Panel</h3>
				{shelfP.length > 0 && renderShelf(shelfP, "P")}
			</div>
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
		<div>
			<div>
				{uniqueFixtureTypes.map((type) => (
					<button key={type} onClick={() => setSelectedFixtureType(type)}>
						{type}
					</button>
				))}
			</div>
			{selectedFixtureType && (
				<div>
					{uniqueRegions.map((region) => (
						<button key={region} onClick={() => setSelectedRegion(region)}>
							{region}
						</button>
					))}
				</div>
			)}
			{processAndDisplayData()}
		</div>
	);
};

export default RootApp;
