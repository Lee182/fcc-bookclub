const path = require('path')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')

const commonConfig = {
  devtool: 'inline-source-map',
  entry: ['regenerator-runtime/runtime', './app/index.js'],
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
            presets: [
              ['env', {
                target: {
                  browsers: ['last 2 versions, chrome']
                }
              }]
            ],
            plugins: ['transform-async-to-generator', 'transform-regenerator']
          }
        }
      },
      {
        test: /\.coffee$/,
        loader: 'coffeescript-loader'
      }
    ]
  },
  plugins: [
    new FriendlyErrorsWebpackPlugin()
  ]
}

const productionConfig = () => commonConfig

const developmentConfig = () => {
  const config = {
    devServer: {
      watchContentBase: true,
      contentBase: './dist',
      proxy: {
        '/': {
          target: 'http://localhost:3000',
          ws: true
        }
      },
      overlay: {
        warnings: true,
        errors: true
      },
      quiet: true
    }
  }
  return Object.assign({}, commonConfig, config)
}

module.exports = env => {
  if (env === 'production') {
    return productionConfig()
  }

  return developmentConfig()
}
