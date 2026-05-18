import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { Tooltip } from "react-tooltip";
import { safeGet } from "../utilities/utilities";
import ItemModal from "./ItemModal";
import { useFitText } from "./AdminItem";

// Item Component
// Represents an individual item with its details and behavior based on the context.

function Item({ item, context, type, imageUrl, disableAddToCart = false, scale = 1 }) {
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

	// console.log("item", item);

	const details = {
		SKU: safeGet(item, "code"),
		Product_Type: safeGet(item, "product_type"),
		Product_ID: safeGet(item, "product_id"),
		Tharstern_id: safeGet(item, "tharstern_id"),
		Material: safeGet(item, "material"),
		Finishing: safeGet(item, "finishing"),
		Width: safeGet(item, "width"),
		Height: safeGet(item, "height"),
		Horizontal: safeGet(item, "horizontal"),
		Vertical: safeGet(item, "vertical"),
		Bay: safeGet(item, "bay"),
		Shelf: safeGet(item, "shelf"),
	};

	const minItemWidth = 40;
	const baseItemWidth = (details.Width || 0) * 5 * scale;
	const baseItemHeight = (details.Height || 0) * 5 * scale;
	const itemScale =
		baseItemWidth > 0 ? Math.max(1, minItemWidth / baseItemWidth) : 1;
	const itemWidth = Math.round(baseItemWidth * itemScale);
	const itemHeight = Math.round(baseItemHeight * itemScale);

	const [skuRef, skuText] = useFitText(details.SKU || "", itemWidth);

	const itemStyle = {
		cursor: "pointer",
		width: itemWidth ? `${itemWidth}px` : undefined,
	};

	return (
		<div
			className={`item position-${details.Horizontal}-${details.Vertical}`}
			data-tooltip-id={uniqId}
			data-product-id={details.Tharstern_id}
			data-product-code={details.SKU}
			data-sku={details.SKU}
			data-width={details.Width}
			data-height={details.Height}
			data-horizontal={details.Horizontal}
			data-vertical={details.Vertical}
			data-bay={details.Bay}
			data-shelf={details.Shelf}
			onClick={handleItemClick}
			style={itemStyle}
		>
			<img
				src={imageUrl}
				alt={`SKU ${details.SKU}`}
				width={itemWidth}
				height={itemHeight}
			/>
			{context === "store" && (
				<div className="item-sku" ref={skuRef}>
					{skuText}
				</div>
			)}
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
					largeImgSrc={imageUrl}
					details={details}
					isOpen={showModal}
					onClose={() => setShowModal(false)}
					disableAddToCart={disableAddToCart}
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
	imageUrl: PropTypes.string,
	disableAddToCart: PropTypes.bool,
	scale: PropTypes.number,
};

export default Item;
