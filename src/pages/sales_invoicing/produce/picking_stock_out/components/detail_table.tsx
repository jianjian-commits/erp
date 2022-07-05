import React, { useState } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import Big from 'big.js'
import { BoxPanel, RightSideModal } from '@gm-pc/react'
import { Table, Column } from '@gm-pc/table-x'
import TableRight from '@/common/components/key_board_tips'
import { RECEIPT_STATUS } from '@/pages/sales_invoicing/enum'
import { TextAreaCell } from '@/pages/sales_invoicing/components'
import { BatchSelectDetail } from '@/pages/sales_invoicing/components/batch_select'
import { CategroySortHeader, ProductNameHeader } from './product_detail'
import BoxSummary from './box_summary'
import SummaryTable from './summary_table'
import globalStore from '@/stores/global'
import { DetailStore } from '../stores/index'
import { COMMON_COLUMNS } from '@/common/enum'
import { quoteCommonColumn } from '@/pages/sales_invoicing/common_column_enum'
import { toFixedSalesInvoicing } from '@/common/util'

const Detail = observer(() => {
  const { productDetails, receiptDetail } = DetailStore
  const [isShowSummary, setShowSummary] = useState<boolean>(false)

  // 生产计划和汇总切换
  const handleToggleTable = () => setShowSummary(!isShowSummary)

  // 做一层记忆处理，若内部有值会变，需要放到第二个参数中
  const columns: Column[] = React.useMemo(() => {
    return [
      COMMON_COLUMNS.INDEX,
      {
        Header: <ProductNameHeader />,
        accessor: 'sku_name',
        diyEnable: false,
        minWidth: 120,
      },
      COMMON_COLUMNS.SKU_BASE_UNIT_NAME,
      {
        Header: <CategroySortHeader />,
        minWidth: 100,
        accessor: 'category',
        Cell: (cellProps) => {
          return <TextAreaCell data={cellProps.original} field='category' />
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
          const data = cellProps.original
          const quantity = data?.input_stock?.input?.quantity || 0
          return parseFloat(quantity) + data?.sku_base_unit_name
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
      quoteCommonColumn('MUTI_UNIT_DISPLAY', { type: 'detail' }),
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
                      .times(1)
                      // .times(ssu_base_unit_rate!)
                      .toFixed(globalStore.dpSalesInvoicing),
                  }}
                  data={batch_selected.slice()}
                  hasSkuUnit
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
        Header: t('出库单价（基本单位）'),
        minWidth: 150,
        accessor: 'ssu_base_price',
        diyEnable: false,
        Cell: (cellProps) => {
          return (
            <TextAreaCell
              data={cellProps.original}
              field='ssu_base_price_compatible'
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

      {
        Header: t('出库成本'),
        accessor: 'amount',
        diyEnable: false,
        minWidth: 140,
        Cell: (cellProps) => {
          return (
            <TextAreaCell data={cellProps.original} field='amount_compatible' />
          )
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
      //     const { production_task_serial_no, production_task_id, sku_id } =
      //       cellProps.original

      //     const handlePlan = () => {
      //       RightSideModal.render({
      //         children: (
      //           <PlanSelectDetail taskId={production_task_id} skuId={sku_id} />
      //         ),
      //         title: '生产计划',
      //         onHide: RightSideModal.hide,
      //       })
      //     }
      //     return (
      //       <a onClick={handlePlan} className='gm-cursor'>
      //         {production_task_serial_no}
      //       </a>
      //     )
      //   },
      // },
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
    <BoxPanel
      title={t('商品明细')}
      summary={
        <BoxSummary
          handleToggle={handleToggleTable}
          isShowSummary={isShowSummary}
        />
      }
      collapse
      right={<TableRight />}
    >
      {isShowSummary ? (
        <SummaryTable />
      ) : (
        <Table
          isDiy
          isKeyboard
          isVirtualized
          id='picking_stock_out_detail_table'
          data={productDetails.slice()}
          isTrDisable={(item: any) => {
            return item.spu_status === 0
          }}
          columns={columns}
        />
      )}
    </BoxPanel>
  )
})

export default Detail
