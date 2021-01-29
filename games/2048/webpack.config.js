const path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
require('dotenv').config()

module.exports = (_, argv)=>{

    return   {
        entry: { main: './src/index.js'},

        output: {
            path: path.join(__dirname, 'dist'),
            filename: '[name].js',
        },

        // plugins: [new HtmlWebpackPlugin({
        //     template: 'index.html',
        //     filename: './index.html',
        // })],

        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader"
                    }
                },
                {
                    exclude: /node_modules/,
                    test: /\.worker\.js$/,
                    loader: 'worker-loader',
                    options : {
                        inline : 'no-fallback',
                        publicPath: path.join(__dirname, '..'),
                    }
                },
            ]
        },

        devtool: 'cheap-source-map',
        devServer: {
            liveReload: false,
            hot: true,
            // contentBase: path.join(__dirname, ''),
            // publicPath: ''
        },
    }

}



