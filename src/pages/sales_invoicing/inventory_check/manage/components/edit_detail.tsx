import TableRight from '@/common/components/key_board_tips'
import { COMMON_COLUMNS } from '@/common/enum'
import { TextAreaCell } from '@/pages/sales_invoicing/components'
import { BatchSelectDetail } from '@/pages/sales_invoicing/components/batch_select'
import globalStore from '@/stores/global'
import { BoxPanel, RightSideModal } from '@gm-pc/react'
import { TableXUtil, Table, Column } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import React, { useCallback, useEffect } from 'react'
import store from '../stores/detail_store'
import {
  BatchDetailCell,
  InventoryCell,
  ManageBatchCell,
  OperationCell,
  ProductNameCell,
  ProfitOrLossCell,
  RemakeDetailCell,
} from './product_detail'

const { OperationHeader, TABLE_X } = TableXUtil

const EditDetail = observer(() => {
  const { productFilterList, positionFilter, receiptDetail, getSkuInventory } =
    store

  const handleDetailAdd = useCallback(() => {
    store.addProductListItem()
  }, [])

  // 做一层记忆处理，若内部有值会变，需要放到第二个参数中
  const columns: Column[] = React.useMemo(() => {
    return [
      COMMON_COLUMNS.INDEX,
      {
        Header: OperationHeader,
        accessor: 'action',
        diyEnable: false,
        diyItemText: t('操作'),
        hide: positionFilter.productType !== '0',
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
        minWidth: 200,
        isKeyboard: true,
        Cell: (cellProps) => {
          return positionFilter.productType === '0' ? (
            <ProductNameCell
              index={cellProps.index}
              data={cellProps.original}
            />
          ) : (
            <TextAreaCell field='sku_name' data={cellProps.original} />
          )
        },
      },
      // {
      //   Header: t('规格'),
      //   accessor: 'sale_ratio',
      //   diyEnable: false,
      //   minWidth: 200,
      //   isKeyboard: true,
      //   Cell: (cellProps) => {
      //     return positionFilter.productType === '0' ? (
      //       <SpecificationCell
      //         index={cellProps.index}
      //         data={cellProps.original}
      //       />
      //     ) : (
      //       <TextAreaCell field='ssu_display_name' data={cellProps.original} />
      //     )
      //   },
      // },
      COMMON_COLUMNS.SKU_BASE_UNIT_NAME,
      {
        Header: t('商品分类'),
        minWidth: 100,
        accessor: 'category',
        Cell: (cellProps) => {
          return <TextAreaCell data={cellProps.original} field='category' />
        },
      },
      {
        Header: t('盘点批次'),
        accessor: 'batch_serial_no',
        minWidth: 90,
        Cell: (cellProps) => {
          const { batch_selected } = cellProps.original
          const handleBatch = () => {
            RightSideModal.render({
              children: (
                <BatchSelectDetail
                  productInfo={{ skuBaseUnitName: '', skuBaseCount: 0 }}
                  data={batch_selected.slice()}
                  type='inventory'
                />
              ),
              style: {
                width: '1000px',
              },
              onHide: RightSideModal.hide,
            })
          }
          return positionFilter.productType === '0' ? (
            <BatchDetailCell
              index={cellProps.index}
              data={cellProps.original}
              warehouseId={receiptDetail?.warehouse_id}
            />
          ) : (
            <a onClick={handleBatch} className='gm-cursor'>
              {t('查看批次')}
            </a>
          )
        },
      },
      {
        Header: t(globalStore.isLite ? '账目库存' : '账目库存（基本单位）'),
        diyEnable: false,
        isKeyboard: true,
        accessor: 'base_unit_quantity',
        minWidth: 190,
        Cell: (cellProps) => {
          return (
            <InventoryCell data={cellProps.original} index={cellProps.index} />
          )
        },
      },
      {
        Header: t(globalStore.isLite ? '实盘库存' : '实盘库存（基本单位）'),
        diyEnable: false,
        isKeyboard: true,
        accessor: 'ssu_stock_quantity',
        minWidth: 190,
        Cell: (cellProps) => {
          return <ManageBatchCell data={cellProps.original} />
        },
      },
      {
        Header: t(globalStore.isLite ? '盈亏数量' : '盈亏数量（基本单位）'),
        diyEnable: false,
        isKeyboard: true,
        accessor: 'sku_stock_quantity',
        minWidth: 190,
        Cell: (cellProps) => {
          return (
            <ProfitOrLossCell
              data={cellProps.original}
              index={cellProps.index}
            />
          )
        },
      },
      {
        Header: t('备注'),
        diyEnable: false,
        isKeyboard: true,
        accessor: 'quantity',
        minWidth: 190,
        Cell: (cellProps) => {
          return positionFilter.productType === '0' ? (
            <RemakeDetailCell
              index={cellProps.index}
              data={cellProps.original}
            />
          ) : (
            <TextAreaCell field='remark' data={cellProps.original} />
          )
        },
      },
      {
        Header: t('最后操作人'),
        accessor: 'operator',
        minWidth: 90,
        Cell: (cellProps) => {
          return <TextAreaCell data={cellProps.original} field='operator' />
        },
      },
    ]
  }, [handleDetailAdd, positionFilter.productType, receiptDetail]) // 由于这里做了记忆，任何可能改变的值都应该加到这里来，以免改变时未触发更新导致意想不到的bug

  return (
    <BoxPanel title={t('商品明细')} collapse right={<TableRight />}>
      <Table
        isDiy
        isKeyboard
        isEdit
        isVirtualized
        onAddRow={handleDetailAdd}
        id='in_stock_table'
        data={productFilterList.slice()}
        isTrDisable={(item: any) => {
          return item.spu_status === 0
        }}
        columns={columns}
      />
    </BoxPanel>
  )
})

export default EditDetail
