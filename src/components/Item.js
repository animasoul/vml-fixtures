import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { Tooltip } from "react-tooltip";
import { safeGet } from "../utilities/utilities";
import ItemModal from "./ItemModal";

// Item Component
// Represents an individual item with its details and behavior based on the context.

function Item({ item, context, type }) {
	const [showModal, setShowModal] = useState(false);
	// Create a ref for the tooltip/modal. useRef() will generate a unique reference object.
	const uniqRef = useRef();
	// If uniqRef.current is not already set, generate a unique number or string for it.
	if (!uniqRef.current) {
		uniqRef.current = `uniqId-${Math.random().toString(36).slice(2, 9)}`;
	}
	// Use tooltipRef.current as the id for the Tooltip component
	const uniqId = uniqRef.current;

	const handleItemClick = () => {
		if (context === "store") setShowModal(true);
	};

	// Check for valid item
	if (!item || typeof item !== "object") return null;

	const details = {
		Description: safeGet(item, "Description"),
		Width: safeGet(item, "Width"),
		Height: safeGet(item, "Height"),
		TharsternCode: safeGet(item, "TharsternCode"),
		ProductID: safeGet(item, "ProductID"),
		Category: safeGet(item, "Category"),
		Code: safeGet(item, "Code"),
		StockQty: safeGet(item, "StockQty"),
		Horizontal: safeGet(item, "Horizontal"),
		Vertical: safeGet(item, "Vertical"),
	};

	const tooltipId = `my-tooltip-html-prop-${details.TharsternCode}`;
	const position = `${details.Horizontal}-${details.Vertical}`;
	let halfWidth = details.Width / (type === "panel" ? 2 : 1.4);
	let halfHeight = details.Height / (type === "panel" ? 2 : 1.4);

	const backgroundImage = safeGet(item, "URL1");

	const itemStyle = {
		cursor: "pointer",
		width: `${halfWidth}em`,
		height: `${halfHeight}em`,
		backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
	};

	return (
		<div
			className={`item position-${position}`}
			data-tooltip-id={uniqId}
			data-product-id={details.ProductID}
			data-product-code={details.Code}
			onClick={handleItemClick}
			style={itemStyle}
		>
			{type === "panel" && <p className="smallp">{details.Description}</p>}
			{context === "admin" && (
				<>
					<Tooltip id={uniqId}>
						{Object.entries(details).map(([key, value]) => (
							<p key={key}>
								<strong>{key}:</strong> {value}
							</p>
						))}
					</Tooltip>
					{!backgroundImage && (
						// This will display when backgroundImage is not available
						<p className="smallp">
							{details.Category}, V:{details.Vertical}, H:{details.Horizontal}
						</p>
					)}
				</>
			)}

			{context === "store" && (
				<ItemModal
					modalId={uniqId}
					largeImgSrc={safeGet(item, "URL1")}
					details={details}
					isOpen={showModal}
					onClose={() => setShowModal(false)}
				/>
			)}
		</div>
	);
}

Item.propTypes = {
	item: PropTypes.shape({
		Description: PropTypes.string,
		Width: PropTypes.number,
		Height: PropTypes.number,
		TharsternCode: PropTypes.string.isRequired,
		ProductID: PropTypes.string.isRequired,
		Category: PropTypes.string,
		Code: PropTypes.string,
		StockQty: PropTypes.number,
		Horizontal: PropTypes.string.isRequired,
		Vertical: PropTypes.string.isRequired,
		URL1: PropTypes.string.isRequired,
	}).isRequired,
	context: PropTypes.oneOf(["admin", "store"]).isRequired,
	type: PropTypes.string, // Specify possible values if they're known
};

export default Item;
