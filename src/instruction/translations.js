const defaultStrings = {
	noDataPromotion: "No data: Please select a Promotion.",
	noSkuData: "No SKU data available.",
	pleaseSelectPromotion: "Please select a Promotion",
	sephoraLogo: "Sephora Logo",
	brandLogo: "Brand Logo",
	skuAlt: "SKU %s",
	bayShelf: "BAY %s / SHELF %s",
	bayLabel: "Bay %s",
	shelfLabel: "Shelf %s",
	graphicLayoutBay: "Graphic Layout: Bay %s",
	backpanelBay: "Backpanel: Bay %s",
	green: "GREEN",
	yellow: "YELLOW",
	red: "RED",
	keyCodeLabel: "Key Code:",
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
	showSkuLabels: "Show SKU labels",
	shelfBefore: "SHELF %s - BEFORE",
	shelfAfter: "SHELF %s - AFTER",
	bayShelfBefore: "BAY %s / SHELF %s - BEFORE",
	bayShelfAfter: "BAY %s / SHELF %s - AFTER",
	movingOffShelf: "MOVING OFF SHELF",
	discardLabel: "DISCARD Graphics",
	newComponents: "NEW COMPONENTS",
	movingToShelf: "MOVING TO SHELF",
	completedShelf: "COMPLETED SHELF %s",
	completedSidePanels: "COMPLETED SIDE PANELS",
	completedBackPanels: "COMPLETED BACK PANELS",
	executionInstructions: "EXECUTION INSTRUCTIONS:",
	executionInstructionStep1Label: "Step 1:",
	executionInstructionStep1Body: "Remove and set aside products and components from shelf.",
	executionInstructionStep2Label: "Step 2:",
	executionInstructionStep2Body: "Remove and set aside existing Acrylic. Remove and discard existing Graphic.",
	executionInstructionStep2Note: "Do NOT discard Acrylic, this will be reused.",
	executionInstructionStep3Label: "Step 3:",
	executionInstructionStep3Body: "Insert new/ existing Acrylic and new Graphic into shelf.",
	executionInstructionStep4Label: "Step 4:",
	executionInstructionStep4Body: "Insert new Graphic into existing Acrylic and insert back into shelf.",
	executionInstructionStep5Label: "Step 5:",
	executionInstructionStep5Body: "Insert new Graphic into front of shelf.",
	executionInstructionStep6Label: "Step 6:",
	executionInstructionStep6Body: "Remove and discard existing Graphic",
	executionInstructionStep7Label: "Step 7:",
	executionInstructionStep7Body: "Remove and discard existing Graphic. Do NOT discard Sign, this will be reused.",
	executionInstructionStep8Label: "Step 8:",
	executionInstructionStep8Body: "Insert existing products and components back onto shelf.",
	executionInstructionOverview: "Refer to the overview on the previous page to ensure graphics are placed in the proper order.",
	instructionSheetFinalGraphic: "Instruction Sheet Final Graphic",
	sidePanelsBefore: "SIDE PANELS - BEFORE",
	sidePanelsAfter: "SIDE PANELS - AFTER",
	backPanelsBefore: "BACK PANELS - BEFORE",
	backPanelsAfter: "BACK PANELS - AFTER",
	baySidePanelsBefore: "BAY %s / SIDE PANELS - BEFORE",
	baySidePanelsAfter: "BAY %s / SIDE PANELS - AFTER",
	bayBackPanelsBefore: "BAY %s / BACK PANELS - BEFORE",
	bayBackPanelsAfter: "BAY %s / BACK PANELS - AFTER",
	qtyLabel: "QTY: %s",
	naLabel: "N/A",
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
