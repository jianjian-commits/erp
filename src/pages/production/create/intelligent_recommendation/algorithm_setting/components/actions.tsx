import { t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { Button, Flex, Tip } from '@gm-pc/react'

import { history } from '@/common/service'
import { isValid } from '@/common/util'
import store from '../../store'

const Actions = observer(() => {
  const handleCancel = () => {
    history.push('/production/task/production_task/create')
  }

  const verifyData = () => {
    let canSubmit = true
    const {
      query_order_type,
      query_order_days,
      adjust_ratio,
      stock_up_days,
      stock_up_type,
    } = store.algorithmFilter
    // 日均下单数手动填写天数时，需要校验是否填写天数
    const verifyQueryOrder =
      query_order_type === 1 && !isValid(query_order_days)
    // 预计备货天数手动填写天数时，需要校验是否填写天数
    const verifyStockUp = stock_up_type === 1 && !isValid(stock_up_days)
    const verifyRatio = !isValid(adjust_ratio)

    if (verifyQueryOrder || verifyStockUp || verifyRatio) {
      Tip.danger(t('请填写完整信息'))
      canSubmit = false
    }
    return canSubmit
  }
  const handleRunCompute = () => {
    if (verifyData()) {
      // 执行运算
      store.postStartCompute()
      // 跳转到结果页面
      history.push(
        '/production/task/pack_task/create/intelligent_recommendation/product',
      )
    }
  }

  return (
    <Flex justifyCenter>
      <Button onClick={handleCancel}>{t('取消')}</Button>
      <Button
        type='primary'
        className='gm-margin-left-20'
        onClick={handleRunCompute}
      >
        {t('执行运算')}
      </Button>
    </Flex>
  )
})

export default Actions
