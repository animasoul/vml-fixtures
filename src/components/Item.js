import React, { useState } from "react";
import PropTypes from "prop-types";
import { Tooltip } from "react-tooltip";
import { safeGet } from "../utilities/utilities";
import ItemModal from "./ItemModal";

// Item Component
// Represents an individual item with its details and behavior based on the context.

function Item({ item, context, type }) {
	const [showModal, setShowModal] = useState(false);

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
		Code: safeGet(item, "Code"),
		StockQty: safeGet(item, "StockQty"),
		Horizontal: safeGet(item, "Horizontal"),
		Vertical: safeGet(item, "Vertical"),
	};

	const tooltipId = `my-tooltip-html-prop-${details.TharsternCode}`;
	const position = `${details.Horizontal}-${details.Vertical}`;
	let halfWidth = details.Width / (type === "panel" ? 2 : 1.4);
	let halfHeight = details.Height / (type === "panel" ? 2 : 1.4);

	const itemStyle = {
		cursor: "pointer",
		width: `${halfWidth}em`,
		height: `${halfHeight}em`,
		backgroundImage: `url(${safeGet(item, "URL1")})`,
	};

	return (
		<div
			className={`item position-${position}`}
			data-tooltip-id={tooltipId}
			data-product-id={details.ProductID}
			data-product-code={details.Code}
			onClick={handleItemClick}
			style={itemStyle}
		>
			{type === "panel" && <p className="smallp">{details.Description}</p>}
			{context === "admin" && (
				<Tooltip id={tooltipId}>
					{Object.entries(details).map(([key, value]) => (
						<p key={key}>
							<strong>{key}:</strong> {value}
						</p>
					))}
				</Tooltip>
			)}

			{context === "store" && (
				<ItemModal
					modalId={`modal-${details.TharsternCode}`}
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
