import React from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { BoxTable, BoxTableProps, Button, Modal } from '@gm-pc/react'
import { Table, BatchActionDefault, Column } from '@gm-pc/table-x'
import {
  Operation,
  SheetStatus,
  GroupUser,
  Quantity,
} from '../components/index'
import Turnover from '../../components/turnModal'
import { formatSecond } from '@/pages/sales_invoicing/util'
import store from '../stores/lend_store'
import globalStore from '@/stores/global'
import { getUnNillText } from '@/common/util'

const columns: Column[] = [
  {
    Header: t('客户编码'),
    diyGroupName: t('基础字段'),
    Cell: (cellProps) => {
      const { customerInfo } = cellProps.original
      return customerInfo?.customized_code ?? '-'
    },
  },
  {
    Header: t('客户名称'),
    diyGroupName: t('基础字段'),
    Cell: (cellProps) => {
      const { customerInfo } = cellProps.original
      return customerInfo?.name ?? '-'
    },
  },
  {
    Header: t('关联订单'),
    diyGroupName: t('基础字段'),
    Cell: (cellProps) => {
      const { related_sheet_serial_no } = cellProps.original
      return related_sheet_serial_no || '-'
    },
  },
  {
    Header: t('周转物名称'),
    diyGroupName: t('基础字段'),
    Cell: (cellProps) => {
      const {
        skuInfo: {
          sku: { name },
        },
      } = cellProps.original
      return name
    },
  },
  {
    Header: t('数量'),
    diyGroupName: t('基础字段'),
    Cell: (cellProps) => {
      return (
        <Quantity
          index={cellProps.index}
          data={cellProps.original}
          updateSheetInfo={store.updateSheetInfo}
        />
      )
    },
  },
  {
    Header: t('状态'),
    diyGroupName: t('基础字段'),
    Cell: (cellProps) => {
      return (
        <SheetStatus
          index={cellProps.index}
          data={cellProps.original}
          type='lend'
          updateSheetInfo={store.updateSheetInfo}
        />
      )
    },
  },
  {
    Header: t('司机'),
    diyGroupName: t('基础字段'),
    Cell: (cellProps) => {
      return (
        <GroupUser
          index={cellProps.index}
          data={cellProps.original}
          updateSheetInfo={store.updateSheetInfo}
        />
      )
    },
  },
  {
    Header: t('仓库'),
    accessor: 'warehouse_name',
    Cell: (cellProps: any) => {
      const { warehouse_name } = cellProps.row.original
      return getUnNillText(warehouse_name)
    },
  },
  {
    Header: t('创建时间'),
    diyGroupName: t('基础字段'),
    Cell: (cellProps) => {
      const { create_time } = cellProps.original
      return formatSecond(create_time)
    },
  },
  {
    Header: t('借出时间'),
    diyGroupName: t('基础字段'),
    Cell: (cellProps) => {
      const { submit_time } = cellProps.original
      return Number(submit_time) ? formatSecond(submit_time) : '-'
    },
  },
  {
    Header: t('操作'),
    diyGroupName: t('基础字段'),
    Cell: (cellProps) => {
      return (
        <Operation
          index={cellProps.index}
          data={cellProps.original}
          updateSheetInfo={store.updateSheetInfo}
          updateSheet={store.updateSheet}
          doRequest={store.doRequest}
        />
      )
    },
  },
]

const List = observer(({ pagination }: Pick<BoxTableProps, 'pagination'>) => {
  const { list } = store

  const handleBatchStock = (selected: string[], isSelectAll: boolean) => {
    store.batchUpdateStock(selected, isSelectAll, 'submitted').then(() => {
      globalStore.showTaskPanel('1')
      return null
    })
  }

  return (
    <BoxTable
      pagination={pagination}
      action={
        <>
          <Button
            type='primary'
            onClick={() => {
              Modal.render({
                title: t('周转物借出'),
                size: 'md',
                children: (
                  <Turnover
                    sheetInfo={store.sheetInfo}
                    createSheetInfo={store.createSheetInfo}
                    createSheet={store.createSheet}
                    doRequest={store.doRequest}
                    clearSheet={store.clearSheet}
                    type='lend'
                  />
                ),
                onHide: () => {
                  Modal.hide()
                  store.clearSheet()
                },
              })
            }}
          >
            {t('周转物借出')}
          </Button>
        </>
      }
    >
      <Table
        isBatchSelect
        keyField='stock_sheet_id'
        data={list.slice()}
        columns={columns}
        batchActions={[
          {
            children: <BatchActionDefault>{t('批量借出')}</BatchActionDefault>,
            onAction: handleBatchStock,
          },
        ]}
      />
    </BoxTable>
  )
})

export default List
