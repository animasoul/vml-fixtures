import { render } from "@wordpress/element";
import FrontendApp from "../components/FrontEndApp";

const appRoot = document.querySelector(".wp-block-vml-fixtures-admin");
if (appRoot) {
	render(
		<div className="admin-fixture">
			<React.StrictMode>
				<FrontendApp context="admin" />
			</React.StrictMode>
			<div className="panel-data-display">
				<h2>Panel</h2>
			</div>
		</div>,
		appRoot,
	);
}
