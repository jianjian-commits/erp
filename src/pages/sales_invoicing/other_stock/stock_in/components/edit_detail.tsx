import React, { useCallback } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { BoxPanel } from '@gm-pc/react'
import { TableXUtil, Column, Table } from '@gm-pc/table-x'
import TableRight from '@/common/components/key_board_tips'

import { TextAreaCell } from '@/pages/sales_invoicing/components'
import {
  ProductNameCell,
  // SsuBaseQuantityCell,
  SsuBasePriceCell,
  MoneyCell,
  ProductionTimeCell,
  ShelfNameCell,
  OperationCell,
} from './product_detail'
import store from '../stores/detail_store'
import { checkDigit } from '@/common/util'
import RemarkCell from '@/pages/sales_invoicing/other_stock/stock_in/components/product_detail/remake_cell'
import globalStore from '@/stores/global'
import { COMMON_COLUMNS } from '@/common/enum'
import {
  BaseQuantityColumn,
  sortHeader,
} from '@/pages/sales_invoicing/common_column_enum'

const { OperationHeader, TABLE_X } = TableXUtil

const EditDetail = observer(() => {
  const { productList, receiptDetail, changeProductDetailsItem } = store
  React.useEffect(() => {
    globalStore.fetchShelf({ warehouse_id: receiptDetail.warehouse_id })
  }, [receiptDetail.warehouse_id])

  const handleDetailAdd = useCallback(() => {
    !checkDigit(receiptDetail.status, 8) && store.addProductListItem()
  }, [receiptDetail.status])

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
        Header: t('批次号'),
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
        accessor: 'name',
        diyEnable: false,
        minWidth: 200,
        isKeyboard: !checkDigit(receiptDetail.status, 8),
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
          store,
        ),
        diyItemText: t('商品分类'),
        minWidth: 100,
        accessor: 'category',
        Cell: (cellProps) => {
          return <TextAreaCell data={cellProps.original} field='categoryV2' />
        },
      },
      ...BaseQuantityColumn(
        {
          title: '入库数',
          is_replace: false,
        },
        changeProductDetailsItem,
      ),
      // {
      //   Header: t('入库数（基本单位）'),
      //   diyEnable: false,
      //   isKeyboard: !checkDigit(receiptDetail.status, 8),
      //   accessor: 'ssu_base_quantity',
      //   minWidth: 140,
      //   Cell: (cellProps) => {
      //     return (
      //       <SsuBaseQuantityCell
      //         index={cellProps.index}
      //         data={cellProps.original}
      //       />
      //     )
      //   },
      // },
      {
        Header: t('入库单价（基本单位）'),
        minWidth: 150,
        accessor: 'unit_price',
        diyEnable: false,
        isKeyboard: true,
        Cell: (cellProps) => {
          return (
            <SsuBasePriceCell
              index={cellProps.index}
              data={cellProps.original}
            />
          )
        },
      },
      {
        Header: t('入库金额'),
        accessor: 'amount',
        diyEnable: false,
        isKeyboard: !checkDigit(receiptDetail.status, 8),
        minWidth: 140,
        Cell: (cellProps) => {
          return <MoneyCell index={cellProps.index} data={cellProps.original} />
        },
      },

      {
        Header: t('生产日期'),
        accessor: 'production_time',
        isKeyboard: true,
        minWidth: 160,
        Cell: (cellProps) => {
          return (
            <ProductionTimeCell
              index={cellProps.index}
              data={cellProps.original}
            />
          )
        },
      },
      {
        Header: t('存放货位'),
        accessor: 'shelf_name',
        minWidth: 200,
        isKeyboard: true,
        Cell: (cellProps) => {
          return (
            <ShelfNameCell index={cellProps.index} data={cellProps.original} />
          )
        },
      },
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
  }, [handleDetailAdd, receiptDetail.status]) // 由于这里做了记忆，任何可能改变的值都应该加到这里来，以免改变时未触发更新导致意想不到的bug

  return (
    <BoxPanel title={t('商品明细')} collapse right={<TableRight />}>
      <Table
        isDiy
        isKeyboard
        isVirtualized
        isEdit
        onAddRow={handleDetailAdd}
        id='in_stock_table'
        data={productList.slice()}
        isTrDisable={(item: any) => {
          return item.spu_status === 0
        }}
        columns={columns}
      />
    </BoxPanel>
  )
})

export default EditDetail
