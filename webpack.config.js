const path = require('path');
const SRC_DIR = path.join(__dirname, '/static/src');
const DIST_DIR = path.join(__dirname, '/static/dist');
const webpack = require('webpack');

module.exports = {
	entry: `${SRC_DIR}/client.js`,
	output: {
		path: DIST_DIR,
		filename: 'bundle.js',
	},
	module: {
		loaders: [
			{
				test: /\.css$/,
				loader: 'style-loader!css-loader'
			},
			{
				test: /\.png$/,
				loader: 'url-loader?limit=100000&minetype=image/png'
			},
			{
				test: /\.jpg/,
				loader: "url-loader?limit=10000&mimetype=image/jpg"
			},
			{
				test: /\.(js|jsx)$/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: ['es2015'],
						},
					},
				],
			},
		]
	},

	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production')
		}),
		new webpack.optimize.UglifyJsPlugin({
			sourceMap: false,
			mangle: false
		})
	]
};