import React from "react";
import { useFitText } from "./AdminItem";
import { formatText } from "../instruction/translations";

// Instruction-side counterpart to AdminItem: same dimensional + SKU-label
// logic, but without the modal anchor / tooltip. Preserves the InstructApp
// data-attributes, update-class border, moved-item slot and "moved" SVG
// overlay so existing instruction features keep working.
const InstructionItem = ({ item, data, scale = 1, id = "" }) => {
	if (!item?.code || !data?.Customer) {
		console.error("Missing required data for InstructionItem:", {
			hasItem: !!item,
			hasCode: !!item?.code,
			hasCustomer: !!data?.Customer,
		});
		return null;
	}

	const imageUrl = `${item.ImageURL || data.ImageURL}${data.Customer}-${item.code}.jpg`;

	const minItemWidth = 40;
	const baseItemWidth = item.width * 5 * scale;
	const baseItemHeight = item.height * 5 * scale;
	const itemScale = baseItemWidth > 0 ? Math.max(1, minItemWidth / baseItemWidth) : 1;
	const itemWidth = Math.round(baseItemWidth * itemScale);
	const itemHeight = Math.round(baseItemHeight * itemScale);

	const [skuRef, skuText] = useFitText(item.code, itemWidth);

	const isMovedView = id === "moved";

	return (
		<div
			className={`item position-${item.horizontal}-${item.vertical}`}
			style={{ width: itemWidth }}
		>
			{item.moved_item ? (
				<div
					className="moved-item"
					style={{
						width: `${itemWidth}px`,
						height: `${itemHeight}px`,
					}}
					id={`${item.code}-movedFrom`}
				/>
			) : (
				<img
					src={imageUrl}
					alt={formatText("skuAlt", [item.code])}
					width={itemWidth}
					height={itemHeight}
					{...(isMovedView && { id: `${item.code}-movedTo` })}
					className={item.update}
					data-bay={item.bay}
					data-shelf={item.shelf}
					data-horizontal={item.horizontal}
					data-vertical={item.vertical}
					data-height={item.height}
					data-width={item.width}
				/>
			)}
			<div className="item-sku" ref={skuRef}>
				{skuText}
			</div>
			{isMovedView && item.moved_item && (
				<svg
					id={`${item.code}-svg-container`}
					style={{
						position: "absolute",
						top: "0",
						left: "0",
						width: "100%",
						height: "100%",
						zIndex: "1000",
					}}
				/>
			)}
		</div>
	);
};

export default InstructionItem;
