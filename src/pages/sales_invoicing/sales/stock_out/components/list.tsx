import * as React from 'react'
import { FC } from 'react'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  TableXUtil,
  BatchActionDefault,
  Table,
  Column,
  TableProps,
} from '@gm-pc/table-x'
import {
  BoxTableInfo,
  BoxTable,
  Button,
  RightSideModal,
  Price,
  BoxTableProps,
} from '@gm-pc/react'

import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'
import { Customer, GroupUser } from 'gm_api/src/enterprise/types'
import { Warehouse } from 'gm_api/src/inventory/types'
import { Permission } from 'gm_api/src/enterprise'

import { history } from '@/common/service'
import TableTotalText from '@/common/components/table_total_text'
import PermissionJudge from '@/common/components/permission_judge'
import {
  getFormatTimeForTable,
  getUnNillText,
  isValid,
  openNewTab,
  toFixedByType,
} from '@/common/util'

import { ListStatusTabs, PrintModal } from '@/pages/sales_invoicing/components'
import { ReceiptStatusAllKey } from '@/pages/sales_invoicing/interface'
import { canDeleteReceipt } from '@/pages/sales_invoicing/util'
import StockSheetLink from '@/pages/sales_invoicing/components/stock_sheet_link'

import {
  RECEIPT_STATUS,
  STOCK_OUT_RECEIPT_STATUS_NAME,
  STOCK_OUT_RECEIPT_TABS,
} from '../../../enum'

import globalStore from '@/stores/global'
import { ListSotre } from '../stores/index'

const { OperationHeader, OperationCell, OperationDelete } = TableXUtil

const ListRight = observer(() => {
  const handleCreate = () => {
    history.push('/sales_invoicing/sales/stock_out/create')
  }

  return (
    <PermissionJudge
      permission={Permission.PERMISSION_INVENTORY_CREATE_SALE_OUT_SHEET}
    >
      {!globalStore.isLite && (
        <Button type='primary' onClick={handleCreate}>
          {t('新建销售出库单')}
        </Button>
      )}
    </PermissionJudge>
  )
})

const ListTable = observer((props: ListProps) => {
  const {
    list,
    getAdditionInfo,
    deleteReceipt,
    getFilterParams,
    batchUpdateReceipt,
  } = ListSotre

  const _columns: Column[] = [
    {
      Header: t('建单时间'),
      accessor: 'create_time',
      minWidth: 100,
      Cell: (cellProps) => {
        const { create_time } = cellProps.original
        return getFormatTimeForTable('YYYY-MM-DD', create_time)
      },
    },
    {
      Header: t('收货时间'),
      accessor: 'estimated_time',
      minWidth: 100,
      Cell: (cellProps) => {
        const { estimated_time } = cellProps.original
        return getFormatTimeForTable('YYYY-MM-DD HH:mm', estimated_time)
      },
    },
    {
      Header: t('仓库'),
      accessor: 'warehouse_name',
      minWidth: 110,
      show: !globalStore.isLite,
      Cell: (cellProps: any) => {
        const { warehouse_id } = cellProps.row.original
        const warehouse = getAdditionInfo<Warehouse>('warehouses', warehouse_id)
        return getUnNillText(warehouse?.name)
      },
    },
    {
      Header: t('出库时间'),
      accessor: 'stock_sheet_id5',
      minWidth: 110,
      Cell: (cellProps) => {
        const { out_stock_time } = cellProps.original
        return getFormatTimeForTable('YYYY-MM-DD HH:mm', out_stock_time)
      },
    },
    {
      Header: t('销售出库单号'),
      accessor: 'sale_out_stock_sheet_id',
      minWidth: 100,
      Cell: (cellProps) => {
        const {
          sale_out_stock_sheet_id,
          sale_out_stock_sheet_serial_no,
          sheet_status,
        } = cellProps.original
        return (
          <StockSheetLink
            url='/sales_invoicing/sales/stock_out'
            sheetStatus={sheet_status}
            showText={sale_out_stock_sheet_serial_no}
            stockSheetId={sale_out_stock_sheet_id}
          />
        )
      },
    },
    {
      Header: t('客户'),
      accessor: 'target_name',
      minWidth: 100,
      Cell: (cellProps) => {
        const { customer_id, customer_name } = cellProps.original
        const customer = getAdditionInfo<Customer>('customers', customer_id)
        return customer?.name || customer_name
      },
    },
    {
      Header: t('关联订单号'),
      accessor: 'order_serial_no',
      minWidth: 100,
      Cell: ({ original: { order_serial_no } }) => {
        return order_serial_no || '-'
      },
    },
    {
      Header: t('单据金额'),
      accessor: 'amount',
      minWidth: 100,
      Cell: ({ original: { amount } }) => {
        return isValid(amount)
          ? toFixedByType(amount, 'dpInventoryAmount') + Price.getUnit()
          : '-'
      },
    },
    {
      Header: t('单据状态'),
      accessor: 'stock_sheet_id3',
      minWidth: 100,
      Cell: (cellProps) => {
        return STOCK_OUT_RECEIPT_STATUS_NAME[cellProps.original.sheet_status]
      },
    },
    {
      Header: t('单据备注'),
      accessor: 'remark',
      hide: globalStore.isLite,
      minWidth: 100,
      Cell: ({ original: { remark } }) => {
        return isValid(remark) ? remark : '-'
      },
    },
    {
      Header: t('建单人'),
      accessor: 'creator_id',
      hide: globalStore.isLite,
      minWidth: 100,
      Cell: (cellProps) => {
        const { creator_id } = cellProps.original
        const groupUser = getAdditionInfo<GroupUser>('group_users', creator_id)
        return getUnNillText(groupUser?.name)
      },
    },
    {
      Header: OperationHeader,
      accessor: 'operate',
      hide: globalStore.isLite,
      width: TableXUtil.TABLE_X.WIDTH_OPERATION,
      diyItemText: t('操作'),
      Cell: (cellProps) => {
        return (
          <OperationCell>
            {canDeleteReceipt(cellProps.original.sheet_status) && (
              <OperationDelete
                disabled={
                  !globalStore.hasPermission(
                    Permission.PERMISSION_INVENTORY_DELETE_SALE_OUT_SHEET,
                  )
                }
                title={t('确认删除')}
                onClick={() => {
                  deleteReceipt(cellProps.index).then(() => {
                    props.onFetchList()
                    return null
                  })
                }}
              >
                {t('确认删除该单据？')}
              </OperationDelete>
            )}
          </OperationCell>
        )
      },
    },
  ]

  const handlePopupPrintModal = (
    selected: string[],
    isSelectedAll: boolean,
  ) => {
    const req = isSelectedAll
      ? getFilterParams()
      : {
          sheet_ids: selected,
          with_details: true,
        }
    return ListPrintingTemplate({
      paging: { limit: 999 },
      type: PrintingTemplate_Type.TYPE_OUT_STOCK,
    }).then((json) => {
      RightSideModal.render({
        onHide: RightSideModal.hide,
        style: { width: '300px' },
        children: (
          <PrintModal
            name='sales_stock_out_print'
            onPrint={({ printing_template_id }: any) => {
              const stock_sheet_req = JSON.stringify(req)
              openNewTab(
                `#system/template/print_template/stock_out_template/print?tpl_id=${printing_template_id}&stock_sheet_req=${stock_sheet_req}&type=sale_out`,
              )
              RightSideModal.hide()
            }}
            templates={json.response.printing_templates}
          />
        ),
      })
      return json
    })
  }

  const handleCheckStock = (
    selected: string[],
    isSelectedAll: boolean,
    onEnsure: (selected: string[], isSelectedAll: boolean) => Promise<any>,
  ) => {
    onEnsure(selected, isSelectedAll)
  }

  const handleBatchSubmit = (selected: string[], isSelectedAll: boolean) => {
    return batchUpdateReceipt(selected, isSelectedAll, 'submitted').then(() => {
      globalStore.showTaskPanel('1')
      return null
    })
  }

  const handleBatchApproval = (selected: string[], isSelectedAll: boolean) => {
    return batchUpdateReceipt(selected, isSelectedAll, 'approved').then(() => {
      globalStore.showTaskPanel('1')
      return null
    })
  }

  return (
    <BoxTable
      pagination={props.pagination}
      info={
        <BoxTableInfo>
          <TableTotalText
            data={[
              {
                label: t('单据总数'),
                content: props.pagination?.paging.count,
              },
            ]}
          />
        </BoxTableInfo>
      }
      action={<ListRight />}
    >
      <Table
        isBatchSelect
        isDiy
        id='sales_stock_out_list'
        keyField='sale_out_stock_sheet_id'
        fixedSelect
        columns={_columns}
        data={list}
        loading={props.loading}
        batchActions={
          _.without(
            [
              !globalStore.isLite && {
                children: (
                  <BatchActionDefault>{t('批量打印')}</BatchActionDefault>
                ),
                onAction: handlePopupPrintModal,
              },
              !globalStore.isLite &&
                globalStore.hasPermission(
                  Permission.PERMISSION_INVENTORY_EXPORT_SALE_OUT_SHEET,
                ) && {
                  children: (
                    <BatchActionDefault>{t('批量提交')}</BatchActionDefault>
                  ),
                  onAction: (selected: any[], isSelectedAll: boolean) =>
                    handleCheckStock(
                      selected,
                      isSelectedAll,
                      handleBatchSubmit,
                    ),
                },
              globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_APPROVE_SALE_OUT_SHEET,
              ) && {
                children: (
                  <BatchActionDefault>
                    {t(globalStore.isLite ? '批量出库' : '批量审核通过')}
                  </BatchActionDefault>
                ),
                onAction: (selected: any[], isSelectedAll: boolean) =>
                  handleCheckStock(
                    selected,
                    isSelectedAll,
                    handleBatchApproval,
                  ),
              },
            ],
            false,
          ) as TableProps['batchActions']
        }
      />
    </BoxTable>
  )
})

interface ListProps extends Pick<BoxTableProps, 'pagination'> {
  onFetchList: () => any
  loading: boolean
}
const List: FC<ListProps> = observer((props) => {
  const { activeType, changeFilter, changeActiveType } = ListSotre
  const { onFetchList, loading, pagination } = props

  const handleChange = (type: ReceiptStatusAllKey) => {
    changeFilter('stock_sheet_status', RECEIPT_STATUS[type])
    changeActiveType(type)
    onFetchList()
  }
  if (globalStore.isLite)
    return (
      <ListTable
        onFetchList={onFetchList}
        loading={loading}
        pagination={pagination}
      />
    )
  return (
    <ListStatusTabs
      active={activeType}
      onChange={handleChange}
      tabComponent={
        <ListTable
          onFetchList={onFetchList}
          loading={loading}
          pagination={pagination}
        />
      }
      tabData={STOCK_OUT_RECEIPT_TABS}
    />
  )
})

export default List
export { ListTable }
