
const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports =  {
    mode: 'production',
    entry: {
        app: './src/produce.js',
    },
    plugins: [
        new CleanWebpackPlugin(),
    ],
    output: {
        filename: 'formValidate.min.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
    },
    module:{
        rules:[
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            }
        ],
    }
};