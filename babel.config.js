module.exports = (api) => {
  api.cache(true)

  return {
    presets: ['gm-react-app'],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-proposal-private-methods', { loose: true }],
    ],
  }
}
