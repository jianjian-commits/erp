import React, { useCallback, useState } from 'react'
import { BoxPanel, Button, Flex } from '@gm-pc/react'
import { TableXUtil, Column, Table } from '@gm-pc/table-x'

import { t } from 'gm-i18n'
import store from '../stores/receipt_store1'
import { observer } from 'mobx-react'
import {
  ProductNameCell,
  BaseQuantityCell,
  // SsuQuantityCell,
  BasePriceCell,
  ProductionTimeCell,
  ShelfNameCell,
  OperationCell,
  // DifferentPriceCell,
  // SpecificationCell,
  NoTaxAmountCell,
  NoTaxPriceCell,
  TaxMoneyCell,
  TaxRateCell,
  RemarkCell,
  MoneyCellV2,
} from './product_detail'

import { TextAreaCell } from '@/pages/sales_invoicing/components'
// import { checkDigit } from '@/common/util'
import { history } from '@/common/service'
import { isInShareV2 } from '@/pages/sales_invoicing/util'
import { COMMON_COLUMNS } from '@/common/enum'
import globalStore from '@/stores/global'
import { DetailStore } from '../stores'
import { Permission } from 'gm_api/src/enterprise'
import { BaseQuantityColumn } from '@/pages/sales_invoicing/common_column_enum'

const { OperationHeader, TABLE_X } = TableXUtil

const SplitDetail = observer(() => {
  const {
    productDetails,
    receiptDetail,
    apportionList,
    changeProductItem,
    addProductDetailsItem,
  } = DetailStore
  const { purchase_in_stock_sheet_id, is_replace } = receiptDetail
  const [selected, setSelected] = useState<Array<any>>([])

  const handleDetailAdd = useCallback(() => {
    !is_replace && addProductDetailsItem()
  }, [is_replace])

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
        Header: t('商品名'),
        accessor: 'name',
        diyEnable: false,
        width: 200,
        fixed: 'left',
        isKeyboard: !is_replace, // 如果是虚拟库存的话，这里就不是全键盘
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
        Header: t('商品分类'),
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
        Header: t(globalStore.isLite ? '入库单价' : '入库单价（基本单位）'),
        minWidth: 150,
        accessor: 'base_price',
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
        diyEnable: false,
        isKeyboard: !is_replace,
        minWidth: 140,
        Cell: (cellProps) => {
          return (
            <MoneyCellV2 index={cellProps.index} data={cellProps.original} />
          )
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
            <NoTaxAmountCell
              index={cellProps.index}
              data={cellProps.original}
            />
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
          return (
            <TaxRateCell index={cellProps.index} data={cellProps.original} />
          )
        },
      },
      {
        Header: t('生产日期'),
        accessor: 'production_time',
        isKeyboard: true,
        hide: globalStore.isLite,
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
  }, [handleDetailAdd, is_replace, apportionList])

  const handleSubmit = () => {
    DetailStore.batchUpdateReceipt('split', selected)
  }

  const RenderButton = () => {
    return (
      <Flex justifyEnd alignCenter>
        <Button
          onClick={() => {
            history.push(
              `/sales_invoicing/purchase/stock_in/detail?sheet_id=${purchase_in_stock_sheet_id}`,
            )
          }}
        >
          {t('取消')}
        </Button>
        <Button
          className='gm-margin-left-10'
          onClick={handleSubmit}
          type='primary'
          disabled={!selected.length}
        >
          {t('确定')}
        </Button>
      </Flex>
    )
  }

  return (
    <>
      <Flex className='tw-px-4 b-table-tip' alignCenter style={{ height: 40 }}>
        <Flex alignCenter style={{ flex: 1 }}>
          {t(`
          提示：请勾选要分批提交的商品，
          所选商品提交后将生成新的采购入库单并从原单中移除；
          已分摊商品无法分批提交，请移除分摊后再勾选
        `)}
        </Flex>
      </Flex>
      <BoxPanel title={t('商品明细')} collapse right={<RenderButton />}>
        <Table
          isDiy
          isKeyboard
          isSelect
          isEdit
          isVirtualized
          onAddRow={handleDetailAdd}
          id='purchase_in_stock_sheet_detail_id'
          keyField='purchase_in_stock_sheet_detail_id'
          data={productDetails.slice()}
          isTrDisable={(item: any) => {
            return item.spu_status === 0
          }}
          onSelect={(selected: Array<any>) => {
            setSelected(selected.slice())
          }}
          isSelectorDisable={(original: any) => {
            const { sku_id } = original
            return isInShareV2(apportionList, sku_id)
          }}
          selected={selected.slice()}
          columns={columns}
          fixedSelect
        />
      </BoxPanel>
    </>
  )
})

export default SplitDetail
