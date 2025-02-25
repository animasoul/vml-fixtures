export const getUniqueValues = (jsonData, key) => {
    const values = new Set();
    if (jsonData?.final_skus) {
        Object.values(jsonData.final_skus).forEach((sku) => {
            sku.positions.forEach((pos) => values.add(pos[key]));
        });
    }
    return Array.from(values).sort();
};

export const organizeBayData = (data, selectedFixtureType, selectedRegion) => {
    let bays = {};

    Object.values(data.final_skus).forEach((sku) => {
        if (sku.positions) {
            sku.positions.forEach((position) => {
                if (position.update === "delete") return;

                if (
                    position.fixture_type === selectedFixtureType &&
                    (!selectedRegion || position.region === selectedRegion)
                ) {
                    const bayNumber = position.bay || 1;
                    if (!bays[bayNumber]) {
                        bays[bayNumber] = {
                            shelves: {},
                            shelfP: []
                        };
                    }

                    if (position.shelf === "P") {
                        bays[bayNumber].shelfP.push({ ...position, ...sku });
                    } else {
                        if (!bays[bayNumber].shelves[position.shelf]) {
                            bays[bayNumber].shelves[position.shelf] = [];
                        }
                        bays[bayNumber].shelves[position.shelf].push({ ...position, ...sku });
                    }
                }
            });
        }
    });

    return bays;
}; 