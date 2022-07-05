import React from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import Big from 'big.js'
import { observer } from 'mobx-react'
import { Table, Column } from '@gm-pc/table-x'
import {
  BoxTable,
  BoxTableInfo,
  BoxTableProps,
  Flex,
  Price,
} from '@gm-pc/react'
import TableTotalText from '@/common/components/table_total_text'
import { getEndlessPrice, toFixedSalesInvoicing } from '@/common/util'

import ToSheet from '@/pages/sales_invoicing/components/toSheet'
import { formatDay, showUnitText } from '@/pages/sales_invoicing/util'
import storageStore from '../stores/storage_store'
import { BatchExpand } from '@/pages/sales_invoicing/interface'
import { ExpireType } from 'gm_api/src/inventory'
import globalStore from '@/stores/global'
import { quoteCommonColumn } from '@/pages/sales_invoicing/common_column_enum'

export const getHeathlyTag = (
  expire_type: ExpireType = ExpireType.EXPIRE_TYPE_UNSPECIFIED,
) => {
  const map = {
    [ExpireType.EXPIRE_TYPE_UNSPECIFIED]: '未设置',
    [ExpireType.EXPIRE_TYPE_SAFE]: '正常',
    [ExpireType.EXPIRE_TYPE_EXPIRE]: '过期',
    [ExpireType.EXPIRE_TYPE_CLOSE]: '临期',
  }

  if (['未设置', '正常'].includes(map[expire_type])) return ''

  return (
    <div
      style={{
        borderRadius: '6px',
        background: 'red',
        padding: '2px',
        color: 'white',
        fontSize: '10px',
        marginLeft: '10px',
      }}
    >
      {map[expire_type]}
    </div>
  )
}

const List = observer(({ pagination }: Pick<BoxTableProps, 'pagination'>) => {
  const { list, sku_info, paging } = storageStore

  const columns: Column<BatchExpand>[] = [
    // {
    //   Header: t('规格'),
    //   Cell: (cellProps) => {
    //     const { ssu_base_unit_name, ssu_info } = cellProps.original

    //     if (!ssu_info) return '-'
    //     const showText = showUnitText(ssu_info, ssu_base_unit_name)
    //     return showText
    //   },
    // },
    {
      Header: t('批次号'),
      Cell: (cellProps) => {
        const { batch_serial_no, parent_id } = cellProps.original
        return (
          <a
            className='gm-text-primary gm-cursor'
            href={`#/sales_invoicing/inventory_account/stock_overview/inventory_overview/batch_detail?batch_id=${parent_id}`}
          >
            {batch_serial_no}
          </a>
        )
      },
    },
    {
      Header: t('批次来源'),
      Cell: (cellProps) => {
        const { source_sheet_type, in_stock_sheet_id, stock_sheet_serial_no } =
          cellProps.original
        return (
          <ToSheet
            source_type={source_sheet_type}
            serial_no={stock_sheet_serial_no}
            sheet_id={in_stock_sheet_id}
            showName
          />
        )
      },
    },
    {
      Header: t('批次均价'),
      Cell: (cellProps) => {
        const { stock } = cellProps.original
        return (
          getEndlessPrice(Big(stock?.base_unit?.price ?? ''), true) +
          Price.getUnit()
        )
      },
    },
    {
      Header: t('货位'),
      hide: globalStore.isLite,
      Cell: (cellProps) => {
        const { shelfNames } = cellProps.original
        return _.join((shelfNames as string[]) ?? [], '/') || '-'
      },
    },
    {
      Header: t('生产日期'),
      hide: globalStore.isLite,
      Cell: (cellProps) => {
        const { production_time } = cellProps.original
        return Number(production_time) ? formatDay(production_time!) : '-'
      },
    },
    {
      Header: t('过期时间'),
      hide: globalStore.isLite,
      Cell: (cellProps) => {
        const { expire_date } = cellProps.original

        return Number(expire_date) && !!expire_date
          ? formatDay(expire_date)
          : '-'
      },
    },
    {
      Header: t(globalStore.isLite ? '账面库存' : '账面库存(基本单位)'),
      Cell: (cellProps) => {
        const { stock, base_unit_name, expire_type } = cellProps.original
        return (
          <Flex>
            {toFixedSalesInvoicing(Big(stock?.base_unit?.quantity ?? '')) +
              `${base_unit_name}`}
            {getHeathlyTag(expire_type ?? 0)}
          </Flex>
        )
      },
    },
    quoteCommonColumn(
      'MUTI_UNIT_DISPLAY',
      { type: 'put_in_storage' },
      {
        Header: t('多单位数量汇总'),
      },
    ),
    /** 商品改造弃掉包装单位 */
    // {
    //   Header: t('账面库存(包装单位(废弃))'),
    //   hide: globalStore.isLite,
    //   Cell: (cellProps) => {
    //     const {
    //       stock: { sku_unit },
    //       ssu_info,
    //     } = cellProps.original
    //     let unit_name = '-'
    //     if (ssu_info) unit_name = ssu_info?.ssu?.unit?.name
    //     return ssu_info
    //       ? toFixedSalesInvoicing(Big(sku_unit.quantity)) + `${unit_name}`
    //       : unit_name
    //   },
    // },
  ]
  const data = [
    {
      label: t('批次总数'),
      content: paging.count,
    },
  ]
  return (
    <BoxTable
      pagination={pagination}
      info={
        <Flex alignCenter>
          <BoxTableInfo>{sku_info?.name}</BoxTableInfo>
          <div className='gm-padding-right-10' />
          <BoxTableInfo>
            <TableTotalText data={data} />
          </BoxTableInfo>
        </Flex>
      }
    >
      <Table data={list.slice()} columns={columns} />
    </BoxTable>
  )
})

export default List
