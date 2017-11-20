const path = require('path')

module.exports = {
  devtool: 'inline-source-map',
  entry: './app/index.js',
  output: {
    path: path.resolve('./dist'),
    filename: 'bundle.js'
  },
  resolve: {
    // add alias for application code directory
    alias: {
      server: path.resolve('./server'),
      shared: path.resolve('./shared'),
      app: path.resolve('./app')
    },
    extensions: ['.js', '.json', '.coffee']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [require('babel-preset-env')],
            plugins: [require('babel-plugin-transform-async-to-generator')]
          }
        }
      },
      {
        test: /\.coffee$/,
        loader: 'coffeescript-loader'
      }
    ]
  }
}
