//TODO: Remove the unused constants

const ENVIRONMENT = process.env.NODE_ENV;
const BUILD_NUMBER = process.env.build_number;
const EDITOR_VER = process.env.version_number;

const CONFIG_STRING_REPLACE = [
    { search: '/plugins', replace: '/content-plugins' },
    { search: "/api", replace: '/action' },
    { search: 'https://dev.ekstep.in', replace: '' }
];

const BASE_PATH = './'

const BUILD_FOLDER_NAME = 'generic-editor.zip';

const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const glob = require('glob-all');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CleanWebpackPlugin = require('clean-webpack-plugin');

/**
 * External files 
 */
const VENDOR = [
    "./app/libs/please-wait.min.js",
    "./app/bower_components/jquery/dist/jquery.min.js",
    "./app/bower_components/async/dist/async.min.js",
    "./app/libs/semantic.min.js",
    "./app/bower_components/angular/angular.min.js",
    "./app/bower_components/lodash/dist/lodash.min.js",
    "./app/bower_components/x2js/index.js",
    "./app/bower_components/eventbus/index.js",
    "./app/bower_components/uuid/index.js",
    "./app/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js",
    "./app/bower_components/ng-dialog/js/ngDialog.min.js",
    "./app/bower_components/ngSafeApply/index.js",
    "./app/bower_components/oclazyload/dist/ocLazyLoad.min.js",
    "./app/scripts/genericeditor/md5.js",
    "./app/libs/ng-tags-input.js"
];

var EDITOR_APP = [
    "./app/bower_components/contenteditor/index.js",
    "./app/scripts/genericeditor/bootstrap-editor.js",
    "./app/scripts/genericeditor/genericeditor-config.js",
    "./app/scripts/genericeditor/genericeditor-api.js",
    "./app/scripts/genericeditor/genericeditor-base-plugin.js",
    "./app/scripts/genericeditor/manager/container-manager.js",
    "./app/scripts/genericeditor/manager/canvas-manager.js",
    "./app/scripts/angular/controller/main.js",
    "./app/scripts/angular/directive/template-compiler-directive.js",
];
const APP_STYLE = [
    "./app/bower_components/font-awesome/css/font-awesome.min.css",
    "./app/bower_components/ng-dialog/css/ngDialog.min.css",
    "./app/bower_components/ng-dialog/css/ngDialog-theme-plain.min.css",
    "./app/bower_components/ng-dialog/css/ngDialog-theme-default.min.css",
    "./app/libs/spinkit.css",
    "./app/libs/please-wait.css",
    "./app/libs/ng-tags-input.css"

];

// removing the duplicate files
const APP_SCRIPT = [...new Set([...VENDOR, ...EDITOR_APP])];

if (!BUILD_NUMBER && !EDITOR_VER) {
    console.error('Error!!! Cannot find version_number and build_number env variables');
    return process.exit(1)
}
const VERSION = EDITOR_VER + '.' + BUILD_NUMBER;

module.exports = {
    entry: {
        'script': APP_SCRIPT,
        'style': APP_STYLE,
    },
    output: {
        filename: `[name].min.${VERSION}.js`,
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        alias: {
            'jquery-ui/ui/widgets/menu': path.resolve('./app/bower_components/jquery-ui/ui/widgets/menu.js'),
            'angular': path.resolve('./app/bower_components/angular/angular.js'),
            'Fingerprint2': path.resolve('./app/bower_components/fingerprintjs2/dist/fingerprint2.min.js'),
        }
    },
    module: {
        rules: [{
                test: /\.js$/,
                loader: 'string-replace-loader',
                options: {
                    multiple: CONFIG_STRING_REPLACE,
                    strict: true
                }
            },

            {
                test: require.resolve('./app/bower_components/async/dist/async.min.js'),
                use: [{
                    loader: 'expose-loader',
                    options: 'async'
                }]
            },
            {
                test: require.resolve('./app/libs/eventbus.min.js'),
                use: [{
                    loader: 'expose-loader',
                    options: 'EventBus'
                }]
            },
            {
                test: require.resolve('./app/libs/please-wait.min.js'),
                use: [{
                    loader: 'expose-loader',
                    options: 'pleaseWait'
                }]
            },
            {
                test: require.resolve('./app/bower_components/uuid/index.js'),
                use: [{
                    loader: 'expose-loader',
                    options: 'UUID'
                }]
            },
            {
                test: /\.(s*)css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: false,
                            minimize: true,
                            "preset": "advanced",
                            discardComments: {
                                removeAll: true
                            }
                        }
                    }
                ]
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: [
                    'file-loader',
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 50, //it's important
                            outputPath: './images',
                            name: '[name].[ext]',
                        }
                    },
                ],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf|svg|png)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: './fonts/',
                        limit: 10000,
                        fallback: 'responsive-loader'
                    }
                }]
            },
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new UglifyJsPlugin({
            cache: false,
            parallel: true,
            uglifyOptions: {
                compress: {
                    dead_code: true,
                    drop_console: false,
                    global_defs: {
                        DEBUG: true
                    },
                    passes: 1,
                },
                ecma: 5,
                mangle: true
            },
            sourceMap: true
        }),
        // copy the index.html and templated to eidtor filder
        new CopyWebpackPlugin([{
                from: './app/index.html',
                to: './[name].[ext]',
                toType: 'template'
            },
            {
                from: './app/bower_components/jquery/dist/jquery.min.js',
                to: './'
            },
            {
                from: './app/scripts/coreplugins.js',
                to: './'
            },
            {
                from: './deploy/gulpfile.js',
                to: './'
            },
            {
                from: './deploy/package.json',
                to: './'
            },
            {
                from: './app/libs/jquery-ui.min.js',
                to: './'
            },
            {
                from: './app/libs/semantic.min.js',
                to: './'
            },
            {
                from: './app/libs/contextmenu.min.js',
                to: './'
            },

        ]),
        new ImageminPlugin({
            test: /\.(jpe?g|png|gif|svg)$/i,
            name: '[name].[ext]',
            outputPath: './images',
            pngquant: {
                quality: '65-70'
            }
        }),
        new MiniCssExtractPlugin({
            filename: `[name].min.${VERSION}.css`,
        }),
        new webpack.ProvidePlugin({
            Fingerprint2: 'Fingerprint2',
            Ajv: 'ajv',
            $: "jquery",
            jQuery: "jquery",
            async: 'async'
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.optimize\.css$/g,
            cssProcessor: require('cssnano'),
            cssProcessorOptions: {
                safe: true,
                discardComments: {
                    removeAll: true
                }
            },
            canPrint: true
        }),
        new ZipPlugin({
            path: path.join(__dirname, '.'),
            filename: BUILD_FOLDER_NAME,
            fileOptions: {
                mtime: new Date(),
                mode: 0o100664,
                compress: true,
                forceZip64Format: false,
            },
            pathMapper: function(assetPath) {
                console.log("AssesPath", assetPath)
                if (assetPath.startsWith('gulpfile')) {
                    return path.join('.', path.basename(assetPath));
                }
                if (assetPath.endsWith('.js'))
                    return path.join(path.dirname(assetPath), 'scripts', path.basename(assetPath));
                if (assetPath.endsWith('.css'))
                    return path.join(path.dirname(assetPath), 'styles', path.basename(assetPath));
                if (assetPath.startsWith('fonts')) {
                    return path.join('styles', 'fonts', path.basename(assetPath));
                };
                return assetPath;
            },
            exclude: [`style.min.${VERSION}.js`],
            zipOptions: {
                forceZip64Format: false,
            },
        })
    ],
    optimization: {
        splitChunks: {
            chunks: 'async',
            minSize: 30000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '~',
            name: true,
            cacheGroups: {
                styles: {
                    name: 'style',
                    test: /\.css$/,
                    chunks: 'all',
                    enforce: false
                }
            },
        }
    }

};