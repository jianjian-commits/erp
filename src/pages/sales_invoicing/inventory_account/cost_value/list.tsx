import React from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import TableListTips from '@/common/components/table_list_tips'
import { BoxTable, BoxTableInfo, BoxTableProps } from '@gm-pc/react'
import { Column, Table } from '@gm-pc/table-x'
import {
  toFixedSalesInvoicing,
  toFixedByType,
  getUnNillText,
} from '@/common/util'
import TableTotalText from '@/common/components/table_total_text'
import { ListSkuStockValueRequest_PagingField } from 'gm_api/src/inventory'
import { getSort } from '@/pages/iot/device_management/util'
import store from './store'
import globalStore from '@/stores/global'

const columnsFoot: Column[] = [
  {
    Header: t('基本单位'),
    minWidth: 80,
    accessor: 'base_unit_name',
  },
  {
    Header: t('期初库存'),
    accessor: 'begin_stock',
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          begin_stock: { quantity: value },
        },
      } = cellProps.original
      return toFixedSalesInvoicing(value)
    },
  },
  {
    Header: t('期初货值'),
    accessor: 'begin_stock_value',
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          begin_stock: { amount: value },
        },
      } = cellProps.original
      return toFixedByType(value, 'dpInventoryAmount')
    },
  },
  {
    Header: t('期初均价'),
    accessor: 'begin_stock_avg_price',
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          begin_stock: { price: value },
        },
      } = cellProps.original
      return toFixedByType(value, 'dpInventoryAmount')
    },
  },
  {
    Header: t('期末库存'),
    accessor: 'end_stock',
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          end_stock: { quantity: value },
        },
      } = cellProps.original
      return toFixedSalesInvoicing(value)
    },
  },
  {
    Header: t('超支库存'),
    accessor: 'virtual_stock',
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          virtual_stock: { quantity: value },
        },
      } = cellProps.original
      return toFixedSalesInvoicing(value)
    },
  },
  {
    Header: t('期末货值'),
    accessor: 'end_stock_value',
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          end_stock: { amount: value },
        },
      } = cellProps.original
      return toFixedByType(value, 'dpInventoryAmount')
    },
  },
  {
    Header: t('期末均价'),
    accessor: 'end_stock_avg_price',
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          end_stock: { price: value },
        },
      } = cellProps.original
      return toFixedByType(value, 'dpInventoryAmount')
    },
  },
  {
    Header: t('本期采购入库数量'),
    accessor: 'purchase_in_stock_q',
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          purchase_in_stock: { quantity: value },
        },
      } = cellProps.original
      return toFixedSalesInvoicing(value)
    },
  },
  {
    Header: t('本期入库成本'),
    accessor: 'purchase_in_stock_a',
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          purchase_in_stock: { amount: value },
        },
      } = cellProps.original
      return toFixedByType(value, 'dpInventoryAmount')
    },
  },
  {
    Header: t('本期采购退货出库数量'),
    accessor: 'refund_out_stock_q',
    hide: globalStore.isLite,
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          refund_out_stock: { quantity: value },
        },
      } = cellProps.original
      return toFixedSalesInvoicing(value)
    },
  },
  {
    Header: t('本期采购退货出库金额'),
    accessor: 'refund_out_stock_a',
    hide: globalStore.isLite,
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          refund_out_stock: { amount: value },
        },
      } = cellProps.original
      return toFixedByType(value, 'dpInventoryAmount')
    },
  },
  {
    Header: t('本期销售出库数量'),
    accessor: 'sale_out_stock_q',
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          sale_out_stock: { quantity: value },
        },
      } = cellProps.original
      return toFixedSalesInvoicing(value)
    },
  },
  {
    Header: t('本期销售出库金额'),
    accessor: 'sale_out_stock_a',
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          sale_out_stock: { amount: value },
        },
      } = cellProps.original
      return toFixedByType(value, 'dpInventoryAmount')
    },
  },
  {
    Header: t('本期销售退货入库数量'),
    accessor: 'refund_in_stock_q',
    hide: globalStore.isLite,
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          refund_in_stock: { quantity: value },
        },
      } = cellProps.original
      return toFixedSalesInvoicing(value)
    },
  },
  {
    Header: t('本期销售退货入库金额'),
    accessor: 'refund_in_stock_a',
    hide: globalStore.isLite,
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          refund_in_stock: { amount: value },
        },
      } = cellProps.original
      return toFixedByType(value, 'dpInventoryAmount')
    },
  },
  {
    Header: t('本期领料出库数量'),
    accessor: 'material_out_stock_q',
    hide: globalStore.isLite,
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          material_out_stock: { quantity: value },
        },
      } = cellProps.original
      return toFixedSalesInvoicing(value)
    },
  },
  {
    Header: t('本期领料出库金额'),
    accessor: 'material_out_stock_a',
    hide: globalStore.isLite,
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          material_out_stock: { amount: value },
        },
      } = cellProps.original
      return toFixedByType(value, 'dpInventoryAmount')
    },
  },
  {
    Header: t('本期退料入库数量'),
    accessor: 'material_in_stock_q',
    hide: globalStore.isLite,
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          material_in_stock: { quantity: value },
        },
      } = cellProps.original
      return toFixedSalesInvoicing(value)
    },
  },
  {
    Header: t('本期退料入库金额'),
    accessor: 'material_in_stock_a',
    hide: globalStore.isLite,
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          material_in_stock: { amount: value },
        },
      } = cellProps.original
      return toFixedByType(value, 'dpInventoryAmount')
    },
  },
  {
    Header: t('本期生产入库数量'),
    accessor: 'product_in_stock_q',
    hide: globalStore.isLite,
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          product_in_stock: { quantity: value },
        },
      } = cellProps.original
      return toFixedSalesInvoicing(value)
    },
  },
  {
    Header: t('本期生产入库金额'),
    accessor: 'product_in_stock_a',
    hide: globalStore.isLite,
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          product_in_stock: { amount: value },
        },
      } = cellProps.original
      return toFixedByType(value, 'dpInventoryAmount')
    },
  },
  {
    Header: t('本期盘盈入库数量'),
    accessor: 'increase_stock_q',
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          increase_stock: { quantity: value },
        },
      } = cellProps.original
      return toFixedSalesInvoicing(value)
    },
  },
  {
    Header: t('本期盘盈入库金额'),
    accessor: 'increase_stock_a',
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          increase_stock: { amount: value },
        },
      } = cellProps.original
      return toFixedByType(value, 'dpInventoryAmount')
    },
  },
  {
    Header: t('本期盘亏出库数量'),
    accessor: 'loss_stock_q',
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          loss_stock: { quantity: value },
        },
      } = cellProps.original
      return toFixedSalesInvoicing(value)
    },
  },
  {
    Header: t('本期盘亏出库金额'),
    accessor: 'loss_stock_a',
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          loss_stock: { amount: value },
        },
      } = cellProps.original
      return toFixedByType(value, 'dpInventoryAmount')
    },
  },
  {
    Header: t('本期其他入库数量'),
    accessor: 'other_in_stock_q',
    hide: globalStore.isLite,
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          other_in_stock: { quantity: value },
        },
      } = cellProps.original
      return toFixedSalesInvoicing(value)
    },
  },
  {
    Header: t('本期其他入库金额'),
    accessor: 'other_in_stock_a',
    hide: globalStore.isLite,
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          other_in_stock: { amount: value },
        },
      } = cellProps.original
      return toFixedByType(value, 'dpInventoryAmount')
    },
  },
  {
    Header: t('本期其他出库数量'),
    accessor: 'other_out_stock_q',
    hide: globalStore.isLite,
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          other_out_stock: { quantity: value },
        },
      } = cellProps.original
      return toFixedSalesInvoicing(value)
    },
  },
  {
    Header: t('本期其他出库金额'),
    accessor: 'other_out_stock_a',
    hide: globalStore.isLite,
    minWidth: 80,
    Cell: (cellProps) => {
      const {
        stock_value: {
          other_out_stock: { amount: value },
        },
      } = cellProps.original
      return toFixedByType(value, 'dpInventoryAmount')
    },
  },
]

const List: React.FC<{ run: Function } & Pick<BoxTableProps, 'pagination'>> =
  observer((props) => {
    // 收缩 diy

    const { run, pagination } = props
    const {
      expanded,
      list,
      headDetail: {
        begin_stock: { amount: begin_amount },
        end_stock: { amount: end_amount },
        all_in_stock: { amount: all_in_amount },
        all_out_stock: { amount: all_out_amount },
      },
      getWarehouseName,
    } = store

    const columns: Column[] = [
      {
        Header: t('商品编号'),
        width: 80,
        Cell: (cellProps) => {
          const {
            sku_info: {
              sku: { customize_code },
            },
          } = cellProps.original
          return customize_code
        },
      },
      {
        Header: t('商品名称'),
        width: 80,
        Cell: (cellProps) => {
          const {
            sku_info: {
              sku: { name },
            },
          } = cellProps.original
          return name
        },
      },
      {
        Header: t('仓库'),
        accessor: 'warehouse_name',
        width: 80,
        show: globalStore.isOpenMultWarehouse,
        Cell: (cellProps: any) => {
          const { warehouse_name } = cellProps.original
          return getUnNillText(warehouse_name)
        },
      },
      {
        Header: t('商品分类'),
        id: ListSkuStockValueRequest_PagingField.SKU_CATEGORY,
        minWidth: 120,
        Cell: (cellProps) => {
          const {
            sku_info: { category_infos },
          } = cellProps.original
          return category_infos
            ?.map((it) => it.category_name)
            .filter(Boolean)
            .join('/')
        },
      },

      ...columnsFoot,
    ]

    const data = [
      {
        label: t('期初总货值'),
        content: toFixedByType(+begin_amount!, 'dpInventoryAmount'),
      },
      {
        label: t('期末总货值'),
        content: toFixedByType(+end_amount!, 'dpInventoryAmount'),
      },
      {
        label: t('本期入库总金额'),
        content: toFixedByType(+all_in_amount!, 'dpInventoryAmount'),
      },
      {
        label: t('本期出库总金额'),
        content: toFixedByType(+all_out_amount!, 'dpInventoryAmount'),
      },
    ]

    return (
      <>
        <TableListTips
          tips={[
            t(
              '在某商品库存为负的情况下，库存均价会在此商品下一次入库时更新为的此次入库的入库单价，以保证后续出库时库存成本的准确。货值成本表中的所有数据来源自明细数据的统计，请在库存为负的情况下及时盘点库存，否则会出现货值成本不准确的情况。',
            ),
          ]}
        />
        <BoxTable
          info={
            <BoxTableInfo>
              <TableTotalText data={data} />
            </BoxTableInfo>
          }
          pagination={pagination}
        >
          <Table
            // isExpand
            isDiy
            // onExpand={handleExpand}
            // 传列表为true的商户id
            // expanded={expanded}
            data={list}
            columns={columns}
            onHeadersSort={(des) => {
              store.updateFilter('sort', getSort(des))
              run()
            }}
            // SubComponent={({ original }) => (
            //   <Table
            //     isSub
            //     data={original.ssu_stock_list}
            //     columns={subColumns}
            //   />
            // )}
          />
        </BoxTable>
      </>
    )
  })

export default List
