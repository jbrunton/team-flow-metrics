module.exports = {
  // options...
  devServer: {
    disableHostCheck: true,
    progress: false
  },
  chainWebpack: config => config.resolve.symlinks(false)
};
