import React from 'react';
import { Tooltip } from "react-tooltip";

const AdminItem = ({ item, data, onImageClick, showTooltip }) => (
    <>
        <div className={`item position-${item.horizontal}-${item.vertical}`}>
            <a
                href="#"
                onClick={() => onImageClick(
                    `${item.ImageURL || data.ImageURL}${data.Customer}-${item.code}.jpg`
                )}
            >
                <img
                    src={`${item.ImageURL || data.ImageURL}${data.Customer}-${item.code}.jpg`}
                    alt={`SKU ${item.code}`}
                    width={item.width * 10}
                    height={item.height * 10}
                    data-tooltip-id={item.code}
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

export default AdminItem; 