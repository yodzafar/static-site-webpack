const path = require ('path');
const fs = require ('fs')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyWebpackPlugin= require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

function generateHtmlPlugins(templateDir) {
    const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
    return templateFiles.map(item => {
      const parts = item.split(".");
      const name = parts[0];
      const extension = parts[1];
      return new HtmlWebpackPlugin({
        filename: `${name}.html`,
        template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
        inject: false
      });
    });
  }
  
  const htmlPlugins = generateHtmlPlugins("./src/html/views");

  const config = {
    watch:true,
    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
      },
    entry: ['./src/js/index.js', './src/sass/style.sass'],
    output: {
        filename: './js/bundle.js'
    },
    devtool: 'source-map',
    optimization: {
        minimizer: [
          new UglifyJsPlugin(),
          new OptimizeCSSAssetsPlugin()
        ]
      },
    module: {
        rules: [{
                test: [/.js$|.ts$/],
                include: path.resolve(__dirname, 'src/js'),
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options:{
                        presets: ['@babel/preset-env', '@babel/preset-typescript',]
                    }
                }
            },
            {
                test: [/.css$ |.sass$/],
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader', 
                    'sass-loader',
                ]
            },
            {
                test: /\.html$/,
                include: path.resolve(__dirname, "src/html/includes"),
                use: ["raw-loader"]
              }
        ]
    },
   plugins:[
    new MiniCssExtractPlugin({filename: './css/style.css',}),
   ...htmlPlugins,
   new CopyWebpackPlugin([
       {
           from: './src/fonts',
           to:'./fonts'
       },
       {
        from: './src/img',
        to:'./img'
    },
    {
        from: './src/favicon',
        to:'./favicon'
    },
   ])
]
}

module.exports = (env, argv) => {
    if (argv.mode === "production") {
      config.plugins.push(new CleanWebpackPlugin());
    }
    return config;
  };