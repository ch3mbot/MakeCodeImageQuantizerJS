const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env, argv) => ( {
    //devtool: env.production ? 'hidden-source-map' : 'eval-source-map',

    optimization: {
        // minimizer: [
        //     new TerserPlugin({
        //         terserOptions: {
        //             keep_fnames: true,
        //             keep_classnames: true,
        //         },
        //     }),
        // ],
        // usedExports: true,
    },
    // mode: 'development',
    entry: {
        imageProcessing: './src/imageProcessing.js',
        index: {
            dependOn: 'imageProcessing',
            import: './src/index.js'
        }
    },
    output: {
        filename: '[name].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
});