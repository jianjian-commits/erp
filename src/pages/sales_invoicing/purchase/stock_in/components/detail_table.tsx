import React from 'react'
import { BoxPanel, Flex, Price } from '@gm-pc/react'
import { TableXUtil, Table, Column } from '@gm-pc/table-x'
import Big from 'big.js'
import _ from 'lodash'
import { t } from 'gm-i18n'
import store, { PDetail } from '../stores/receipt_store1'
import { observer } from 'mobx-react'
import TableRight from '@/common/components/key_board_tips'
import { TextAreaCell } from '@/pages/sales_invoicing/components'
import { RECEIPT_STATUS } from '@/pages/sales_invoicing/enum'
import { Status_Code } from 'gm_api/src/inventory'
import WarningPopover from '@/common/components/icon/warning_popover'
import globalStore from '@/stores/global'
import { GroupUser, Permission } from 'gm_api/src/enterprise'
import { COMMON_COLUMNS } from '@/common/enum'
import {
  quoteCommonColumn,
  sortHeader,
} from '@/pages/sales_invoicing/common_column_enum'
import { DetailStore } from '../stores'
import {
  getEndlessPrice,
  getUnNillText,
  toFixed,
  toFixedSalesInvoicing,
} from '@/common/util'

const { TABLE_X } = TableXUtil

const BatchNoCell = observer((props: { data: PDetail }) => {
  const hasUsed = DetailStore.errorMap[Status_Code.CANCEL_USED_BATCH].includes(
    props.data.batch_serial_no,
  )
  return (
    <Flex>
      {props.data.batch_serial_no}
      {hasUsed && (
        <WarningPopover
          popup={
            <div className='gm-padding-tb-10 gm-padding-lr-15'>
              {t('该批次已被使用')}
            </div>
          }
        />
      )}
    </Flex>
  )
})

const Detail = observer(() => {
  const { productDetails, receiptDetail, getAdditionInfo } = DetailStore
  const { sheet_status } = receiptDetail

  // 做一层记忆处理，若内部有值会变，需要放到第二个参数中
  const columns: Column[] = React.useMemo(() => {
    return [
      {
        Header: t('批次号'),
        diyEnable: false,
        accessor: 'batch_serial_no',
        fixed: 'left',
        width:
          receiptDetail.sheet_status === RECEIPT_STATUS.approved
            ? 180
            : TABLE_X.WIDTH_NO,
        Cell: (cellProps) => {
          return <BatchNoCell data={cellProps.original} />
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
          DetailStore,
        ),
        diyItemText: t('商品分类'),
        minWidth: 100,
        accessor: 'category',
        Cell: (cellProps) => {
          return <TextAreaCell data={cellProps.original} field='category' />
        },
      },
      {
        Header: t(globalStore.isLite ? '入库数' : '入库数（基本单位）'),
        diyEnable: false,
        accessor: 'base_quantity',
        minWidth: 150,
        Cell: (cellProps) => {
          const { input_stock, sku_base_unit_name } = cellProps.original
          return (
            toFixedSalesInvoicing(input_stock?.input?.quantity) +
            sku_base_unit_name
          )
        },
      },
      /** 入库数(辅助单位) */
      quoteCommonColumn('SECOND_QUANTITY'),
      {
        Header: t(globalStore.isLite ? '入库单价' : '入库单价（基本单位）'),
        minWidth: 150,
        accessor: 'base_price',
        hide: !globalStore.hasPermission(
          Permission.PERMISSION_INVENTORY_VIEW_PURCHASE_IN_MONEY,
        ),
        diyEnable: false,
        Cell: (cellProps) => {
          return (
            <TextAreaCell
              data={cellProps.original}
              field='base_price'
              isLite={globalStore.isLite}
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
        Cell: (cellProps) => {
          const { input_stock } = cellProps.original

          return (
            getEndlessPrice(Big(input_stock?.input?.price || 0), true) +
            Price.getUnit()
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
        minWidth: 140,
        Cell: (cellProps) => {
          return (
            <TextAreaCell
              index={cellProps.index}
              data={cellProps.original}
              field='amount'
            />
          )
        },
      },
      {
        Header: t('不含税入库金额'),
        accessor: 'no_tax_amount_copy',
        hide:
          !globalStore.hasPermission(
            Permission.PERMISSION_INVENTORY_VIEW_PURCHASE_IN_MONEY,
          ) || globalStore.isLite,
        diyEnable: false,
        minWidth: 140,
        Cell: (cellProps) => {
          return (
            <TextAreaCell
              index={cellProps.index}
              data={cellProps.original}
              field='no_tax_amount_copy'
            />
          )
        },
      },
      {
        Header: t('税额'),
        accessor: 'tax_money_copy',
        hide:
          !globalStore.hasPermission(
            Permission.PERMISSION_INVENTORY_VIEW_PURCHASE_IN_MONEY,
          ) || globalStore.isLite,
        diyEnable: false,
        minWidth: 140,
        Cell: (cellProps) => {
          const { tax_amount, input_tax } = cellProps.original
          const no_tax_amount = _.isNil(tax_amount)
            ? null
            : +tax_amount / (input_tax / 100 + 1)
          return (
            toFixed(Big(Math.abs(+tax_amount! - +no_tax_amount!) || 0), 2) +
            Price.getUnit()
          )
        },
      },
      {
        Header: t('税率'),
        accessor: 'tax_rate',
        hide:
          !globalStore.hasPermission(
            Permission.PERMISSION_INVENTORY_VIEW_PURCHASE_IN_MONEY,
          ) || globalStore.isLite,
        diyEnable: false,
        minWidth: 140,
        Cell: (cellProps) => {
          return (
            <TextAreaCell
              index={cellProps.index}
              data={cellProps.original}
              field='tax_rate'
            />
          )
        },
      },
      {
        Header: t('生产日期'),
        accessor: 'production_time',
        hide: globalStore.isLite,
        minWidth: 160,
        Cell: (cellProps) => {
          return (
            <TextAreaCell data={cellProps.original} field='production_time' />
          )
        },
      },
      {
        Header: t('商品等级'),
        accessor: 'sku_level_filed_id',
        hide: globalStore.isLite,
        minWidth: 160,
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
        Cell: (cellProps) => {
          return <TextAreaCell data={cellProps.original} field='shelf_name' />
        },
      },
      {
        Header: t('商品备注'),
        accessor: 'remark',
        minWidth: 200,
        Cell: (cellProps) => {
          return <TextAreaCell data={cellProps.original} field='remark' />
        },
      },
      {
        Header: t('操作人'),
        accessor: 'creator_id',
        minWidth: 90,
        Cell: (cellProps) => {
          const { creator_id } = cellProps.original
          const groupUser = getAdditionInfo<GroupUser>(
            'group_users',
            creator_id,
          )
          return getUnNillText(groupUser?.name)
        },
      },
    ]
  }, [sheet_status]) // 由于这里做了记忆，任何可能改变的值都应该加到这里来，以免改变时未触发更新导致意想不到的bug

  return (
    <BoxPanel title={t('商品明细')} collapse right={<TableRight />}>
      <Table
        isIndex
        isDiy
        isKeyboard
        isVirtualized
        id='purchase_stock_in_detail_table'
        data={productDetails.slice()}
        isTrDisable={(item: any) => {
          return item.spu_status === 0
        }}
        columns={columns}
      />
    </BoxPanel>
  )
})

export default Detail
