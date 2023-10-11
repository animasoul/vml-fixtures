import PropTypes from "prop-types";

/**
 * Utility to safely get a value from an object.
 *
 * @param {Object} obj - The object to fetch value from.
 * @param {string} key - The key to fetch value for.
 * @param {any} defaultValue - The value to return if the key doesn't exist.
 * @returns {any} - The value from the object or default value.
 */
const safeGet = (obj, key, defaultValue = "") => obj?.[key] ?? defaultValue;

/**
 * Utility to extract the shelf number from a given string.
 *
 * @param {string} str - The string containing shelf number.
 * @returns {string} - The extracted shelf number.
 */
const extractShelfNumber = (str) => str.replace(/\D/g, "");

function Item({ item }) {
	// It's good to assert the type of props at the start of components
	if (!item || typeof item !== "object") return null;

	const details = {
		Description: safeGet(item, "Description"),
		Width: safeGet(item, "Width"),
		Height: safeGet(item, "Height"),
		TharsternCode: safeGet(item, "TharsternCode"),
		Horizontal: safeGet(item, "Horizontal"),
		Vertical: safeGet(item, "Vertical"),
	};

	const position = `${details.Horizontal}-${details.Vertical}`;

	return (
		<div
			className={`item position-${position}`}
			data-product-id={details.ProductID}
			style={{
				width: `${details.Width}em`,
				height: `${details.Height}em`,
				backgroundImage: `url(${safeGet(item, "URL1")})`,
			}}
		>
			<p className="smallp">{details.Description}</p>
			<div className="details">
				{Object.keys(details).map((key) =>
					key !== "formatted" ? (
						<p key={key}>
							<strong>{key}:</strong> {details[key]}
						</p>
					) : null,
				)}
			</div>
		</div>
	);
}

Item.propTypes = {
	item: PropTypes.object.isRequired,
};

function ItemGroup({ items }) {
	if (!items) return null;

	const itemsArray = Array.isArray(items) ? items : [items];
	let positionClass = "";

	itemsArray.forEach((item) => {
		const horizontalValue = safeGet(item, "Horizontal");
		const verticalValue = safeGet(item, "Vertical");

		if (horizontalValue == 8 && verticalValue == 2) {
			positionClass = " group-position-8-2";
		}
	});

	return (
		<div className={`item-group${positionClass}`}>
			{itemsArray.map((item) => (
				<Item item={item} key={item.ProductID} />
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

function Shelf({ shelfData }) {
	if (!shelfData || typeof shelfData !== "object") return null;

	const shelfKey = Object.keys(shelfData)[0];
	const horizontalData = shelfData[shelfKey];

	return (
		<div className={`shelf shelf-${extractShelfNumber(shelfKey)}`}>
			<h2>{shelfKey}</h2>
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

function FaceDataDisplay({ faceData }) {
	if (!Array.isArray(faceData)) return null;

	return (
		<div className="face-data-display">
			{faceData.map((shelfData) => {
				const shelfKey = Object.keys(shelfData)[0]; // Assuming the shelfKey is unique
				return <Shelf key={shelfKey} shelfData={shelfData} />;
			})}
		</div>
	);
}

FaceDataDisplay.propTypes = {
	faceData: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default FaceDataDisplay;
