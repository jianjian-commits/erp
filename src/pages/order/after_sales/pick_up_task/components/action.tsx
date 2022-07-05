import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { TableXUtil } from '@gm-pc/table-x'
import store from '../store'
import _ from 'lodash'
import {
  UpdateAfterSaleOrderTask,
  AfterSaleOrderDetail_TaskStatus,
  AfterSaleOrderDetail_TaskMethod,
} from 'gm_api/src/aftersale'
import { Tip, Flex } from '@gm-pc/react'

interface ActionProps {
  index: number
  status: AfterSaleOrderDetail_TaskStatus
}

const { OperationCell, OperationCellRowEdit, OperationDelete } = TableXUtil

const Action: FC<ActionProps> = observer(({ index, status }) => {
  const { isEditing } = store.list[index]
  const { activeType } = store

  const handleEdit = (index: number) => {
    store.updateListColumn(index, 'isEditing', true)
  }

  const handleEditCancel = (index: number) => {
    store.doRequest()
    store.updateListColumn(index, 'isEditing', false)
  }

  const handleEditSave = (index: number) => {
    const task = store.list[index]
    if (task) {
    }
    const req = _.omit(task, [
      'isEditing',
      'sku_name',
      'category_name',
      'order_code',
      'after_sale_order_serial_no',
      'company',
      'customer',
      'ssu_base_unit_name',
      'route_name',
      'operate_status',
    ])
    store.updateListColumn(index, 'isEditing', false)
    UpdateAfterSaleOrderTask({
      task: req,
    })
      .then(() => {
        handleEditCancel(index)
        // 保存的时候，如果任务状态为已完成，则提示
        if (
          task.task_status ===
            AfterSaleOrderDetail_TaskStatus.TASK_STATUS_DONE &&
          task.task_method ===
            AfterSaleOrderDetail_TaskMethod.TASK_METHOD_PICK_UP
        ) {
          Tip.success(t('修改成功'))
          Tip.tip({
            children: (
              <Flex column>
                <div className='gm-margin-top-5'>{t('提示：')}</div>
                <Flex className='gm-margin-top-10 gm-margin-bottom-10'>
                  <div>{t(`已生成1条销售退货入库记录，`)}</div>
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
        return null
      })
      .catch(() => {
        store.doRequest()
      })
  }

  return (
    <>
      {status === AfterSaleOrderDetail_TaskStatus.TASK_STATUS_UNDONE ? (
        <OperationCellRowEdit
          isEditing={isEditing || false}
          onClick={() => handleEdit(index)}
          onCancel={() => handleEditCancel(index)}
          onSave={() => handleEditSave(index)}
        >
          {/* <OperationDelete
            className='gm-margin-left-20'
            title={t('确认删除')}
            onClick={handleDelete}
          >
            {t('确认删除该计划？')}
          </OperationDelete> */}
        </OperationCellRowEdit>
      ) : (
        <OperationCell>
          {/* <OperationDelete
            className='gm-margin-left-20'
            title={t('确认删除')}
            onClick={handleDelete}
          >
            {t('确认删除该计划？')}
          </OperationDelete> */}
        </OperationCell>
      )}
    </>
  )
})

export default Action
