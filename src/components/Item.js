import PropTypes from "prop-types";
import { Tooltip } from "react-tooltip";
import { safeGet } from "../utilities/utilities";

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
			data-tooltip-id={`my-tooltip-html-prop-${details.TharsternCode}`}
			data-product-id={details.ProductID}
			style={{
				width: `${details.Width}em`,
				height: `${details.Height}em`,
				backgroundImage: `url(${safeGet(item, "URL1")})`,
			}}
		>
			<p className="smallp">{details.Description}</p>

			<Tooltip id={`my-tooltip-html-prop-${details.TharsternCode}`}>
				{Object.keys(details).map((key) =>
					key !== "formatted" ? (
						<p key={key}>
							<strong>{key}:</strong> {details[key]}
						</p>
					) : null,
				)}
			</Tooltip>
		</div>
	);
}

Item.propTypes = {
	item: PropTypes.object.isRequired,
};

export default Item;
