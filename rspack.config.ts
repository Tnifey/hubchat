import { defineConfig } from '@rspack/cli';
import path from 'path';

export default defineConfig({
    mode: 'development',
    devtool: 'source-map',
    context: path.resolve(__dirname, 'src'),
    entry: {
        'main': './main.ts',
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js',
        clean: true,
    },
    optimization: {
        minimize: false,
        chunkIds: 'deterministic',
        mergeDuplicateChunks: true,
    },
    resolve: {
        extensions: ['.ts', '.js', '.tsx', '.jsx'],
        tsConfigPath: path.resolve(__dirname, 'tsconfig.json'),
    },
    watchOptions: {
        ignored: /node_modules/,
        followSymlinks: true,
    },
    module: {
        rules: [
            {
                exclude: '/node_modules\/(?!maki\/src).*/',
                oneOf: [
                    {
                        test: /\.(t|j)s?$/,
                        exclude: '/node_modules\/(?!maki\/src).*/',
                        use: {
                            loader: 'builtin:swc-loader',
                            options: {
                                jsc: {
                                    parser: {
                                        syntax: 'typescript',
                                        jsx: 'react-jsx',
                                    },
                                },
                            },
                        },
                    },
                ],
            },
        ],
    },
    devServer: {
        port: 3030,
        hot: true,
        https: true,
        historyApiFallback: true,
    },
});
