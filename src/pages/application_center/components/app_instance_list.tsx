import React from 'react'
import { observer } from 'mobx-react'
import { Flex } from '@gm-pc/react'
import { Empty } from 'antd'
import AppInstanceItem from './app_instance_item'
import store from '../store'
function AppInstanceList() {
  const { appInstancelist } = store
  const hasApp = !!appInstancelist.length
  return (
    <Flex
      row
      justifyBetween={hasApp}
      justifyCenter={!hasApp}
      alignCenter={!hasApp}
      wrap
    >
      {hasApp ? (
        appInstancelist.map((item, index) => {
          return <AppInstanceItem key={item.app_template_id} index={index} />
        })
      ) : (
        <Empty description='暂无应用' />
      )}
    </Flex>
  )
}

export default observer(AppInstanceList)
