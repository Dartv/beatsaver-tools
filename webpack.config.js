const path = require('path');
const fs = require('fs');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { WatchIgnorePlugin, BannerPlugin } = require('webpack');

module.exports = {
  entry: './src/index.tsx',
  target: 'web',
  mode: 'development',
  devtool: false,
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
    'evergreen-ui': 'EvergreenUI',
    'react-hook-form': 'ReactHookForm',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)x?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          babelrc: false,
          presets: [
            ['@babel/preset-typescript'],
            ['@babel/preset-react'],
          ],
        },
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: { configFile: 'tsconfig.json' },
    }),
    new WatchIgnorePlugin({
      paths: [/\.js$/],
    }),
    new BannerPlugin({
      banner: fs.readFileSync(path.join(__dirname, 'banner.txt'), 'utf-8'),
      raw: true,
    }),
  ],
};
