// 只允许使用yarn
if (!/yarn\.js$/.test(process.env.npm_execpath || '')) {
  console.warn('\u001b[33m请使用yarn.\u001b[39m\n')
  process.exit(1)
}
