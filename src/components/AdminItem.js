import React, { useLayoutEffect, useRef } from 'react';
import { Tooltip } from "react-tooltip";

// Shrinks the SKU label's font-size until the text fits its container width.
const useFitText = (text, containerWidth) => {
    const ref = useRef(null);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el || !containerWidth) return;

        el.style.fontSize = '';
        let size = parseFloat(window.getComputedStyle(el).fontSize) || 14;
        const minSize = 6;

        while (el.scrollWidth > el.clientWidth && size > minSize) {
            size -= 0.5;
            el.style.fontSize = `${size}px`;
        }
    }, [text, containerWidth]);

    return ref;
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

    const itemWidth = item.width * 5 * scale;
    const itemHeight = item.height * 5 * scale;
    const skuRef = useFitText(item.code, itemWidth);

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
                    <div className="item-sku" ref={skuRef}>{item.code}</div>
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