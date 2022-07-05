import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { Button, Space, Table } from 'antd'
import planStore from '../../store'
import store from '../store'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import { ProduceInfo } from '@/pages/production/plan_management/plan/produce/interface'
import BatchActionBarComponent from '@/common/components/batch_action_bar'
import { TableRowSelection } from 'antd/lib/table/interface'
import {
  map_TaskOutput_State,
  map_Task_State,
  SubmitTaskOutput,
  TaskOutput_State,
  Task_State,
} from 'gm_api/src/production'
import _ from 'lodash'
import OutputSubmit from './output_submit'
import { Tip } from '@gm-pc/react'

interface Props {
  refresh: () => void
}
const List: FC<Props> = ({ refresh }) => {
  const { setSelectedRowKeys, setselectAll, setInitData } = store
  const [visible, setVisible] = useState<boolean>(false)
  const { isProduce } = planStore.producePlanCondition
  const columns: ColumnsType<ProduceInfo> = [
    {
      title: t('生产成品'),
      dataIndex: 'skuName',
      key: 'skuName',
      align: 'center',
    },
    {
      title: t('商品类型'),
      dataIndex: 'skuType',
      key: 'skuType',
      align: 'center',
    },
    {
      title: t('分类'),
      dataIndex: 'category',
      key: 'category',
      align: 'center',
    },
    {
      title: t('状态'),
      dataIndex: 'state',
      key: 'state',
      align: 'center',
    },
    {
      title: t('产出数量（基本单位）'),
      dataIndex: 'outputAmount',
      key: 'outputAmount',
      align: 'center',
      render: (_, v) => {
        const { base_unit_output_amount, baseUnit } = v
        if (!base_unit_output_amount) return
        return `${parseFloat(base_unit_output_amount).toFixed(4)}${baseUnit}`
      },
    },
    (!isProduce && {
      title: t('产出数量（包装单位）'),
      dataIndex: 'pack_outputAmount',
      key: 'pack_outputAmount',
      align: 'center',
      render: (_, v) => {
        const { output_amount, packUnit } = v
        if (!output_amount) return
        return `${parseFloat(output_amount).toFixed(4)}${packUnit}`
      },
    }) as ColumnType<ProduceInfo>,

    {
      title: t('入库数量(基本单位)'),
      dataIndex: 'inputAmount',
      key: 'inputAmount',
      align: 'center',
      render: (_, v) => {
        const { stock_in_amount, baseUnit } = v
        if (!stock_in_amount) return
        return `${parseFloat(stock_in_amount).toFixed(4)}${baseUnit}`
      },
    },
    {
      title: t('入库单编号'),
      dataIndex: 'stockSheetSerialNo',
      key: 'stockSheetSerialNo',
      align: 'center',
      render: (_, v) => {
        const { stock_sheet_serial_no, stock_sheet_id } = v
        return (
          <a
            onClick={() => {
              window.open(
                `#/sales_invoicing/produce/produce_stock_in/detail?sheet_id=${stock_sheet_id}`,
              )
            }}
          >
            {stock_sheet_serial_no}
          </a>
        )
      },
    },
  ]
  const handleModal = () => {
    setVisible((v) => !v)
  }

  const getSubmitInfo = (choseAll: boolean) => {
    let task_output_ids: string[] = []
    _.each(store.selectedRowKeys, (selectedRowKey) => {
      task_output_ids = task_output_ids.concat(selectedRowKey.split(','))
    })
    const req = choseAll
      ? { task_output_ids, list_task_output_group_by_request: store.isAllReq }
      : { task_output_ids }
    return req
  }
  const handleSubmit = () => {
    const req = getSubmitInfo(store.selectAll)
    SubmitTaskOutput(req).then(() => {
      handleModal()
      Tip.success('产出成功')
      planStore.HandleProductionOrder()
      setInitData()
      refresh()
    })
  }

  const rowSelection: TableRowSelection<ProduceInfo> = {
    selectedRowKeys: store.selectedRowKeys,
    checkStrictly: false,
    onChange: (value) => {
      setSelectedRowKeys(value as string[])
    },
    getCheckboxProps: (recond) => {
      if (
        recond.state ===
          map_TaskOutput_State[TaskOutput_State.STATE_SUBMITTED] ||
        recond.taskState !== map_Task_State[Task_State.STATE_FINISHED]
      ) {
        return { disabled: true }
      } else return { disabled: false }
    },
  }

  const handleCheckAll = (isAll: boolean) => {
    store.setselectAll(isAll)
  }

  const handleClose = () => {
    setSelectedRowKeys([])
    setselectAll(false)
  }

  return (
    <>
      <BatchActionBarComponent
        className='gm-margin-tb-15'
        selected={store.selectedRowKeys}
        toggleSelectAll={handleCheckAll}
        onClose={handleClose}
        isSelectAll={store.selectAll}
        count={1}
        ButtonNode={
          <Space size='middle'>
            <Button
              onClick={() => {
                handleModal()
              }}
              disabled={store.selectedRowKeys.length === 0}
            >
              {t('产出提交')}
            </Button>
          </Space>
        }
      />
      <Table<ProduceInfo>
        columns={columns.filter(Boolean)}
        rowSelection={{ ...rowSelection }}
        pagination={false}
        rowKey='key'
        dataSource={store.list}
      />
      <OutputSubmit
        visible={visible}
        handleSubmit={handleSubmit}
        handleCancel={handleModal}
      />
    </>
  )
}

export default observer(List)
