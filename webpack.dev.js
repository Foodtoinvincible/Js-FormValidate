const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports =  {

    mode: 'development',

    entry: {
        app: './src/index.js',
    },
    devtool: 'inline-source-map',
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
    ],
    devServer: {
        contentBase: './dev',
        port: 8080,
    },
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dev'),
        publicPath: '/'
    },
    module:{
        rules:[
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            },
            {
                test: /\.css$/,
                use:["style-loader","css-loader"]
            }
        ],
    }
};
