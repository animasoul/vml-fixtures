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
				beforeAfterByBayShelf[key] = {
					bay,
					shelf,
					beforeItems: [],
					afterItems: [],
					discard: [],
					movingOff: [],
					newComponents: [],
					movingTo: [],
				};
			}

			const itemData = { ...position, ...sku };
			const target = beforeAfterByBayShelf[key];
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
		});
	});

	return beforeAfterByBayShelf;
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

	return {
		bays,
		beforeAfterByBayShelf,
		multipleBays: Object.keys(bays).length > 1,
	};
};
