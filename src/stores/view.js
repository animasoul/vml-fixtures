import { render } from "@wordpress/element";
import FrontendApp from "../components/FrontEndApp";

const appRoot = document.querySelector(".wp-block-vml-fixtures-store");
if (appRoot) {
	render(
		<div className="store-fixture">
			<React.StrictMode>
				<FrontendApp context="store" />
			</React.StrictMode>
			<div className="panel-data-display">
				<h2>Panel</h2>
			</div>
		</div>,
		appRoot,
	);
}
