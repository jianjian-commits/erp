import React, { FC } from 'react'
import { observable } from 'mobx'
import { Observer } from 'mobx-react'
import _ from 'lodash'
import { Confirm, Flex, RightSideModal, Select, Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'

import {
  wrapDetailList,
  makeIngredientSkuList,
} from '@/pages/order/order_manage/components/detail/util'
import { gmHistory as history } from '@gm-common/router'
import {
  ListBasicPriceByCustomerID,
  Quotation_Status,
  Quotation_Type,
  Sku,
  Sku_SkuType,
} from 'gm_api/src/merchandise'
import {
  FakeType,
  Order,
  OrderRelationInfoResponse,
  Order_Status,
} from 'gm_api/src/order'
import store from '../../store'
import { CopyOrderProps } from '../copy_order'
import { ChinaVatInvoice_InvoiceType } from 'gm_api/src/enterprise'
import {
  DetailListItem,
  OrderInfo,
} from '@/pages/order/order_manage/components/interface'
import globalStore from '@/stores/global'
import Big from 'big.js'

interface Props {
  order: Order
  relation: OrderRelationInfoResponse | undefined
}

const CopyOrderConfirm: FC<Props & CopyOrderProps> = ({
  order,
  children,
  relation,
  customer_id,
  service_period_id,
  ...rest
}) => {
  const Store = observable({
    value: 0,
    setValue(value: number) {
      this.value = value
    },
  })

  async function handleOrderCopy() {
    // store.order.customer.delete_time 删除时间，非 0 表示已删除
    if (
      !_.isNil(store.order.customer) &&
      `${store.order.customer.delete_time}` !== '0'
    ) {
      Tip.danger('客户已删除，无法复制')
      return
    }
    // 这里要区分order含不含组合商品。
    const orderDetails =
      order[
        +order.status! & Order_Status.STATUS_HAS_COMBINE_SSU
          ? 'order_raw_details'
          : 'order_details'
      ]?.order_details || []
    /**
     * order里面去掉了quotation_id，不用它来做索引了直接去quotations里面找type是WITHOUT_TIME的报价单
     */
    const quotationIds =
      relation?.customer_quotation_relation?.[customer_id]?.values || []
    const childQuotationParentId = relation?.parent_child_quotation_id_map || {}
    const quotation = _.find(relation?.quotations, (item) => {
      const isValid = quotationIds.includes(item.quotation_id)
      const isValidType = [
        Quotation_Type.WITHOUT_TIME,
        Quotation_Type.PERIODIC,
      ].includes(item.type)
      return isValid && isValidType
    })
    // 周期报价单子报价单
    const childQuotation = _.get(
      relation?.quotations,
      _.get(childQuotationParentId, quotationIds || ''),
    )
    // 兼容周期报价单
    const quotationId = childQuotation?.quotation_id || quotation?.quotation_id
    const { basic_prices = [], sku_map = {}, ingredient_basic_price = {} } =
      // eslint-disable-next-line promise/no-nesting
      await ListBasicPriceByCustomerID({
        filter_params: {
          // q: value,
          sku_ids: orderDetails.map((v) => v.sku_id!),
          on_sale: 1,
          on_shelf: 1,
          ...(globalStore.isLite
            ? { sku_type: Sku_SkuType.NOT_PACKAGE }
            : {
                quotation_status: Quotation_Status.STATUS_VALID,
                // quotation_id: store.order.quotation_id,
              }),
          // quotation_type: Quotation_Type.WITHOUT_TIME,
          customer_id: customer_id,
        },
        // request_data: ListBasicPriceV2Request_RequestData.QUOTATION,
        paging: { limit: 999 },
      }).then((json) =>
        _.pick(json.response, [
          'basic_prices',
          'sku_map',
          'ingredient_basic_price',
        ]),
      )
    const detailList = wrapDetailList(orderDetails, relation, (v) => {
      // 报价单中的sku信息
      const sku: Sku = sku_map[v.sku_id!]

      let price = ''

      // 税率
      const isOpenInvoice =
        +(
          store.order.customer?.settlement?.china_vat_invoice?.invoice_type || 0
        ) & ChinaVatInvoice_InvoiceType.VAT_SPECIAL

      const ingredientsInfo: DetailListItem[] = []
      let detail_random_id: string = _.uniqueId(`10${Date.now()}`)
      const skuPrices =
        basic_prices.find((basic_price) => basic_price.sku_id === v.sku_id)
          ?.items?.basic_price_items || []

      let units
      if (sku) {
        // 特殊处理组合商品
        if (sku.sku_type === Sku_SkuType.COMBINE) {
          detail_random_id = _.uniqueId(`${Date.now()}`)
          // 获取组合商品下的原料信息
          _.forEach(v.ingredients?.ingredients, (ingredient) => {
            const target = _.find(
              sku_map,
              (sku) => sku.sku_id === ingredient.sku_id,
            )
            const {
              items: { basic_price_items },
            } = ingredient_basic_price[`${target?.sku_id}-${quotationId}`]
            const {
              fee_unit_price: { val, unit_id },
            } = basic_price_items.find(
              ({ order_unit_id }) => order_unit_id === ingredient.order_unit_id,
            )

            const units = basic_price_items!.map((item) => {
              const unitInfo = target?.units?.units?.find(
                (item2) => item2.unit_id === item.order_unit_id,
              )

              const parentUnitName = globalStore.unitList.find(
                (unit) =>
                  unit.value === (unitInfo?.parent_id || item.order_unit_id),
              )?.text

              const name = unitInfo
                ? `${unitInfo.name}(${unitInfo.rate}${parentUnitName})`
                : parentUnitName
              return {
                ...unitInfo,
                value: item.order_unit_id,
                text: name,
                name,
              }
            })
            const detail = order.order_details?.order_details?.find(
              (detail) => detail.sku_id === ingredient.sku_id,
            )
            const ingredientSkuInit = {
              price: Store.value
                ? detail?.order_unit_value_v2?.price?.val
                : val,
              // 子商品的下单数要用组合商品的数量乘以配比
              quantity: Big(ingredient.ratio)
                .times(v.order_unit_value_v2?.quantity?.val || 0)
                .toString(),
              unit_id: ingredient.order_unit_id,
              fee_unit_id: unit_id,
              units,
              unit: units.find(
                (unit) => unit.value === ingredient.order_unit_id,
              ),
              detail_random_id,
            }

            target &&
              ingredientsInfo.push(
                makeIngredientSkuList(
                  target,
                  sku.sku_id!,
                  quotationId || '',
                  quotation,
                  (sku) => Object.assign(sku, ingredientSkuInit),
                ) as any,
              )
          })
        }

        units = skuPrices!.map((item) => {
          const target = sku?.units?.units?.find(
            (item2) => item2.unit_id === item.order_unit_id,
          )

          const parentUnitName = globalStore.unitList.find(
            (unit) => unit.value === (target?.parent_id || item.order_unit_id),
          )?.text

          const name = target
            ? `${target.name}(${target.rate}${parentUnitName})`
            : parentUnitName
          return {
            ...target,
            value: item.order_unit_id,
            text: name,
            name,
          }
        })
        // 如果采用报价单价格
        if (!Store.value) {
          // @ts-ignore
          price =
            basic_prices
              .find((basic_price) => basic_price.sku_id === v.sku_id)
              ?.items?.basic_price_items?.find(
                (item) => item.order_unit_id === v.unit_id,
              )?.fee_unit_price?.val || ''
        }
      }
      return {
        order_detail_id: '0',
        isDelete: !sku,
        basic_price: {
          current_price: !!v?.sku_unit_is_current_price,
        },
        isNewItem: false,
        quotationName: quotation?.outer_name,
        ingredientsInfo: ingredientsInfo,
        tax: isOpenInvoice ? v.tax : '0',
        units,
        feIngredients: v.ingredients,
        ...(price ? { price } : {}),
        detail_random_id,
        // 复制订单不需要复制加单数
        ...(globalStore.isLite
          ? {}
          : {
              add_order_price1: '',
              add_order_price2: '',
              add_order_price3: '',
              add_order_price4: '',
              add_order_value1: {},
              add_order_value2: {},
              add_order_value3: {},
              add_order_value4: {},
              fake_order_price: '',
              fake_outstock_price: '',
              fake_type: FakeType.FAKE_TYPE_TRUE,
              total_add_order_price: '',
              total_add_order_value: {},
            }),
      }
    })
    const deleteList: string[] = []
    const filterList = _.filter(detailList, (v) => {
      if (v.isDelete) {
        deleteList.push(v.name)
      }
      return !v.isDelete
    })
    if (filterList.length) {
      let tempIngredientsCount = 0
      filterList.slice().forEach((detail, index) => {
        if (detail.sku_is_combine_sku && detail?.ingredientsInfo?.length) {
          filterList.splice(
            index + 1 + tempIngredientsCount,
            0,
            ...detail.ingredientsInfo,
          )
          tempIngredientsCount += detail?.ingredientsInfo?.length
        }
      })
      // 如果是详情页点击了复制订单，那么要复用新建订单的组件
      const fromMenuDetail = history.location.pathname.includes('menu_detail')

      if (store.order.view_type !== 'create' || fromMenuDetail) {
        history.push('/order/order_manage/copy')
      }

      if (fromMenuDetail) {
        store.init4Copy(order as OrderInfo)
      }
      store.setList(filterList)
    }
    if (deleteList.length) {
      Tip.danger(deleteList.join(',') + ' 下架或者被删除')
    }
    RightSideModal.hide()
  }
  return (
    <div
      onClick={() => {
        // lite只保留原订单中的单价，去掉confirm
        if (globalStore.isLite) {
          Store.setValue(1)
          handleOrderCopy()
        } else {
          Confirm({
            children: (
              <Observer>
                {() => (
                  <Flex className='gm-margin-lr-20 gm-margin-top-15 gm-margin-bottom-20'>
                    <span
                      className='gm-margin-right-10'
                      style={{ lineHeight: '30px' }}
                    >
                      {t('是否同步复制订单中的商品单价')}
                    </span>
                    <Select
                      value={Store.value}
                      data={[
                        { text: t('是'), value: 1 },
                        { text: t('否'), value: 0 },
                      ]}
                      onChange={(e) => {
                        Store.setValue(e)
                      }}
                    />
                  </Flex>
                )}
              </Observer>
            ),
            title: t('复制订单'),
          }).then(handleOrderCopy)
        }
      }}
    >
      {children}
    </div>
  )
}

export default CopyOrderConfirm
