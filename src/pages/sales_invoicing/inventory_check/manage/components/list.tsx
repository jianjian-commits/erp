import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { TableXUtil, Table, TableProps, Column } from '@gm-pc/table-x'
import {
  BoxTable,
  BoxTableInfo,
  BoxTableProps,
  Button,
  Modal,
} from '@gm-pc/react'
import TableTotalText from '@/common/components/table_total_text'
import { history } from '@/common/service'

import { formatSecond, canDeleteReceipt } from '@/pages/sales_invoicing/util'
import {
  MANAGE_TABS,
  RECEIPT_STATUS,
  STOCK_MANAGE_RECEIPT_STATUS_NAME,
} from '@/pages/sales_invoicing/enum'
import ListStatusTabs from '@/pages/sales_invoicing/components/list_status_tabs'
import { ReceiptStatusAllKey } from '@/pages/sales_invoicing/interface'
import StockSheetLink from '@/pages/sales_invoicing/components/stock_sheet_link'
import store from '../stores/store'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import PermissionJudge from '@/common/components/permission_judge'
import _ from 'lodash'
import BatchCheck from '@/pages/sales_invoicing/inventory_check/manage/components/product_detail/batch_check'
import { getUnNillText } from '@/common/util'

interface InComing extends Pick<BoxTableProps, 'pagination'> {
  onFetchList: () => {}
}

const { OperationHeader, OperationCell, OperationDelete } = TableXUtil

// const { OperationHeader, OperationCell, OperationDelete } = TableXUtil

// const ScopeModal = observer(() => {
//   const { shelfList, shelf_selected } = store
//   return (
//     <Form>
//       <FormItem label={t('盘点范围')} colWidth='270px'>
//         <LevelSelect
//           onSelect={(select) => {
//             // store.changeShelfSelected(select)
//           }}
//           selected={shelf_selected.slice()}
//           data={toJS(shelfList)}
//           right
//         />
//       </FormItem>
//       <FormItem colWidth='290px'>
//         <div className='gm-margin-bottom-10'>
//           {t(
//             '确认盘点范围后,将对盘点范围内的货位进行锁库，不能进行出入库，盘点完成后解除库存。',
//           )}
//         </div>
//       </FormItem>
//       <Flex justifyCenter>
//         <Button
//           onClick={() => {
//             Modal.hide()
//           }}
//         >
//           {t('取消')}
//         </Button>
//         <div className='gm-gap-5' />
//         <Button
//           type='primary'
//           onClick={() => {
//             history.push(
//               `/sales_invoicing/inventory_check/manage/create?shelf_id=`,
//             )
//             Modal.hide()
//           }}
//         >
//           {t('确定')}
//         </Button>
//       </Flex>
//     </Form>
//   )
// })

const ListRight = observer(() => {
  const handleCreate = () => {
    history.push(`/sales_invoicing/inventory_check/manage/create`)
  }

  const handleBatchCheck = () => {
    Modal.render({
      children: <BatchCheck onHide={Modal.hide} />,
      title: t('批量盘点'),
      onHide: Modal.hide,
    })
  }

  return (
    <PermissionJudge
      permission={Permission.PERMISSION_INVENTORY_CREATE_INVENTORY_SHEET}
    >
      <Button type='primary' onClick={handleCreate}>
        {t('新建盘点单')}
      </Button>
      {!globalStore.isLite && (
        <Button
          type='primary'
          className='gm-margin-left-10'
          onClick={handleBatchCheck}
        >
          {t('批量盘点')}
        </Button>
      )}
    </PermissionJudge>
  )
})

const TabList: FC<InComing> = observer((props) => {
  const { groupUsers } = store
  const { onFetchList, pagination } = props

  const columns: Column[] = [
    {
      Header: t('建单时间'),
      accessor: 'create_time',
      Cell: (cellProps) => {
        const { create_time } = cellProps.original
        return formatSecond(create_time)
      },
    },
    {
      Header: t('盘点时间'),
      accessor: 'submit_time',
      Cell: (cellProps) => {
        const { submit_time } = cellProps.original
        return Number(submit_time) ? formatSecond(submit_time) : '-'
      },
    },
    {
      Header: t('盘点仓库'),
      accessor: 'warehouse_id',
      show: !globalStore.isLite,
      Cell: (cellProps: { row: { original: any } }) => {
        const { warehouse_name } = cellProps.row.original
        return getUnNillText(warehouse_name)
      },
    },
    {
      Header: t('盘点单号'),
      accessor: 'stock_sheet_id',
      Cell: (cellProps) => {
        const { stock_sheet_id, stock_sheet_serial_no, sheet_status } =
          cellProps.original
        return (
          <StockSheetLink
            url='/sales_invoicing/inventory_check/manage'
            sheetStatus={sheet_status}
            showText={stock_sheet_serial_no}
            stockSheetId={stock_sheet_id}
          />
        )
      },
    },
    {
      Header: t('盘点商品数'),
      accessor: 'product_num',
      Cell: (cellProps) => {
        const { detail_len } = cellProps.original
        return detail_len || '-'
      },
    },
    {
      Header: t('单据状态'),
      accessor: 'sheet_status',
      hide: globalStore.isLite,
      Cell: (cellProps) => {
        const { sheet_status } = cellProps.original
        return STOCK_MANAGE_RECEIPT_STATUS_NAME[sheet_status]
      },
    },
    {
      Header: t('单据备注'),
      accessor: 'remark',
    },
    {
      Header: t('建单人'),
      accessor: 'creator_id',
      Cell: (cellProps) => {
        const { creator_id } = cellProps.original
        return groupUsers![creator_id]?.name ?? ''
      },
    },
    {
      Header: OperationHeader,
      accessor: 'operate',
      hide: globalStore.isLite,
      diyItemText: t('操作'),
      Cell: (cellProps) => {
        return (
          <OperationCell>
            {canDeleteReceipt(cellProps.original.sheet_status) ? (
              <OperationDelete
                disabled={
                  !globalStore.hasPermission(
                    Permission.PERMISSION_INVENTORY_DELETE_INVENTORY_SHEET,
                  )
                }
                title={t('确认删除')}
                onClick={() => {
                  store.deleteReceipt(cellProps.index).then(() => {
                    onFetchList()
                    return null
                  })
                }}
              >
                {t('确认删除该单据？')}
              </OperationDelete>
            ) : (
              '-'
            )}
          </OperationCell>
        )
      },
    },
  ]
  return (
    <BoxTable
      pagination={pagination}
      info={
        <BoxTableInfo>
          <TableTotalText
            data={[
              {
                label: t('单据总数'),
                content: pagination?.paging.count,
              },
            ]}
          />
        </BoxTableInfo>
      }
      action={<ListRight />}
    >
      <Table
        isBatchSelect={!globalStore.isLite}
        isDiy
        id='purchase_stock_in_list'
        data={store.list.slice()}
        columns={columns}
        keyField='id'
        batchActions={
          _.without(
            [
              // globalStore.hasPermission(
              //   Permission.PERMISSION_INVENTORY_PRINT_INVENTORY_SHEET,
              // ) && {
              //   children: t('批量打印'),
              //   onAction: () => {},
              // },
            ],
            false,
          ) as unknown as TableProps['batchActions']
        }
      />
    </BoxTable>
  )
})

const List: FC<InComing> = observer((props) => {
  const { onFetchList, pagination } = props
  const activeChange = (type: ReceiptStatusAllKey) => {
    store.changeTab(type)
    store.changeFilter('stock_sheet_status', RECEIPT_STATUS[type])
    onFetchList()
  }
  if (globalStore.isLite)
    return <TabList onFetchList={onFetchList} pagination={pagination} />
  return (
    <ListStatusTabs
      tabComponent={
        <TabList onFetchList={onFetchList} pagination={pagination} />
      }
      active='all'
      onChange={activeChange}
      tabData={MANAGE_TABS}
      omitTabs={['cancelApproval']}
    />
  )
})

export default List
