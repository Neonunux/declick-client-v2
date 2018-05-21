const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const merge = require('webpack-merge')

const src = (...paths) => path.resolve(__dirname, 'src', ...paths)
const public_ = (...paths) => path.resolve(__dirname, 'public', ...paths)
const lib = (...paths) => src('libs', ...paths)
const nodeModules = (...paths) => path.resolve(__dirname, 'node_modules', ...paths)

const baseConfig = {
  entry: src('main.js'),
  output: {
    path: path.join(__dirname, '..', 'dist'),
    filename: 'bundle.js',
  },
  resolve: {
    alias: {
      '@': src(),
      'ace': nodeModules('ace-builds', 'src-noconflict', 'ace'),
      'ace_modules': nodeModules('ace-builds', 'src-noconflict'),
      'intro.js': nodeModules('intro.js'),
      'acorn': lib('acorn', 'acorn'),
      'css': src('css'),
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
      'wPaint.flip': src('plugins', 'wPaint.menu.main.flip'),
      'wPaint.main': lib('wpaint-2.5.0', 'plugins', 'main', 'wPaint.menu.main.min'),
      'wPaint.shapes': lib('wpaint-2.5.0', 'plugins', 'shapes', 'wPaint.menu.main.shapes.min'),
      'wPaint.text': lib('wpaint-2.5.0', 'plugins', 'text', 'wPaint.menu.text.min'),
    },
  },
  module: {
    rules: [{
        test: /\.(png|jpg|gif)$/,
        loader: 'url-loader',
        include: [src('assets', 'images'), src('objects'), public_()],
      },
      {
        test: /\.html$/,
        loader: 'raw-loader',
        include: src('components'),
      },
      {
        test: /\.css$/,
        loader: 'style-loader',
        include: [src(), src('assets', 'styles'), src('components'), nodeModules('/'), public_()],
        exclude: [src('libs')],
      },
      {
        test: /\.css$/,
        loader: 'css-loader',
        include: [src(), src('assets', 'styles'), src('components'), nodeModules('/'), public_()],
        exclude: [src('libs')],
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

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}

const extendConfig = require(`./webpack.config.${process.env.NODE_ENV}.js`)

module.exports = merge(baseConfig, extendConfig)

// cleanempty: {
//   options: {
//       files:false,
//       folders:true
//   },
//   src: ['dist/js/declick/objects/**/*']

/*
 // Utility tasks
    grunt.registerTask('set_dist_config', function() {
        var declickConfig = grunt.file.readJSON("dist/resources/config.json");
        declickConfig.optimized = true;
        declickConfig["cache-version"] = grunt.config("cacheVersion");
        if (declickConfig["analytics"] !== 'false') {
            grunt.config("htmlbuild.dist.options.scripts.analytics", declickConfig["analytics"]);
        }
        grunt.file.write("dist/resources/config.json",JSON.stringify(declickConfig));
    });

    grunt.registerTask('get_objects_list', function() {
        var structure = grunt.file.readJSON("src/js/declick/objects/objects.json");
        var objectsList = [];
        for (var entry in structure) {
            objectsList.push("objects/"+structure[entry].path+"/"+entry);
        }
        grunt.config('objectsList',objectsList);
        var objectsListTUI = objectsList.push('TUI');
        grunt.config('objectsListTUI',objectsListTUI);
    });

    grunt.registerTask('merge_files', function() {
        var structure = grunt.file.readJSON("src/js/declick/objects/objects.json");
        structure.TObject = {path:'tobject'};
        structure.TGraphicalObject = {path:'tgraphicalobject'};
        structure.TObject3D = {path:'tobject3d'};
        var messages = {};
        var i18n = {};
        for (var entry in structure) {
            var path = "dist/js/declick/objects/"+structure[entry].path+"/resources/";
            messages[entry] = grunt.file.readJSON(path+"messages.json");
            i18n[entry] = grunt.file.readJSON(path+"i18n.json");
            // delete files
            grunt.file.delete(path+"messages.json");
            grunt.file.delete(path+"i18n.json");
        }
        grunt.file.write("dist/js/declick/objects/messages.json", JSON.stringify(messages));
        grunt.file.write("dist/js/declick/objects/i18n.json", JSON.stringify(i18n));
    });

    grunt.registerTask('set_cache_version', function() {
        var configPath = "dist/resources/config.json";
        if (grunt.file.exists(configPath)) {
            var declickConfig = grunt.file.readJSON("dist/resources/config.json");
            grunt.config('cacheVersion', declickConfig["cache-version"]+1);
        } else {
            grunt.config('cacheVersion', 0);
        }
    });
*/