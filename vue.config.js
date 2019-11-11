module.exports = {
    runtimeCompiler: true,
    // wasn't working inside package.json's "vue" key
    configureWebpack: {
      node: {
        __filename: true
      }
    }
}