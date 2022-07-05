import { t } from 'gm-i18n'
import React, { useState, useRef, FC } from 'react'
import { KCTableSelect } from '@gm-pc/keyboard'
import _ from 'lodash'
import { Flex, Price, Tooltip } from '@gm-pc/react'
import Big from 'big.js'
import { observer } from 'mobx-react'
import styled from 'styled-components'
import {
  ListSsuByCustomerOrQuotation,
  Ssu_Ingredients,
  Ssu_ShippingFeeUnit,
  Unit,
} from 'gm_api/src/merchandise'

import store from '../store'
import globalStore from '@/stores/global'
import type { TableSelectDataItem } from '@gm-pc/react'
import type { Ssu } from '../../interface'
import {
  parseSsu,
  toFixedOrder,
  list2Map,
  getBaseRateFromBaseUnit,
} from '@/common/util'
import { Filters_Bool } from 'gm_api/src/common'
import { ListSkuStock } from 'gm_api/src/inventory'
import { initSsu } from '../../init'
import { isSsuInvalid } from '../util'
import KCDisabledCell from '@/pages/order/order_manage/components/kc_disable_cell'
import {
  SSU_CUSTOMIZE_CODE,
  SSU_NAME,
} from '@/pages/system/template/order_template/util'
import { makeIngredientSkuList } from '@/pages/order/order_manage/components/detail/util'
import { getQuantity } from '@/pages/order/order_manage/list/menu_detail/util'

interface CellSSuProps {
  orderIndex: number
  ssuIndex: number
  original: Ssu
}

const WordBreak = styled.div`
  word-break: break-all;
`
const CellSSu: FC<CellSSuProps> = ({ orderIndex, ssuIndex, original }) => {
  const order = store.list[orderIndex].info
  const [skuList, setSkuList] = useState<TableSelectDataItem<string>[]>([])

  const productNameRef = useRef<string>()

  const renderID = (cellProps) => {
    const sku = cellProps.original
    return <WordBreak>{sku.customize_code}</WordBreak>
  }

  const renderDesc = (cellProps) => {
    const sku = cellProps.original
    const { description } = sku
    const result = description || '-'
    return result
  }

  const renderSpec = (cellProps) => {
    const ssu = cellProps.original
    const { unit } = ssu
    const text = `${unit?.rate!}${globalStore.getUnitName(unit?.parent_id!)}/${
      unit?.name
    }`
    return <span>{text}</span>
  }

  const renderSalePrice = (cellProps) => {
    const ssu: Ssu = cellProps.original
    const { price } = ssu
    if (ssu.basic_price?.current_price) return t('时价')
    const parse = parseSsu(ssu)

    return price + Price.getUnit() + '/' + parse.ssu_unit_name
  }

  const renderName = (cellProps) => {
    const original = cellProps.original
    return <WordBreak>{original.name}</WordBreak>
  }

  const tableColumns = [
    {
      Header: '商品编码',
      accessor: 'original.customize_code',
      width: 80,
      Cell: renderID,
    },
    {
      Header: '商品名',
      accessor: 'original.name',
      width: 120,
      Cell: renderName,
    },
    {
      Header: '规格',
      accessor: 'original.spec',
      width: 70,
      Cell: renderSpec,
    },
    {
      Header: '分类',
      accessor: 'original.category_name',
      width: 60,
      Cell: (cellProps) => {
        const sku = cellProps.original
        return sku.category_name
      },
    },
    {
      Header: '报价单简称（对外）',
      accessor: 'original.supplier_name',
      width: 120,
      Cell: () => order.customer?.quotation?.outer_name || '-',
    },
    {
      Header: '单价（包装单位）',
      accessor: 'original.price',
      width: 100,
      Cell: renderSalePrice,
    },
    {
      Header: '商品描述',
      accessor: 'original.desc',
      width: 80,
      Cell: renderDesc,
    },
  ]

  const getIngredientsQuantity = (
    ratio: string,
    use_unit_id: string,
    unit: Unit,
    parentQuantity: number,
  ): number => {
    const rate = getBaseRateFromBaseUnit(use_unit_id, unit.parent_id)
    return +toFixedOrder(
      Big(ratio).times(parentQuantity).times(rate).div(unit.rate),
    )
  }

  const handleSelect = (selected: Ssu) => {
    store.updateSsuRow(orderIndex, ssuIndex, {
      ...(selected || initSsu),
      isNewItem: true,
      quantity: +selected?.minimum_order_number! || null,
      quotationName: order.customer?.quotation?.outer_name || '-',
    })
    // 组合商品，把原料添加进列表
    if (selected.type === 2) {
      const { ssu_ratios } = selected.ingredients as Ssu_Ingredients
      _.forEach(selected.ingredientsInfo, (item, count) => {
        // 下单数要根据配比计算，默认返回的是计量单位
        const ratioInfo = ssu_ratios?.find(
          (item2) => item2.ssu_id === item.ssu_id,
        )
        const quantity = getQuantity(
          getIngredientsQuantity(
            ratioInfo?.ratio!,
            ratioInfo?.use_unit_id!,
            item.unit,
            +selected?.minimum_order_number!,
          ),
          globalStore.orderSetting,
          item.unit,
          item.unit_type,
          false,
        )
        store.addSsuRow(
          orderIndex,
          {
            ...(item || initSsu),
            isNewItem: true,
            quantity: quantity || null,
            quotationName: order.customer?.quotation?.outer_name || '-',
          },
          +ssuIndex + +count,
        )
      })
    }
  }

  const handleSearch = (value: string) => {
    productNameRef.current = value
    const { service_period_id, customer, quotation_id } = order
    ListSsuByCustomerOrQuotation({
      q: value,
      service_period_id: service_period_id,
      customer_id: customer?.customer_id!,
      on_sale: Filters_Bool.TRUE,
      quotation_id: quotation_id,
      paging: { limit: 999 },
    }).then(async (json) => {
      const list = json.response.ssu_infos || []
      const single_ssu_infos = json.response.single_ssu_infos || []
      const res = await ListSkuStock({
        paging: { limit: 999 },
        unit_stock_map: true,
        sku_ids: list.map((v) => v.sku?.sku_id!),
      })
      const skuStockMap = list2Map(res.response.sku_stocks, 'sku_id')
      setSkuList(
        list.map((v) => {
          const ssu = v.ssu!
          const parse = parseSsu(ssu)
          const ingredientsInfo: Ssu[] = []
          // 获取组合商品下的原料信息
          if (ssu.type === 2) {
            _.forEach(ssu?.ingredients?.ssu_ratios, (item) => {
              const target = _.find(
                single_ssu_infos,
                (info) => info.ssu?.ssu_id === item.ssu_id,
              )
              target &&
                ingredientsInfo.push(
                  makeIngredientSkuList(
                    target,
                    ssu.ssu_id,
                    customer?.quotation.quotation_id || '',
                  ) as any,
                )
            })
          }
          return {
            ...ssu,
            ...parse,
            remark: '',
            category_name:
              v?.category_infos?.map((v) => v.category_name)?.join('/') || '-',
            price: v?.basic_price?.current_price
              ? 0
              : ssu.shipping_fee_unit === Ssu_ShippingFeeUnit.PACKAGE
              ? v.price
              : toFixedOrder(
                  Big(v.price || 0).times(parse?.ssu_unit_rate || 1),
                ),
            stdPrice: v?.basic_price?.current_price
              ? 0
              : ssu.shipping_fee_unit === Ssu_ShippingFeeUnit.BASE
              ? v.price
              : toFixedOrder(Big(v.price || 0).div(parse?.ssu_unit_rate || 1)),
            _skuStock: skuStockMap[v.sku?.sku_id!],
            basic_price: v?.basic_price,
            value: ssu.sku_id! + ssu.unit_id!,
            text: ssu.name!,
            ingredientsInfo,
          }
        }),
      )
      return null
    })
  }

  const selected: TableSelectDataItem<string> | undefined =
    original.sku_id && original.unit_id
      ? {
          value: original.sku_id + original.unit_id,
          text: original.name!,
        }
      : undefined
  if (isSsuInvalid(original)) {
    const excel = store.list[orderIndex].excel
    const ssus = excel?.excelOrder?.excel_ssus || []
    const ssuData = ssus[original.sort_num! - 1]?.ssu || {}
    return (
      <KCDisabledCell>
        <div className='gm-has-error'>
          {`(${ssuData[SSU_NAME] || ssuData[SSU_CUSTOMIZE_CODE] || '-'})${t(
            '商品异常',
          )}`}
          <Tooltip
            popup={
              <div className='gm-padding-5' style={{ minWidth: '180px' }}>
                <Flex column>
                  <div>{t('可能存在如下原因，请检查后重新导入：')}</div>
                  <div>{t('1.商品已被删除；')}</div>
                  <div>{t('2.商品已被下架；')}</div>
                  <div>{t('3.商品库存不足；')}</div>
                  <div>{t('4.当前用户的报价单中不包含此商品；')}</div>
                </Flex>
              </div>
            }
          />
        </div>
      </KCDisabledCell>
    )
  }
  return (
    <KCTableSelect
      data={skuList}
      columns={tableColumns}
      selected={selected!}
      onSearch={handleSearch}
      onSelect={handleSelect}
      renderListFilter={(data) => data}
      placeholder={t('输入商品编码或商品名')}
      disabled={!!original.parentId}
    />
  )
}

export default observer(CellSSu)
