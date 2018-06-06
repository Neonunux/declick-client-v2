const path = require('path')
const webpack = require('webpack')

require('dotenv').config()

module.exports = {
  mode: 'development',
  optimization: {
    minimize: false,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
  devServer: {
    contentBase: [
      path.resolve(__dirname, 'dist'),
    ],
    watchContentBase: true,
    hot: true,
    public: process.env.DEV_HOST,
    allowedHosts: [
      'localhost',
      process.env.ALLOWED_HOST
    ],
  },
}