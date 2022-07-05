import React, { FC, useMemo, useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { Column, Table } from '@gm-pc/table-x'
import styled from 'styled-components'
import store, { initSsu } from '../../store'
import {
  DetailListItem,
  Sku,
} from '@/pages/order/order_manage/components/interface'
import { ListBestSaleSku, Unit } from 'gm_api/src/merchandise'
import Big from 'big.js'
import { getBaseRateFromBaseUnit, toFixedOrder } from '@/common/util'
import { Button, Flex, TableSelectDataItem, RightSideModal } from '@gm-pc/react'
import { handleFetchSkuResponse } from '@/pages/order/order_manage/components/detail/util'
import { ChinaVatInvoice_InvoiceType } from 'gm_api/src/enterprise'
import { getQuantity } from '@/pages/order/order_manage/list/menu_detail/util'
import { getOrderUnitName, isCombineSku } from '@/pages/order/util'

type Data = TableSelectDataItem<string> & DetailListItem

const PrimaryTag = styled.span`
  border-left: 3px solid var(--gm-color-primary);
`
const FrequentSsu: FC = () => {
  const {
    getCustomerNameById,
    order: { customer },
    list,
    setList,
    addRow,
  } = store

  const [data, setData] = useState<Data[]>([])
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    ListBestSaleSku({
      customer_id: customer?.customer_id!,
      // quotation_id: customer?.quotation?.quotation_id!,
      limit: '50',
    }).then(
      handleFetchSkuResponse.bind(
        null,
        setData,
        customer?.quotation?.quotation_id!,
      ),
    )
  }, [customer])

  const columns: Column<DetailListItem>[] = useMemo(
    () => [
      {
        Header: t('商品编码'),
        id: 'customize_code',
        minWidth: 100,
        Cell: ({ original: sku }) => {
          return sku.customize_code || '-'
        },
      },
      {
        Header: t('商品名称'),
        id: 'name',
        minWidth: 100,
        Cell: ({ original: sku }) => {
          if (isCombineSku(sku))
            return <div className='b-combine-goods-row-tootips'>{sku.name}</div>
          return sku.name || '-'
        },
      },
      // {
      //   Header: t('下单单位'),
      //   id: 'unit',
      //   minWidth: 100,
      //   Cell: ({ original: sku }) => {
      //     const { unit } = sku
      //     const text = unit.parent_id
      //       ? `${unit?.rate}${globalStore.getUnitName(unit?.parent_id)}/${
      //           unit?.name
      //         }`
      //       : '-'
      //     return <span>{text}</span>
      //   },
      // },
      // {
      //   Header: t('商品价格'),
      //   id: 'price',
      //   minWidth: 100,
      //   Cell: ({ original: sku }) => {
      //     const ssu = cellProps.original
      //     if (!ssu.price && ssu.basic_price?.current_price) {
      //       return <div>{t('时价')}</div>
      //     }
      //     return (
      //       toFixedOrder(Big(ssu.price || 0)) +
      //         Price.getUnit() +
      //         '/' +
      //         ssu.ssu_unit_name || '-'
      //     )
      //   },
      // },
      {
        Header: t('下单频次'),
        id: 'sku_order_count',
        minWidth: 100,
        Cell: ({ original: sku }) => {
          return sku.sku_order_count || '-'
        },
      },
    ],
    [],
  )

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

  const handleFrequentSkuAdd = () => {
    const isOpenInvoice =
      +(
        store.order.customer?.settlement?.china_vat_invoice?.invoice_type || 0
      ) & ChinaVatInvoice_InvoiceType.VAT_SPECIAL

    selected.forEach((skuId, index) => {
      const sku = data.find((item) => item.sku_id! === skuId)
      const detail_random_id = isCombineSku(sku)
        ? _.uniqueId(`${Date.now()}`)
        : _.uniqueId(`10${Date.now()}`)
      const data4List = {
        ...(sku || initSsu),
        isNewItem: true,
        quantity: isCombineSku(sku) ? '1' : sku?.minimum_order_number,
        quotationName: store.order.customer?.quotation?.outer_name || '-',
        tax: isOpenInvoice ? sku?.tax : '0',
        detail_random_id,
      }
      if (store.list.length === 1 && !store.list[0].name) {
        setList([data4List])
      } else {
        addRow(store.list.length + index, data4List)
      }
      // 组合商品，把原料添加进列表
      if (isCombineSku(sku!)) {
        // const { ssu_ratios } = sku.ingredients as Ssu_Ingredients
        _.forEach(sku?.ingredientsInfo, (item, count) => {
          // 下单数要根据配比计算，默认返回的是计量单位
          // const ratioInfo = ssu_ratios?.find(
          //   (item2) => item2.ssu_id === item.ssu_id,
          // )
          // 获取原料的数量,包装单位，舍入两位
          // TODO 取整逻辑有调整,先pass
          // const quantity = getQuantity(
          //   getIngredientsQuantity(
          //     ratioInfo?.ratio!,
          //     ratioInfo?.use_unit_id!,
          //     item.unit,
          //     +sku?.minimum_order_number!,
          //   ),
          //   globalStore.orderSetting,
          //   item.unit,
          //   item.unit_type,
          //   false,
          // )
          addRow(store.list.length + +count, {
            ...(item || initSsu),
            isNewItem: true,
            // quantity: quantity || null,
            quotationName: store.order.customer?.quotation?.outer_name || '-',
            tax: isOpenInvoice ? item.tax : '0',
            detail_random_id,
          })
        })
      }
    })
    RightSideModal.hide()
  }

  return (
    <>
      <div style={{ maxHeight: '90%', overflow: 'auto' }}>
        <div className='gm-back-bg gm-padding-tb-10 gm-padding-lr-20'>
          <PrimaryTag className='gm-padding-left-5 gm-text-bold gm-text-14'>
            {t('常购商品列表')}
          </PrimaryTag>
          <div className='gm-margin-top-10'>
            {t('商户')}: {getCustomerNameById(customer?.value!)}
          </div>
        </div>
        <div className=' gm-padding-lr-20'>
          <p className='gm-text-desc' style={{ marginTop: '1em' }}>
            {t('注：仅统计近一个月下单频次最高的前50条商品')}
          </p>
        </div>
        <Table<DetailListItem>
          isVirtualized
          isSelect
          columns={columns}
          isSelectorDisable={(item) =>
            !!list
              .filter((sku) => !sku.parentId)
              .find((sku) => sku.sku_id === item.sku_id)
          }
          data={data.slice()}
          onSelect={(selected) => {
            setSelected(selected)
          }}
          selected={selected}
        />
      </div>
      <Flex justifyCenter className='gm-margin-20' style={{ maxHeight: '10%' }}>
        <Button className='gm-margin-right-10' onClick={RightSideModal.hide}>
          {t('取消')}
        </Button>
        <Button type='primary' onClick={handleFrequentSkuAdd}>
          {t('添加')}
        </Button>
      </Flex>
    </>
  )
}

export default FrequentSsu
