import React from 'react'
import { BoxPanel, Price } from '@gm-pc/react'
import { TableXUtil, Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import store from '../stores/receipt_store'
import { observer } from 'mobx-react'
import TableRight from '@/common/components/key_board_tips'
import { TextAreaCell } from '@/pages/sales_invoicing/components'
import { checkDigit, getUnNillText, toFixedSalesInvoicing } from '@/common/util'
import {
  RemarkCell,
  ProductionTimeCell,
  SsuBaseQuantityCell,
  ShelfNameCell,
  BasePrice,
} from './product_details'
import { COMMON_COLUMNS } from '@/common/enum'
import {
  BaseQuantityColumn,
  sortHeader,
} from '@/pages/sales_invoicing/common_column_enum'

const { TABLE_X } = TableXUtil

const EditDetail = observer(() => {
  const {
    productDetails,
    receiptDetail,
    canEdit,
    getRelationInfo,
    changeDetailItem,
  } = store

  const limit = 12
  const tableHeight =
    TABLE_X.HEIGHT_HEAD_TR +
    Math.min(limit, productDetails.length) * TABLE_X.HEIGHT_TR

  const columns = [
    COMMON_COLUMNS.INDEX,
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
      minWidth: 130,
      accessor: 'category',
      Cell: (cellProps: any) => {
        return <TextAreaCell data={cellProps.original} field='category' />
      },
    },
    {
      Header: t('入库数（基本单位）'),
      diyEnable: false,
      isKeyboard: !checkDigit(receiptDetail.status, 8),
      accessor: 'ssu_base_quantity',
      minWidth: 140,
      Cell: (cellProps: any) => {
        return (
          <SsuBaseQuantityCell
            index={cellProps.index}
            data={cellProps.original}
          />
        )
      },
    },
    {
      Header: t('入库数（辅助单位）'),
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
    {
      Header: t('入库单价(基本单位)'),
      minWidth: 150,
      isKeyboard: true,
      diyEnable: false,
      Cell: (cellProps: any) => {
        return <BasePrice data={cellProps.original} />
      },
    },
    {
      Header: t('入库金额'),
      minWidth: 150,
      accessor: 'amount',
      isKeyboard: true,
      diyEnable: false,
      Cell: (cellProps: any) => {
        const { amount } = cellProps.original
        return getUnNillText(amount) + Price.getUnit()
      },
    },
    {
      Header: t('生产日期'),
      accessor: 'production_time',
      isKeyboard: true,
      minWidth: 140,
      Cell: (cellProps: any) => {
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
      minWidth: 170,
      isKeyboard: true,
      Cell: (cellProps: any) => {
        return (
          <ShelfNameCell index={cellProps.index} data={cellProps.original} />
        )
      },
    },
    {
      Header: t('商品备注'),
      accessor: 'remark',
      minWidth: 170,
      isKeyboard: true,
      Cell: (cellProps: any) => {
        const { remark } = cellProps.original
        return canEdit ? (
          <RemarkCell index={cellProps.index} data={cellProps.original} />
        ) : (
          remark
        )
      },
    },
    {
      Header: t('操作人'),
      accessor: 'creator_id',
      minWidth: 100,
      Cell: (cellProps: any) => {
        const { creator_id } = cellProps.original
        const user = getRelationInfo('group_users', creator_id)
        return getUnNillText(user?.name)
      },
    },
  ]

  // 入库基本单位 & 辅助单位 区别于 columns, 其它一样
  const editColumns = [
    COMMON_COLUMNS.INDEX,
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
      minWidth: 130,
      accessor: 'category',
      Cell: (cellProps: any) => {
        return <TextAreaCell data={cellProps.original} field='category' />
      },
    },
    // 基本单位 & 辅助单位
    ...BaseQuantityColumn(
      {
        title: '入库数',
        is_replace: false,
      },
      changeDetailItem,
    ),
    {
      Header: t('入库单价(基本单位)'),
      minWidth: 150,
      isKeyboard: true,
      diyEnable: false,
      Cell: (cellProps: any) => {
        return <BasePrice data={cellProps.original} />
      },
    },
    {
      Header: t('入库金额'),
      minWidth: 150,
      accessor: 'amount',
      isKeyboard: true,
      diyEnable: false,
      Cell: (cellProps: any) => {
        const { amount } = cellProps.original
        return getUnNillText(amount) + Price.getUnit()
      },
    },
    {
      Header: t('生产日期'),
      accessor: 'production_time',
      isKeyboard: true,
      minWidth: 140,
      Cell: (cellProps: any) => {
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
      minWidth: 170,
      isKeyboard: true,
      Cell: (cellProps: any) => {
        return (
          <ShelfNameCell index={cellProps.index} data={cellProps.original} />
        )
      },
    },
    {
      Header: t('商品备注'),
      accessor: 'remark',
      minWidth: 170,
      isKeyboard: true,
      Cell: (cellProps: any) => {
        const { remark } = cellProps.original
        return canEdit ? (
          <RemarkCell index={cellProps.index} data={cellProps.original} />
        ) : (
          remark
        )
      },
    },
    {
      Header: t('操作人'),
      accessor: 'creator_id',
      minWidth: 100,
      Cell: (cellProps: any) => {
        const { creator_id } = cellProps.original
        const user = getRelationInfo('group_users', creator_id)
        return getUnNillText(user?.name)
      },
    },
  ]

  return (
    <BoxPanel title={t('商品明细')} collapse right={<TableRight />}>
      <Table
        isDiy
        isEdit
        // isBatchSelect
        isKeyboard
        keyField='uniqueKey'
        virtualizedItemSize={TABLE_X.HEIGHT_TR}
        virtualizedHeight={tableHeight}
        id='allocation_sheet_order'
        data={productDetails.slice()}
        isTrDisable={(item: any) => {
          return item.spu_status === 0
        }}
        fixedSelect
        columns={!canEdit ? columns : editColumns}
        batchActionBarPure
      />
    </BoxPanel>
  )
})

export default EditDetail
