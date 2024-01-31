/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/components/Loader.js":
/*!**********************************!*\
  !*** ./src/components/Loader.js ***!
  \**********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_spinners_PropagateLoader__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-spinners/PropagateLoader */ "./node_modules/react-spinners/PropagateLoader.js");
/* harmony import */ var react_spinners_PropagateLoader__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_spinners_PropagateLoader__WEBPACK_IMPORTED_MODULE_1__);


function Loader() {
  const override = {
    display: "block",
    margin: "0 auto",
    width: "max-content",
    padding: "20px 0"
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "loading"
  }, "Loading fixture...", (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)((react_spinners_PropagateLoader__WEBPACK_IMPORTED_MODULE_1___default()), {
    color: "#008fca",
    cssOverride: override
  }));
}
/* harmony default export */ __webpack_exports__["default"] = (Loader);

/***/ }),

/***/ "./src/instruction/InstructApp.js":
/*!****************************************!*\
  !*** ./src/instruction/InstructApp.js ***!
  \****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_Loader__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/Loader */ "./src/components/Loader.js");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _services_getOptionService__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../services/getOptionService */ "./src/services/getOptionService.js");
/* harmony import */ var _style_index_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./style-index.css */ "./src/instruction/style-index.css");

// Desc: Root component for admin app




const InstructApp = () => {
  const [data, setData] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(null);
  const [isLoading, setIsLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(true);
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(null);
  const [selectedFixtureType, setSelectedFixtureType] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(null);
  const [selectedRegion, setSelectedRegion] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(null);

  // Get the current URL
  const url = new URL(window.location.href);

  // Get the parameters from the URL
  const brand = url.searchParams.get("brand");
  const promo = url.searchParams.get("promo");
  const initialFixtureType = url.searchParams.get("fixture");
  const initialRegion = url.searchParams.get("region");
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    async function fetchData() {
      try {
        const response = await (0,_services_getOptionService__WEBPACK_IMPORTED_MODULE_3__.fetchOptionData)(brand, promo);
        if (!response?.data) {
          throw new Error("No data received. Please select a Promotion.");
        } else {
          const jsonData = response.data;
          setData(jsonData);
          setSelectedFixtureType(initialFixtureType);
          setSelectedRegion(initialRegion);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        setError(error.toString());
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);
  const processAndDisplayData = () => {
    if (!data || typeof data.final_skus !== "object" || !selectedFixtureType) {
      return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, "No SKU data available. Please select a Promotion.");
    }
    let shelves = {}; // Object to hold shelves data
    let shelfP = []; // Array to hold shelf 'P' data

    const sortHorizontalValues = (a, b) => {
      const order = ["LS", "M", "RS"];
      return order.indexOf(a) - order.indexOf(b);
    };

    // Iterate over each SKU object in final_skus
    Object.values(data.final_skus).forEach(sku => {
      if (sku.positions) {
        sku.positions.forEach(position => {
          if (position.fixture_type === selectedFixtureType && (!selectedRegion || position.region === selectedRegion)) {
            if (position.shelf === "P") {
              shelfP.push({
                ...position,
                ...sku
              });
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

    // Function to render shelf data
    const renderShelf = (positions, shelfLabel) => {
      // Group by horizontal value
      let groupedByHorizontal = positions.reduce((acc, item) => {
        let horizontal = item.horizontal;
        if (!acc[horizontal]) {
          acc[horizontal] = [];
        }
        acc[horizontal].push(item);
        return acc;
      }, {});

      // Sort groups by horizontal and reverse sort items within by vertical
      let sortedGroupKeys = Object.keys(groupedByHorizontal).sort((a, b) => a - b);
      sortedGroupKeys.forEach(horizontal => {
        groupedByHorizontal[horizontal].sort((a, b) => b.vertical - a.vertical); // Reverse sorting by vertical
      });
      // Adjust sorting for 'P' shelf if horizontal values are not numeric
      if (shelfLabel === "P") {
        sortedGroupKeys.sort(sortHorizontalValues);
      }
      const color = "green";

      // Step 4: Render
      return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
        className: `face-shelf face-shelf-${shelfLabel}`,
        key: shelfLabel
      }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
        className: "shelf-title common-container"
      }, shelfLabel === "P" ? null : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, "B1S", shelfLabel)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
        className: `shelf shelf-${shelfLabel}`
      }, sortedGroupKeys.map(horizontal => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
        className: "item-group",
        key: horizontal
      }, groupedByHorizontal[horizontal].map((item, index) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
        className: `item position-${item.horizontal}-${item.vertical}`,
        key: index
      }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("img", {
        src: `${data.ImageURL}${item.code}.jpg`,
        alt: `SKU ${item.code}`,
        width: item.width * 12,
        height: item.height * 12,
        "data-tooltip-id": item.code,
        className: color
      })))))));
    };
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h2", null, selectedFixtureType, " - ", selectedRegion), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "admin-fixture"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "face-data-display"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h3", null, "Graphic Layout:"), Object.entries(shelves).map(([shelfLabel, positions]) => renderShelf(positions, shelfLabel))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "panel-data-display"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h3", null, "Backpanel:"), shelfP.length > 0 && renderShelf(shelfP, "P"))));
  };
  // Debug: Output raw data and selected values
  // console.log("Raw Data:", data);

  if (isLoading) {
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_Loader__WEBPACK_IMPORTED_MODULE_1__["default"], null);
  }
  if (error) {
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, error);
  }
  if (!data) {
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, "No data available. Please select a Promotion");
  }
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "fixture-select"
  }, processAndDisplayData());
};
/* harmony default export */ __webpack_exports__["default"] = (InstructApp);

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

    let apiUrl = `/wp-json/vml-fixtures/v1/get-option/`;

    // Add brand and promo as query parameters if they are passed into the function
    if (brand || promo) {
      apiUrl += `?${new URLSearchParams({
        brand,
        promo
      }).toString()}`;
    }
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

/***/ "./src/instruction/style-index.css":
/*!*****************************************!*\
  !*** ./src/instruction/style-index.css ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./node_modules/react-spinners/PropagateLoader.js":
/*!********************************************************!*\
  !*** ./node_modules/react-spinners/PropagateLoader.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var React = __importStar(__webpack_require__(/*! react */ "react"));
var unitConverter_1 = __webpack_require__(/*! ./helpers/unitConverter */ "./node_modules/react-spinners/helpers/unitConverter.js");
var animation_1 = __webpack_require__(/*! ./helpers/animation */ "./node_modules/react-spinners/helpers/animation.js");
// 1.5 4.5 7.5
var distance = [1, 3, 5];
var propagate = [
    (0, animation_1.createAnimation)("PropagateLoader", "25% {transform: translateX(-".concat(distance[0], "rem) scale(0.75)}\n    50% {transform: translateX(-").concat(distance[1], "rem) scale(0.6)}\n    75% {transform: translateX(-").concat(distance[2], "rem) scale(0.5)}\n    95% {transform: translateX(0rem) scale(1)}"), "propogate-0"),
    (0, animation_1.createAnimation)("PropagateLoader", "25% {transform: translateX(-".concat(distance[0], "rem) scale(0.75)}\n    50% {transform: translateX(-").concat(distance[1], "rem) scale(0.6)}\n    75% {transform: translateX(-").concat(distance[1], "rem) scale(0.6)}\n    95% {transform: translateX(0rem) scale(1)}"), "propogate-1"),
    (0, animation_1.createAnimation)("PropagateLoader", "25% {transform: translateX(-".concat(distance[0], "rem) scale(0.75)}\n    75% {transform: translateX(-").concat(distance[0], "rem) scale(0.75)}\n    95% {transform: translateX(0rem) scale(1)}"), "propogate-2"),
    (0, animation_1.createAnimation)("PropagateLoader", "25% {transform: translateX(".concat(distance[0], "rem) scale(0.75)}\n    75% {transform: translateX(").concat(distance[0], "rem) scale(0.75)}\n    95% {transform: translateX(0rem) scale(1)}"), "propogate-3"),
    (0, animation_1.createAnimation)("PropagateLoader", "25% {transform: translateX(".concat(distance[0], "rem) scale(0.75)}\n    50% {transform: translateX(").concat(distance[1], "rem) scale(0.6)}\n    75% {transform: translateX(").concat(distance[1], "rem) scale(0.6)}\n    95% {transform: translateX(0rem) scale(1)}"), "propogate-4"),
    (0, animation_1.createAnimation)("PropagateLoader", "25% {transform: translateX(".concat(distance[0], "rem) scale(0.75)}\n    50% {transform: translateX(").concat(distance[1], "rem) scale(0.6)}\n    75% {transform: translateX(").concat(distance[2], "rem) scale(0.5)}\n    95% {transform: translateX(0rem) scale(1)}"), "propogate-5"),
];
function PropagateLoader(_a) {
    var _b = _a.loading, loading = _b === void 0 ? true : _b, _c = _a.color, color = _c === void 0 ? "#000000" : _c, _d = _a.speedMultiplier, speedMultiplier = _d === void 0 ? 1 : _d, _e = _a.cssOverride, cssOverride = _e === void 0 ? {} : _e, _f = _a.size, size = _f === void 0 ? 15 : _f, additionalprops = __rest(_a, ["loading", "color", "speedMultiplier", "cssOverride", "size"]);
    var _g = (0, unitConverter_1.parseLengthAndUnit)(size), value = _g.value, unit = _g.unit;
    var wrapper = __assign({ display: "inherit", position: "relative" }, cssOverride);
    var style = function (i) {
        return {
            position: "absolute",
            fontSize: "".concat(value / 3).concat(unit),
            width: "".concat(value).concat(unit),
            height: "".concat(value).concat(unit),
            background: color,
            borderRadius: "50%",
            animation: "".concat(propagate[i], " ").concat(1.5 / speedMultiplier, "s infinite"),
            animationFillMode: "forwards",
        };
    };
    if (!loading) {
        return null;
    }
    return (React.createElement("span", __assign({ style: wrapper }, additionalprops),
        React.createElement("span", { style: style(0) }),
        React.createElement("span", { style: style(1) }),
        React.createElement("span", { style: style(2) }),
        React.createElement("span", { style: style(3) }),
        React.createElement("span", { style: style(4) }),
        React.createElement("span", { style: style(5) })));
}
exports["default"] = PropagateLoader;


/***/ }),

/***/ "./node_modules/react-spinners/helpers/animation.js":
/*!**********************************************************!*\
  !*** ./node_modules/react-spinners/helpers/animation.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createAnimation = void 0;
var createAnimation = function (loaderName, frames, suffix) {
    var animationName = "react-spinners-".concat(loaderName, "-").concat(suffix);
    if (typeof window == "undefined" || !window.document) {
        return animationName;
    }
    var styleEl = document.createElement("style");
    document.head.appendChild(styleEl);
    var styleSheet = styleEl.sheet;
    var keyFrames = "\n    @keyframes ".concat(animationName, " {\n      ").concat(frames, "\n    }\n  ");
    if (styleSheet) {
        styleSheet.insertRule(keyFrames, 0);
    }
    return animationName;
};
exports.createAnimation = createAnimation;


/***/ }),

/***/ "./node_modules/react-spinners/helpers/unitConverter.js":
/*!**************************************************************!*\
  !*** ./node_modules/react-spinners/helpers/unitConverter.js ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.cssValue = exports.parseLengthAndUnit = void 0;
var cssUnit = {
    cm: true,
    mm: true,
    in: true,
    px: true,
    pt: true,
    pc: true,
    em: true,
    ex: true,
    ch: true,
    rem: true,
    vw: true,
    vh: true,
    vmin: true,
    vmax: true,
    "%": true,
};
/**
 * If size is a number, append px to the value as default unit.
 * If size is a string, validate against list of valid units.
 * If unit is valid, return size as is.
 * If unit is invalid, console warn issue, replace with px as the unit.
 *
 * @param {(number | string)} size
 * @return {LengthObject} LengthObject
 */
function parseLengthAndUnit(size) {
    if (typeof size === "number") {
        return {
            value: size,
            unit: "px",
        };
    }
    var value;
    var valueString = (size.match(/^[0-9.]*/) || "").toString();
    if (valueString.includes(".")) {
        value = parseFloat(valueString);
    }
    else {
        value = parseInt(valueString, 10);
    }
    var unit = (size.match(/[^0-9]*$/) || "").toString();
    if (cssUnit[unit]) {
        return {
            value: value,
            unit: unit,
        };
    }
    console.warn("React Spinners: ".concat(size, " is not a valid css value. Defaulting to ").concat(value, "px."));
    return {
        value: value,
        unit: "px",
    };
}
exports.parseLengthAndUnit = parseLengthAndUnit;
/**
 * Take value as an input and return valid css value
 *
 * @param {(number | string)} value
 * @return {string} valid css value
 */
function cssValue(value) {
    var lengthWithunit = parseLengthAndUnit(value);
    return "".concat(lengthWithunit.value).concat(lengthWithunit.unit);
}
exports.cssValue = cssValue;


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
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
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
/*!*********************************!*\
  !*** ./src/instruction/view.js ***!
  \*********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _InstructApp__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./InstructApp */ "./src/instruction/InstructApp.js");



const appRoot = document.querySelector(".wp-block-vml-fixtures-instruct");
if (appRoot) {
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.render)((0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_InstructApp__WEBPACK_IMPORTED_MODULE_2__["default"], null), appRoot);
}
}();
/******/ })()
;
//# sourceMappingURL=view.js.map