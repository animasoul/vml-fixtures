import React, { useRef } from "@wordpress/element";
import { gatherProductInfoAndCallAPI } from "../utilities/gatherAndCallAPI";
import PropTypes from "prop-types";
import Item from "../components/Item";
import AddButton from "../components/AddButton";

function StoreShelf({ positions, shelfLabel, data }) {
	// console.log("positions", positions);
	const shelfRef = useRef(null);
	const handleAddAllShelfItems = async () => {
		try {
			const shelfElement = shelfRef.current;
			// console.log("shelfElement", shelfElement);
			if (shelfElement) {
				await gatherProductInfoAndCallAPI(shelfElement);
			} else {
				throw new Error(
					`Unable to locate items for shelf ${shelfLabel} to add to cart.`,
				);
			}
		} catch (error) {
			console.error("Error in handleAddAllShelfItems:", error);
			// Handle or show error message as required
		}
	};
	const sortHorizontalValues = (a, b) => {
		const order = ["LS", "M", "RS"];
		return order.indexOf(a) - order.indexOf(b);
	};
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
	let sortedGroupKeys = Object.keys(groupedByHorizontal).sort((a, b) => a - b);
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
				{shelfLabel === "P" ? null : (
					<>
						<h3>Shelf {shelfLabel}</h3>
						<AddButton
							onClickHandler={handleAddAllShelfItems}
							text={`Add All Shelf ${shelfLabel} items to cart`}
						/>
					</>
				)}
			</div>
			<div
				className={`shelf shelf-${shelfLabel}`}
				ref={shelfLabel === "P" ? null : shelfRef}
			>
				{sortedGroupKeys.map((horizontal) => (
					<div className="item-group" key={horizontal}>
						{groupedByHorizontal[horizontal].map((item) => (
							<Item
								item={item}
								key={item.product_id}
								context="store"
								type="face"
								imageUrl={`${item.ImageURL || data.ImageURL}${item.code}.jpg`}
							/>
						))}
					</div>
				))}
			</div>
		</div>
	);
}
StoreShelf.propTypes = {
	positions: PropTypes.arrayOf(
		PropTypes.shape({
			fixture_type: PropTypes.string,
			region: PropTypes.string,
			shelf: PropTypes.string,
		}),
	).isRequired,
	shelfLabel: PropTypes.string.isRequired,
	data: PropTypes.shape({
		ImageURL: PropTypes.string,
	}).isRequired,
};

export default StoreShelf;
