import React, { FC, useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import { Flex, Tabs, Tip } from '@gm-pc/react'
import { observer, Observer } from 'mobx-react'
import store from '../store'
import PurchaseDetail from './purchase_detail'
import Merchants from './merchants'
import AssociatedPlan from './associated_plan'
import PrePlan from './pre_purchase_plan'
import SplitNumberTabs from './split_number_tabs'
import {
  map_PurchaseTask_Status,
  DeletePurchaseTask,
  UpdatePurchaseTask,
} from 'gm_api/src/purchase'
import { toFixed } from '@/common/util'
import Big from 'big.js'
import _ from 'lodash'
import { GoodDetailProps } from '../interface'

const GoodDetail: FC<GoodDetailProps> = ({ index }) => {
  const { active, list, skuSnaps, setDrawerVisible } = store
  const task = list[index]
  // const { rate = 1, unit_name = '' } = task
  // 采购明细 和 预采购有联动，其中一个tab的某条数据被删了，则需要联动更新另一个tab的数据
  const [data, setData] = useState<{ [key: string]: any }[]>([])
  const [planValue, setPlanValue] = useState('0')
  const [needValue, setNeedValue] = useState('0')

  useEffect(() => {
    // 处理list数据 传给每个tab数据
    const _list = (task?.request_details?.request_details || []).map(
      (v, index) => {
        const sku = skuSnaps[`${task.sku_id}`] || {}
        const level_field_id = task.sku_level_filed_id!
        return {
          ...v,
          ...sku,
          unit_name: task?.unit_name || '',
          // 预采购删除用，因为预采购显示的list是过滤后的data
          _index: index,
          level_field_id,
          // 需求数
          need:
            toFixed(Big(v?.val?.input?.quantity! || 0).div(+task?.rate || 1)) ||
            0,
        }
      },
    )
    if (task?.plan_value?.input?.quantity) {
      setPlanValue(
        toFixed(Big(task?.plan_value?.input?.quantity).div(+task?.rate || 1)),
      )
    }
    if (task?.request_value?.input?.quantity) {
      setNeedValue(
        toFixed(
          Big(task?.request_value?.input?.quantity).div(+task?.rate || 1),
        ),
      )
    }
    setData(_list)
  }, [list, task])

  // 预采购的删除方法
  const handleDeletePrePlan = (index: number) => {
    const _list = _.cloneDeep(data)
    _list.splice(index, 1)
    let _task = Object.assign({}, task, {
      request_details: Object.assign({}, task.request_details, {
        request_details: _list,
      }),
    })
    _task = _.omit(_task, ['plan_value'])
    if (_list.length) {
      UpdatePurchaseTask({ purchase_tasks: [_task] }).then((json) => {
        Tip.success(t('修改成功'))
        store.doRequest()
        return json
      })
    } else {
      DeletePurchaseTask({ purchase_task_ids: [task?.purchase_task_id] }).then(
        (json) => {
          Tip.success(t('删除成功'))
          // RightSideModal.hide()
          setDrawerVisible(false)
          store.doRequest()
          return json
        },
      )
    }
  }

  const tabs = [
    {
      text: t('采购明细'),
      value: '1',
      children: (
        <PurchaseDetail
          task={task}
          planValue={planValue}
          needValue={needValue}
        />
      ),
    },
    {
      text: t('关联客户'),
      value: '2',
      children: <Merchants task={task} />,
    },
    {
      text: t('关联计划'),
      value: '3',
      children: <AssociatedPlan task={task} />,
    },
    {
      text: t('预采购'),
      value: '4',
      children: (
        <PrePlan task={task} data={data} onDelete={handleDeletePrePlan} />
      ),
    },
    {
      text: t('拆分采购计划(按数量)'),
      value: '5',
      children: <SplitNumberTabs data={data} />,
    },
  ]

  return (
    <Flex column>
      <Flex
        alignCenter
        className='gm-padding-lr-20 gm-padding-tb-10 gm-text-14 gm-border-bottom'
      >
        <div className='b-purchase-status b-purchase-status-unpublished'>
          {map_PurchaseTask_Status?.[task?.status] || '-'}
        </div>
        <strong className='gm-margin-lr-10'>{task?.sku?.name}</strong>
      </Flex>
      <Flex column>
        <Observer>
          {() => (
            <Tabs
              tabs={tabs}
              active={active}
              onChange={(active) => {
                store.setActive(active)
              }}
            />
          )}
        </Observer>
      </Flex>
    </Flex>
  )
}

export default observer(GoodDetail)
