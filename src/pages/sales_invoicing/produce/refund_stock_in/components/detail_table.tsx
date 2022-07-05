import React from 'react'
import { BoxPanel, RightSideModal } from '@gm-pc/react'
import { TableXUtil, Column, Table } from '@gm-pc/table-x'
import Big from 'big.js'

import { t } from 'gm-i18n'
import store from '../stores/receipt_store'
import { observer } from 'mobx-react'
import TableRight from '@/common/components/key_board_tips'
import { TextAreaCell } from '@/pages/sales_invoicing/components'
import { PlanSelectDetail } from '@/pages/sales_invoicing/components/production_plan_select'
import { BatchSelectDetail } from '@/pages/sales_invoicing/components/batch_select'
import globalStore from '@/stores/global'
// import { ProductNameHeader } from './product_detail'
import { COMMON_COLUMNS } from '@/common/enum'
import {
  quoteCommonColumn,
  sortHeader,
} from '@/pages/sales_invoicing/common_column_enum'
import { toFixedSalesInvoicing } from '@/common/util'

const { TABLE_X } = TableXUtil

const Detail = observer(() => {
  const { productDetails } = store

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
        minWidth: 120,
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
          return <TextAreaCell data={cellProps.original} field='category' />
        },
      },
      /**
       * @deprecate 不需要了, 除了一大害😄
       */
      // {
      //   Header: t('生产计划'),
      //   accessor: 'plan',
      //   minWidth: 120,
      //   Cell: (cellProps) => {
      //     const { production_task_id, production_task_serial_no, sku_id } =
      //       cellProps.original

      //     const handleBatch = () => {
      //       RightSideModal.render({
      //         children: (
      //           <PlanSelectDetail taskId={production_task_id} skuId={sku_id} />
      //         ),
      //         title: t('生产计划'),
      //         onHide: RightSideModal.hide,
      //       })
      //     }
      //     return (
      //       <a onClick={handleBatch} className='gm-cursor'>
      //         {production_task_serial_no}
      //       </a>
      //     )
      //   },
      // },
      {
        Header: t('入库批次'),
        accessor: 'batch_serial_no',
        minWidth: 90,
        Cell: (cellProps) => {
          const {
            sku_base_unit_name,
            batch_selected,
            input_stock: { input, input2 },
          } = cellProps.original

          const handleBatch = () => {
            RightSideModal.render({
              children: (
                <BatchSelectDetail
                  productInfo={{
                    skuBaseUnitName: sku_base_unit_name,
                    skuBaseCount: +Big(input?.quantity!)
                      .times(1)
                      // .times(ssu_base_unit_rate!)
                      .toFixed(globalStore.dpSalesInvoicing),
                  }}
                  data={batch_selected.slice()}
                  hasSkuUnit
                  type='refund_stock_in'
                />
              ),
              title: '入库',
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
        Header: t('入库数（基本单位）'),
        diyEnable: false,
        accessor: 'input_quantity',
        minWidth: 140,
        Cell: (cellProps) => {
          const { input_stock, sku_base_unit_name } = cellProps.original
          return input_stock.input
            ? toFixedSalesInvoicing(input_stock?.input?.quantity) +
                sku_base_unit_name
            : '-'
        },
      },
      /** 入库数(辅助单位) */
      quoteCommonColumn('SECOND_QUANTITY'),
      {
        Header: t('入库单价（基本单位）'),
        minWidth: 150,
        accessor: 'ssu_base_price_origin',
        diyEnable: false,
        Cell: (cellProps) => {
          return (
            <TextAreaCell
              data={cellProps.original}
              field='ssu_base_price_origin'
            />
          )
        },
      },
      {
        Header: t('入库金额'),
        accessor: 'amount',
        diyEnable: false,
        minWidth: 140,
        Cell: (cellProps) => {
          return <TextAreaCell data={cellProps.original} field='amount' />
        },
      },
      {
        Header: t('存放货位'),
        accessor: 'shelf_name',
        minWidth: 200,
        Cell: (cellProps) => {
          return <TextAreaCell data={cellProps.original} field='shelf_name' />
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
        isKeyboard
        isVirtualized
        id='refund_stock_in_detail_table'
        data={productDetails.slice()}
        isTrDisable={(item: any) => {
          return item.spu_status === 0
        }}
        columns={columns}
      />
    </BoxPanel>
  )
})

export default Detail
