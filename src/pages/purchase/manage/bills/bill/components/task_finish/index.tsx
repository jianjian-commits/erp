import { i18next, t } from 'gm-i18n'
import React, { useState, useEffect } from 'react'
import Big from 'big.js'
import { Collapse, ProgressCircle, Flex, Button, Modal } from '@gm-pc/react'
import { Table } from '@gm-pc/table-x'
import SvgSuccess from '@/svg/success.svg'
import { observer } from 'mobx-react'
import store from './store'
import {
  UpdatePurchaseTask,
  PurchaseTask_Status,
  PurchaseTask,
} from 'gm_api/src/purchase'
import { gmHistory } from '@gm-common/router'
import { getBaseUnitName } from '../../../../../util'
import { toFixed } from '@/common/util'

const TaskFinish = (props: { ids: string[] }) => {
  const [active, setActive] = useState(false)

  useEffect(() => {
    store.fetchList(props.ids)
    store.setSelected(props.ids)
  }, [props.ids])

  function handleCollapse() {
    setActive(!active)
  }

  function handleBack() {
    gmHistory.replace('/purchase/manage/bills')
    Modal.hide()
  }

  function handleSubmit() {
    const selected = store.selected.slice()
    const task = selected.map((id) => ({
      ...store.purchaseTaskMap[id],
      status: PurchaseTask_Status.FINISHED,
    }))
    if (!task.length) {
      handleBack()
      return
    }
    return UpdatePurchaseTask({
      purchase_tasks: task,
    }).then(() => {
      handleBack()
      return null
    })
  }

  function handleSelect(selected: string[]) {
    store.setSelected(selected)
  }

  return (
    <Flex column>
      <Flex alignCenter justifyCenter className='gm-text-16'>
        <SvgSuccess className='gm-margin-right-10 gm-text-24 gm-text-primary' />
        {i18next.t('采购单据已提交！')}
      </Flex>
      {store.list.length > 0 ? (
        <Flex column>
          <div className='gm-text-14'>
            {i18next.t('确认以下任务已完成')}：{store.selected.length}
          </div>
          <Collapse active={active}>
            <Table<PurchaseTask>
              isSelect
              tiled
              keyField='purchase_task_id'
              data={store.list.slice()}
              selected={store.selected}
              onSelect={handleSelect}
              fixedSelect
              columns={[
                {
                  Header: t('商品名'),
                  accessor: 'sku.sku.name',
                },
                {
                  Header: t('已采/计划'),
                  accessor: 'purchase_value',
                  Cell: (props) => {
                    const task = props.original
                    const name = getBaseUnitName(
                      task.plan_value?.input?.unit_id!,
                    )
                    const percentage = +toFixed(
                      Big(task.purchase_value?.input?.quantity || 0)
                        .div(+task.plan_value?.input?.quantity! || 1)
                        .times(100),
                    )
                    return (
                      <Flex alignCenter>
                        <ProgressCircle
                          percentage={percentage > 100 ? 100 : percentage}
                          size={35}
                        />
                        (
                        {toFixed(
                          Big(task.purchase_value?.input?.quantity || '0'),
                        ) + name}
                        /
                        {(task.plan_value?.input?.quantity!
                          ? toFixed(Big(task.plan_value?.input?.quantity!))
                          : '-') + name}
                        )
                      </Flex>
                    )
                  },
                },
              ]}
            />
          </Collapse>
        </Flex>
      ) : null}
      <Flex justifyCenter>
        <a href='javascript:;' onClick={handleCollapse}>
          {active ? i18next.t('收起详情 ') : i18next.t('展开任务详情 ')}
        </a>
      </Flex>
      <div className='gm-text-right gm-padding-top-10'>
        <Button type='primary' onClick={handleSubmit}>
          {t('确定')}
        </Button>
      </div>
    </Flex>
  )
}

export default observer(TaskFinish)
