var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: "./src/main.ts",
    output: {
        filename: "bundle.js"
    },
    resolve: {
        // Add '.ts' and '.tsx' as a resolvable extension.
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },
    module: {
        loaders: [
            // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
            { test: /\.tsx?$/, loader: "ts-loader", exclude: /node_modules/ }
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'Gravity',
			filename: 'index.html'
		})
    ]
}

