import { render } from "@wordpress/element";
import InstructApp from "./InstructApp";

const appRoot = document.querySelector(".wp-block-vml-fixtures-instruct");
if (appRoot) {
	render(<InstructApp />, appRoot);
}
