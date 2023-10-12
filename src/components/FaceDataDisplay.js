import PropTypes from "prop-types";
import Shelf from "./Shelf";

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
