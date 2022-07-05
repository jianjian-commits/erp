import React, { useCallback } from 'react'
import { BoxPanel } from '@gm-pc/react'
import { TableXUtil, BatchActionDefault, Column, Table } from '@gm-pc/table-x'

import { t } from 'gm-i18n'
import store from '../stores/receipt_store'
import { observer } from 'mobx-react'
import TableRight from '@/common/components/key_board_tips'
import {
  ProductNameCell,
  SsuBaseQuantityCell,
  ProducePlanCell,
  ProductionTimeCell,
  ShelfNameCell,
  OperationCell,
  SsuBasePriceCell,
  MoneyCell,
  CustomerCell,
} from './product_detail'

import { TextAreaCell } from '@/pages/sales_invoicing/components'
import { checkDigit } from '@/common/util'
import RemarkCell from '@/pages/sales_invoicing/produce/produce_stock_in/components/product_detail/remake_cell'
import { COMMON_COLUMNS } from '@/common/enum'
import globalStore from '@/stores/global'
import {
  BaseQuantityColumn,
  sortHeader,
} from '@/pages/sales_invoicing/common_column_enum'

const { OperationHeader, TABLE_X } = TableXUtil

const EditDetail = observer(() => {
  const {
    productDetails,
    receiptDetail,
    apportionList,
    changeProductDetailsItem,
  } = store
  const { warehouse_id } = receiptDetail

  const listShelf = () => {
    globalStore.fetchShelf({ warehouse_id })
  }

  React.useEffect(() => {
    listShelf()
  }, [warehouse_id])

  const handleDetailAdd = useCallback(() => {
    !checkDigit(receiptDetail.status, 8) && store.addProductDetailsItem()
  }, [receiptDetail.status])

  const columns: Column[] = [
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
      isKeyboard: !checkDigit(receiptDetail.status, 8),
      Cell: (cellProps) => {
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
          field: 'category_name',
        },
        store,
      ),
      diyItemText: t('商品分类'),
      minWidth: 130,
      accessor: 'category',
      Cell: (cellProps) => {
        return <TextAreaCell data={cellProps.original} field='category' />
      },
    },
    ...BaseQuantityColumn(
      {
        title: '入库数',
        is_replace: false,
      },
      changeProductDetailsItem,
      apportionList,
    ),
    {
      Header: t('生产需求'),
      accessor: 'production_task_serial_no',
      minWidth: 120,
      Cell: (cellProps) => {
        return (
          <ProducePlanCell index={cellProps.index} data={cellProps.original} />
        )
      },
    },
    {
      Header: t('入库单价（基本单位）'),
      minWidth: 170,
      accessor: 'ssu_base_price',
      isKeyboard: true,
      diyEnable: false,
      Cell: (cellProps) => {
        return (
          <SsuBasePriceCell index={cellProps.index} data={cellProps.original} />
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
      Header: t('关联生产对象'),
      accessor: 'target_customer_name',
      minWidth: 290,
      isKeyboard: true,
      Cell: (cellProps) => {
        return (
          <CustomerCell index={cellProps.index} data={cellProps.original} />
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
        isBatchSelect
        isDiy
        isKeyboard
        isEdit
        isVirtualized
        keyField='uniqueKey'
        onAddRow={handleDetailAdd}
        id='produce_stock_in_edit_table'
        data={productDetails.slice()}
        isTrDisable={(item: any) => {
          return item.spu_status === 0
        }}
        fixedSelect
        columns={columns}
        batchActionBarPure
        batchActions={[
          {
            children: (
              <BatchActionDefault>{t('批量推荐入库单价')}</BatchActionDefault>
            ),
            onAction: store.batchGetPrice,
          },
        ]}
      />
    </BoxPanel>
  )
})

export default EditDetail
