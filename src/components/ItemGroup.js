import PropTypes from "prop-types";
import Item from "./Item";
import { safeGet } from "../utilities/utilities";

function ItemGroup({ items, context }) {
	if (!items) return null;

	const itemsArray = Array.isArray(items) ? items : [items];
	let positionClass = "";

	itemsArray.forEach((item) => {
		const horizontalValue = safeGet(item, "Horizontal");

		if (horizontalValue == 8) {
			positionClass = " group-position-8";
		}
	});

	return (
		<div className={`item-group${positionClass}`}>
			{itemsArray.map((item) => (
				<Item item={item} key={item.ProductID} context={context} />
			))}
		</div>
	);
}

ItemGroup.propTypes = {
	items: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.object),
		PropTypes.object,
	]).isRequired,
};

export default ItemGroup;
