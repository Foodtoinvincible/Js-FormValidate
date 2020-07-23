

const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const app = express();
const config = require('./webpack.dev.js');
const compiler = webpack(config);


app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath
}));

app.listen(config.devServer.port,'localhost',  ()=> {
    console.log(`Example app listening on port ${config.devServer.port}!\n`);
});