import { __ } from "@wordpress/i18n";
import { useBlockProps } from "@wordpress/block-editor";
import "./editor.scss";

export default function Edit() {
	return (
		<p {...useBlockProps()}>
			{__(
				"vmLogistics Instructions Sheet Gutenburg Block – Admin",
				"vml-fixtures",
			)}
		</p>
	);
}
