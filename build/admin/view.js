/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/admin/RootApp.js":
/*!******************************!*\
  !*** ./src/admin/RootApp.js ***!
  \******************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _services_getOptionService__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../services/getOptionService */ "./src/services/getOptionService.js");

// import React, { useState } from "@wordpress/element";
// import FrontendApp from "../components/FrontEndApp";
// import PromotionsList from "../components/PromotionsList";

// function RootApp() {
// 	const [selectedPromotion, setSelectedPromotion] = useState(null);

// 	return (
// 		<div className="admin-fixture-wrapper">
// 			<PromotionsList
// 				onPromotionSelect={setSelectedPromotion}
// 				selectedPromotion={selectedPromotion}
// 			/>

// 			<FrontendApp context="admin" selectedPromotion={selectedPromotion} />
// 		</div>
// 	);
// }

// export default RootApp;



const RootApp = () => {
  const [data, setData] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [isLoading, setIsLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(true);
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [selectedFixtureType, setSelectedFixtureType] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [selectedRegion, setSelectedRegion] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    async function fetchData() {
      try {
        const jsonData = await (0,_services_getOptionService__WEBPACK_IMPORTED_MODULE_2__.fetchOptionData)();
        setData(jsonData);
        const firstFixtureType = getUniqueValues(jsonData, "fixture_type")[0];
        setSelectedFixtureType(firstFixtureType);
        const firstRegion = getUniqueValues(jsonData, "region")[0];
        setSelectedRegion(firstRegion);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Function to get unique values for fixture_type or region
  const getUniqueValues = (jsonData, key) => {
    const values = new Set();
    if (jsonData && jsonData.final_skus) {
      Object.values(jsonData.final_skus).forEach(sku => {
        sku.positions.forEach(pos => values.add(pos[key]));
      });
    }
    return Array.from(values).sort();
  };
  const getRegionsForSelectedFixture = () => {
    const regions = new Set();
    if (data && data.final_skus) {
      Object.values(data.final_skus).forEach(sku => {
        sku.positions.forEach(pos => {
          if (pos.fixture_type === selectedFixtureType) {
            regions.add(pos.region);
          }
        });
      });
    }
    return Array.from(regions).sort();
  };
  const uniqueFixtureTypes = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => getUniqueValues(data, "fixture_type"), [data]);
  const uniqueRegions = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => getRegionsForSelectedFixture(), [data, selectedFixtureType]);
  const processAndDisplayData = () => {
    if (!data || typeof data.final_skus !== "object" || !selectedFixtureType) {
      return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, "No SKU data available.");
    }
    let shelves = {}; // Object to hold shelves data
    let shelfP = []; // Array to hold shelf 'P' data

    // Iterate over each SKU object in final_skus
    Object.values(data.final_skus).forEach(sku => {
      if (sku.positions) {
        sku.positions.forEach(position => {
          // Debugging logs
          // console.log("Checking position:", position);
          // console.log(
          // 	"Fixture Type Check:",
          // 	position.fixture_type === selectedFixtureType,
          // );
          // console.log(
          // 	"Region Check:",
          // 	!selectedRegion || position.region === selectedRegion,
          // );
          // console.log("Shelf Check:", position.shelf);
          if (position.fixture_type === selectedFixtureType && (!selectedRegion || position.region === selectedRegion)) {
            if (position.shelf === "P") {
              shelfP.push({
                ...position,
                ...sku
              });
              // console.log("Added to shelf P:", position); // Debugging log
            } else {
              if (!shelves[position.shelf]) {
                shelves[position.shelf] = [];
              }
              shelves[position.shelf].push({
                ...position,
                ...sku
              });
            }
          }
        });
      }
    });
    // console.log("Shelf P data:", shelfP); // Debugging log

    // Function to render shelf data
    const renderShelf = (positions, shelfLabel) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      key: shelfLabel
    }, shelfLabel === "P" ? null : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h4", null, "Shelf ", shelfLabel), positions.map((item, index) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      key: index
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, "SKU: ", item.code), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("img", {
      src: `${data.ImageURL}${item.code}.jpg`,
      alt: `SKU ${item.code}`,
      width: item.width * 30,
      height: item.height * 30
    }))));
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h2", null, selectedFixtureType), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h3", null, "Front"), Object.entries(shelves).map(([shelfLabel, positions]) => renderShelf(positions, shelfLabel)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h3", null, "Panel"), shelfP.length > 0 && renderShelf(shelfP, "P"));
  };
  // Debug: Output raw data and selected values
  console.log("Raw Data:", data);
  // console.log("Selected Fixture Type:", selectedFixtureType);
  // console.log("Selected Region:", selectedRegion);

  if (isLoading) {
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, "Loading...");
  }
  if (error) {
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, "Error: ", error);
  }
  if (!data) {
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, "No data available.");
  }
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, uniqueFixtureTypes.map(type => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    key: type,
    onClick: () => setSelectedFixtureType(type)
  }, type))), selectedFixtureType && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, uniqueRegions.map(region => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    key: region,
    onClick: () => setSelectedRegion(region)
  }, region))), processAndDisplayData());
};
/* harmony default export */ __webpack_exports__["default"] = (RootApp);

/***/ }),

/***/ "./src/services/getOptionService.js":
/*!******************************************!*\
  !*** ./src/services/getOptionService.js ***!
  \******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fetchOptionData: function() { return /* binding */ fetchOptionData; }
/* harmony export */ });
// getOptionService.js

/**
 * Fetch option data from the custom WordPress REST API.
 * @param {string} brand - The brand parameter for the API.
 * @param {string} promo - The promo parameter for the API.
 * @returns {Promise<any>} A promise that resolves to the fetched data.
 */
const fetchOptionData = async (brand, promo) => {
  try {
    // const apiUrl = `/wp-json/vml-fixtures/v1/get-option/?brand=${encodeURIComponent(
    // 	brand,
    // )}&promo=${encodeURIComponent(promo)}`;

    const apiUrl = `/wp-json/vml-fixtures/v1/get-option/`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error("Error fetching option data:", err);
    throw err;
  }
};

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ (function(module) {

module.exports = window["React"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ (function(module) {

module.exports = window["wp"]["element"];

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
!function() {
/*!***************************!*\
  !*** ./src/admin/view.js ***!
  \***************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _RootApp__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./RootApp */ "./src/admin/RootApp.js");



const appRoot = document.querySelector(".wp-block-vml-fixtures-admin");
if (appRoot) {
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.render)((0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_RootApp__WEBPACK_IMPORTED_MODULE_2__["default"], null), appRoot);
}
}();
/******/ })()
;
//# sourceMappingURL=view.js.map