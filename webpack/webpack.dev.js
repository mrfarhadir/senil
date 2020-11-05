const path = require('path');
const {  prod_Path,  src_Path} = require('./path');

module.exports = {
  entry: {
    'senil.webpack': './' + src_Path + '/index.ts'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    path: path.resolve(__dirname, prod_Path),
    filename: '[name].js'
  },
  devtool: 'source-map',
  devServer: {
    open: true,
  },
  module: {
    rules: [{
      test: /\.ts?$/,
      use: 'ts-loader',
      exclude: /node_modules/
    }]
  }
};