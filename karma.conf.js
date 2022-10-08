// Karma configuration
module.exports = function (config) {
  config.set({
    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },

    frameworks: ["jasmine"],
    // ... normal karma configuration
    files: [
      // all files ending in "_test"
      { pattern: 'test/*_test.ts', watched: false }
      // each file acts as entry point for the webpack configuration
    ],

    preprocessors: {
      // add webpack as preprocessor
      '*/**.ts': ['webpack']
    },

    webpack: {
      resolve: {
        extensions: ['.ts', '.tsx', '.js']
      },
      module: {
        rules: [
          { test: /\.tsx?$/, loader: 'ts-loader' }
        ]
      }
    },

    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i. e.
      stats: 'errors-only'
    }
  });
};

