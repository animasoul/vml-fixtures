import { useBlockProps } from "@wordpress/block-editor";

export default function save() {
	return (
		<div {...useBlockProps}>
			<div className="wp-block-vml-fixtures-instruct">Loading...</div>
		</div>
	);
}
