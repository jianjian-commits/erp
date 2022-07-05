import { t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import { Table, Column } from '@gm-pc/table-x'
import globalStore from '@/stores/global'
import Big from 'big.js'
import { Price } from '@gm-pc/react'
import { toFixedOrder } from '@/common/util'
import { getImages } from '@/common/service'
import CellImage from '../../../../components/cell_image'
import { OrderDetail } from 'gm_api/src/order'

const OrderList = observer(() => {
  const { list, customer_type, relation_info } = store

  const columns: Column<OrderDetail>[] = [
    {
      Header: <div className='text-center'>{t('序号')}</div>,
      diyItemText: t('序号'),
      accessor: 'sequence',
      minWidth: 50,
      Cell: (cellProps) => (
        <div className='text-center'>{cellProps.index + 1}</div>
      ),
    },
    {
      Header: t('商品图'),
      id: 'img',
      minWidth: 80,
      accessor: (d) => (
        <CellImage
          img={
            getImages(
              relation_info!.skus![d?.sku_id!]!.ssu_map![d?.ssu?.unit_id!]?.ssu
                ?.repeated_field?.images || [],
            )[0]?.url
          }
        />
      ),
    },
    {
      Header: t('商品编码'),
      id: 'sku_id',
      minWidth: 80,
      accessor: (d) => d.ssu?.customize_code,
      diyEnable: false,
    },
    {
      Header: t('商品名'),
      id: 'name',
      minWidth: 80,
      diyItemText: t('商品名'),
      diyEnable: false,
      accessor: (d) => d.ssu?.name,
    },
    {
      Header: t('规格'),
      accessor: 'unit',
      minWidth: 80,
      Cell: (cellProps) => {
        const { unit } = cellProps.original.ssu
        const text =
          unit.rate && unit.parent_id
            ? `${unit?.rate!}${globalStore.getUnitName(unit?.parent_id!)}/${
                unit?.name
              }`
            : '-'
        return <span>{text}</span>
      },
    },
    {
      Header: t('分类'),
      minWidth: 50,
      diyItemText: t('分类'),
      id: 'category_name',
      accessor: (d) =>
        relation_info!
          .skus![d?.sku_id!]!.category_infos?.map((v) => v.category_name)
          ?.join('/') || '未知',
    },
    {
      Header: t('下单数(包装单位)'),
      id: 'quantity',
      minWidth: 100,
      diyEnable: false,
      accessor: (d) =>
        d.order_unit_value_v2?.quantity?.val + d.ssu?.unit?.name || '-',
    },
    {
      Header: t('销售价'),
      id: 'price',
      minWidth: 120,
      diyEnable: false,
      accessor: (d) => {
        const { ssu, order_unit_value_v2 } = d
        if (
          !order_unit_value_v2?.price?.val &&
          relation_info!.skus![d?.sku_id!]!.ssu_map![d?.ssu?.unit_id!]
            ?.basic_prices![0]?.current_price
        ) {
          return <div>{t('时价')}</div>
        }
        return (
          toFixedOrder(Big(order_unit_value_v2?.price?.val || 0)) +
            Price.getUnit() +
            '/' +
            ssu?.unit?.name || '-'
        )
      },
    },
    {
      Header: t('下单金额'),
      minWidth: 80,
      id: 'order_price',
      accessor: (d) => toFixedOrder(Big(d.order_price || 0)) + Price.getUnit(),
    },
  ]

  return (
    <Table
      isDiy
      columns={columns}
      data={list.slice()}
      id={'group_meal_order_view' + customer_type}
    />
  )
})

export default OrderList
