const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    dashboard: [path.join(__dirname, './client/containers/dashboard/index.jsx')],
  },
  output: {
    path: path.join(__dirname, 'www/assets/'),
    publicPath: 'assets/',
    filename: './js/[name].[contenthash].js',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      '@components': path.join(__dirname, './client/components'),
      '@containers': path.join(__dirname, './client/containers'),
      '@utils': path.join(__dirname, './client/utils'),
    },
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|server)/,
        use: ['babel-loader'],
      },
      {
        test: /\.(css)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: 'assets/',
            },
          },
          'css-loader',
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: 'assets/',
            },
          },
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.jpe?g$|\.gif$|\.ico$|\.png$|\.svg$/,
        use: {
          loader: 'file-loader',
          options: {
            publicPath: 'assets/',
            name: 'img/[contenthash].[ext]',
          },
        },
      },
      {
        test: /\.(ttf|eot|woff|woff2|svg)$/,
        use: {
          loader: 'file-loader',
          options: {
            publicPath: 'assets/',
            name: 'fonts/[contenthash].[ext]',
          },
        },
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css',
      chunkFilename: 'css/[id].[contenthash].css',
    }),
    new AntdDayjsWebpackPlugin(),
    // new BundleAnalyzerPlugin()
  ],
};
