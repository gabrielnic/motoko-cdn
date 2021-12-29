const webpack = require('webpack');
const path = require('path');

let localCanisters, prodCanisters, canisters;

let localEnv = true;

function initCanisterIds() {
  try {
    localCanisters = require(path.resolve(".dfx", "local", "canister_ids.json"));
  } catch (error) {
    console.log("No local canister_ids.json found. Continuing production");
  }
  try {
    prodCanisters = require(path.resolve("canister_ids.json"));
    localEnv = false;
  } catch (error) {
    console.log("No production canister_ids.json found. Continuing with local");
  }

  const network =
    process.env.REACT_APP_DFX_NETWORK ||
    (process.env.REACT_APP_DFX_NETWORK === "production" && !localEnv ? "ic" : "local");

  canisters = network === "local" || localEnv ? localCanisters : prodCanisters;
  for (const canister in canisters) {
    process.env[canister.toUpperCase() + "_CANISTER_ID"] =
      canisters[canister][network];
  }
};

initCanisterIds();

const isDevelopment = process.env.NODE_ENV !== "production" || localEnv;

const asset_entry = path.join(
  "src",
  "assets",
  "src",
  "index.html"
);


module.exports = {
  mode : "development",
  eslint: {
    enable: false,
  },
  css: {
    loaderOptions: { /* Any css-loader configuration options: https://github.com/webpack-contrib/css-loader. */ },
    loaderOptions: (cssLoaderOptions, { env, paths }) => { return cssLoaderOptions; }
  },
  webpack: {
    alias: {},
    plugins: [
      new webpack.EnvironmentPlugin({
        DFX_NETWORK: process.env.REACT_APP_DFX_NETWORK,
        BACKEND_CANISTER_ID: canisters["backend"],
        CDN_CANISTER_ID: canisters["cdn"],
        NODE_ENV: isDevelopment,
      }),
    ],
    configure: { /* Any webpack configuration options: https://webpack.js.org/configuration */ },
    configure: (webpackConfig, { env, paths }) => { return webpackConfig; }
  },
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        pathRewrite: {
          "^/api": "/api",
        },
      },
    },
    hot: true,
  },
  plugins: {
    plugin: {
      overrideWebpackConfig: ({ webpackConfig, pluginOptions }) => {
        return {
          ...webpackConfig,
          mode: isDevelopment ? "development" : "production",
          entry: {
            index: path.join(__dirname, asset_entry).replace(/\.html$/, ".js"),
          },
          devtool: isDevelopment ? "source-map" : false,
          optimization: {
            minimize: !isDevelopment,
            minimizer: [new TerserPlugin()],
          },
          resolve: {
            extensions: [".js", ".ts", ".jsx", ".tsx"],
            fallback: {
              assert: require.resolve("assert/"),
              buffer: require.resolve("buffer/"),
              events: require.resolve("events/"),
              stream: require.resolve("stream-browserify/"),
              util: require.resolve("util/"),
            },
          },
          output: {
            filename: "index.js",
            path: path.join(__dirname, "build"),
          },
        };
      } 
    },
  }
};
