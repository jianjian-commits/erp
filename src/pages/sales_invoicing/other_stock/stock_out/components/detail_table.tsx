import React from 'react'
import Big from 'big.js'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { BoxPanel, RightSideModal } from '@gm-pc/react'
import { Table, TableXUtil, Column } from '@gm-pc/table-x'
import { RECEIPT_STATUS } from '@/pages/sales_invoicing/enum'
import globalStore from '@/stores/global'
import TableRight from '@/common/components/key_board_tips'

import { TextAreaCell } from '@/pages/sales_invoicing/components'
import { BatchSelectDetail } from '@/pages/sales_invoicing/components/batch_select'
import store from '../stores/detail_store'
import { COMMON_COLUMNS } from '@/common/enum'
import {
  quoteCommonColumn,
  sortHeader,
} from '@/pages/sales_invoicing/common_column_enum'
import { toFixedSalesInvoicing } from '@/common/util'

const { TABLE_X } = TableXUtil

const EditDetail = observer(() => {
  const { productDetails, receiptDetail } = store

  // 做一层记忆处理，若内部有值会变，需要放到第二个参数中
  const columns: Column[] = React.useMemo(() => {
    return [
      {
        Header: t('序号'),
        diyEnable: false,
        accessor: 'num',
        fixed: 'left',
        width: TABLE_X.WIDTH_NO,
        Cell: (cellProps) => {
          const { index } = cellProps
          return index + 1
        },
      },
      {
        Header: sortHeader(
          {
            title: t('商品名称'),
            field: 'sku_name',
          },
          store,
        ),
        diyItemText: t('商品名称'),
        accessor: 'sku_name',
        diyEnable: false,
        minWidth: 200,
        Cell: (cellProps) => {
          return <TextAreaCell field='sku_name' data={cellProps.original} />
        },
      },
      COMMON_COLUMNS.SKU_BASE_UNIT_NAME,
      {
        Header: sortHeader(
          {
            title: t('商品分类'),
            field: 'category_name',
          },
          store,
        ),
        diyItemText: t('商品分类'),
        minWidth: 100,
        accessor: 'category',
        Cell: (cellProps) => {
          return <TextAreaCell field='category' data={cellProps.original} />
        },
      },
      {
        Header: t('当前库存（基本单位）'),
        minWidth: 100,
        accessor: 'currStockQuantity',
        show: receiptDetail.sheet_status === RECEIPT_STATUS.toBeSubmitted,
        Cell: (cellProps) => {
          return (
            <TextAreaCell field='currStockQuantity' data={cellProps.original} />
          )
        },
      },
      quoteCommonColumn('CURRENT_STOCK', { type: 'add' }),
      {
        Header: t('出库数（基本单位）'),
        diyEnable: false,
        accessor: 'base_quantity',
        minWidth: 140,
        Cell: (cellProps) => {
          return (
            <TextAreaCell field='base_quantity' data={cellProps.original} />
          )
        },
      },
      {
        Header: t('出库数（辅助单位）'),
        diyEnable: false,
        accessor: 'second_base_quantity',
        minWidth: 140,
        Cell: (cellProps) => {
          const {
            second_base_unit_id,
            second_base_unit_name,
            second_base_unit_quantity,
          } = cellProps.original
          return second_base_unit_id !== '0'
            ? toFixedSalesInvoicing(second_base_unit_quantity) +
                second_base_unit_name
            : '-'
        },
      },
      quoteCommonColumn('MUTI_UNIT_DISPLAY', { type: 'add' }),
      {
        Header: t('出库批次'),
        accessor: 'batch_serial_no',
        minWidth: 90,
        Cell: (cellProps) => {
          const { base_quantity, sku_base_unit_name, batch_selected } =
            cellProps.original

          const handleBatch = () => {
            RightSideModal.render({
              children: (
                <BatchSelectDetail
                  productInfo={{
                    skuBaseUnitName: sku_base_unit_name,
                    skuBaseCount: +Big(base_quantity!)
                      // .times(ssu_base_unit_rate!)
                      .toFixed(globalStore.dpSalesInvoicing),
                  }}
                  data={batch_selected.slice()}
                />
              ),
              title: '出库',
              style: {
                width: '1000px',
              },
              onHide: RightSideModal.hide,
            })
          }
          return (
            <a onClick={handleBatch} className='gm-cursor'>
              {t('查看批次')}
            </a>
          )
        },
      },
      {
        Header: t('出库单价'),
        minWidth: 150,
        accessor: 'ssu_base_price_compatible',
        diyEnable: false,
        Cell: (cellProps) => {
          return (
            <TextAreaCell
              field='ssu_base_price_compatible'
              data={cellProps.original}
            />
          )
        },
      },
      {
        Header: t('出库成本'),
        accessor: 'amount_compatible',
        diyEnable: false,
        minWidth: 140,
        Cell: (cellProps) => {
          return (
            <TextAreaCell field='amount_compatible' data={cellProps.original} />
          )
        },
      },
      {
        Header: t('商品备注'),
        accessor: 'remark',
        minWidth: 200,
        Cell: (cellProps) => {
          return <TextAreaCell data={cellProps.original} field='remark' />
        },
      },
      {
        Header: t('操作人'),
        accessor: 'operator',
        minWidth: 90,
        Cell: (cellProps) => {
          return (
            <TextAreaCell data={cellProps.original} field='operator_name' />
          )
        },
      },
    ]
  }, [])

  return (
    <BoxPanel title={t('商品明细')} collapse right={<TableRight />}>
      <Table
        isDiy
        isVirtualized
        id='in_stock_table'
        data={productDetails.slice()}
        isTrDisable={(item: any) => {
          return item.spu_status === 0
        }}
        columns={columns}
      />
    </BoxPanel>
  )
})

export default EditDetail
