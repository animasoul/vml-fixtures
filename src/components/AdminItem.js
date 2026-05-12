import React, { useLayoutEffect, useRef, useState } from 'react';
import { Tooltip } from "react-tooltip";

const getTextWithFirstHyphenBreak = (text) => {
    const hyphenIndex = text.indexOf('-');

    if (hyphenIndex === -1) {
        return text;
    }

    return (
        <>
            {text.slice(0, hyphenIndex + 1)}
            <br />
            {text.slice(hyphenIndex + 1)}
        </>
    );
};

// Breaks at the first hyphen if needed, then shrinks the SKU label until it fits.
export const useFitText = (text, containerWidth) => {
    const ref = useRef(null);
    const [breakAtFirstHyphen, setBreakAtFirstHyphen] = useState(false);

    useLayoutEffect(() => {
        setBreakAtFirstHyphen(false);
    }, [text, containerWidth]);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el || !containerWidth) return;

        el.style.fontSize = '';
        let size = parseFloat(window.getComputedStyle(el).fontSize) || 14;
        const minSize = 7;

        if (
            !breakAtFirstHyphen &&
            text.includes('-') &&
            el.scrollWidth > el.clientWidth
        ) {
            setBreakAtFirstHyphen(true);
            return;
        }

        while (el.scrollWidth > el.clientWidth && size > minSize) {
            size -= 0.5;
            el.style.fontSize = `${size}px`;
        }
    }, [text, containerWidth, breakAtFirstHyphen]);

    return [
        ref,
        breakAtFirstHyphen ? getTextWithFirstHyphenBreak(text) : text
    ];
};

const AdminItem = ({ item, data, onImageClick, showTooltip, scale = 1 }) => {
    // Only log if essential data is missing
    if (!item?.code || !data?.Customer) {
        console.error('Missing required data for AdminItem:', {
            hasItem: !!item,
            hasCode: !!item?.code,
            hasCustomer: !!data?.Customer
        });
        return null;
    }

    const imageUrl = `${item.ImageURL || data.ImageURL}${data.Customer}-${item.code}.jpg`;

    // Only log if image URL components are missing
    if (!item.ImageURL && !data.ImageURL) {
        console.warn('No ImageURL found for SKU:', item.code);
    }

    const minItemWidth = 40;
    const baseItemWidth = item.width * 7 * scale;
    const baseItemHeight = item.height * 7 * scale;
    const itemScale = Math.max(1, minItemWidth / baseItemWidth);
    const itemWidth = Math.round(baseItemWidth * itemScale);
    const itemHeight = Math.round(baseItemHeight * itemScale);
    const [skuRef, skuText] = useFitText(item.code, itemWidth);

    return (
        <>
            <div
                className={`item position-${item.horizontal}-${item.vertical}`}
                style={{ width: itemWidth }}
            >
                <a
                    href="#"
                    onClick={() => onImageClick(imageUrl)}
                >
                    <img
                        src={imageUrl}
                        alt={`SKU ${item.code}`}
                        width={itemWidth}
                        height={itemHeight}
                        data-tooltip-id={item.code}
                        onError={(e) => {
                            console.warn(`Image failed to load for SKU ${item.code}`);
                            e.target.style.backgroundColor = '#ddd';
                            e.target.alt = `SKU ${item.code} (image not found)`;
                        }}
                    />
                    <div className="item-sku" ref={skuRef}>{skuText}</div>
                </a>
            </div>
            {showTooltip && (
                <Tooltip id={item.code}>
                    <p>SKU: {item.code}</p>
                    <p>Product Type: {item.product_type}</p>
                    <p>Material: {item.material}</p>
                    <p>Finishing: {item.finishing}</p>
                    <p>Width: {item.width}</p>
                    <p>Height: {item.height}</p>
                    <p>Horizontal: {item.horizontal}, Vertical: {item.vertical}</p>
                    <p>Bay: {item.bay}</p>
                </Tooltip>
            )}
        </>
    );
};

export default AdminItem; 