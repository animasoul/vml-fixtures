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
				{
					from: "src/stores/fixtures/jsonConfig",
					to: "stores/fixtures/jsonConfig",
				},
				{ from: "assets/images", to: "images" },
				{ from: "assets/helpers", to: "helpers" },
			],
		}),
	],
};
