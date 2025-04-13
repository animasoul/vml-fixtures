import { matchesFixtureType, createLocationKey } from './fixtureUtils';

export const sortHorizontalValues = (a, b) => {
    const order = ["CS", "LS", "M", "RS"];
    return order.indexOf(a) - order.indexOf(b);
};

export const getUniqueValues = (jsonData, key) => {
    const values = new Set();
    if (jsonData?.final_skus) {
        Object.values(jsonData.final_skus).forEach((sku) => {
            sku.positions.forEach((pos) => values.add(pos[key]));
        });
    }
    return Array.from(values).sort();
};

export const organizeBayData = (data, selectedFixtureType, selectedRegion, type = 'default') => {
    let bays = {};
    let missingDataItems = [];

    // Create a map to store the best position for each unique location
    const bestPositionsMap = new Map();

    Object.values(data.final_skus).forEach((sku) => {
        // Check for missing essential SKU data
        if (!sku.code || !sku.positions) {
            missingDataItems.push({
                type: 'missing_sku_data',
                sku: sku.code || 'unknown',
                missing: !sku.code ? 'code' : 'positions'
            });
            return;
        }

        sku.positions.forEach((position) => {
            // Check for missing essential position data
            if (!position.fixture_type || !position.shelf || !position.horizontal || !position.vertical) {
                missingDataItems.push({
                    type: 'missing_position_data',
                    sku: sku.code,
                    position: {
                        fixture_type: position.fixture_type,
                        shelf: position.shelf,
                        horizontal: position.horizontal,
                        vertical: position.vertical
                    }
                });
                return;
            }

            // Skip based on type conditions
            if (type === 'default' && position.update === "delete") return;
            if (type === 'new' && position.update !== "new") return;
            if (type === 'move' && position.update !== "move") return;
            if (type === 'delete' && position.update !== "delete") return;

            // Use flexible fixture type matching
            if (!matchesFixtureType(position.fixture_type, selectedFixtureType)) return;

            // Handle region matching with support for combined regions
            if (selectedRegion) {
                const posRegion = position.region;
                const isMatch = Array.isArray(posRegion)
                    ? posRegion.includes(selectedRegion)
                    : posRegion === selectedRegion;

                // Support for combined regions like "US - CA"
                const isCombinedMatch = selectedRegion.includes('-') &&
                    selectedRegion.split('-').some(r => {
                        const trimmedRegion = r.trim();
                        return Array.isArray(posRegion)
                            ? posRegion.includes(trimmedRegion)
                            : posRegion === trimmedRegion;
                    });

                if (!isMatch && !isCombinedMatch) return;
            }

            // Create a unique key for this position's location
            const locationKey = createLocationKey(position);

            // If we haven't seen this location before, add it
            if (!bestPositionsMap.has(locationKey)) {
                bestPositionsMap.set(locationKey, { position, sku });
            } else {
                // If we have seen this location, check if this position is better
                const existingEntry = bestPositionsMap.get(locationKey);
                const existingFixtureType = existingEntry.position.fixture_type;

                // If the existing position has the exact fixture type, keep it
                if (existingFixtureType === selectedFixtureType && position.fixture_type !== selectedFixtureType) {
                    return;
                }

                // If this position has the exact fixture type, use it
                if (position.fixture_type === selectedFixtureType && existingFixtureType !== selectedFixtureType) {
                    bestPositionsMap.set(locationKey, { position, sku });
                    return;
                }

                // If both have the same fixture type match level, prefer newer positions
                // Assuming positions with higher IDs are newer
                if (position.id && existingEntry.position.id && position.id > existingEntry.position.id) {
                    bestPositionsMap.set(locationKey, { position, sku });
                }
            }
        });
    });

    // Build the bays object from the best positions
    bestPositionsMap.forEach(({ position, sku }, locationKey) => {
        const bayNumber = position.bay || 1;
        if (!bays[bayNumber]) {
            bays[bayNumber] = {
                shelves: {},
                shelfP: []
            };
        }

        const item = { ...position, ...sku };
        if (position.shelf === "P") {
            bays[bayNumber].shelfP.push(item);
        } else {
            if (!bays[bayNumber].shelves[position.shelf]) {
                bays[bayNumber].shelves[position.shelf] = [];
            }
            bays[bayNumber].shelves[position.shelf].push(item);
        }
    });

    // Only log if there are missing data items
    if (missingDataItems.length > 0) {
        console.warn(`Missing Data in ${type} view:`, missingDataItems);
    }

    return bays;
};

export const organizeAllBayTypes = (data, selectedFixtureType, selectedRegion) => {
    // Only log if there's no data
    if (!data?.final_skus || Object.keys(data.final_skus).length === 0) {
        console.error('No SKU data available:', { data, selectedFixtureType, selectedRegion });
        return {
            default: {},
            new: {},
            move: {},
            delete: {}
        };
    }

    return {
        default: organizeBayData(data, selectedFixtureType, selectedRegion, 'default'),
        new: organizeBayData(data, selectedFixtureType, selectedRegion, 'new'),
        move: organizeBayData(data, selectedFixtureType, selectedRegion, 'move'),
        delete: organizeBayData(data, selectedFixtureType, selectedRegion, 'delete')
    };
}; 