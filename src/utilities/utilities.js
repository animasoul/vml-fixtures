/**
 * Utility to safely get a value from an object.
 *
 * @param {Object} obj - The object to fetch value from.
 * @param {string} key - The key to fetch value for.
 * @param {any} defaultValue - The value to return if the key doesn't exist.
 * @returns {any} - The value from the object or default value.
 */
const safeGet = (obj, key, defaultValue = "Not Set") => {
	const value = obj?.[key];
	return value === undefined || value === "" ? defaultValue : value;
};

/**
 * Utility to extract the shelf number from a given string.
 *
 * @param {string} str - The string containing shelf number.
 * @returns {string} - The extracted shelf number.
 */
const extractShelfNumber = (str) => str.replace(/\D/g, "");

export { safeGet, extractShelfNumber };
