import React from 'react'
import Big from 'big.js'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { BoxPanel, RightSideModal } from '@gm-pc/react'
import { Table, Column } from '@gm-pc/table-x'
import TableRight from '@/common/components/key_board_tips'
import globalStore from '@/stores/global'

import { TextAreaCell } from '@/pages/sales_invoicing/components'
import { BatchSelectDetail } from '@/pages/sales_invoicing/components/batch_select'
import {
  InventoryCell,
  ManageBatchCell,
  ProfitOrLossCell,
} from './product_detail'
import Summary from './summary'
import store from '../stores/detail_store'
import { COMMON_COLUMNS } from '@/common/enum'

const EditDetail = observer(() => {
  const { productFilterList } = store

  // 做一层记忆处理，若内部有值会变，需要放到第二个参数中
  const columns: Column[] = React.useMemo(() => {
    return [
      COMMON_COLUMNS.INDEX,
      {
        Header: t('商品名'),
        accessor: 'sku_name',
        diyEnable: false,
        minWidth: 200,
        Cell: (cellProps) => {
          return <TextAreaCell field='sku_name' data={cellProps.original} />
        },
      },
      COMMON_COLUMNS.SKU_BASE_UNIT_NAME,
      {
        Header: t('商品分类'),
        minWidth: 100,
        accessor: 'category',
        Cell: (cellProps) => {
          return <TextAreaCell field='category' data={cellProps.original} />
        },
      },
      {
        Header: t('盘点批次'),
        accessor: 'batch_serial_no',
        minWidth: 90,
        Cell: (cellProps) => {
          const {
            // ssu_base_quantity,
            base_quantity,
            sku_base_unit_name,
            batch_selected,
            // ssu_base_unit_rate,
          } = cellProps.original
          const handleBatch = () => {
            RightSideModal.render({
              children: (
                <BatchSelectDetail
                  productInfo={{
                    skuBaseUnitName: sku_base_unit_name,
                    // skuBaseCount: +Big(ssu_base_quantity!)
                    skuBaseCount: +Big(base_quantity!)
                      // .times(ssu_base_unit_rate!)
                      .toFixed(globalStore.dpSalesInvoicing),
                  }}
                  type='inventory'
                  data={batch_selected.slice()}
                />
              ),
              style: {
                width: '1000px',
              },
              onHide: RightSideModal.hide,
            })
          }
          return (
            <a onClick={handleBatch} className='gm-cursor'>
              {t('查看批次')}
            </a>
          )
        },
      },
      {
        Header: t(globalStore.isLite ? '账面库存' : '账面库存（基本单位）'),
        diyEnable: false,
        isKeyboard: true,
        accessor: 'ssu_unit_id',
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
        minWidth: 190,
        Cell: (cellProps) => {
          return <ManageBatchCell data={cellProps.original} />
        },
      },
      {
        Header: t(globalStore.isLite ? '盈亏数量' : '盈亏数量（基本单位）'),
        diyEnable: false,
        isKeyboard: true,
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
        accessor: 'remark',
        diyEnable: false,
        minWidth: 140,
        Cell: (cellProps) => {
          return <TextAreaCell field='remark' data={cellProps.original} />
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
  }, []) // 由于这里做了记忆，任何可能改变的值都应该加到这里来，以免改变时未触发更新导致意想不到的bug

  return (
    <BoxPanel
      title={t('商品明细')}
      collapse
      right={<TableRight />}
      summary={<Summary />}
    >
      <Table
        isDiy
        isVirtualized
        id='in_stock_table'
        data={productFilterList}
        isTrDisable={(item: any) => {
          return item.spu_status === 0
        }}
        columns={columns}
      />
    </BoxPanel>
  )
})

export default EditDetail
