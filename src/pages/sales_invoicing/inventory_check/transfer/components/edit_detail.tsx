import TableRight from '@/common/components/key_board_tips'
import { getFormatTimeForTable } from '@/common/util'
import { TextAreaCell } from '@/pages/sales_invoicing/components'
import { BoxPanel } from '@gm-pc/react'
import { TableXUtil, Table, Column } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import React, { useCallback } from 'react'
import store from '../stores/detail_store'
import {
  InventoryCell,
  OperationCell,
  ProductNameCell,
  // SpecificationCell,
} from './product_detail'
import ExistingInventoryCell from './product_detail/existing_inventory_cell'
import SupplierCell from './product_detail/supplier_cell'
import TransferBatchCell from './product_detail/transfer_batch_cell'
import TransferInventoryCell from './product_detail/transfer_inventory_cell'
import TransferMesureCell from './product_detail/transfer_measure_cell'
// import TransferPackageCell from './product_detail/transfer_package_cell'
import { COMMON_COLUMNS } from '@/common/enum'

const { OperationHeader, TABLE_X } = TableXUtil

const EditDetail = observer(() => {
  const { productFilterList, positionFilter } = store

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
      COMMON_COLUMNS.SKU_BASE_UNIT_NAME,
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
      {
        Header: t('商品分类'),
        minWidth: 100,
        accessor: 'category',
        Cell: (cellProps) => {
          return <TextAreaCell data={cellProps.original} field='category' />
        },
      },
      {
        Header: t('现存货位'),
        diyEnable: false,
        isKeyboard: true,
        accessor: 'base_unit_quantity',
        minWidth: 190,
        Cell: (cellProps) => {
          return (
            <ExistingInventoryCell
              data={cellProps.original}
              index={cellProps.index}
            />
          )
        },
      },
      {
        Header: t('移库批次'),
        diyEnable: false,
        isKeyboard: true,
        accessor: 'base_unit_quantity',
        minWidth: 190,
        Cell: (cellProps) => {
          return (
            <TransferBatchCell
              data={cellProps.original}
              index={cellProps.index}
            />
          )
        },
      },
      {
        Header: t('供应商'),
        diyEnable: false,
        isKeyboard: true,
        accessor: 'base_unit_quantity',
        minWidth: 190,
        Cell: (cellProps) => {
          return (
            <SupplierCell data={cellProps.original} index={cellProps.index} />
          )
        },
      },
      {
        Header: t('入库日期'),
        diyEnable: false,
        isKeyboard: true,
        accessor: 'base_unit_quantity',
        minWidth: 190,
        Cell: (cellProps) => {
          const in_stock_time =
            cellProps.original?.batch_selected_single?.in_stock_time
          return (
            <span>{getFormatTimeForTable('YYYY-MM-DD', in_stock_time)}</span>
          )
        },
      },
      {
        Header: t('生产日期'),
        diyEnable: false,
        isKeyboard: true,
        accessor: 'base_unit_quantity',
        minWidth: 190,
        Cell: (cellProps) => {
          // getFormatTimeForTable
          const production_time =
            cellProps.original.batch_selected_single?.production_time
          return (
            <span>{getFormatTimeForTable('YYYY-MM-DD', production_time)}</span>
          )
        },
      },
      {
        Header: t('保质期'),
        diyEnable: false,
        isKeyboard: true,
        accessor: 'base_unit_quantity',
        minWidth: 190,
        Cell: (cellProps) => {
          const expiry_time =
            cellProps.original.batch_selected_single?.expiry_time
          return <span>{getFormatTimeForTable('YYYY-MM-DD', expiry_time)}</span>
        },
      },
      {
        Header: t('账面库存（基本单位）'),
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
        Header: t('移库数 (基本单位)'),
        diyEnable: false,
        isKeyboard: true,
        accessor: 'quantity',
        minWidth: 190,
        Cell: (cellProps) => {
          return positionFilter.productType === '0' ? (
            <TransferMesureCell
              index={cellProps.index}
              data={cellProps.original}
            />
          ) : (
            <TextAreaCell field='remark' data={cellProps.original} />
          )
        },
      },
      /** 商品改造弃掉包装单位 */
      // {
      //   Header: t('调拨数 (包装单位(废弃))'),
      //   accessor: 'operator',
      //   minWidth: 190,
      //   Cell: (cellProps) => {
      //     return (
      //       <TransferPackageCell
      //         index={cellProps.index}
      //         data={cellProps.original}
      //       />
      //     )
      //   },
      // },
      {
        Header: t('移入货位'),
        accessor: 'operator',
        minWidth: 190,
        Cell: (cellProps) => {
          return (
            <TransferInventoryCell
              data={cellProps.original}
              index={cellProps.index}
            />
          )
        },
      },
    ]
  }, [handleDetailAdd, positionFilter.productType]) // 由于这里做了记忆，任何可能改变的值都应该加到这里来，以免改变时未触发更新导致意想不到的bug

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
