const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    publicPath: "/"
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL)
    }),
    new HtmlWebpackPlugin({
      template: './index.html'
    })
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  resolve: {
    extensions: [".js", ".jsx"]
  },
  devServer: {
    static: {
      directory: path.join(__dirname)
    },
    historyApiFallback: true,
    port: process.env.PORT || 3001
  }
};


