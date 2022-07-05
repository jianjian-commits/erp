import React, { useState } from 'react'
import { TableXUtil } from '@gm-pc/table-x'
import { observer } from 'mobx-react'
import store from '../store'
import splitStore from '../components/split_purchase_task/store'
import { UpdatePurchaseTask, PurchaseTask_Status } from 'gm_api/src/purchase'
import { Flex, Tip, Button } from '@gm-pc/react'
import { message } from 'antd'
import { t } from 'gm-i18n'
import { Sku_SupplierCooperateModelType, Ssu } from 'gm_api/src/merchandise'
import SplitPurchaseTask from './split_purchase_task'
import _ from 'lodash'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
interface OperationProps {
  index: number
  editDisabled?: boolean
  deleteDisabled?: boolean
}

const Operation = (props: OperationProps) => {
  const [splitVisible, setSpiltVisible] = useState(false)
  const { setChooseSplitTask } = splitStore
  const task = store.list[props.index]

  function handleEdit() {
    store.rowUpdate(props.index, 'isEditing', true)
  }
  function handleCancel() {
    store.getSummary()
    store.doRequest()
    store.rowUpdate(props.index, 'isEditing', false)
  }
  function handleSave() {
    const task = store.list[props.index]
    if (!+task.plan_value?.input?.quantity!) {
      Tip.danger('计划采购数必须大于0')
      return
    }
    const supplierSupport =
      task.supplier_cooperate_model_type ===
        Sku_SupplierCooperateModelType.SCMT_WITH_DELIVERY ||
      task.supplier_cooperate_model_type ===
        Sku_SupplierCooperateModelType.SCMT_WITH_SORTING
    if (
      supplierSupport &&
      task.request_value?.input?.quantity !== task.plan_value?.input?.quantity
    ) {
      Tip.danger(t('当供应商代分拣或代配送时，计划采购数须等于需求数'))
      return
    }
    const purchase_tasks = _.omit(
      store.getParams(props.index),
      'sku_level_name',
      'sku_level_id',
    )
    UpdatePurchaseTask({ purchase_tasks: [purchase_tasks] }).then(() => {
      handleCancel()
      return null
    })
  }
  const handleSplit = () => {
    if (
      task.request_details.request_details.length === 1 &&
      task.supplier_cooperate_model_type !==
        Sku_SupplierCooperateModelType.SCMT_JUST_PROVIDE_GOODS
    )
      return message.error(
        t('该采购计划的来源只有一条且供货模式不为仅供货模式不允许拆分'),
      )
    setChooseSplitTask(task)
    setSpiltVisible(true)
  }

  if (task.status !== PurchaseTask_Status.PREPARE) return <div>-</div>
  const isEditing = store.list[props.index].isEditing
  return (
    <>
      <Flex justifyAround>
        {isEditing ? (
          <Flex justifyAround className='tw-w-full'>
            <Button onClick={handleSave} size='small' type='primary'>
              {t('保存')}
            </Button>
            <Button onClick={handleCancel} size='small'>
              {t('取消')}
            </Button>
          </Flex>
        ) : (
          <Flex alignCenter justifyCenter className='tw-w-full'>
            <a onClick={handleEdit} className='tw-box-border'>
              {t('编辑')}
            </a>

            <PermissionJudge
              permission={Permission.PERMISSION_PURCHASE_SPLIT_PURCHASE_TASK}
            >
              <Flex>
                <div
                  className='tw-mx-2'
                  style={{
                    width: '1px',
                    height: '12px',
                    backgroundColor: '#ccc',
                  }}
                />
                <a onClick={handleSplit}>{t('拆分')}</a>
              </Flex>
            </PermissionJudge>
          </Flex>
        )}
      </Flex>
      {splitVisible && (
        <SplitPurchaseTask
          visible={splitVisible}
          handleCancel={() => setSpiltVisible(false)}
        />
      )}
    </>
  )
}

export default observer(Operation)
