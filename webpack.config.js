const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const Merge = require('webpack-merge');

// process['traceDeprecation'] = true;

const CommonConfig = (Mode) => {
    return {
        entry: {
            index: path.resolve(__dirname, 'src/js/index.js'),
            //login: path.resolve(__dirname, 'src/js/login.js'),
        },
        output: {
            path: path.resolve(__dirname, Mode.dir),
            publicPath: '/',
            filename: 'js/[name]' + (Mode.isDebug ? '.js' : '.[hash].js'),
        },
        resolve: {
            alias: {
                'css': path.resolve(__dirname, 'src/css'),
                'img': path.resolve(__dirname, 'src/img'),
                'common': path.resolve(__dirname, 'src/js/common'),
                'component': path.resolve(__dirname, 'src/component'),
                'root': path.resolve(__dirname, 'src/js/root'),
            },
        },
        devServer: {
            contentBase: path.resolve(__dirname, Mode.dir),
            host: '0.0.0.0',
        },
        module: {
            rules: [{
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env', 'react', 'stage-1'],
                    },
                }
            }, {
                test: /\.less/,
                exclude: /node_modules/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [{
                        loader: 'css-loader',
                    }, {
                        loader: 'postcss-loader',
                        options: {
                            plugins: function () {
                                return [autoprefixer];
                            }
                        },
                    }, {
                        loader: 'less-loader'
                    }]
                })
            }, {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [{
                        loader: 'css-loader',
                    }]
                })
            }, {
                test: /\.(gif|png|jpe?g)$/i,
                use: [{
                    loader: 'url-loader',
                    options: {
                        name: 'img/[name]' + (Mode.isDebug ? '.[ext]' : '.[hash].[ext]'),
                        limit: 8192,
                    }
                }]
            }, {
                test: /\.(eot|svg|ttf|woff2?)$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        name: 'font/[name]' + (Mode.isDebug ? '.[ext]' : '.[hash].[ext]'),
                        limit: 8192,
                    }
                }],
            }],
        },
        plugins: [

            // 清除原文件夹
            new CleanWebpackPlugin([Mode.dir], {
                verbose: true,
            }),

            // 编译 index.html
            new HtmlWebpackPlugin({
                filename: 'index.html',
                template: 'src/index.html',
                chunks: ['index'],
                inject: 'body',
                mode: Mode,
            }),

            // 打包 login.html
            /*new HtmlWebpackPlugin({
                filename: 'Login.html',
                template: 'src/Login.html',
                chunks: ['login'],
                inject: 'body',
                mode: Mode,
            }),*/

            // 设置全局引用，在代码中不需要 import 即可使用
            new webpack['ProvidePlugin']({
                _: 'underscore',
            }),

            new webpack['DllReferencePlugin']({
                context: __dirname,
                manifest: path.resolve(__dirname, 'src/js/vendors/manifest' + (Mode.isDebug ? '.json' : '.min.json')),
            }),

            // 分离CSS
            new ExtractTextPlugin("css/[name]" + (Mode.isDebug ? '.css' : '.[hash].css')),

            // 设置环境变量
            new webpack['DefinePlugin']({
                process: {
                    env: {
                        'NODE_ENV': Mode.isDebug ? JSON.stringify('development') : JSON.stringify('production'),
                    }
                }
            }),
        ],
    }
};

const DevConfig = (Mode) => {
    return {
        plugins: [
            new CopyWebpackPlugin([
                {context: 'src', from: '*.ico'},
                //{context: 'src', from: 'debug.html'},
                {context: 'src', from: 'lib/**/*'},
                {context: 'src', from: 'pages/**/*'},
                {context: 'src', from: 'web/api/**/*'},
                {context: 'src', from: 'js/vendors/*.js'},
            ])
        ]
    }
};

const ProdConfig = (Mode) => {
    return {
        plugins: [
            new CopyWebpackPlugin([
                {context: 'src', from: '*.ico'},
                //{context: 'src', from: 'debug.html'},
                {context: 'src', from: 'lib/**/*'},
                {context: 'src', from: 'pages/**/*'},
                {context: 'src', from: 'js/vendors/vendors.*.min.js'},
            ]),

            new webpack['optimize']['UglifyJsPlugin']({
                output: {
                    comments: Mode.isDebug,
                },
                compress: {
                    warnings: Mode.isDebug,
                }
            }),
        ]
    }
};

module.exports = (env) => {
    const Mode = {
        dir: env,
        isDebug: 'Debug' === env,
    };

    if (Mode.isDebug) {
        return Merge(CommonConfig(Mode), DevConfig(Mode));
    } else {
        return Merge(CommonConfig(Mode), ProdConfig(Mode));
    }
};
