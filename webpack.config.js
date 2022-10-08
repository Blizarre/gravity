var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: ["./src/main.ts", "./src/hammer.js"],
    output: {
        filename: "bundle.js"
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: 'ts-loader' }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Gravity',
            filename: 'index.html'
        })
    ]
}

