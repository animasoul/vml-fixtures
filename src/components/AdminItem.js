import React from 'react';
import { Tooltip } from "react-tooltip";

const AdminItem = ({ item, data, onImageClick, showTooltip }) => {
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

    return (
        <>
            <div className={`item position-${item.horizontal}-${item.vertical}`}>
                <a
                    href="#"
                    onClick={() => onImageClick(imageUrl)}
                >
                    <img
                        src={imageUrl}
                        alt={`SKU ${item.code}`}
                        width={item.width * 10}
                        height={item.height * 10}
                        data-tooltip-id={item.code}
                        onError={(e) => {
                            console.warn(`Image failed to load for SKU ${item.code}`);
                            e.target.style.backgroundColor = '#ddd';
                            e.target.alt = `SKU ${item.code} (image not found)`;
                        }}
                    />
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