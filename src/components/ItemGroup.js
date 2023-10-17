// ItemGroup Component
// Represents a group of items. Assigns position classes based on item properties.

import PropTypes from "prop-types";
import Item from "./Item";
import { safeGet } from "../utilities/utilities";

function ItemGroup({ items, context, type }) {
	// Validate items prop
	if (!items) return null;

	const itemsArray = Array.isArray(items) ? items : [items];

	// Check if any item in the itemsArray has a horizontal value of 8
	const hasPosition8 = itemsArray.some(
		(item) => safeGet(item, "Horizontal") == 8,
	);
	const positionClass = hasPosition8 ? " group-position-8" : "";

	return (
		<div className={`item-group${positionClass}`}>
			{itemsArray.map((item) => (
				<Item
					item={item}
					key={item.ProductID || item.someOtherUniqueId}
					context={context}
					type={type}
				/>
			))}
		</div>
	);
}

ItemGroup.propTypes = {
	items: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.object),
		PropTypes.object,
	]).isRequired,
	context: PropTypes.string, // Make sure to define what possible values 'context' can have, if known
	type: PropTypes.string, // Same goes for 'type'
};

export default ItemGroup;
