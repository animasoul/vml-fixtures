// Shelf Component
// Represents a shelf in a store with items and provides an option to add all items to the cart.

import React, { useRef } from "react";
import PropTypes from "prop-types";
import AddButton from "./AddButton";
import { extractShelfNumber } from "../utilities/utilities";
import ItemGroup from "../components/ItemGroup";
import { gatherProductInfoAndCallAPI } from "../utilities/gatherAndCallAPI";

function Shelf({ shelfData, context }) {
	const shelfRef = useRef(null);

	// Check for valid shelfData
	if (
		!shelfData ||
		typeof shelfData !== "object" ||
		!Object.keys(shelfData).length
	) {
		return null;
	}

	const handleAddAllShelfItems = async () => {
		try {
			const shelfElement = shelfRef.current;
			if (shelfElement) {
				await gatherProductInfoAndCallAPI(shelfElement);
			} else {
				throw new Error(
					`Unable to locate items for shelf ${shelfKey} to add to cart.`,
				);
			}
		} catch (error) {
			console.error("Error in handleAddAllShelfItems:", error);
			// Handle or show error message as required
		}
	};

	const shelfKey = Object.keys(shelfData)?.[0];
	const horizontalData = shelfData[shelfKey];

	return (
		<div className={`face-shelf face-shelf-${extractShelfNumber(shelfKey)}`}>
			<div className="shelf-title common-container">
				<h3>{shelfKey}</h3>
				{context === "store" && (
					<AddButton
						onClickHandler={handleAddAllShelfItems}
						text={`Add All ${shelfKey} items to cart`}
					/>
				)}
			</div>
			<div
				className={`shelf shelf-${extractShelfNumber(shelfKey)}`}
				ref={shelfRef}
			>
				{horizontalData.map((data, horizontalIndex) => {
					const horizontalKey = Object.keys(data)?.[0];
					const items = data[horizontalKey];
					return (
						<ItemGroup
							items={items}
							key={data.someUniqueId || `${horizontalKey}-${horizontalIndex}`}
							context={context}
							type="shelf"
						/>
					);
				})}
			</div>
		</div>
	);
}

Shelf.propTypes = {
	shelfData: PropTypes.object.isRequired,
	context: PropTypes.string.isRequired,
};

export default Shelf;
