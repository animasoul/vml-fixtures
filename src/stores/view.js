import { render } from "@wordpress/element";
import FrontendApp from "../components/FrontEndApp";

const appRoot = document.querySelector(".wp-block-vml-fixtures-store");
if (appRoot) {
	render(
		<React.StrictMode>
			<FrontendApp context="store" />
		</React.StrictMode>,
		appRoot,
	);
}
