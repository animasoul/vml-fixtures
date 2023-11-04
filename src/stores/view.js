import { render } from "@wordpress/element";
import StoreApp from "./StoreApp";

const appRoot = document.querySelector(".wp-block-vml-fixtures-store");
if (appRoot) {
	render(<StoreApp />, appRoot);
}
