/* eslint-disable no-undefined */

const path = require('path');

const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD = NODE_ENV === 'production';
const IS_DEV = NODE_ENV === 'development';

// constructs a URL (relative to the base URL of static files) of an asset from
// the given components
function assetURL(filename, hash, extension) {
  let fullPath = `assets/${filename}`;

  if (NODE_ENV === 'production') fullPath += `.${hash}`;
  fullPath += `.${extension}`;

  return fullPath;
}

function resolve(...paths) {
  return path.resolve(__dirname, ...paths);
}

// regular expressions for common file types
const JAVASCRIPT_FILES = /\.js$/;
const TYPESCRIPT_FILES = /\.ts$/;
const STYLESHEET_FILES = /\.(s[ca]|c)ss$/;

module.exports = {
  mode: NODE_ENV,
  entry: resolve('src', 'index'),

  devtool: 'source-map',

  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },

  output: {
    filename: assetURL('[name]', '[chunkhash:8]', 'js'),
    chunkFilename: assetURL('[name]', '[chunkhash:8]', 'chunk.js'),
    // publicPath: '/',
    publicPath: '',
    path: IS_PROD ? resolve('build') : undefined,
  },

  devServer: {
    hot: true,
    hotOnly: true,
    inline: true,
    // Disable verbose logging in browser's console, only print errors
    clientLogLevel: 'error',
    // Do not print chunks list on every compilation, only print errors
    stats: 'errors-only',
    publicPath: '/',
    overlay: true,
  },

  module: {
    rules: [
      // {
      //   test: JAVASCRIPT_FILES,
      //   include: resolve('src'),
      //   exclude: /node_modules/,
      //   enforce: 'pre',
      //   use: [
      //     {
      //       loader: 'eslint-loader',
      //       options: {},
      //     },
      //   ],
      // },

      // {
      //   test: JAVASCRIPT_FILES,
      //   include: resolve('src'),
      //   exclude: /node_modules/,
      //   use: [
      //     {
      //       loader: 'babel-loader',
      //       options: { cacheDirectory: true },
      //     },
      //   ],
      // },

      {
        test: TYPESCRIPT_FILES,
        include: resolve('src'),
        exclude: /node_modules/,
        enforce: 'pre',
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },

      {
        test: STYLESHEET_FILES,
        use: [
          // don't use style-loader because mini-css-extract-plugin is used instead
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: IS_DEV,
            },
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              importLoaders: 1,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },

      {
        exclude: [
          JAVASCRIPT_FILES,
          TYPESCRIPT_FILES,
          STYLESHEET_FILES,
          /\.(json|html)$/,
        ],
        use: [
          {
            loader: 'file-loader',
            options: {
              name: assetURL('assets/[name]', '[hash:8]', '[ext]'),
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new webpack.EnvironmentPlugin(['NODE_ENV']),

    new MiniCssExtractPlugin({
      filename: assetURL('[name]', '[chunkhash:8]', 'css'),
      chunkFilename: assetURL('[name]', '[chunkhash:8]', 'chunk.css'),
    }),

    new HtmlWebpackPlugin({
      inject: 'body',
      template: resolve('src', 'index.html'),
    }),

    IS_DEV ? new webpack.HotModuleReplacementPlugin() : null,
  ].filter(p => p != null),

  optimization: {
    // extracts webpack runtime into a different chunk
    runtimeChunk: true,
    // https://gist.github.com/sokra/1522d586b8e5c0f5072d7565c2bee693
    splitChunks: { chunks: 'all' },
    // use file paths as module IDs
    // https://medium.com/webpack/predictable-long-term-caching-with-webpack-d3eee1d3fa31
    namedModules: true,

    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
      }),
      new OptimizeCSSAssetsPlugin(),
    ],
  },
};
