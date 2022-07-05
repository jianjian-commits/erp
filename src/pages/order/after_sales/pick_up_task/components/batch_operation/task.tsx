import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { Flex, Button, Modal, Tip } from '@gm-pc/react'
import type { BatchProps } from '../../interface'
import {
  BatchCompleteAfterSaleOrderTask,
  AfterSaleOrderDetail_TaskMethod,
  AfterSaleOrderDetail_TaskStatus,
} from 'gm_api/src/aftersale'
import store from '../../store'

const Task: FC<BatchProps> = observer(({ selected, isSelectAll = false }) => {
  const handleOk = () => {
    const filterData = store.getSearchData()

    const selectedData = _.filter(store.list, (item) =>
      selected.includes(item.after_sale_order_detail_id),
    )
    const unfinished = _.some(
      selectedData,
      (item) =>
        item.task_method ===
          AfterSaleOrderDetail_TaskMethod.TASK_METHOD_PICK_UP &&
        item.task_status === AfterSaleOrderDetail_TaskStatus.TASK_STATUS_UNDONE,
    )

    const pick_up_task_arr = _.filter(
      selectedData,
      (it) =>
        it.task_status === AfterSaleOrderDetail_TaskStatus.TASK_STATUS_UNDONE,
    )
    const req = {}
    if (isSelectAll) {
      Object.assign(req, {
        ...filterData,
      })
    } else {
      Object.assign(req, {
        task_ids: selected,
      })
    }
    BatchCompleteAfterSaleOrderTask(req).then(() => {
      Modal.hide()
      if (unfinished) {
        Tip.success(t('修改成功'))
        Tip.tip({
          children: (
            <Flex column>
              <div className='gm-margin-top-5'>{t('提示：')}</div>
              <Flex className='gm-margin-top-10 gm-margin-bottom-10'>
                <div>
                  {isSelectAll
                    ? t('已生成销售退货入库记录，')
                    : t(`已生成${pick_up_task_arr.length}条销售退货入库记录，`)}
                </div>
                <a
                  rel='noopener noreferrer'
                  className='gm-text-primary gm-cursor'
                  href='#/sales_invoicing/sales/stock_in?type=task'
                >
                  {t('点击查看')}
                </a>
              </Flex>
            </Flex>
          ),
          onClose: () => {},
        })
      } else {
        Tip.success(t('修改成功'))
      }
      store.doRequest()
      return null
    })
  }

  const handleCancel = () => {
    Modal.hide()
  }

  return (
    <Flex column>
      <div className='gm-margin-left-20 gm-margin-bottom-20'>
        {isSelectAll
          ? t('选中了当前所有页售后任务')
          : t(`已勾选${selected.length}售后任务，确认批量完成任务吗？`)}
      </div>
      <div className='gm-text-right'>
        <Button className='gm-margin-right-10' onClick={handleCancel}>
          {t('取消')}
        </Button>
        <Button type='primary' htmlType='submit' onClick={handleOk}>
          {t('确定')}
        </Button>
      </div>
    </Flex>
  )
})

export default Task
