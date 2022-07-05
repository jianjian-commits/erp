import React, { useCallback, useEffect } from 'react'
import { BoxPanel, Tooltip } from '@gm-pc/react'
import { TableXUtil, Table, Column } from '@gm-pc/table-x'

import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import TableRight from '@/common/components/key_board_tips'
import {
  ProductNameCell,
  BaseQuantityCell,
  BasePriceCell,
  MoneyCellV2,
  ProductionTimeCell,
  ShelfNameCell,
  OperationCell,
  NoTaxAmountCell,
  TaxMoneyCell,
  TaxRateCell,
  RemarkCell,
  NoTaxPriceCell,
} from './product_detail'
import { TextAreaCell } from '@/pages/sales_invoicing/components'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import { COMMON_COLUMNS } from '@/common/enum'
import {
  sortHeader,
  BaseQuantityColumn,
} from '@/pages/sales_invoicing/common_column_enum'
// import DetailStore from '../stores/receipt_store1'
import { DetailStore } from '../stores'

const { OperationHeader, TABLE_X } = TableXUtil

const EditDetail = observer(() => {
  const {
    productDetails,
    receiptDetail,
    addProductDetailsItem,
    apportionList,
    changeProductItem,
  } = DetailStore
  const { is_replace, warehouse_id } = receiptDetail

  useEffect(() => {
    globalStore.fetchShelf({ warehouse_id })
  }, [warehouse_id])

  const handleDetailAdd = useCallback(() => {
    !is_replace && addProductDetailsItem()
  }, [is_replace])

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
        DetailStore,
      ),
      diyItemText: t('商品名称'),
      accessor: 'name',
      diyEnable: false,
      minWidth: 200,
      isKeyboard: !is_replace, // 如果是虚拟库存的话，这里就不是全键盘
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
        DetailStore,
      ),
      diyItemText: t('商品分类'),
      minWidth: 140,
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
      changeProductItem,
      apportionList,
    ),
    {
      Header: (
        <div>
          {t(globalStore.isLite ? '入库单价' : '入库单价（基本单位）')}
          {/* <Tooltip
              className='gm-padding-lr-5 gm-text-14'
              hidden={globalStore.isLite}
              popup={
                DetailStore.openBasicPriceState ? (
                  <div className='gm-padding-5'>
                    {t('点击')}
                    <a
                      className='gm-cursor'
                      onClick={handleToSalesInvoicingSetting}
                    >
                      {t('点此设置')}
                    </a>
                    {t('，跳转至进销存设置页面')}
                  </div>
                ) : (
                  <div>
                    {t('新增商品默认展示协议价，')}
                    <a
                      className='gm-cursor'
                      onClick={handleToSalesInvoicingSetting}
                    >
                      {t('点此设置')}
                    </a>
                  </div>
                )
              }
            /> */}
        </div>
      ),
      minWidth: 160,
      accessor: 'base_price',
      hide: !globalStore.hasPermission(
        Permission.PERMISSION_INVENTORY_VIEW_PURCHASE_IN_MONEY,
      ),
      diyEnable: false,
      isKeyboard: true,
      Cell: (cellProps) => {
        return (
          <BasePriceCell
            disabled={
              !globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_UPDATE_PURCHASE_UNIT_PRICE_IN_SHEET,
              )
            }
            index={cellProps.index}
            data={cellProps.original}
          />
        )
      },
    },
    {
      Header: t('不含税入库单价'),
      minWidth: 150,
      hide:
        !globalStore.hasPermission(
          Permission.PERMISSION_INVENTORY_VIEW_PURCHASE_IN_MONEY,
        ) || globalStore.isLite,
      accessor: 'no_tax_base_price',
      diyEnable: false,
      isKeyboard: true,
      Cell: (cellProps) => {
        return (
          <NoTaxPriceCell index={cellProps.index} data={cellProps.original} />
        )
      },
    },
    {
      Header: t('入库金额'),
      accessor: 'amount',
      hide: !globalStore.hasPermission(
        Permission.PERMISSION_INVENTORY_VIEW_PURCHASE_IN_MONEY,
      ),
      diyEnable: false,
      isKeyboard: !is_replace,
      minWidth: 140,
      Cell: (cellProps) => {
        return <MoneyCellV2 index={cellProps.index} data={cellProps.original} />
      },
    },
    {
      Header: t('不含税入库金额'),
      accessor: 'no_tax_amount',
      hide:
        !globalStore.hasPermission(
          Permission.PERMISSION_INVENTORY_VIEW_PURCHASE_IN_MONEY,
        ) || globalStore.isLite,
      diyEnable: false,
      isKeyboard: !is_replace,
      minWidth: 140,
      Cell: (cellProps) => {
        return (
          <NoTaxAmountCell index={cellProps.index} data={cellProps.original} />
        )
      },
    },
    {
      Header: t('税额'),
      accessor: 'tax_money',
      hide:
        !globalStore.hasPermission(
          Permission.PERMISSION_INVENTORY_VIEW_PURCHASE_IN_MONEY,
        ) || globalStore.isLite,
      diyEnable: false,
      isKeyboard: !is_replace,
      minWidth: 140,
      Cell: (cellProps) => {
        return <TaxMoneyCell index={cellProps.index} />
      },
    },
    {
      Header: t('税率'),
      accessor: 'tax_rate',
      diyEnable: false,
      hide:
        !globalStore.hasPermission(
          Permission.PERMISSION_INVENTORY_VIEW_PURCHASE_IN_MONEY,
        ) || globalStore.isLite,
      isKeyboard: !is_replace,
      minWidth: 140,
      Cell: (cellProps) => {
        return <TaxRateCell index={cellProps.index} data={cellProps.original} />
      },
    },
    {
      Header: t('生产日期'),
      accessor: 'production_time',
      hide: globalStore.isLite,
      isKeyboard: true,
      minWidth: 140,
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
      Header: t('商品等级'),
      accessor: 'sku_level_filed_id',
      hide: globalStore.isLite,
      minWidth: 100,
      Cell: (cellProps) => {
        const { sku_level_filed_id } = cellProps.original
        return <span>{sku_level_filed_id?.name || '-'}</span>
      },
    },
    {
      Header: t('存放货位'),
      accessor: 'shelf_name',
      hide: globalStore.isLite,
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
        isEdit
        isKeyboard
        isVirtualized
        onAddRow={handleDetailAdd}
        id='purchase_stock_in_edit_table'
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
