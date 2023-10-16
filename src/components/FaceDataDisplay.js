import React, { useRef } from "react";
import PropTypes from "prop-types";
import Shelf from "./Shelf";
import AddButton from "./AddButton";
import { gatherProductInfoAndCallAPI } from "../utilities/gatherAndCallAPI";

function FaceDataDisplay({ faceData, context }) {
	// Create a ref for the face data display div
	const faceDisplayRef = useRef(null);

	// Check if faceData is an array
	if (!Array.isArray(faceData)) return null;

	/**
	 * Handle the addition of all fixtures to cart
	 */
	const handleAddAllFixtureClick = async () => {
		// Use the ref to get the faceDisplayElement
		const faceDisplayElement = faceDisplayRef.current;

		if (faceDisplayElement) {
			return gatherProductInfoAndCallAPI(faceDisplayElement);
		}
		throw new Error("Unable to locate face data for addition to cart.");
	};

	return (
		<div className="face-data-display" ref={faceDisplayRef}>
			<h2>Face</h2>
			{faceData.map((shelfData) => {
				const [shelfKey] = Object.keys(shelfData);
				return <Shelf key={shelfKey} shelfData={shelfData} context={context} />;
			})}
			{context === "store" && (
				<div className="footer-btn">
					<AddButton
						onClickHandler={handleAddAllFixtureClick}
						text="Add All Fixture items to cart"
					/>
				</div>
			)}
		</div>
	);
}

FaceDataDisplay.propTypes = {
	faceData: PropTypes.arrayOf(PropTypes.object).isRequired,
	context: PropTypes.string, // Adding context to propTypes for better type safety
};

export default FaceDataDisplay;
