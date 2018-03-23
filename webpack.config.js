var webpack = require("webpack");

module.exports = {
  entry: {
    ash: "./src/ash.js"
  },

  output: {
    path: __dirname + "/dist",
    filename: "ash.js",
    libraryTarget: "var",
    library: "ash"
  }
};
