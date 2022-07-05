module.exports = function (config) {
  config.externals = Object.assign({}, config.externals, {
    'gm-i18n': 'gmI18n',
    echarts: 'echarts',
  })
  config.devServer = Object.assign({}, config.devServer, {
    host: 'localhost',
  })
  if (process.env.GM_API_ENV) {
    try {
      config.devServer.proxy[0].target = process.env.GM_API_ENV
    } catch (e) {
      console.log(e)
    }
  }
  return config
}
