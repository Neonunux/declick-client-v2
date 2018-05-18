const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

const src = (...paths) => path.resolve(__dirname, '..', 'src', ...paths)
const lib = (...paths) => src(path.join('js', 'libs', ...paths))
const nodeModule = (...paths) => path.resolve(__dirname, '..', 'node_modules', ...paths)

module.exports = {
	mode: 'development',
	resolve: {
		alias: {
			'@': src('js', 'declick'),
			'ace': nodeModule('ace-builds', 'src-noconflict', 'ace'),
			'ace_modules': nodeModule('ace-builds', 'src-noconflict'),
			'acorn': lib('acorn', 'acorn'),
			'quintus': lib('quintus-0.2.0', 'quintus-all'),
			'jquery.ui.draggable': lib('jquery.ui-1.11.2', 'draggable'),
			'jquery.ui.widget': lib('jquery.ui-1.11.2', 'widget'),
			'jquery.iframe-transport': lib('jquery-file-upload', 'jquery.iframe-transport'),
			'jquery.fileupload': lib('jquery-file-upload', 'jquery.fileupload'),
			'js-interpreter': lib('js-interpreter', 'interpreter'),
			'platform-pr': lib('pem-task', 'platform-pr'),
			'Prism': lib('prism', 'prism'),
			'split-pane': lib('split-pane', 'split-pane'),
			'wColorPicker': lib('wpaint-2.5.0', 'wColorPicker.min'),
			'wPaint': lib('wpaint-2.5.0', 'wPaint.min'),
			'wPaint.file': lib('wpaint-2.5.0', 'plugins', 'file', 'wPaint.menu.main.file.min'),
			'wPaint.flip': src('js', 'declick', 'plugins', 'wPaint.menu.main.flip'),
			'wPaint.main': lib('wpaint-2.5.0', 'plugins', 'main', 'wPaint.menu.main.min'),
			'wPaint.shapes': lib('wpaint-2.5.0', 'plugins', 'shapes', 'wPaint.menu.main.shapes.min'),
			'wPaint.text': lib('wpaint-2.5.0', 'plugins', 'text', 'wPaint.menu.text.min'),
		},
	},
	entry: {
		app: ['./src/js/declick/main.js']
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		publicPath: '/images/',
		filename: 'bundle.js'
	},
	module: {
		rules: [{
				test: /\.(png|jpg|gif)$/,
				loader: 'url-loader',
				include: [src('images'), src('js', 'declick', 'objects')],
			},
			{
				test: /\.html$/,
				loader: 'raw-loader',
				include: src('components'),
			},
		],
	},
	plugins: [
		new webpack.ProvidePlugin({
			'$': 'jquery',
			'jQuery': 'jquery',
			'window.jQuery': 'jquery',
		}),
		new HtmlWebpackPlugin({
			template: src('index.html'),
			filename: 'index.html',
		}),
	],
	optimization: {
		minimize: false,
	},
	performance: {
		hints: false,
	},
}