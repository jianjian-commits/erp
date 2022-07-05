import React, { useCallback } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { BoxPanel, Button, Flex, Price, RightSideModal } from '@gm-pc/react'
import { TableXUtil, Table, Column } from '@gm-pc/table-x'

import TableRight from '@/common/components/key_board_tips'
import { TextAreaCell } from '@/pages/sales_invoicing/components'
import {
  BatchDetailCell,
  ProductNameCell,
  OperationCell,
} from './product_detail'
import store from '../stores/detail_store'
import ModalRight from './modal_right/index.page'
import RemarkCell from '@/pages/sales_invoicing/other_stock/stock_out/components/product_detail/remake_cell'
import { COMMON_COLUMNS } from '@/common/enum'
import {
  quoteCommonColumn,
  sortHeader,
  BaseQuantityColumn,
} from '@/pages/sales_invoicing/common_column_enum'
import { toJS } from 'mobx'
import { getEndlessPrice } from '@/common/util'

const { OperationHeader, TABLE_X } = TableXUtil

const EditDetail = observer(() => {
  const { productDetails, receiptDetail, changeProductDetailsItem } = store
  const handleDetailAdd = useCallback(() => {
    store.addProductDetailsItem()
  }, [])

  console.log(toJS(productDetails), '其它出库') // 暂时保留, 打印才能渲染 入库基本单位/入库金额

  // 做一层记忆处理，若内部有值会变，需要放到第二个参数中
  const columns: Column[] = React.useMemo(() => {
    return [
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
            <OperationCell index={cellProps.index} onAddRow={handleDetailAdd} />
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
              warehouseId={receiptDetail?.warehouse_id}
            />
          )
        },
      },
      {
        Header: t('出库单价'),
        minWidth: 150,
        accessor: 'ssu_base_price',
        diyEnable: false,
        isKeyboard: true,
        Cell: (cellProps) => {
          const { batch_selected, base_price } = cellProps.original
          const out_stock_base_price =
            batch_selected.length > 0
              ? getEndlessPrice(base_price) + Price.getUnit()
              : '-'
          return <span>{out_stock_base_price}</span>
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
              {amount ? getEndlessPrice(amount) + Price.getUnit() : '-'}
            </span>
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
  }, [handleDetailAdd, receiptDetail])

  const handleSelectStockInOrder = () => {
    RightSideModal.render({
      title: '复制入库单据',
      children: <ModalRight onHide={RightSideModal.hide} />,
      style: {
        width: '1000px',
      },
      onHide: RightSideModal.hide,
    })
  }

  return (
    <BoxPanel
      title={t('商品明细')}
      collapse
      right={
        <Flex>
          <TableRight />
          <Button
            className='gm-margin-left-10'
            type='primary'
            onClick={handleSelectStockInOrder}
          >
            复制入库单数据
          </Button>
        </Flex>
      }
    >
      <Table
        isDiy
        isEdit
        isKeyboard
        onAddRow={handleDetailAdd}
        id='in_stock_table'
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
