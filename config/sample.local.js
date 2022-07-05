module.exports = {
  port: 5555,
  proxy: [
    {
      context: ['/ceres'],
      target: 'https://x.guanmai.cn/', // 线上环境
      // target: 'https://env-develop.x.k8s.guanmai.cn/',  // 测试环境
      changeOrigin: true,
    },
  ],
  // autoRouterReg: '/^\\.\\/(customer|demo|login).*?index\\.page\\./',
}
