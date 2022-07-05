import React, { useCallback } from 'react'
import { BoxPanel, Price } from '@gm-pc/react'
import { TableXUtil, Table, Column } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import store from '../stores/receipt_store'
import { observer } from 'mobx-react'
import TableRight from '@/common/components/key_board_tips'
import { RECEIPT_STATUS } from '@/pages/sales_invoicing/enum'
import {
  ProductNameCell,
  SsuBaseQuantityCell,
  OperationCell,
  RemarkCell,
  InputStockCell,
} from './product_detail'
import { checkDigit } from '@/common/util'
import { COMMON_COLUMNS } from '@/common/enum'
import {
  BaseQuantityColumn,
  quoteCommonColumn,
  sortHeader,
} from '@/pages/sales_invoicing/common_column_enum'

const { OperationHeader, TABLE_X } = TableXUtil

const EditDetail = observer(() => {
  const {
    productDetails,
    receiptDetail,
    changeProductDetailsItem,
    costAllocations,
  } = store

  const handleDetailAdd = useCallback(() => {
    !checkDigit(receiptDetail.status, 8) && store.addProductDetailsItem()
  }, [receiptDetail.status])

  const limit = 12
  const tableHeight =
    TABLE_X.HEIGHT_HEAD_TR +
    Math.min(limit, productDetails.length) * TABLE_X.HEIGHT_TR

  // 做一层记忆处理，若内部有值会变，需要放到第二个参数中
  const columns: Column[] = [
    COMMON_COLUMNS.INDEX,
    {
      Header: OperationHeader,
      accessor: 'action',
      diyEnable: false,
      diyItemText: t('操作'),
      fixed: 'left',
      width: TABLE_X.WIDTH_EDIT_OPERATION,
      Cell: (cellProps: any) => {
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
          field: 'sku.name',
        },
        store,
      ),
      diyItemText: t('商品名称'),
      accessor: 'name',
      diyEnable: false,
      minWidth: 200,
      isKeyboard: !checkDigit(receiptDetail.status, 8),
      Cell: (cellProps: any) => {
        return (
          <ProductNameCell index={cellProps.index} data={cellProps.original} />
        )
      },
    },
    // 基本单位
    COMMON_COLUMNS.SKU_BASE_UNIT_NAME,
    {
      Header: sortHeader(
        {
          title: t('商品分类'),
          field: 'sku.categoryName',
        },
        store,
      ),
      diyItemText: t('商品分类'),
      minWidth: 130,
      accessor: 'category',
      Cell: (cellProps: any) => {
        const {
          sku: { category_name },
        } = cellProps.original
        return category_name || '-'
      },
    },
    {
      Header: t('当前库存（基本单位）'),
      minWidth: 100,
      accessor: 'currStockQuantity',
      show:
        receiptDetail.status === -1 ||
        receiptDetail.status === RECEIPT_STATUS.toBeSubmitted,
      Cell: (cellProps: any) => {
        const { currStockQuantity, sku_base_unit_name } = cellProps.original
        return currStockQuantity
          ? Number(currStockQuantity).toFixed(4) + sku_base_unit_name
          : '-'
      },
    },
    quoteCommonColumn('CURRENT_STOCK', { type: 'add' }),
    // {
    //   Header: t('出库数（基本单位）'),
    //   diyEnable: false,
    //   isKeyboard: !checkDigit(receiptDetail.status, 8),
    //   accessor: 'ssu_base_quantity',
    //   minWidth: 140,
    //   Cell: (cellProps: any) => {
    //     return (
    //       <SsuBaseQuantityCell
    //         index={cellProps.index}
    //         data={cellProps.original}
    //       />
    //     )
    //   },
    // },
    ...BaseQuantityColumn(
      {
        title: '出库数',
        keyField: 'input_out_stock',
        is_replace: false,
      },
      changeProductDetailsItem,
      costAllocations,
    ),
    quoteCommonColumn('MUTI_UNIT_DISPLAY', { type: 'add' }),
    {
      Header: t('出库单价'),
      minWidth: 120,
      accessor: 'out_stock_price',
      diyEnable: false,
      Cell: (cellProps: any) => {
        const { out_stock_price } = cellProps.original
        return out_stock_price ? out_stock_price + Price.getUnit() : '-'
      },
    },
    {
      Header: t('出库成本'),
      minWidth: 120,
      accessor: 'out_stock_amount',
      diyEnable: false,
      Cell: (cellProps: any) => {
        const { out_stock_amount } = cellProps.original
        return out_stock_amount ? out_stock_amount + Price.getUnit() : '-'
      },
    },
    {
      Header: t('入库数（基本单位）'),
      accessor: 'input_in_stock',
      minWidth: 140,
      Cell: (cellProps) => {
        return (
          <InputStockCell
            data={cellProps?.original}
            index={cellProps.index}
            type='input_in.input'
          />
        )
      },
    },
    {
      Header: t('入库单价'),
      minWidth: 120,
      accessor: 'in_stock_price',
      diyEnable: false,
      Cell: (cellProps: any) => {
        const { in_stock_price } = cellProps.original
        return in_stock_price ? in_stock_price + Price.getUnit() : '-'
      },
    },
    {
      Header: t('入库成本'),
      minWidth: 120,
      accessor: 'in_stock_amount',
      diyEnable: false,
      Cell: (cellProps: any) => {
        const { in_stock_amount } = cellProps.original
        return in_stock_amount ? in_stock_amount + Price.getUnit() : '-'
      },
    },
    {
      Header: t('商品备注'),
      accessor: 'remark',
      minWidth: 170,
      isKeyboard: true,
      Cell: (cellProps: any) => {
        return <RemarkCell index={cellProps.index} data={cellProps.original} />
      },
    },
  ]

  return (
    <BoxPanel title={t('商品明细')} collapse right={<TableRight />}>
      <Table
        isDiy
        isEdit
        isKeyboard
        keyField='uniqueKey'
        onAddRow={handleDetailAdd}
        virtualizedItemSize={TABLE_X.HEIGHT_TR}
        virtualizedHeight={tableHeight}
        id='allocation_sheet_order'
        data={productDetails.slice()}
        isTrDisable={(item: any) => {
          return item.spu_status === 0
        }}
        fixedSelect
        columns={columns}
        batchActionBarPure
      />
    </BoxPanel>
  )
})

export default EditDetail
