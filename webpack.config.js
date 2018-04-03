const
	path = require('path'),
	webpack = require('webpack'),
	ExtractTextPlugin = require("extract-text-webpack-plugin"),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
	AudioSpritePlugin = require("webpack-audio-sprite-plugin");

module.exports = {
	entry: [
		path.join(__dirname, 'src/js/client.js'),
		path.join(__dirname, 'src/css/style.css')
	],
	output: {
		path: path.join(__dirname,'dist'),
		filename: 'js/bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['es2015']
					}
				}
			},
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract({
					use: 'css-loader',
					fallback: 'style-loader'
				})
			},
			{
				test: /\.html$/,
				include: path.resolve(__dirname, 'src/html/includes'),
				use: ['raw-loader']
			},
			{
				test: /\.(jpe?g|png|gif|svg|mp3)$/i,
				use: 'file-loader'
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin(),
		new ExtractTextPlugin({
			filename: 'css/bundle.css',
			allChunks: true,
		}),
		new AudioSpritePlugin(),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production')
		}),
		new webpack.optimize.UglifyJsPlugin({
			sourceMap: false,
			mangle: false
		})
	]
};