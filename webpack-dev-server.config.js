const webpack = require('webpack');
const path = require('path');

const config = {
  // Entry points to the project
  entry: {
    main: [
      // only- means to only hot reload for successful updates
      'webpack/hot/only-dev-server',
      './main.js',
    ],
  },
  // Server Configuration options
  devServer: {
    contentBase: './', // Relative directory for base of server
    hot: true, // Live-reload
    inline: true,
    port: 3000, // Port Number
    host: 'localhost', // Change to '0.0.0.0' for external facing server
  },
  devtool: 'eval',
  node: {fs: "empty"},
  output: {
    path: __dirname, // Path of output file
    filename: 'bundle.js',
  },
  plugins: [
    // Enables Hot Modules Replacement
    new webpack.HotModuleReplacementPlugin(),
  ],
  resolve: {
    alias: {
      ol: path.resolve(__dirname, 'node_modules/ol'),
      'mapbox-to-ol-style': path.resolve(__dirname, 'node_modules/mapbox-to-ol-style')
    },
    extensions: [".js", ".json", ".jsx"],
    modules: ['node_modules', path.resolve(__dirname, 'node_modules/maputnik/src/components/layers')]
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules\/(?!(maputnik)\/).*/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
        }
      }, {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      },
    ],
  },
};

module.exports = config;
