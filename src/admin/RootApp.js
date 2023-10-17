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
				<button onClick={() => handleButtonClick("param4")}>Button 4</button>
			</div>

			<React.StrictMode>
				<FrontendApp context="admin" selectedParam={selectedParam} />
			</React.StrictMode>
		</div>
	);
}

export default RootApp;
