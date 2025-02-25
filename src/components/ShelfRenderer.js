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
    id = ""
}) => {
    const sortHorizontalValues = (a, b) => {
        const order = ["LS", "M", "RS"];
        return order.indexOf(a) - order.indexOf(b);
    };

    // Group by horizontal value
    let groupedByHorizontal = positions.reduce((acc, item) => {
        let horizontal = item.horizontal;
        if (!acc[horizontal]) {
            acc[horizontal] = [];
        }
        acc[horizontal].push(item);
        return acc;
    }, {});

    // Sort groups
    let sortedGroupKeys = Object.keys(groupedByHorizontal).sort((a, b) => a - b);
    sortedGroupKeys.forEach((horizontal) => {
        groupedByHorizontal[horizontal].sort((a, b) => b.vertical - a.vertical);
    });

    if (shelfLabel === "P") {
        sortedGroupKeys.sort(sortHorizontalValues);
    }

    return (
        <div className={`face-shelf face-shelf-${shelfLabel}`}>
            <div className="shelf-title common-container">
                {shelfLabel === "P" ? null : <>BAY {bayNumber}/SHELF {shelfLabel}</>}
            </div>
            <div className={`shelf shelf-${shelfLabel}`}>
                {sortedGroupKeys.map((horizontal) => (
                    <div className="item-group" key={horizontal}>
                        {groupedByHorizontal[horizontal].map((item, index) => (
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
                                />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShelfRenderer; 