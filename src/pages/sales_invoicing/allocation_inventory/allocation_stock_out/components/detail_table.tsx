import React from 'react'
import { BoxPanel, RightSideModal } from '@gm-pc/react'
import {
  fixedColumnsTableXHOC,
  TableXVirtualized,
  diyTableXHOC,
  TableXUtil,
} from '@gm-pc/table-x'
import Big from 'big.js'
import { t } from 'gm-i18n'
import store from '../stores/receipt_store'
import { observer } from 'mobx-react'
import TableRight from '@/common/components/key_board_tips'

import { TextAreaCell } from '@/pages/sales_invoicing/components'
import { BatchSelectDetail } from '@/pages/sales_invoicing/components/batch_select'
import globalStore from '@/stores/global'
import { COMMON_COLUMNS } from '@/common/enum'
import { getUnNillText, toFixedSalesInvoicing } from '@/common/util'
import { RECEIPT_STATUS } from '@/pages/sales_invoicing/enum'
import {
  quoteCommonColumn,
  sortHeader,
} from '@/pages/sales_invoicing/common_column_enum'

const VirtualizedDiyTable = diyTableXHOC(
  fixedColumnsTableXHOC(TableXVirtualized),
)

const { TABLE_X } = TableXUtil

const EditDetail = observer(() => {
  const { productDetails, group_users, receiptDetail } = store
  const limit = 12
  const tableHeight =
    TABLE_X.HEIGHT_HEAD_TR +
    Math.min(limit, productDetails.length) * TABLE_X.HEIGHT_TR

  // 做一层记忆处理，若内部有值会变，需要放到第二个参数中
  const columns = [
    {
      Header: t('序号'),
      diyEnable: false,
      accessor: 'num',
      fixed: 'left',
      width: TABLE_X.WIDTH_NO,
      Cell: (cellProps: any) => {
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
      Cell: (cellProps: any) => {
        return <TextAreaCell field='category' data={cellProps.original} />
      },
    },
    {
      Header: t('当前库存（基本单位）'),
      minWidth: 130,
      accessor: 'currStockQuantity',
      show: receiptDetail.status === RECEIPT_STATUS.toBeSubmitted,
      Cell: (cellProps: any) => {
        return (
          <TextAreaCell field='currStockQuantity' data={cellProps.original} />
        )
      },
    },
    quoteCommonColumn(
      'CURRENT_STOCK',
      { type: 'add' },
      {
        show: receiptDetail.status === RECEIPT_STATUS.toBeSubmitted,
      },
    ),
    {
      Header: t('出库数（基本单位）'),
      diyEnable: false,
      accessor: 'base_quantity',
      minWidth: 130,
      Cell: (cellProps: any) => {
        return <TextAreaCell field='base_quantity' data={cellProps.original} />
      },
    },
    {
      Header: t('出库数（辅助单位）'),
      diyEnable: false,
      accessor: 'second_base_quantity',
      minWidth: 140,
      Cell: (cellProps: any) => {
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
      Cell: (cellProps: any) => {
        const {
          base_quantity,
          sku_base_unit_name,
          batch_selected,
          // ssu_base_unit_rate,
        } = cellProps.original

        const handleBatch = () => {
          RightSideModal.render({
            children: (
              <BatchSelectDetail
                productInfo={{
                  skuBaseUnitName: sku_base_unit_name,
                  skuBaseCount: +Big(base_quantity!).toFixed(
                    globalStore.dpSalesInvoicing,
                  ),
                }}
                data={batch_selected.slice()}
                hasSkuUnit
                hasCustomer
              />
            ),
            title: '出库',
            style: {
              width: '1200px',
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
      Cell: (cellProps: any) => {
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
      Cell: (cellProps: any) => {
        return (
          <TextAreaCell field='amount_compatible' data={cellProps.original} />
        )
      },
    },
    {
      Header: t('商品备注'),
      accessor: 'remark',
      minWidth: 200,
      Cell: (cellProps: any) => {
        return <TextAreaCell data={cellProps.original} field='remark' />
      },
    },
    {
      Header: t('操作人'),
      accessor: 'creator_id',
      minWidth: 90,
      Cell: (cellProps: any) => {
        const { creator_id } = cellProps.original
        return getUnNillText(group_users?.[creator_id]?.name)
      },
    },
  ].filter((item) => item) // 由于diy,show 不可控，因此需要特殊处理，这里去除false

  return (
    <BoxPanel title={t('商品明细')} collapse right={<TableRight />}>
      <VirtualizedDiyTable
        virtualizedItemSize={TABLE_X.HEIGHT_TR}
        virtualizedHeight={tableHeight}
        id='sales_stock_out_detail_table'
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
