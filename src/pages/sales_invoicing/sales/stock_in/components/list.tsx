import React, { FC, useMemo } from 'react'
import { Table, TableXUtil, Column } from '@gm-pc/table-x'
import { t } from 'gm-i18n'

import store from '../stores/list_store'
import { observer } from 'mobx-react'
import {
  ListStatusTabs,
  TextAreaCell,
} from '@/pages/sales_invoicing/components'
import { RECEIPT_STATUS } from '../../../enum'
import { BoxTableInfo, BoxTable, BoxTableProps } from '@gm-pc/react'
import TableTotalText from '@/common/components/table_total_text'
import { ReceiptStatusAllKey } from '@/pages/sales_invoicing/interface'
import { SALES_IN_RECEIPT_TABS } from '../enum'
import {
  OperationCell,
  ProductionTimeCell,
  ShelfNameCell,
  SsuBaseQuantityCell,
  SupplierCell,
  StockStatusCell,
  StockInTimeCell,
  WarehouseNameCell,
  BaseQuantitySecondCell,
  StockInAmountCell,
} from './product_detail'
import { getFormatTimeForTable } from '@/common/util'
import globalStore from '@/stores/global'
import { COMMON_COLUMNS } from '@/common/enum'

const { OperationHeader } = TableXUtil

const ListTable = observer(
  (props: { loading: boolean } & Pick<BoxTableProps, 'pagination'>) => {
    const { list, groupUsers, changeDetailItem } = store

    const _columns: Column[] = useMemo(() => {
      return [
        {
          Header: t('入库时间'),
          accessor: 'submit_time',
          minWidth: 130,
          Cell: (cellProps) => {
            return <StockInTimeCell index={cellProps.index} />
          },
        },
        {
          Header: t('生产日期'),
          accessor: 'production_time',
          isKeyboard: true,
          minWidth: 130,
          Cell: (cellProps) => {
            return (
              <ProductionTimeCell
                index={cellProps.index}
                data={cellProps.original.details[0]}
              />
            )
          },
        },
        {
          Header: t('商品名'),
          accessor: 'sku_name',
          minWidth: 100,
          Cell: (cellProps) => {
            return (
              <TextAreaCell
                data={cellProps.original.details[0]}
                field='sku_name'
              />
            )
          },
        },
        COMMON_COLUMNS.SKU_BASE_UNIT_NAME,
        {
          Header: t('商品分类'),
          accessor: 'category',
          minWidth: 120,
          Cell: (cellProps) => {
            return (
              <TextAreaCell
                data={cellProps.original.details[0]}
                field='category'
              />
            )
          },
        },
        {
          Header: t('客户'),
          accessor: 'customer_name',
          minWidth: 100,
          Cell: (cellProps) => {
            return cellProps.original.customer_name ?? '-'
          },
        },
        {
          Header: t('销售退货入库单号'),
          accessor: 'stock_sheet_serial_no',
          minWidth: 130,
        },
        {
          Header: t('订单号'),
          accessor: 'related_sheet_serial_no',
          minWidth: 130,
        },
        {
          Header: t('售后单号'),
          accessor: 'after_sale_order_serial_no',
          minWidth: 130,
        },
        {
          Header: t('供应商'),
          accessor: 'supplier_name',
          minWidth: 150,
          Cell: (cellProps) => {
            return (
              <SupplierCell
                data={cellProps.original.details[0]}
                index={cellProps.index}
              />
            )
          },
        },
        {
          Header: t('入库数（基本单位）'),
          diyEnable: false,
          isKeyboard: true,
          accessor: 'ssu_base_quantity',
          minWidth: 140,
          Cell: (cellProps) => {
            return (
              <SsuBaseQuantityCell
                index={cellProps.index}
                data={cellProps.original.details[0]}
              />
            )
          },
        },
        {
          Header: t('入库数（辅助单位）'),
          diyEnable: false,
          isKeyboard: true,
          accessor: 'second_base_unit_quantity',
          minWidth: 140,
          Cell: (cellProps) => {
            return (
              <BaseQuantitySecondCell
                index={cellProps.index}
                data={cellProps.original.details[0]}
              />
            )
          },
        },
        {
          Header: t('入库单价（基本单位）'),
          minWidth: 150,
          accessor: 'ssu_base_price',
          diyEnable: false,
          isKeyboard: true,
          Cell: (cellProps) => {
            return (
              <StockInAmountCell
                index={cellProps.index}
                data={cellProps.original.details[0]}
              />
            )
          },
        },
        {
          Header: t('入库金额'),
          accessor: 'amount_compatible',
          diyEnable: false,
          isKeyboard: true,
          minWidth: 140,
          Cell: (cellProps) => {
            return (
              <TextAreaCell
                data={cellProps.original.details[0]}
                field='amount_compatible'
              />
            )
          },
        },
        {
          Header: t('创建时间'),
          accessor: 'create_time',
          minWidth: 140,
          Cell: (cellProps) => {
            return getFormatTimeForTable(
              'YYYY-MM-DD HH:mm',
              cellProps.original.create_time,
            )
          },
        },
        {
          Header: t('入库仓库'),
          accessor: 'warehouse_name',
          minWidth: 150,
          show: globalStore.isOpenMultWarehouse,
          Cell: (cellProps: any) => {
            return (
              <WarehouseNameCell
                data={cellProps.original.details[0]}
                index={cellProps.index}
              />
            )
          },
        },
        {
          Header: t('存放货位'),
          accessor: 'shelf_name',
          minWidth: 170,
          isKeyboard: true,
          Cell: (cellProps) => {
            return (
              <ShelfNameCell
                index={cellProps.index}
                data={cellProps.original.details[0]}
              />
            )
          },
        },
        {
          Header: t('入库状态'),
          accessor: 'sheet_status',
          minWidth: 100,
          Cell: (cellProps) => {
            return (
              <StockStatusCell
                index={cellProps.index}
                data={cellProps.original.details[0]}
              />
            )
          },
        },
        {
          Header: t('建单人'),
          accessor: 'creator_id',
          minWidth: 100,
          Cell: (cellProps) => {
            const { creator_id } = cellProps.original
            return groupUsers![creator_id]?.name ?? ''
          },
        },
        {
          Header: OperationHeader,
          diyItemText: '操作',
          accessor: 'operate',
          fixed: 'right',
          width: TableXUtil.TABLE_X.WIDTH_OPERATION,
          Cell: (props) => <OperationCell index={props.index} />,
        },
      ]
    }, [groupUsers])

    return (
      <BoxTable
        pagination={props.pagination}
        info={
          <BoxTableInfo>
            <TableTotalText
              data={[
                {
                  label: t('单据总数'),
                  content: props.pagination?.paging?.count,
                },
              ]}
            />
          </BoxTableInfo>
        }
      >
        <Table
          isBatchSelect
          isDiy
          id='purchase_stock_in_list'
          keyField='stock_sheet_id'
          fixedSelect
          loading={props.loading}
          columns={_columns}
          data={list.slice()}
          batchActions={[]}
        />
      </BoxTable>
    )
  },
)

interface ListProps extends Pick<BoxTableProps, 'pagination'> {
  onFetchList: () => any
  loading: boolean
}
const List: FC<ListProps> = observer((props) => {
  const { activeType } = store
  const { onFetchList, loading, pagination } = props

  const handleChange = (type: ReceiptStatusAllKey) => {
    store.changeFilter('stock_sheet_status', RECEIPT_STATUS[type])
    store.changeActiveType(type)
    onFetchList()
  }

  return (
    <ListStatusTabs
      active={activeType}
      onChange={handleChange}
      tabComponent={<ListTable loading={loading} pagination={pagination} />}
      tabData={SALES_IN_RECEIPT_TABS}
    />
  )
})

export default List
export { ListTable }
