import {
	createLocationKey,
	matchesFixtureType,
	matchesRegion,
} from "../utilities/fixtureUtils";

const createPreviewItemKey = (item) =>
	[item.code, item.bay, item.shelf, item.horizontal, item.vertical].join("|");

const addUniquePreviewItem = (items, item) => {
	const key = createPreviewItemKey(item);

	if (!items.some((existingItem) => createPreviewItemKey(existingItem) === key)) {
		items.push(item);
	}
};

const createEmptyBeforeAfterEntry = (fields) => ({
	beforeItems: [],
	afterItems: [],
	discard: [],
	movingOff: [],
	newComponents: [],
	movingTo: [],
	...fields,
});

export const hasBeforeAfterChanges = (entry) =>
	entry.discard.length > 0 ||
	entry.movingOff.length > 0 ||
	entry.newComponents.length > 0 ||
	entry.movingTo.length > 0;

export const getPanelType = (horizontal) => {
	const value = String(horizontal);
	if (["LS", "CS", "RS"].includes(value)) {
		return "side";
	}
	if (value === "M") {
		return "back";
	}
	return null;
};

const applyBeforeAfterCategorization = (target, position, itemData) => {
	const isMoveFromPosition = position.update === "move" && position.moved_item;
	const isMoveToPosition = position.update === "move" && !position.moved_item;

	if (position.update !== "new" && !isMoveToPosition) {
		addUniquePreviewItem(target.beforeItems, {
			...itemData,
			update:
				position.update === "delete" || isMoveFromPosition
					? position.update
					: "keep",
			moved_item: false,
		});
	}

	if (position.update !== "delete" && !isMoveFromPosition) {
		addUniquePreviewItem(target.afterItems, {
			...itemData,
			update:
				position.update === "new" || isMoveToPosition
					? position.update
					: "keep",
			moved_item: false,
		});
	}

	if (position.update === "delete") {
		target.discard.push(itemData);
	} else if (position.update === "new") {
		target.newComponents.push(itemData);
	} else if (position.update === "move") {
		if (position.moved_item) {
			target.movingOff.push(itemData);
		} else {
			target.movingTo.push(itemData);
		}
	}
};

const sortShelfEntries = (a, b) => {
	const an = parseFloat(a.shelf);
	const bn = parseFloat(b.shelf);
	if (Number.isFinite(an) && Number.isFinite(bn)) {
		return an - bn;
	}
	return String(a.shelf).localeCompare(String(b.shelf));
};

export const hasSidePanels = (shelfP = []) =>
	shelfP.some((item) => ["LS", "CS", "RS"].includes(item.horizontal));

export const hasBackPanels = (shelfP = []) =>
	shelfP.some((item) => item.horizontal === "M");

/**
 * Builds the bay/shelf layout used by the instruction sheet main view.
 * Preserves the instruction-specific duplicate-location rules rather than
 * using organizeBayData(), which resolves conflicts differently elsewhere.
 */
export const buildInstructionBays = (data, selectedFixtureType, selectedRegion) => {
	const bestPositionsMap = new Map();

	Object.values(data.final_skus).forEach((sku) => {
		if (!sku.positions || !Array.isArray(sku.positions)) {
			return;
		}

		sku.positions.forEach((position) => {
			if (position.update === "delete") {
				return;
			}

			if (
				!matchesFixtureType(position.fixture_type, selectedFixtureType) ||
				!matchesRegion(position, selectedRegion)
			) {
				return;
			}

			const locationKey = createLocationKey(position);

			if (bestPositionsMap.has(locationKey)) {
				const existingPosition = bestPositionsMap.get(locationKey);

				if (existingPosition.sku.code !== sku.code) {
					console.warn("InstructApp - Multiple SKUs at same location:", {
						location: locationKey,
						existingSku: existingPosition.sku.code,
						newSku: sku.code,
					});
					return;
				}

				const exactMatchCurrent = position.fixture_type === selectedFixtureType;
				const exactMatchExisting =
					existingPosition.position.fixture_type === selectedFixtureType;

				if (exactMatchCurrent && !exactMatchExisting) {
					bestPositionsMap.set(locationKey, { position, sku });
					console.log(
						"InstructApp - Replaced with exact fixture type match:",
						position.fixture_type
					);
				}
			} else {
				bestPositionsMap.set(locationKey, { position, sku });
			}
		});
	});

	const bays = {};

	bestPositionsMap.forEach(({ position, sku }) => {
		const bay = position.bay || 1;

		if (!bays[bay]) {
			bays[bay] = {
				shelves: {},
				shelfP: [],
			};
		}

		if (position.shelf === "P") {
			bays[bay].shelfP.push({ ...position, ...sku });
		} else {
			if (!bays[bay].shelves[position.shelf]) {
				bays[bay].shelves[position.shelf] = [];
			}
			bays[bay].shelves[position.shelf].push({ ...position, ...sku });
		}
	});

	return bays;
};

/**
 * Builds per-shelf BEFORE/AFTER categorisation for instruction print pages.
 */
export const buildBeforeAfterByBayShelf = (
	data,
	selectedFixtureType,
	selectedRegion
) => {
	const beforeAfterByBayShelf = {};

	Object.values(data.final_skus).forEach((sku) => {
		if (!sku.positions || !Array.isArray(sku.positions)) {
			return;
		}

		sku.positions.forEach((position) => {
			if (
				!matchesFixtureType(position.fixture_type, selectedFixtureType) ||
				!matchesRegion(position, selectedRegion)
			) {
				return;
			}

			const bay = position.bay || 1;
			const shelf = position.shelf;
			if (shelf === "P") {
				return;
			}

			const key = `${bay}|${shelf}`;
			if (!beforeAfterByBayShelf[key]) {
				beforeAfterByBayShelf[key] = createEmptyBeforeAfterEntry({ bay, shelf });
			}

			applyBeforeAfterCategorization(
				beforeAfterByBayShelf[key],
				position,
				{ ...position, ...sku }
			);
		});
	});

	return beforeAfterByBayShelf;
};

/**
 * Builds per-bay side/back panel BEFORE/AFTER categorisation for print pages.
 */
export const buildBeforeAfterByBayPanel = (
	data,
	selectedFixtureType,
	selectedRegion
) => {
	const beforeAfterByBayPanel = {};

	Object.values(data.final_skus).forEach((sku) => {
		if (!sku.positions || !Array.isArray(sku.positions)) {
			return;
		}

		sku.positions.forEach((position) => {
			if (
				!matchesFixtureType(position.fixture_type, selectedFixtureType) ||
				!matchesRegion(position, selectedRegion)
			) {
				return;
			}

			if (position.shelf !== "P") {
				return;
			}

			const panelType = getPanelType(position.horizontal);
			if (!panelType) {
				return;
			}

			const bay = position.bay || 1;
			const key = `${bay}|${panelType}`;
			if (!beforeAfterByBayPanel[key]) {
				beforeAfterByBayPanel[key] = createEmptyBeforeAfterEntry({
					bay,
					shelf: "P",
					panelType,
				});
			}

			applyBeforeAfterCategorization(
				beforeAfterByBayPanel[key],
				position,
				{ ...position, ...sku }
			);
		});
	});

	return beforeAfterByBayPanel;
};

/**
 * Returns before/after print entries grouped by bay: shelves first, then side
 * panels, then back panels for each bay.
 */
export const buildBeforeAfterPrintSequence = (
	beforeAfterByBayShelf,
	beforeAfterByBayPanel
) => {
	const shelfEntries = Object.values(beforeAfterByBayShelf).filter(hasBeforeAfterChanges);
	const panelEntries = Object.values(beforeAfterByBayPanel).filter(hasBeforeAfterChanges);

	const allBays = [...new Set([
		...shelfEntries.map((entry) => String(entry.bay)),
		...panelEntries.map((entry) => String(entry.bay)),
	])].sort((a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0));

	const sequence = [];

	allBays.forEach((bay) => {
		const bayShelfEntries = shelfEntries
			.filter((entry) => String(entry.bay) === bay)
			.sort(sortShelfEntries);

		const sidePanelEntry = panelEntries.find(
			(entry) => String(entry.bay) === bay && entry.panelType === "side"
		);
		const backPanelEntry = panelEntries.find(
			(entry) => String(entry.bay) === bay && entry.panelType === "back"
		);

		sequence.push(...bayShelfEntries);
		if (sidePanelEntry) {
			sequence.push(sidePanelEntry);
		}
		if (backPanelEntry) {
			sequence.push(backPanelEntry);
		}
	});

	return sequence;
};

export const buildInstructionViewModel = (
	data,
	selectedFixtureType,
	selectedRegion
) => {
	const bays = buildInstructionBays(data, selectedFixtureType, selectedRegion);
	const beforeAfterByBayShelf = buildBeforeAfterByBayShelf(
		data,
		selectedFixtureType,
		selectedRegion
	);
	const beforeAfterByBayPanel = buildBeforeAfterByBayPanel(
		data,
		selectedFixtureType,
		selectedRegion
	);

	return {
		bays,
		beforeAfterByBayShelf,
		beforeAfterByBayPanel,
		beforeAfterPrintSequence: buildBeforeAfterPrintSequence(
			beforeAfterByBayShelf,
			beforeAfterByBayPanel
		),
		multipleBays: Object.keys(bays).length > 1,
	};
};
