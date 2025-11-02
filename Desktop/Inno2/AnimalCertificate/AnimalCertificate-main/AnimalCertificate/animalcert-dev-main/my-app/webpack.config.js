const webpack = require('webpack');

module.exports = {
    plugins: [
        // Work around for Buffer is undefined:
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ]
}