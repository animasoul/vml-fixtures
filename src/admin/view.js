import { render } from "@wordpress/element";
import RootApp from "./RootApp";

const appRoot = document.querySelector(".wp-block-vml-fixtures-admin");
if (appRoot) {
	render(<RootApp />, appRoot);
}
