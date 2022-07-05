import { hot } from 'react-hot-loader/root'
import ReactDOM from 'react-dom'
import { configure } from 'mobx'
import React from 'react'
import '@/frame/i18n'
import '@/frame/request'
import Root from './frame'
import locale from 'antd/lib/locale/zh_CN'
import { ConfigProvider } from 'antd'
import 'moment/locale/zh-cn'
import './css/index.less'

configure({ enforceActions: 'never' })

const HotRoot = hot(Root)

ReactDOM.render(
  <ConfigProvider locale={locale}>
    <HotRoot />
  </ConfigProvider>,
  document.getElementById('appContainer'),
)
