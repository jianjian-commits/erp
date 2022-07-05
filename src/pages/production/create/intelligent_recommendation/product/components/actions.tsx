import { t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { Flex, Button } from '@gm-pc/react'

import { history } from '@/common/service'

const Actions = observer(() => {
  const handleAddGoods = () => {}

  return (
    <Flex justifyCenter className='gm-margin-top-20'>
      <Button
        onClick={() => {
          history.push('/production/production_task/list/create')
        }}
      >
        {t('取消')}
      </Button>
      <Button
        type='default'
        className='gm-margin-left-20'
        onClick={() => {
          history.push(
            '/production/task/pack_task/create/intelligent_recommendation/algorithm_setting',
          )
        }}
      >
        {t('返回上一步')}
      </Button>
      <Button
        type='primary'
        className='gm-margin-left-20'
        onClick={handleAddGoods}
      >
        {t('添加商品')}
      </Button>
    </Flex>
  )
})

export default Actions
