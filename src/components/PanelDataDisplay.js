import React, { useRef } from "react";
import PropTypes from "prop-types";
import ItemGroup from "./ItemGroup";
import AddButton from "./AddButton";
import { gatherProductInfoAndCallAPI } from "../utilities/gatherAndCallAPI";

function PanelDataDisplay({ panelData, context }) {
	// Create a ref for the panel data display div
	const panelDisplayRef = useRef(null);

	// Check if panelData is an array
	if (!Array.isArray(panelData)) return null;

	/**
	 * Handle the addition of all fixtures to cart
	 */
	const handleAddAllFixtureClick = async () => {
		// Use the ref to get the panelDisplayElement
		const panelDisplayElement = panelDisplayRef.current;

		if (panelDisplayElement) {
			return gatherProductInfoAndCallAPI(panelDisplayElement);
		}
		throw new Error("Unable to locate panel data for addition to cart.");
	};

	return (
		<div className="panel-data-display" ref={panelDisplayRef}>
			<h2>Panel</h2>
			<ItemGroup items={panelData} context={context} type="panel" />
			{context === "store" && (
				<div className="footer-btn">
					<AddButton
						onClickHandler={handleAddAllFixtureClick}
						text="Add All Panel items to cart"
					/>
				</div>
			)}
		</div>
	);
}

PanelDataDisplay.propTypes = {
	panelData: PropTypes.arrayOf(PropTypes.object).isRequired,
	context: PropTypes.string, // Adding context to propTypes for better type safety
};

export default PanelDataDisplay;
