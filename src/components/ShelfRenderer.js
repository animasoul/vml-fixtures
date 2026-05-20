import React from 'react';
import AdminItem from './AdminItem';

const ShelfRenderer = ({
    positions,
    shelfLabel,
    bayNumber,
    scale = 1,
    onImageClick = null,
    showTooltip = false,
    isInstruction = false,
    data,
    id = "",
    panelType = null, // New prop to specify panel type: "side" or "back"
    hideTitle = false
}) => {
    const sortHorizontalValues = (a, b) => {
        const order = ["CS", "LS", "M", "RS"];
        return order.indexOf(a) - order.indexOf(b);
    };

    const isHorizontalEight = (item) => String(item.horizontal) === "8";

    const getGroupKey = (item) => {
        if (shelfLabel === "P") {
            return item.horizontal;
        }

        const vertical = String(item.vertical);
        return isHorizontalEight(item) ? `8-${vertical}` : `v-${vertical}`;
    };

    // Panels keep the original horizontal grouping; regular shelves are grouped
    // by vertical row so vertical 8 renders before 7, 6... down to 1.
    let groupedByHorizontal = positions.reduce((acc, item) => {
        const groupKey = getGroupKey(item);
        if (!acc[groupKey]) {
            acc[groupKey] = [];
        }
        acc[groupKey].push(item);
        return acc;
    }, {});

    const getNumericValue = (value) => {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : 0;
    };

    const getGroupSortValue = (groupKey) => {
        if (shelfLabel === "P") {
            return getNumericValue(groupKey);
        }

        const items = groupedByHorizontal[groupKey] || [];
        const vertical = getNumericValue(items[0]?.vertical);
        const hasHorizontalEight = items.some(isHorizontalEight);

        return {
            vertical,
            hasHorizontalEight,
            horizontal: getNumericValue(items[0]?.horizontal),
        };
    };

    const sortRegularShelfGroups = (a, b) => {
        const groupA = getGroupSortValue(a);
        const groupB = getGroupSortValue(b);

        if (groupA.vertical !== groupB.vertical) {
            return groupB.vertical - groupA.vertical;
        }

        if (groupA.hasHorizontalEight !== groupB.hasHorizontalEight) {
            return groupA.hasHorizontalEight ? 1 : -1;
        }

        return groupA.horizontal - groupB.horizontal;
    };

    // Sort groups
    let sortedGroupKeys = Object.keys(groupedByHorizontal).sort((a, b) => {
        if (shelfLabel === "P") {
            return getGroupSortValue(a) - getGroupSortValue(b);
        }

        return sortRegularShelfGroups(a, b);
    });
    sortedGroupKeys.forEach((groupKey) => {
        // Only reverse sort by vertical if it's NOT a panel shelf
        if (shelfLabel === "P") {
            // For panel shelf, use normal (ascending) vertical order
            groupedByHorizontal[groupKey].sort((a, b) => a.vertical - b.vertical);
        } else {
            // For regular vertical rows, place items left-to-right by horizontal.
            groupedByHorizontal[groupKey].sort((a, b) => a.horizontal - b.horizontal);
        }
    });

    if (shelfLabel === "P") {
        sortedGroupKeys.sort(sortHorizontalValues);
    }

    // Filter panel items based on panelType
    if (shelfLabel === "P" && panelType) {
        if (panelType === "side") {
            // For side panels, only include LS, CS, and RS
            sortedGroupKeys = sortedGroupKeys.filter(key => key === "LS" || key === "CS" || key === "RS");
        } else if (panelType === "back") {
            // For back panels, only include M
            sortedGroupKeys = sortedGroupKeys.filter(key => key === "M");
        }
    }

    const getItemGroupClassName = (groupKey) => {
        if (shelfLabel === "P") {
            return groupKey == 8 ? "item-group group-position-8" : "item-group";
        }

        const isEightRow = (groupedByHorizontal[groupKey] || []).some(isHorizontalEight);
        return isEightRow
            ? "item-group item-group-vertical-row group-position-8"
            : "item-group item-group-vertical-row";
    };

    return (
        <div className={`face-shelf face-shelf-${shelfLabel}`}>
            {!hideTitle && (
                <div className="shelf-title common-container">
                    {shelfLabel === "P" ? null : <>BAY {bayNumber}/SHELF {shelfLabel}</>}
                </div>
            )}
            <div className={`shelf shelf-${shelfLabel}`}>
                {sortedGroupKeys.map((groupKey) => (
                    <div className={getItemGroupClassName(groupKey)} key={groupKey}>
                        {groupedByHorizontal[groupKey].map((item, index) => (
                            isInstruction ?
                                <InstructionItem
                                    key={index}
                                    item={item}
                                    data={data}
                                    scale={scale}
                                    id={id}
                                /> :
                                <AdminItem
                                    key={index}
                                    item={item}
                                    data={data}
                                    onImageClick={onImageClick}
                                    showTooltip={showTooltip}
                                    scale={scale}
                                />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShelfRenderer; 