const path = require('path');
const dir = path.resolve(__dirname);

module.exports = {
  entry: {
    app: path.resolve('src', 'js', 'app.js'),
    search: path.resolve('src', 'js', 'search.js')
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
    extensions: ['.ts', '.js', '.tsx', '.jsx']
  }
}