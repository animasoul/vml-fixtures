import PropagateLoader from "react-spinners/PropagateLoader";

function Loader() {
	const override = {
		display: "block",
		margin: "0 auto",
		width: "max-content",
		padding: "20px 0",
	};
	return (
		<div className="loading">
			Loading...
			<PropagateLoader color="#008fca" cssOverride={override} />
		</div>
	);
}

export default Loader;
