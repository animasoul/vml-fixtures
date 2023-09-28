const defaultConfig = require("@wordpress/scripts/config/webpack.config");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
	...defaultConfig,
	module: {
		...defaultConfig.module,
	},
	plugins: [
		...(defaultConfig.plugins || []),
		new CopyWebpackPlugin({
			patterns: [
				{ from: "src/fixtures/jsonConfig", to: "fixtures/jsonConfig" },
				{ from: "assets/images", to: "images" },
			],
		}),
	],
};
