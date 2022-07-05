const path = require('path')

module.exports = {
  extends: ['plugin:gm-react-app/recommended'],
  settings: {
    'import/resolver': {
      // 配置 alias,和 webpack config.resolver.alias 保持一致即可
      'gmfe-alias': {
        common: path.resolve(__dirname, 'src/js/common/'),
        stores: path.resolve(__dirname, 'src/js/stores/'),
        svg: path.resolve(__dirname, 'src/svg/'),
        img: path.resolve(__dirname, 'src/img/'),
        '@': path.resolve(__dirname, 'src/'),
      },
    },
  },
  rules: {
    'promise/always-return': 'off',
    'no-void': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'promise/no-nesting': 'off',
  },
}
