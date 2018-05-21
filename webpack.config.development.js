const path = require('path')
const webpack = require('webpack')

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
      path.resolve(__dirname, 'src', 'assets'),
    ],
    watchContentBase: true,
    hot: true,
    public: 'localhost',
    allowedHosts: [
      'localhost',
      'fcc44c0356ec48c391df95af4f538acf.vfs.cloud9.eu-west-1.amazonaws.com',
    ],
  },
}