const path = require('path');

module.exports = (env, argv)=>{

    return   {
        entry: { main: './src/index.js'},
        output: {
            path: path.join(__dirname, '../public', 'js'),
            filename: '[name].js',
        },
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
            contentBase: path.join(__dirname, '../public'),
            publicPath: '/js/'
        },
    }

}



