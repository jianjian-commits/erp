import React, { useCallback, useState } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { BoxPanel, Price } from '@gm-pc/react'
import { TableXUtil, Table, Column } from '@gm-pc/table-x'

import TableRight from '@/common/components/key_board_tips'
import { COMMON_COLUMNS } from '@/common/enum'

import { TextAreaCell } from '@/pages/sales_invoicing/components'
import {
  quoteCommonColumn,
  sortHeader,
  BaseQuantityColumn,
} from '@/pages/sales_invoicing/common_column_enum'

import {
  ProductNameCell,
  ProducePlanCell,
  OperationCell,
  BatchDetailCell,
  RemarkCell,
} from './product_detail'
import BoxSummary from './box_summary'
import SummaryTable from './summary_table'

import { DetailStore } from '../stores/index'
import { toJS } from 'mobx'

const { OperationHeader, TABLE_X } = TableXUtil

const EditDetail = observer(() => {
  const {
    productDetails,
    receiptDetail,
    addProductDetailsItem,
    changeProductDetailsItem,
  } = DetailStore
  // 商品汇总 | 生产计划
  const [isShowSummary, setShowSummary] = useState<boolean>(false)

  console.log(toJS(productDetails), '领料出库') // 暂时保留, 打印才能渲染 出库单价/出库成本

  const limit = 12
  const tableHeight =
    TABLE_X.HEIGHT_HEAD_TR +
    Math.min(limit, productDetails.length) * TABLE_X.HEIGHT_TR

  const handleDetailAdd = useCallback(() => addProductDetailsItem(), [])

  // 生产计划和汇总切换
  const handleToggleTable = () => setShowSummary(!isShowSummary)

  // 做一层记忆处理，若内部有值会变，需要放到第二个参数中
  const columns: Column[] = React.useMemo(() => {
    return [
      COMMON_COLUMNS.INDEX,
      {
        Header: OperationHeader,
        accessor: 'action',
        diyEnable: false,
        diyItemText: t('操作'),
        fixed: 'left',
        width: TABLE_X.WIDTH_EDIT_OPERATION,
        Cell: (cellProps) => {
          return (
            <OperationCell
              index={cellProps.index}
              onAddRow={handleDetailAdd}
              data={cellProps.original}
            />
          )
        },
      },
      {
        Header: sortHeader(
          {
            title: t('商品名称'),
            field: 'sku_name',
          },
          DetailStore,
        ),
        diyItemText: t('商品名称'),
        accessor: 'name',
        diyEnable: false,
        minWidth: 200,
        isKeyboard: true,
        Cell: (cellProps) => {
          return (
            <ProductNameCell
              index={cellProps.index}
              data={cellProps.original}
            />
          )
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
          return <TextAreaCell data={cellProps.original} field='category' />
        },
      },
      {
        Header: t('当前库存（基本单位）'),
        minWidth: 100,
        accessor: 'currStockQuantity',
        Cell: (cellProps) => {
          return (
            <TextAreaCell field='currStockQuantity' data={cellProps.original} />
          )
        },
      },
      quoteCommonColumn('CURRENT_STOCK', { type: 'add' }),
      // 基本单位 & 辅助单位
      ...BaseQuantityColumn(
        {
          title: '出库数',
          is_replace: false,
        },
        changeProductDetailsItem,
      ),
      quoteCommonColumn('MUTI_UNIT_DISPLAY', { type: 'add' }),
      {
        Header: t('出库批次'),
        accessor: 'batch_serial_no',
        minWidth: 90,
        Cell: (cellProps) => {
          return (
            <BatchDetailCell
              index={cellProps.index}
              data={cellProps.original}
              warehouseId={receiptDetail?.warehouse_id!}
            />
          )
        },
      },
      {
        Header: t('出库单价'),
        minWidth: 150,
        accessor: 'out_stock_base_price',
        diyEnable: false,
        isKeyboard: true,
        Cell: (cellProps) => {
          return (
            <TextAreaCell
              field='out_stock_base_price'
              data={cellProps.original}
            />
          )
        },
      },
      {
        Header: t('出库成本'),
        accessor: 'amount',
        diyEnable: false,
        isKeyboard: true,
        minWidth: 140,
        Cell: (cellProps) => {
          const { amount } = cellProps.original
          return (
            <span>
              {amount && amount !== '0' ? amount + Price.getUnit() : '-'}
            </span>
          )
        },
      },
      /**
       * @deprecate 不需要了, 除了一大害😄
       */
      // {
      //   Header: t('生产计划'),
      //   accessor: 'plan',
      //   minWidth: 80,
      //   Cell: (cellProps) => {
      //     return (
      //       <ProducePlanCell
      //         index={cellProps.index}
      //         data={cellProps.original}
      //       />
      //     )
      //   },
      // },
      {
        Header: t('商品备注'),
        accessor: 'remark',
        minWidth: 200,
        isKeyboard: true,
        Cell: (cellProps) => {
          return (
            <RemarkCell index={cellProps.index} data={cellProps.original} />
          )
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
  }, [handleDetailAdd, receiptDetail]) // 由于这里做了记忆，任何可能改变的值都应该加到这里来，以免改变时未触发更新导致意想不到的bug

  return (
    <BoxPanel
      title={t('商品明细')}
      summary={
        receiptDetail.material_out_stock_sheet_id ? (
          <BoxSummary
            handleToggle={handleToggleTable}
            isShowSummary={isShowSummary}
          />
        ) : null
      }
      collapse
      right={<TableRight />}
    >
      {isShowSummary ? (
        <SummaryTable />
      ) : (
        <Table
          isDiy
          isEdit
          isKeyboard
          onAddRow={handleDetailAdd}
          virtualizedItemSize={TABLE_X.HEIGHT_TR}
          virtualizedHeight={tableHeight}
          id='picking_stock_out_edit_table'
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

export default EditDetail
