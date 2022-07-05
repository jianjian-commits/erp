import React, { FC } from 'react'
import { Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { BoxTableInfo, BoxTable, Button } from '@gm-pc/react'

import {
  formatDateTime,
  getUnNillText,
  getEnumText,
  toFixOrderWithPrice,
} from '@/common/util'
import { history } from '@/common/service'
import TableTotalText from '@/common/components/table_total_text'
import PermissionJudge from '@/common/components/permission_judge'
import store from '../stores/store'
import { ListStatusTabs } from '@/pages/sales_invoicing/components'
import { TableColumns } from '@/pages/sales_invoicing/interface'
import {
  TREANSFER_STATUS_NAME,
  TRANSFER_TYPE,
  TRANDSFER_STATUS,
  RECEIPT_STATUS,
} from '@/pages/sales_invoicing/enum'

import { Permission } from 'gm_api/src/enterprise'
import { WarehouseTransferSheet } from 'gm_api/src/inventory'
import type { PaginationProps } from '@gm-pc/react'

interface ListTableProps {
  loading: boolean
  pagination: PaginationProps
}

type CellProps = TableColumns<WarehouseTransferSheet>

const ListRight = React.memo(() => {
  const handleCreate = () => {
    history.push(
      '/sales_invoicing/allocation_inventory/allocation_order/create',
    )
  }

  return (
    <PermissionJudge
      permission={Permission.PERMISSION_INVENTORY_CREATE_PURCHASE_IN_SHEET}
    >
      <Button type='primary' onClick={handleCreate}>
        {t('新建调拨申请')}
      </Button>
    </PermissionJudge>
  )
})

const ListTable: FC<ListTableProps> = observer(({ loading, pagination }) => {
  const { list, getRelationInfo } = store

  const _columns = _.without([
    {
      Header: t('建单时间'),
      accessor: 'create_time',
      minWidth: 100,
      Cell: (cellProps: CellProps) => {
        const { create_time } = cellProps.original
        return create_time ? formatDateTime(+create_time) : '-'
      },
    },
    {
      Header: t('审核时间'),
      accessor: 'submit_time',
      minWidth: 100,
      Cell: (cellProps: CellProps) => {
        const { submit_time } = cellProps.original
        return submit_time ? formatDateTime(+submit_time) : '-'
      },
    },
    {
      Header: t('申请编号'),
      accessor: 'serial_no',
      minWidth: 130,
      Cell: (cellProps: CellProps) => {
        const { serial_no, warehouse_transfer_sheet_id } = cellProps.original
        return (
          <a
            className='gm-text-primary gm-cursor'
            href={`#/sales_invoicing/allocation_inventory/allocation_order/detail?sheet_id=${warehouse_transfer_sheet_id}`}
          >
            {serial_no}
          </a>
        )
      },
    },
    {
      Header: t('调拨入库单号'),
      accessor: 'in_stock_sheet_serial_no',
      minWidth: 135,
      Cell: (cellProps: CellProps) => {
        const { in_stock_sheet_serial_no, in_stock_sheet_id } =
          cellProps.original
        return (
          <a
            className='gm-text-primary gm-cursor'
            href={`#/sales_invoicing/allocation_inventory/allocation_stock_in/detail?sheet_id=${in_stock_sheet_id}`}
          >
            {in_stock_sheet_serial_no}
          </a>
        )
      },
    },
    {
      Header: t('调拨出库单号'),
      accessor: 'out_stock_sheet_serial_no',
      minWidth: 135,
      Cell: (cellProps: CellProps) => {
        const { out_stock_sheet_serial_no, out_stock_sheet_id } =
          cellProps.original
        return (
          <a
            className='gm-text-primary gm-cursor'
            href={`#/sales_invoicing/allocation_inventory/allocation_stock_out/detail?sheet_id=${out_stock_sheet_id}`}
          >
            {out_stock_sheet_serial_no}
          </a>
        )
      },
    },
    {
      Header: t('调出仓库'),
      accessor: 'out_warehouse_id',
      minWidth: 140,
      Cell: (cellProps: CellProps) => {
        const { out_warehouse_id } = cellProps.original
        const warehouse = getRelationInfo('warehouses', out_warehouse_id)
        return getUnNillText(warehouse?.name)
      },
    },
    {
      Header: t('调入仓库'),
      accessor: 'in_warehouse_id',
      minWidth: 110,
      Cell: (cellProps: CellProps) => {
        const { in_warehouse_id } = cellProps.original
        const warehouse = getRelationInfo('warehouses', in_warehouse_id)
        return getUnNillText(warehouse?.name)
      },
    },
    {
      Header: t('调拨类型'),
      accessor: 'type',
      minWidth: 100,
      Cell: (cellProps: CellProps) => {
        const { type } = cellProps.original
        return getEnumText(TRANSFER_TYPE, type)
      },
    },
    {
      Header: t('出库金额（无)'),
      accessor: 'out_stock_amount',
      minWidth: 100,
      Cell: (cellProps: CellProps) => {
        const { out_stock_amount } = cellProps.original
        return toFixOrderWithPrice(out_stock_amount)
      },
    },
    {
      Header: t('调拨费用'),
      accessor: 'transfer_fee',
      minWidth: 100,
      Cell: (cellProps: CellProps) => {
        const { transfer_fee } = cellProps.original
        const money = transfer_fee!?.details![0]?.money
        return getUnNillText(toFixOrderWithPrice(money))
      },
    },
    {
      Header: t('单据状态'),
      accessor: 'status',
      diyEnable: false,
      minWidth: 100,
      Cell: (cellProps: CellProps) => {
        const { status } = cellProps.original
        return getUnNillText(TREANSFER_STATUS_NAME[status])
      },
    },
    {
      Header: t('调拨状态'),
      accessor: 'transfer_status',
      diyEnable: false,
      minWidth: 100,
      Cell: (cellProps: CellProps) => {
        const { transfer_status } = cellProps.original
        return transfer_status
          ? getEnumText(TRANDSFER_STATUS, transfer_status)
          : ''
      },
    },
    {
      Header: t('备注'),
      accessor: 'remark',
      minWidth: 100,
    },
    {
      Header: t('建单人'),
      accessor: 'creator_id',
      minWidth: 100,
      Cell: (cellProps: CellProps) => {
        const { creator_id } = cellProps.original
        const user = getRelationInfo('group_users', creator_id as string)
        return getUnNillText(user?.name)
      },
    },
    {
      Header: t('提交人'),
      accessor: 'submitter_id',
      minWidth: 100,
      Cell: (cellProps: CellProps) => {
        const { submitter_id } = cellProps.original
        const user = getRelationInfo('group_users', submitter_id as string)
        return getUnNillText(user?.name)
      },
    },
    {
      Header: t('审核人'),
      accessor: 'auditor_id',
      minWidth: 100,
      Cell: (cellProps: CellProps) => {
        const { auditor_id } = cellProps.original
        const user = getRelationInfo('group_users', auditor_id as string)
        return getUnNillText(user?.name)
      },
    },
  ])

  // TODO： 批量打印调拨单待做
  // const handlePopupPrintModal = (
  //   selected: string[],
  //   isSelectedAll: boolean,
  // ) => {
  //   const req = isSelectedAll
  //     ? store.getSearchData()
  //     : {
  //         sheet_ids: selected,
  //         stock_sheet_type: store.filter.stock_sheet_type,
  //       }
  //   return ListPrintingTemplate({
  //     paging: { limit: 999 },
  //     type: PrintingTemplate_Type.TYPE_IN_STOCK,
  //   }).then((json) => {
  //     RightSideModal.render({
  //       onHide: RightSideModal.hide,
  //       style: { width: '300px' },
  //       children: (
  //         <PrintModal
  //           name='purchase_stock_in_print'
  //           onPrint={({ printing_template_id }: any) => {
  //             const stock_sheet_req = JSON.stringify(req)
  //             openNewTab(
  //               `#system/template/print_template/stock_in_template/print?tpl_id=${printing_template_id}&stock_sheet_req=${stock_sheet_req}`,
  //             )
  //             RightSideModal.hide()
  //           }}
  //           templates={json.response.printing_templates}
  //         />
  //       ),
  //     })
  //     return json
  //   })
  // }
  return (
    <BoxTable
      pagination={pagination}
      info={
        <BoxTableInfo>
          <TableTotalText
            data={[
              {
                label: t('单据总数'),
                content: pagination?.paging?.count,
              },
            ]}
          />
        </BoxTableInfo>
      }
      action={<ListRight />}
    >
      <Table
        isDiy
        isTrDisable={(data) => {
          const { status } = data
          return status === RECEIPT_STATUS.deleted
        }}
        // isBatchSelect
        id='purchase_stock_in_list'
        keyField='stock_sheet_id'
        columns={_columns}
        fixedSelect
        data={list}
        loading={loading}
      />
    </BoxTable>
  )
})

interface ListProps {
  onFetchList: () => any
  loading: boolean
  pagination: PaginationProps
}
const List: FC<ListProps> = observer((props) => {
  const { activeType } = store
  const { onFetchList, loading, pagination } = props

  const handleChange = (type: string) => {
    store.changeActiveType(type)
    onFetchList()
  }

  return (
    <ListStatusTabs
      active={activeType}
      onChange={handleChange}
      tabComponent={<ListTable loading={loading} pagination={pagination} />}
      tabData={TREANSFER_STATUS_NAME}
    />
  )
})

export default List
export { ListTable }
