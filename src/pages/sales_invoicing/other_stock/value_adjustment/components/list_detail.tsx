import React from 'react'
import { t } from 'gm-i18n'
import Big from 'big.js'
import _ from 'lodash'
import { observer } from 'mobx-react'

import { Table, Column } from '@gm-pc/table-x'
import { BoxPanel } from '@gm-pc/react'
import { toFixedByType, toFixedSalesInvoicing } from '@/common/util'
import detail_store from '../stores/detail_store'

const List = observer(() => {
  const { adjustList, type } = detail_store
  const columns: Column[] = [
    {
      Header: t('序号'),
      id: 'index',
      fixed: 'left',
      diyEnable: false,
      Cell: (cellProps) => {
        return <div>{cellProps.index + 1}</div>
      },
    },
    {
      Header: t('商品名称'),
      Cell: (cellProps) => {
        const {
          skuInfo: {
            sku: { name },
          },
        } = cellProps.original
        return name
      },
    },
    // {
    //   Header: t('规格'),
    //   Cell: (cellProps) => {
    //     const {
    //       unit_id,
    //       ssu_base_unit_name,
    //       skuInfo: { ssu_map },
    //     } = cellProps.original
    //     const ssu = _.find(ssu_map, (value) => value.ssu.unit_id === unit_id)
    //     let showText
    //     if (ssu) {
    //       showText =
    //         ssu?.ssu?.unit_type === 1
    //           ? ssu_base_unit_name
    //           : `${ssu?.ssu?.unit?.rate} ${ssu_base_unit_name}/${ssu?.ssu?.unit?.name}`
    //     } else showText = `${ssu_base_unit_name}(基本单位)`
    //     return showText
    //   },
    // },
    {
      Header: t('商品分类'),
      Cell: (cellProps) => {
        const {
          skuInfo: { category_infos },
        } = cellProps.original
        const operate_name = _.map(category_infos, (obj) => {
          return obj.category_name
        }).join('/')
        return operate_name
      },
    },
    {
      Header: t('批次号'),
      accessor: 'batch_id',
      Cell: (cellProps) => {
        const { batchedInfo } = cellProps.original

        return batchedInfo?.batch_serial_no ?? '-'
      },
    },
    {
      Header: t('入库数(基本单位)'),
      show: type === 'stockIn',
      Cell: (cellProps) => {
        const { stock_amount } = cellProps.original
        return toFixedSalesInvoicing(Big(stock_amount))
      },
    },
    {
      Header: t('出库数(基本单位)'),
      show: type === 'stockOut',
      Cell: (cellProps) => {
        const { stock_amount } = cellProps.original
        return toFixedSalesInvoicing(Big(stock_amount))
      },
    },
    {
      Header: t('调整前库存均价'),
      Cell: (cellProps) => {
        const { original_price } = cellProps.original
        return toFixedByType(Big(original_price), 'dpInventoryAmount')
      },
    },
    {
      Header: t('调整后库存均价'),
      Cell: (cellProps) => {
        const { adjust_price } = cellProps.original
        return toFixedByType(Big(adjust_price), 'dpInventoryAmount')
      },
    },
    {
      Header: t('调整差异'),
      Cell: (cellProps) => {
        const { adjust_price, original_price } = cellProps.original
        return toFixedByType(
          Big(original_price).minus(adjust_price),
          'dpInventoryAmount',
        )
      },
    },
  ]
  return (
    <BoxPanel
      summary={[{ text: t('商品数'), value: adjustList?.length }]}
      collapse
      title={t('商品列表')}
    >
      <Table data={adjustList.slice() || []} columns={columns} />
    </BoxPanel>
  )
})

export default List
