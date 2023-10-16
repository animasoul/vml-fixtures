import { useState } from "@wordpress/element";
import FrontendApp from "../components/FrontEndApp";

function RootApp() {
	const [selectedParam, setSelectedParam] = useState("defaultParam");

	const handleButtonClick = (param) => {
		setSelectedParam(param);
	};

	return (
		<div className="admin-fixture-wrapper">
			<div className="buttons-row">
				<button
					onClick={() => handleButtonClick("param1")}
					className="activeBtn"
				>
					ENDCAP
				</button>
				<button onClick={() => handleButtonClick("param2")}>SOTF</button>
				<button onClick={() => handleButtonClick("param3")}>Button 3</button>
			</div>
			<div className="admin-fixture">
				<React.StrictMode>
					<FrontendApp context="admin" selectedParam={selectedParam} />
				</React.StrictMode>
				<div className="panel-data-display">
					<h2>Panel</h2>
				</div>
			</div>
		</div>
	);
}

export default RootApp;
