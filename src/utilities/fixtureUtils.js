/**
 * Utility functions for fixture data processing
 */

/**
 * Checks if an item's fixture type matches the selected fixture type
 * using the base fixture type (part before any parentheses)
 * 
 * @param {string} itemFixtureType - The fixture type of the item
 * @param {string} selectedFixtureType - The selected fixture type
 * @returns {boolean} - Whether the fixture types match
 */
export function matchesFixtureType(itemFixtureType, selectedFixtureType) {
    if (!itemFixtureType || !selectedFixtureType) return false;

    const baseItemType = itemFixtureType.split('(')[0];
    const baseSelectedType = selectedFixtureType.split('(')[0];
    return baseItemType === baseSelectedType;
}

/**
 * Gets regions for a selected fixture type
 * 
 * @param {Object} data - The fixture data
 * @param {string} selectedFixtureType - The selected fixture type
 * @returns {string[]} - Array of regions for the fixture type, sorted
 */
export function getRegionsForSelectedFixture(data, selectedFixtureType) {
    const regions = new Set();
    if (data?.final_skus && selectedFixtureType) {
        Object.values(data.final_skus).forEach((sku) => {
            if (sku.positions) {
                sku.positions.forEach((pos) => {
                    if (matchesFixtureType(pos.fixture_type, selectedFixtureType)) {
                        if (Array.isArray(pos.region)) {
                            pos.region.forEach(r => regions.add(r));
                        } else {
                            regions.add(pos.region);
                        }
                    }
                });
            }
        });
    }
    return Array.from(regions).sort();
}

/**
 * Creates a unique location key for a position
 * 
 * @param {Object} position - The position object
 * @returns {string} - A unique key for the position's location
 */
export function createLocationKey(position) {
    const bay = position.bay || 1;
    const shelf = position.shelf;
    const horizontal = position.horizontal;
    const vertical = position.vertical;
    return `${bay}-${shelf}-${horizontal}-${vertical}`;
} 