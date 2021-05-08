/* eslint-disable no-undefined */

const paths = require('path');

const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD = NODE_ENV === 'production';
const IS_DEV = NODE_ENV === 'development';

// constructs a URL (relative to the base URL of static files) of an asset from
// the given components
function assetURL(filename, hash, extension) {
  let fullPath = `assets/${filename}`;

  if (NODE_ENV === 'production') fullPath += hash;
  fullPath += extension;

  return fullPath;
}

// regular expressions for common file types
const JAVASCRIPT_FILES = /\.js$/;
const TYPESCRIPT_FILES = /\.ts$/;
const STYLESHEET_FILES = /\.(s[ca]|c)ss$/;

/**
 * @type {webpack.Configuration}
 */
module.exports = {
  mode: NODE_ENV,
  entry: paths.resolve(__dirname, 'src', 'index'),

  devtool: 'source-map',

  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },

  output: {
    filename: assetURL('[name]', '.[chunkhash:8]', '.js'),
    chunkFilename: assetURL('[name]', '.[chunkhash:8]', '.chunk.js'),
    assetModuleFilename: assetURL('[name]', '.[hash:8]', '[ext]'),
    publicPath: '',
    path: IS_PROD ? paths.resolve(__dirname, 'build') : undefined,
  },

  devServer: {
    hot: true,
    inline: true,
    publicPath: '/',
    overlay: true,
    before(_app, server) {
      server._watch(`src/**/*.html`);
    },
  },

  module: {
    rules: [
      {
        test: TYPESCRIPT_FILES,
        include: paths.resolve(__dirname, 'src'),
        loader: 'ts-loader',
      },

      {
        test: STYLESHEET_FILES,
        use: [
          // don't use style-loader because mini-css-extract-plugin is used instead
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: 'sass-loader',
          },
        ],
      },

      {
        exclude: [JAVASCRIPT_FILES, TYPESCRIPT_FILES, STYLESHEET_FILES, /\.(json|html)$/, /^$/],
        type: 'asset/resource',
      },
    ],
  },

  plugins: [
    new webpack.ProgressPlugin(),
    new CleanWebpackPlugin(),

    new ESLintWebpackPlugin({
      files: paths.resolve(__dirname, 'src'),
      extensions: ['js', 'ts'],
    }),

    new MiniCssExtractPlugin({
      filename: assetURL('[name]', '.[chunkhash:8]', '.css'),
      chunkFilename: assetURL('[name]', '.[chunkhash:8]', '.chunk.css'),
    }),

    new HtmlWebpackPlugin({
      inject: 'body',
      template: paths.resolve(__dirname, 'src', 'index.html'),
    }),
  ].filter((p) => p != null),

  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
      new CssMinimizerPlugin(),
    ],
  },
};
