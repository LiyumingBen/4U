const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const Merge = require('webpack-merge');

const CommonConfig = (Mode) => {
    return {
        entry: {
            vendors: [
                'react',
                'react-dom',
                'react-router',
                'react-bootstrap-table',
            ],
        },
        output: {
            path: path.resolve(__dirname, 'src/js/vendors'),
            filename: '[name]' + (Mode.isDebug ? '.js' : '.[hash].min.js'),
            library: '[name]'
        },
        plugins: [

            new webpack['DllPlugin']({
                path: path.resolve(__dirname, 'src/js/vendors/manifest' + (Mode.isDebug ? '.json' : '.min.json')),
                name: '[name]',
                context: __dirname
            }),

            // 设置环境变量
            new webpack['DefinePlugin']({
                process: {
                    env: {
                        'NODE_ENV': Mode.isDebug ? JSON.stringify('development') : JSON.stringify('production'),
                    }
                }
            }),
        ]
    }
};

const DevConfig = (Mode) => {
    return {
        plugins: [
            new CleanWebpackPlugin(['src/js/vendors'], {
                verbose: true,
            })
        ]
    }
};

const ProdConfig = (Mode) => {
    return {
        plugins: [
            // 压缩JS
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

module.exports = () => {
    
    const DevMode = {
        isDebug: true,
    };

    const ProdMode = {
        isDebug: false,
    };
    
    return [
        Merge(CommonConfig(DevMode), DevConfig(DevMode)),
        Merge(CommonConfig(ProdMode), ProdConfig(ProdMode)),
    ];
};
