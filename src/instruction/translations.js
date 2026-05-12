const defaultStrings = {
	noDataPromotion: "No data: Please select a Promotion.",
	noSkuData: "No SKU data available.",
	pleaseSelectPromotion: "Please select a Promotion",
	sephoraLogo: "Sephora Logo",
	brandLogo: "Brand Logo",
	skuAlt: "SKU %s",
	bayShelf: "BAY %s/SHELF %s",
	graphicLayoutBay: "Graphic Layout: Bay %s",
	backpanelBay: "Backpanel: Bay %s",
	green: "GREEN",
	yellow: "YELLOW",
	red: "RED",
	newGraphics: "NEW Graphics",
	movingGraphics: "MOVING Graphics",
	removedGraphics: "REMOVED Graphics",
	layoutDescription:
		"This graphic layout shows all of the graphics on your gondola by location AFTER the update is complete.",
	cleanInstructions: "To clean: Use a dry cloth only - No alcohol based products",
	selectFixture: "Select Fixture",
	selectRegion: "Select Region",
	instructionSheetToPdf: "Instruction sheet to PDF",
	stores: "Stores",
	totalAcrossRegions: "Total across all regions: %s Stores",
	headerInformation: "Enter the header of the PDF information",
	sameUsCaRegions: "This fixture has same US CA regions",
	sameAllRegions: "This fixture has same ALL regions",
	combine: "Combine?",
	fixture: "Fixture:",
	fixtureType: "Fixture Type",
	region: "Region",
	regionLabel: "Region:",
	updates: "Updates:",
	updateSeason: "Update Season",
	executionDates: "Execution Dates",
	executionDatesLabel: "Execution Dates:",
	type: "Type:",
	branding: "Branding",
	enlargeReduceImageSizes: "Enlarge/reduce image sizes",
	toFitPrinterOutput: "to fit printer output",
	uploadPdfFirstPage: "Upload PDF of the first page",
	uploadPdf: "Upload PDF",
	loading: "Loading...",
};

const localizedStrings =
	typeof window !== "undefined" && window.vmlFixturesInstructionText
		? window.vmlFixturesInstructionText
		: {};

const getSeededStrings = () => {
	if (typeof document === "undefined") {
		return {};
	}

	return Array.from(
		document.querySelectorAll("[data-vml-fixtures-instruction-key]"),
	).reduce((strings, node) => {
		const key = node.getAttribute("data-vml-fixtures-instruction-key");

		if (key) {
			strings[key] = node.textContent;
		}

		return strings;
	}, {});
};

export const instructionText = {
	...defaultStrings,
	...localizedStrings,
	...getSeededStrings(),
};

export const t = (key) => instructionText[key] || defaultStrings[key] || key;

export const formatText = (key, replacements = []) => {
	let value = t(key);

	replacements.forEach((replacement) => {
		value = value.replace("%s", replacement);
	});

	return value;
};
