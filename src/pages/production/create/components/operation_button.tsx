import ButtonGroupFixed from '@/common/components/button_group_fixed'
import { history } from '@/common/service'
import globalStore from '@/stores/global'
import { useGMLocation } from '@gm-common/router'
import { Tip } from '@gm-pc/react'
import { Modal, Button } from 'antd'
import Big from 'big.js'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { observer } from 'mobx-react'
import qs from 'qs'
import React, { FC } from 'react'
import { ProductDetailInfo, ProductPlanType, Query } from '../interface'
import store from '../store'

const Operation: FC<ProductPlanType> = observer(({ type }) => {
  const location = useGMLocation<Query>()
  const { name, productionOrderId, filter } = location.query
  const handleCancel = () => {
    history.push(
      `/production/plan_management/plan?productionOrderId=${productionOrderId}&${qs.stringify(
        { filter: filter },
      )}`,
    )
  }

  const handleCreateTask = () => {
    // 过滤空项
    const { product_details } = store.taskInfo
    const list: ProductDetailInfo[] = _.filter(
      product_details,
      (d) => d.sku_id !== '',
    )
    if (!list.length) {
      Tip.tip(t('请填写商品信息'))
      return
    }

    // 校验当前是否有未填写的数量商品
    const noAmountSkus = _.filter(
      list,
      (item) => Big(item.order_amount || 0).toFixed(2) === '0.00',
    )
    if (noAmountSkus.length) {
      Tip.tip(t('商品数量不可为空或为0，请修改'))
      return
    }
    Modal.confirm({
      title: t('发布需求'),
      content: (
        <>
          <span> 是否确认将需求发布在</span>
          <span className='gm-text-red'>{`（${name}）`}</span>
          <span> 生产计划中，发布后交期将以生产计划的交期为主</span>
        </>
      ),
      okText: t('确认'),
      cancelText: t('取消'),
      onOk: () => {
        store.createTask().then(() => {
          globalStore.showTaskPanel('1')
          handleCancel()
        })
      },
    })
  }

  return (
    <>
      <ButtonGroupFixed
        onCancel={() => {
          history.go(-1)
        }}
        ButtonNode={
          <>
            <Button
              type='primary'
              onClick={handleCreateTask}
              className='gm-margin-left-10'
            >
              {t('发布需求')}
            </Button>
          </>
        }
      />
    </>
  )
})
export default Operation
