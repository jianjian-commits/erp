import React, { useCallback } from 'react'
import { BoxPanel, Price } from '@gm-pc/react'
import { TableXUtil, Column, Table } from '@gm-pc/table-x'

import { t } from 'gm-i18n'
import store from '../stores/receipt_store'
import { observer, Observer } from 'mobx-react'
import TableRight from '@/common/components/key_board_tips'
import {
  ProductNameCell,
  SsuBaseQuantityCell,
  OperationCell,
  BatchDetailCell,
  ShelfNameCell,
  RemarkCell,
} from './product_detail'

import { TextAreaCell } from '@/pages/sales_invoicing/components'
import globalStore from '@/stores/global'
import { COMMON_COLUMNS } from '@/common/enum'
import {
  quoteCommonColumn,
  sortHeader,
} from '@/pages/sales_invoicing/common_column_enum'

const { OperationHeader, TABLE_X } = TableXUtil

const EditDetail = observer(() => {
  const { productDetails, receiptDetail } = store
  const { warehouse_id } = receiptDetail

  const listShelf = () => {
    globalStore.fetchShelf({ warehouse_id })
  }

  React.useEffect(() => {
    listShelf()
  }, [warehouse_id])

  const handleDetailAdd = useCallback(() => {
    store.addProductDetailsItem()
  }, [])

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
        store,
      ),
      diyItemText: t('商品名称'),
      accessor: 'name',
      diyEnable: false,
      minWidth: 200,
      isKeyboard: true,
      Cell: (cellProps) => {
        return (
          <ProductNameCell index={cellProps.index} data={cellProps.original} />
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
      minWidth: 120,
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
    //     return (
    //       <ProducePlanCell index={cellProps.index} data={cellProps.original} />
    //     )
    //   },
    // },
    {
      Header: t('入库批次'),
      accessor: 'batch_serial_no',
      minWidth: 90,
      Cell: (cellProps) => {
        return (
          <BatchDetailCell
            index={cellProps.index}
            data={cellProps.original}
            warehouseId={receiptDetail?.warehouse_id}
          />
        )
      },
    },
    {
      Header: t('入库数（基本单位）'),
      diyEnable: false,
      isKeyboard: true,
      accessor: 'ssu_base_quantity',
      minWidth: 140,
      Cell: (cellProps) => {
        return (
          <SsuBaseQuantityCell
            index={cellProps.index}
            data={cellProps.original}
          />
        )
      },
    },
    /** 入库数(辅助单位) */
    quoteCommonColumn('SECOND_QUANTITY'),
    {
      Header: t('入库单价（基本单位）'),
      minWidth: 150,
      accessor: 'ssu_base_price',
      diyEnable: false,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const { batch_selected, base_price } = cellProps.original
              const out_stock_base_price =
                batch_selected.length > 0 ? base_price + Price.getUnit() : '-'
              return <span>{out_stock_base_price}</span>
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('入库金额'),
      accessor: 'amount',
      diyEnable: false,
      isKeyboard: true,
      minWidth: 100,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const { amount } = cellProps.original
              return <span>{amount ? amount + Price.getUnit() : '-'}</span>
            }}
          </Observer>
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
        return <RemarkCell index={cellProps.index} data={cellProps.original} />
      },
    },
    {
      Header: t('操作人'),
      accessor: 'operator',
      minWidth: 90,
      Cell: (cellProps) => {
        return <TextAreaCell data={cellProps.original} field='operator_name' />
      },
    },
  ]

  return (
    <BoxPanel title={t('商品明细')} collapse right={<TableRight />}>
      <Table
        isDiy
        isKeyboard
        isEdit
        isVirtualized
        onAddRow={handleDetailAdd}
        id='refund_stock_in_edit_table'
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
