

const ThreadsPlugin = require('threads-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
    // モード値を production に設定すると最適化された状態で、
    // development に設定するとソースマップ有効でJSファイルが出力される
    mode: "development",
  
    // メインとなるJavaScriptファイル（エントリーポイント）
    entry: "./src/index.ts",
    // ファイルの出力設定
    output: {
      //  出力ファイルのディレクトリ名
      path: `${__dirname}/app`,
      // 出力ファイル名
      filename: "main.js"
    },
    module: {
      rules: [
        {
          // 拡張子 .ts の場合
          test: /\.tsx?$/,
          // TypeScript をコンパイルする
          loader: 'ts-loader',
          options:{
            appendTsSuffixTo:[/\.vue$/],
          }
        },
        {
          test:/\.css$/,
          loaders: [
            'style-loader',
            'css-loader',
          ]
        },
        {
          test:/\.vue$/,
          loaders:[
            'vue-loader'
          ]
        }
      ]
    },
    // import 文で .ts ファイルを解決するため
    resolve: {
      extensions: [".ts", ".js",'.vue'],
      alias: {
        vue$: "vue/dist/vue.esm.js"
      },
    },
    plugins: [
      new ThreadsPlugin({
        
      }),
      new VueLoaderPlugin(),
        //new CopyPlugin([{ from: './build' }])
    ],
    externals:{
      "tiny-worker": "tiny-worker",
    }
  };