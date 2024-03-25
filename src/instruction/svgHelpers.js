const SVG_NS = "http://www.w3.org/2000/svg";

function createSvgElement(type, attributes, parent) {
	const element = document.createElementNS(SVG_NS, type);
	for (let attr in attributes) {
		element.setAttribute(attr, attributes[attr]);
	}
	parent.appendChild(element);
	return element;
}

export function drawLineBetweenMovedItems(itemId) {
	const fromElement = document.getElementById(`${itemId}-movedFrom`);
	const toElement = document.getElementById(`${itemId}-movedTo`);
	const svgContainer = document.getElementById(`${itemId}-svg-container`);

	if (fromElement && toElement && svgContainer) {
		const fromRect = fromElement.getBoundingClientRect();
		const toRect = toElement.getBoundingClientRect();
		const svgPosition = svgContainer.getBoundingClientRect();

		// Calculate line start and end positions relative to the SVG container
		const startX = fromRect.left + fromRect.width / 2 - svgPosition.left;
		const startY = fromRect.top + fromRect.height / 2 - svgPosition.top;
		let endX = toRect.left + toRect.width / 2 - svgPosition.left;
		let endY = toRect.top + toRect.height / 2 - svgPosition.top;

		// Clear previous SVG content
		svgContainer.innerHTML = "";

		// Define a unique marker ID to prevent conflicts in case of multiple lines
		const markerId = `arrowhead-${itemId}`;

		// Create the defs element for marker definition
		const defs = createSvgElement("defs", {}, svgContainer);

		// Create the marker element
		const markerWidth = 10;
		const marker = createSvgElement(
			"marker",
			{
				id: markerId,
				markerWidth: markerWidth.toString(),
				markerHeight: "10",
				refX: "0",
				refY: "3",
				orient: "auto",
				markerUnits: "strokeWidth",
			},
			defs,
		);

		// Adjust endX and endY to account for the arrowhead size
		const angle = Math.atan2(endY - startY, endX - startX);
		endX -= markerWidth * 1.5 * Math.cos(angle);
		endY -= markerWidth * 1.5 * Math.sin(angle);

		// Create the polygon element for the arrowhead shape
		createSvgElement(
			"polygon",
			{
				points: "0 0, 10 3, 0 6",
				fill: "red",
			},
			marker,
		);

		// Create the line
		createSvgElement(
			"line",
			{
				x1: startX,
				y1: startY,
				x2: endX,
				y2: endY,
				stroke: "red",
				"stroke-width": "2",
				"marker-end": `url(#${markerId})`,
			},
			svgContainer,
		);
	}
}
