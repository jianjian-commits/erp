import React, { useEffect, useState } from 'react'
import { Tabs } from 'antd'
import { observer } from 'mobx-react'
import { setTitle } from '@gm-common/tool'

import TemplateList from './components/template_list'
import Carousel from './components/carousel'
import AppInstanceList from './components/app_instance_list'
import './style.less'
import store from './store'

const { TabPane } = Tabs

/**
 * 同步页面的组件函数
 */
const ApplicationCenter = () => {
  const [tabKey, setTabKey] = useState('1')
  useEffect(() => {
    setTitle('应用中心')
    return () => setTitle('')
  }, [])
  useEffect(() => {
    tabKey === '1' ? store.getTemplateList() : store.getAppInstanceList()
  }, [tabKey])
  return (
    <div className='gm-application-center'>
      <Tabs activeKey={tabKey} onChange={setTabKey}>
        <TabPane tab='推荐应用' key='1'>
          <>
            {/* <Carousel /> */}
            <TemplateList />
          </>
        </TabPane>
        <TabPane tab='我的应用' key='2'>
          <AppInstanceList />
        </TabPane>
      </Tabs>
    </div>
  )
}

export default observer(ApplicationCenter)
