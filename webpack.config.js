const path = require('path')

module.exports = {
	entry: './src/globalEntry.ts',
	devtool: 'inline-source-map',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
	},
	optimization: {
		// Disable minification so all symbols show up
		// when using Google Chrome debugger.
		minimize: false,
	},
}
