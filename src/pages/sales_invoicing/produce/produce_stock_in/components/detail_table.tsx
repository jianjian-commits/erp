import React from 'react'
import { BoxPanel, Price, RightSideModal } from '@gm-pc/react'
import { Table, TableXUtil, Column } from '@gm-pc/table-x'

import { t } from 'gm-i18n'
import store from '../stores/receipt_store'
import { observer } from 'mobx-react'
import TableRight from '@/common/components/key_board_tips'
import { TextAreaCell } from '@/pages/sales_invoicing/components'
import { PlanSelectDetail } from '@/pages/sales_invoicing/components/production_plan_select'
import { RECEIPT_STATUS } from '@/pages/sales_invoicing/enum'
import { COMMON_COLUMNS } from '@/common/enum'
import { toFixedSalesInvoicing } from '@/common/util'
import {
  quoteCommonColumn,
  sortHeader,
} from '@/pages/sales_invoicing/common_column_enum'

const { TABLE_X } = TableXUtil

const Detail = observer(() => {
  const { productDetails, receiptDetail } = store

  // 做一层记忆处理，若内部有值会变，需要放到第二个参数中
  const columns: Column[] = React.useMemo(() => {
    return [
      COMMON_COLUMNS.INDEX,
      {
        Header: t('批次号'),
        diyEnable: false,
        accessor: 'batch_serial_no',
        fixed: 'left',
        width:
          receiptDetail.sheet_status === RECEIPT_STATUS.approved
            ? 180
            : TABLE_X.WIDTH_NO,
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
        minWidth: 150,
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
      {
        Header: t('入库数（基本单位）'),
        diyEnable: false,
        accessor: 'base_quantity',
        minWidth: 140,
        Cell: (cellProps) => {
          return (
            <TextAreaCell data={cellProps.original} field='base_quantity' />
          )
        },
      },
      /** 入库数(辅助单位) */
      quoteCommonColumn('SECOND_QUANTITY'),
      {
        Header: t('生产需求'),
        accessor: 'plan',
        minWidth: 130,
        Cell: (cellProps) => {
          const { production_task_id, production_task_serial_no } =
            cellProps.original

          const handleBatch = () => {
            RightSideModal.render({
              children: <PlanSelectDetail taskId={production_task_id} />,
              title: '生产需求',
              onHide: RightSideModal.hide,
            })
          }
          return (
            <a onClick={handleBatch} className='gm-cursor'>
              {production_task_serial_no}
            </a>
          )
        },
      },
      {
        Header: t('入库单价（基本单位）'),
        minWidth: 150,
        accessor: 'ssu_base_price',
        diyEnable: false,
        Cell: (cellProps) => {
          const data = cellProps.original
          return (
            toFixedSalesInvoicing(data?.input_stock?.input?.price) +
            `${Price.getUnit()}/${data?.sku_base_unit_name}`
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
        Header: t('生产日期'),
        accessor: 'production_time',
        minWidth: 160,
        Cell: (cellProps) => {
          return (
            <TextAreaCell data={cellProps.original} field='production_time' />
          )
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
        Header: t('关联生产对象'),
        accessor: 'target_customer_name',
        minWidth: 120,
        isKeyboard: true,
        Cell: (cellProps) => {
          return (
            <TextAreaCell
              data={cellProps.original}
              field='target_customer_name'
            />
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
  }, [receiptDetail.sheet_status])

  return (
    <BoxPanel title={t('商品明细')} collapse right={<TableRight />}>
      <Table
        isDiy
        isKeyboard
        isVirtualized
        id='produce_stock_in_detail_table'
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
