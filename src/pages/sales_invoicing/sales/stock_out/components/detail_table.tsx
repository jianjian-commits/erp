import React from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import Big from 'big.js'
import { BoxPanel, RightSideModal } from '@gm-pc/react'
import { Table, Column } from '@gm-pc/table-x'

import { RECEIPT_STATUS } from '@/pages/sales_invoicing/enum'
import { TextAreaCell } from '@/pages/sales_invoicing/components'
import { BatchSelectDetail } from '@/pages/sales_invoicing/components/batch_select'

import TableRight from '@/common/components/key_board_tips'

import globalStore from '@/stores/global'
import { COMMON_COLUMNS } from '@/common/enum'
import {
  quoteCommonColumn,
  sortHeader,
} from '@/pages/sales_invoicing/common_column_enum'
import { DetailStore } from '../stores/index'
import { GroupUser } from 'gm_api/src/enterprise/types'
import { toFixedSalesInvoicing } from '@/common/util'

const EditDetail = observer(() => {
  const { productDetails, receiptDetail, getAdditionInfo } = DetailStore

  // 做一层记忆处理，若内部有值会变，需要放到第二个参数中
  const columns: Column[] = React.useMemo(() => {
    return [
      COMMON_COLUMNS.INDEX,
      {
        Header: sortHeader(
          {
            title: t('商品名称'),
            field: 'sku_name',
          },
          DetailStore,
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
          DetailStore,
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
      quoteCommonColumn(
        'CURRENT_STOCK',
        { type: 'detail' },
        {
          show: receiptDetail.sheet_status === RECEIPT_STATUS.toBeSubmitted,
        },
      ),
      {
        Header: t(globalStore.isLite ? '出库数' : '出库数（基本单位）'),
        diyEnable: false,
        accessor: 'base_quantity',
        minWidth: 140,
        Cell: (cellProps) => {
          return (
            <TextAreaCell
              field='base_quantity'
              data={cellProps.original}
              isLite={globalStore.isLite}
            />
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
        Cell: (cellProps) => {
          return (
            <TextAreaCell
              field='ssu_base_price_compatible'
              data={cellProps.original}
              isLite={globalStore.isLite}
            />
          )
        },
      },
      {
        Header: t('出库成本'),
        accessor: 'amount_compatible',
        hide: globalStore.isLite,
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
          const { operator_id } = cellProps.original
          const operator = getAdditionInfo<GroupUser>(
            'group_users',
            operator_id,
          )
          return operator?.name || '-'
        },
      },
    ]
  }, [receiptDetail.sheet_status]) // 由于这里做了记忆，任何可能改变的值都应该加到这里来，以免改变时未触发更新导致意想不到的bug

  return (
    <BoxPanel title={t('商品明细')} collapse right={<TableRight />}>
      <Table
        isDiy
        isVirtualized
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
