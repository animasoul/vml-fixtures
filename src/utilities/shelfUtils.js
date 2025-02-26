export const sortHorizontalValues = (a, b) => {
    const order = ["LS", "M", "RS"];
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
            if (position.fixture_type !== selectedFixtureType) return;
            if (selectedRegion && position.region !== selectedRegion) return;

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