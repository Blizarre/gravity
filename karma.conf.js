// Karma configuration
module.exports = function(config) {
  config.set({
    mime: {
        'text/x-typescript': ['ts','tsx']
    },

    frameworks: ["jasmine"],
    // ... normal karma configuration
    files: [
      // all files ending in "_test"
      {pattern: 'test/*_test.ts', watched: false}
      // each file acts as entry point for the webpack configuration
    ],

    preprocessors: {
      // add webpack as preprocessor
      '*/**.ts': ['webpack']
    },

    webpack: {
        module: {
            loaders: [
                // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
            { test: /\.tsx?$/, loader: "ts-loader", exclude: /node_modules/ }
            ]
        },
        resolve: {
            // Add '.ts' and '.tsx' as a resolvable extension.
            extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
        }
      // karma watches the test entry points
      // (you don't need to specify the entry option)
      // webpack watches dependencies

      // webpack configuration
    },

    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i. e.
      stats: 'errors-only'
    }
  });
};

