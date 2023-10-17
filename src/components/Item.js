import React, { useState } from "react";
import PropTypes from "prop-types";
import { Tooltip } from "react-tooltip";
import { safeGet } from "../utilities/utilities";
import ItemModal from "./ItemModal";

function Item({ item, context, type }) {
	// State to control modal visibility
	const [showModal, setShowModal] = useState(false);

	// Open the modal
	const handleOpenModal = () => {
		setShowModal(true);
	};

	// Close the modal
	const handleCloseModal = () => {
		setShowModal(false);
	};

	// Check if the provided item is valid
	if (!item || typeof item !== "object") return null;

	// Extract details from the item object
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

	const position = `${details.Horizontal}-${details.Vertical}`;
	let halfWidth = details.Width / 1.4;
	let halfHeight = details.Height / 1.4;
	if (type === "panel") {
		halfWidth = details.Width / 2;
		halfHeight = details.Height / 2;
	}

	return (
		<div
			className={`item position-${position}`}
			data-tooltip-id={`my-tooltip-html-prop-${details.TharsternCode}`}
			data-product-id={details.ProductID}
			data-product-code={details.Code}
			onClick={() => {
				if (context === "store") handleOpenModal();
			}}
			style={{
				cursor: "pointer",
				width: `${halfWidth}em`,
				height: `${halfHeight}em`,
				backgroundImage: `url(${safeGet(item, "URL1")})`,
			}}
		>
			{type === "panel" && <p className="smallp">{details.Description}</p>}
			{/* Optionally display item details for admin context */}
			{context === "admin" && (
				<Tooltip id={`my-tooltip-html-prop-${details.TharsternCode}`}>
					{Object.keys(details).map((key) =>
						key !== "formatted" ? (
							<p key={key}>
								<strong>{key}:</strong> {details[key]}
							</p>
						) : null,
					)}
				</Tooltip>
			)}

			{/* Display the modal if context is "store" */}
			{context === "store" && (
				<ItemModal
					modalId={`modal-${details.TharsternCode}`}
					largeImgSrc={safeGet(item, "URL1")}
					details={details}
					isOpen={showModal} // Passing down the state
					onClose={handleCloseModal} // Passing down the method to close the modal
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
		TharsternCode: PropTypes.string,
		ProductID: PropTypes.string,
		Code: PropTypes.string,
		StockQty: PropTypes.number,
		Horizontal: PropTypes.string,
		Vertical: PropTypes.string,
		URL1: PropTypes.string,
	}).isRequired,
	context: PropTypes.oneOf(["admin", "store"]).isRequired,
};

export default Item;
