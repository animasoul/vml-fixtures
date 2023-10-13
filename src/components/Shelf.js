import PropTypes from "prop-types";
import { extractShelfNumber } from "../utilities/utilities";
import ItemGroup from "../components/ItemGroup";

function Shelf({ shelfData }) {
	if (!shelfData || typeof shelfData !== "object") return null;

	const shelfKey = Object.keys(shelfData)[0];
	const horizontalData = shelfData[shelfKey];

	return (
		<div className={`shelf shelf-${extractShelfNumber(shelfKey)}`}>
			<h3>{shelfKey}</h3>
			{horizontalData.map((data, horizontalIndex) => {
				const horizontalKey = Object.keys(data)[0];
				const items = data[horizontalKey];
				return (
					<ItemGroup
						items={items}
						key={data.someUniqueId || `${horizontalKey}-${shelfKey}`}
					/>
				);
			})}
		</div>
	);
}

Shelf.propTypes = {
	shelfData: PropTypes.object.isRequired,
};

export default Shelf;
