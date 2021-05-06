const path = require('path');
const webpack = require('webpack');
const dir = path.resolve(__dirname);

module.exports = {
  entry: {
    base: path.resolve('src', 'js', 'base.js'),
    registrySearch: path.resolve('src', 'js', 'registrySearch.js')
  },
  output: {
    path: path.resolve('assets', 'js'),
    filename: '[name].js'
  },
  target: 'web',
  resolve: {
    modules: [
      path.resolve(dir), 'node_modules',
    ],
    extensions: ['.ts', '.js']
  }
}