import React from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { useGMLocation, gmHistory as history } from '@gm-common/router'
import { Flex } from '@gm-pc/react'
import { Space, Tag } from 'antd'
import { Query } from '../../interface'
import store from '../../store'
const DetailHeader = observer(() => {
  const location = useGMLocation<Query>()
  const { name } = location.query
  return (
    <Flex alignCenter className='tw-h-14 tw-pl-8 tw-text-base tw-box-border '>
      <Space size='middle'>
        <span className='tw-align-middle tw-font-bold'>{name}</span>
        <Tag color='green' className='tw-w-9 tw-text-center'>
          {t('在售')}
        </Tag>
        <Tag
          color='default'
          style={{ color: '#626262' }}
          className='tw-w-9 tw-text-center '
        >
          {t('停售')}
        </Tag>
      </Space>
    </Flex>
  )
})
export default DetailHeader
