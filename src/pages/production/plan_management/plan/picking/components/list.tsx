import React, { FC, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import { Table, Modal, Button, Tooltip } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import type { TableRowSelection } from 'antd/lib/table/interface'
import type { ColumnsType } from 'antd/lib/table'
import BatchActionBarComponent from '@/common/components/batch_action_bar'
import { t } from 'gm-i18n'
import {
  ListTaskInputRequest_ViewType,
  MaterialOrder_State,
} from 'gm_api/src/production'
import store from '../store'
import { Flex, Tip } from '@gm-pc/react'
import { PickingListType, OriginalListType } from '../type'
import CreateOrderModal from './create_order_modal'
import SubmitOrderModal from './submit_order_modal'
import OrderDetailModal from './order_detail_modal'
import _ from 'lodash'
import MaterialPrint from '@/pages/production/plan_management/plan/picking/components/material_print'
import Big from 'big.js'

const { confirm } = Modal

const List: FC<{ refresh(): void; paging: any }> = ({ refresh, paging }) => {
  const [createVisible, setCreateVisible] = useState(false)
  const [submitVisible, setSubmitVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const materialRef = useRef<{ handleChangeModal: () => void }>()

  const rowSelection: TableRowSelection<PickingListType | OriginalListType> = {
    selectedRowKeys: store.selectedRowKeys,
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      const data = selectedRows.filter((row: any) => !row.children)
      store.setSelectedData(data)
      store.setSelectedRowKeys(selectedRowKeys)
    },
    onSelect: (record: any, selected: any, selectedRows: any) => {
      if (!selected) {
        store.setSelectAll(false)
      }
    },
  }

  const handleDelete = (id: string) => {
    confirm({
      title: t('状态回退'),
      content: (
        <>
          <div>{t('警告：')}</div>
          <div>{t('1、只有未提交的领料单原料可以回退状态；')}</div>
          <div>
            {t(
              '2、状态回退后，原料将回退到未生成领料单的状态，可再次生成领料单；',
            )}
          </div>
        </>
      ),
      onOk() {
        store.deleteMaterial(id).then(() => {
          Tip.success(t('删除成功'))
          return refresh()
        })
      },
    })
  }

  const handleShowOrderDetail = (id: string) => {
    store.getMaterialOrder(id).then(() => setDetailVisible(true))
    // setDetailVisible(true)
  }

  const handleClearSelect = () => {
    store.initSelectedData()
  }

  // true: 全选所有页 false: 全选当前页
  const handleSelectAll = (bool: boolean) => {
    const { keys, data } = store.getAllSelected(store.list)
    store.setSelectedRowKeys(keys)
    store.setSelectedData(data)
    store.setSelectAll(bool)
  }

  const originalColumns: ColumnsType<OriginalListType> = [
    {
      title: t('物料名称'),
      dataIndex: 'name',
      key: 'name',
      width: 120,
      fixed: 'left',
    },
    {
      title: t('物料类型'),
      dataIndex: 'skuType',
      key: 'skuType',
      width: 120,
    },
    {
      title: t('物料分类'),
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: t('需求数量（基本单位）'),
      dataIndex: 'planUsageAmount',
      key: 'planUsageAmount',
      width: 120,
      render: (planUsageAmount: string, record: any) => {
        if (!planUsageAmount) return
        return `${planUsageAmount}${record.baseUnit}`
      },
    },
    {
      title: t('领料车间'),
      dataIndex: 'processorWorkShop',
      key: 'processorWorkShop',
      width: 120,
    },
    {
      title: t('领料小组'),
      dataIndex: 'processorGroup',
      key: 'processorGroup',
      width: 120,
    },
    {
      title: t('领料出库数量（基本单位）'),
      dataIndex: 'receiveAmount',
      key: 'receiveAmount',
      width: 120,
      render: (receiveAmount: string, record: any) => {
        if (!receiveAmount) return
        const planUsageAmount = record.planUsageAmount
        // 领料出库数>0、需求数>0、且需求数不等于领料出库数时，领料出库数标红显示
        if (
          Big(receiveAmount).gt(0) &&
          Big(planUsageAmount).gt(0) &&
          !Big(planUsageAmount).eq(receiveAmount)
        ) {
          return (
            <Flex alignCenter justifyCenter>
              <span className='tw-mr-1'>{`${receiveAmount}${record.baseUnit}`}</span>
              <Tooltip title={t('需求数对应的计划生产数/领料出库单数被修改')}>
                <ExclamationCircleOutlined style={{ color: 'red' }} />
              </Tooltip>
            </Flex>
          )
        }
        return `${receiveAmount}${record.baseUnit}`
      },
    },
    {
      title: t('领料单编号'),
      dataIndex: 'serialNo',
      key: 'serialNo',
      width: 120,
      render: (serialNo: string, record: any) => {
        if (!serialNo || serialNo === '-') return serialNo
        const materialOrderId = record.materialOrderId || ''
        return (
          <a onClick={() => handleShowOrderDetail(materialOrderId)}>
            {serialNo}
          </a>
        )
      },
    },
    {
      title: t('领料出库单编号'),
      dataIndex: 'stockSheetSerialNo',
      key: 'stockSheetSerialNo',
      width: 120,
      render: (no: string, record: any) => {
        if (!no || no === '-') return no
        const sheetId = record?.sheetId || ''
        return (
          <a
            onClick={() =>
              window.open(
                `#/sales_invoicing/produce/picking_stock_out/detail?sheet_id=${sheetId}`,
              )
            }
          >
            {no}
          </a>
        )
      },
    },
    {
      title: t('备注'),
      dataIndex: 'batch',
      key: 'batch',
      width: 120,
    },
  ]

  const pickingColumns: ColumnsType<PickingListType> = [
    {
      title: t('领料单名称'),
      dataIndex: 'serialNo',
      key: 'serialNo',
      width: 120,
      fixed: 'left',
      render: (serialNo: string, record: any) => {
        if (serialNo && record.children) {
          const materialOrderId = record.materialOrderId
          // const [category, state, no] = serialNo.split('-')
          return (
            <>
              {/* {category}-{state}- */}
              <a onClick={() => handleShowOrderDetail(materialOrderId)}>
                {serialNo}
              </a>
            </>
          )
        }
        return undefined
      },
    },
    {
      title: t('物料名称'),
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: t('物料类型'),
      dataIndex: 'skuType',
      key: 'skuType',
      width: 120,
    },
    {
      title: t('物料分类'),
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: t('领料车间'),
      dataIndex: 'processorWorkShop',
      key: 'processorWorkShop',
      width: 120,
    },
    {
      title: t('领料小组'),
      dataIndex: 'processorGroup',
      key: 'processorGroup',
      width: 120,
    },
    {
      title: t('需求数量（基本单位）'),
      dataIndex: 'planUsageAmount',
      key: 'planUsageAmount',
      width: 120,
      render: (planUsageAmount: string, record: any) => {
        if (!planUsageAmount) return
        const receiveAmount = record.receiveAmount
        // 领料出库数>0，需求数等于0，需求数标红显示
        if (Big(receiveAmount).gt(0) && Big(planUsageAmount).eq(0)) {
          return (
            <Flex alignCenter justifyCenter>
              <span className='tw-mr-1'>{`${planUsageAmount}${record.baseUnit}`}</span>
              <Tooltip title={t('该领料数据对应的需求被删')}>
                <ExclamationCircleOutlined style={{ color: 'red' }} />
              </Tooltip>
            </Flex>
          )
        }
        return `${planUsageAmount}${record.baseUnit}`
      },
    },
    {
      title: t('领料出库数量（基本单位）'),
      dataIndex: 'receiveAmount',
      key: 'receiveAmount',
      width: 120,
      render: (receiveAmount: string, record: any) => {
        if (!receiveAmount) return
        const planUsageAmount = record.planUsageAmount
        // 领料出库数>0、需求数>0、且需求数不等于领料出库数时，领料出库数标红显示
        if (
          Big(receiveAmount).gt(0) &&
          Big(planUsageAmount).gt(0) &&
          !Big(planUsageAmount).eq(receiveAmount)
        ) {
          return (
            <Flex alignCenter justifyCenter>
              <span className='tw-mr-1'>{`${receiveAmount}${record.baseUnit}`}</span>
              <Tooltip title={t('需求数对应的计划生产数/领料出库单数被修改')}>
                <ExclamationCircleOutlined style={{ color: 'red' }} />
              </Tooltip>
            </Flex>
          )
        }
        return `${receiveAmount}${record.baseUnit}`
      },
    },
    {
      title: t('领料出库单编号'),
      dataIndex: 'stockSheetSerialNo',
      key: 'stockSheetSerialNo',
      width: 120,
      render: (no: string, record: any) => {
        if (!no || no === '-') return no
        const sheetId = record?.sheetId || ''
        return (
          <a
            onClick={() =>
              window.open(
                `#/sales_invoicing/produce/picking_stock_out/detail?sheet_id=${sheetId}`,
              )
            }
          >
            {no}
          </a>
        )
      },
    },
    {
      title: t('备注'),
      dataIndex: 'batch',
      key: 'batch',
      width: 120,
    },
    {
      title: t('操作'),
      dataIndex: 'action',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (text: string, record: any) => {
        const state = record.state
        const id = record.taskInputId
        if (state === MaterialOrder_State.STATE_NOT_SUBMITTED && id) {
          return (
            <div>
              <a onClick={() => handleDelete(id)}>{t('删除')}</a>
            </div>
          )
        }
      },
    },
  ]

  const hasSelected = store.selectedData.length > 0

  const columnsMap: any = {
    [ListTaskInputRequest_ViewType.VIEW_TYPE_CATEGORY]: originalColumns,
    [ListTaskInputRequest_ViewType.VIEW_TYPE_MATERIAL_ORDER]: pickingColumns,
  }

  const buttonMap: any = {
    [ListTaskInputRequest_ViewType.VIEW_TYPE_CATEGORY]: (
      <Button
        className='tw-mr-2'
        disabled={!hasSelected}
        onClick={() => setCreateVisible(true)}
      >
        {t('生成领料单')}
      </Button>
    ),
    [ListTaskInputRequest_ViewType.VIEW_TYPE_MATERIAL_ORDER]: (
      <Flex alignCenter>
        <Button
          className='tw-mr-2'
          disabled={!hasSelected}
          onClick={() => setSubmitVisible(true)}
        >
          {t('提交领料单')}
        </Button>
        <Button
          className='tw-mr-2'
          disabled={!hasSelected}
          onClick={() => {
            materialRef.current!.handleChangeModal()
          }}
        >
          {t('打印领料单')}
        </Button>
      </Flex>
    ),
  }

  return (
    <>
      <Flex alignCenter className='tw-my-3'>
        <BatchActionBarComponent
          selected={store.selectedData}
          count={paging.count} // 这里的count指的是总数量
          onClose={handleClearSelect}
          isSelectAll={store.selectAll}
          toggleSelectAll={(bool: boolean) => handleSelectAll(bool)}
          ButtonNode={buttonMap[store.filter.view_type]}
        />
      </Flex>
      <CreateOrderModal
        visible={createVisible}
        setVisible={setCreateVisible}
        refresh={refresh}
        data={store.selectedData}
      />
      <SubmitOrderModal
        visible={submitVisible}
        setVisible={setSubmitVisible}
        data={store.selectedData}
        refresh={refresh}
      />
      <OrderDetailModal visible={detailVisible} setVisible={setDetailVisible} />
      <Table<PickingListType | OriginalListType>
        expandable={{
          expandedRowKeys: store.list.map((e) => e.key),
          expandIcon: () => null,
        }}
        columns={columnsMap[store.filter.view_type]}
        rowSelection={{ ...rowSelection, checkStrictly: false }}
        pagination={false}
        dataSource={store.list}
        scroll={{ x: 1300 }}
        sticky
      />
      <MaterialPrint ref={materialRef} />
    </>
  )
}

export default observer(List)
