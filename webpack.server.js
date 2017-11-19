const path = require('path')
const nodeExternals = require('webpack-node-externals')
console.log('hereo', __dirname, path.resolve(__dirname), path.resolve('./'))

module.exports = {
  devtool: 'source-map',
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
    require: false
  },
  externals: [nodeExternals()],
  entry: './server/index',
  output: {
    path: path.resolve('./'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs'
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
        test: /\.coffee$/,
        use: [
          {
            loader: 'coffee-loader',
            options: {
              sourceMap: true,
              transpile: {
                'presets': ['node8'],
                'plugins': []
              }
            }
          }
        ]
      }
    ]
  }
}
