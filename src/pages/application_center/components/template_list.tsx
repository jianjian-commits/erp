import React from 'react'
import { observer } from 'mobx-react'
import { Flex } from '@gm-pc/react'

import ApplicationItem from './application_item'
import store from '../store'
function TemplateList() {
  const { templatelist } = store
  return (
    <div>
      {templatelist.map(({ title, list }) => {
        return (
          <div key={title}>
            <div className='gm-application-center-group-title'>{title}</div>
            <Flex wrap>
              {list.map((item) => {
                return <ApplicationItem key={item.app_template_id} {...item} />
              })}
            </Flex>
          </div>
        )
      })}
    </div>
  )
}

export default observer(TemplateList)
