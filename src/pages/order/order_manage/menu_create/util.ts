import { ServicePeriodInfoProps } from '@/common/components/quotation_detail/interface'
import { Order, OrderDetail } from 'gm_api/src/order'
import _ from 'lodash'
import moment from 'moment'
import Big from 'big.js'
import { CustomerWithSelectDataItem, Summary } from './interface'
import {
  getTimestamp,
  isValid,
  toFixed,
  MToDate,
  DuffUtil,
  limitPriceDecimal,
} from '@/common/util'
import { App_Type } from 'gm_api/src/common'
import {
  Ingredients,
  Quotation_Type,
  Sku_SkuType,
} from 'gm_api/src/merchandise'

// 收货时间，
// 优先看有没有记录上一次的收货时间，有就读取餐次天+上次收货的具体时间点
// 否则返回餐次时间
const getReceiveTime = (menu_time: any, recv_time: any) => {
  if (recv_time) {
    return getTimestamp(
      moment(
        moment(menu_time).format('YYYY-MM-DD') +
          ' ' +
          moment(new Date(+recv_time)).format('HH:mm:ss'),
      ).toDate(),
    )
  } else {
    return getTimestamp(menu_time)
  }
}

/** 一个商户一个餐次一张单 */
export const handleMealToOrder = (
  arr: ServicePeriodInfoProps[],
  customers: CustomerWithSelectDataItem[],
) => {
  const res: Order[] = []

  DuffUtil(
    arr,
    (mdi, res) => {
      DuffUtil(customers, (cus) => {
        const dining_count =
          cus?.original?.attrs?.default_dining_count?.dinning_count_map[
            // mdi?.menu_period_group_id
            mdi.details[0].menu_period_group_id!
          ]
        let itemPrice = '0'
        DuffUtil(mdi.details, (de) => {
          // 这里单品的话需要判断当前计价单位，下单是按照包装单位下的

          // 特殊处理后台返回的price='-'
          de.price = _.isFinite(+de.price!) ? de.price : '0'
          //   const price = isCombineSku(de)
          //     ? de?.price
          //     : de.original_ssu?.shipping_fee_unit === Ssu_ShippingFeeUnit.PACKAGE
          //     ? de?.price
          //     : Big(de?.price || 0).times(de?.original_ssu?.unit?.rate || 1)
          const price = de?.price
          itemPrice = toFixed(Big(itemPrice).plus(price || 0))
        })

        const item = {
          ...mdi,
          order_id: '0',
          service_period: { ..._.omit(mdi, ['details']) },
          menu_id: mdi.quotation_id,
          quotation_id: mdi.quotation_id,
          quotation_type: Quotation_Type.WITH_TIME,
          menu_detail_id: mdi.menu_detail_id,
          menu_period_group_id: mdi.menu_period_group_id,
          receive_customer_id: cus?.original?.customer_id,
          bill_customer_id: cus?.original?.customer_id,
          addresses: {
            addresses: [
              {
                ...cus?.original?.attrs?.addresses[0],
                name: cus?.original?.name,
              },
            ],
          },
          // 收货时间默认取上一次的收货时间，没有取餐次设置的收货时间
          // default_receive_time只返回了时间，不包含日期,日期是default_receive_date字段
          receive_time: getReceiveTime(
            moment(mdi?.menu_time).subtract(+mdi?.default_receive_date, 'days'),
            cus?.original?.attrs?.last_menu_period_order_recv_time[
              mdi?.menu_period_group_id
            ] || +MToDate(+mdi.default_receive_time),
          ),
          dining_count: dining_count || '',
          total_price: isValid(dining_count)
            ? toFixed(Big(dining_count).times(itemPrice))
            : '-',
          customer: cus,
          price: itemPrice,
        }
        res && res.push(item)
      })
    },
    res,
  )

  return res
}

export const getParams = (arr: Order[]) => {
  const res: Order[] = []

  _.forEach(arr, (mdi) => {
    const order_raw_details: Record<'order_details', OrderDetail[]> = {
      order_details: [],
    }
    const order_details: Record<'order_details', OrderDetail[]> = {
      order_details: [],
    }
    _.forEach(mdi.details, (de, i) => {
      const { unit_id, fee_unit_id, price, sku_id, sku_type, ingredientsInfo } =
        de
      if (sku_type === Sku_SkuType.COMBINE) {
        const ingredients: Ingredients = { ingredients: [] }
        const detail_random_id = _.uniqueId(`${new Date().valueOf()}`)
        // *子商品放进order_details
        _.forEach(ingredientsInfo, (ig, index) => {
          const { unit_id, fee_unit_id, price, sku_id, ratio } = ig
          const ig_detail = {
            sku_id,
            fee_unit_id,
            unit_id,
            order_detail_id: '0',
            remark: '',
            sort_num: `${order_details.order_details.length + 1}`,
            sku_is_combine_sku: false,
            order_unit_value_v2: {
              quantity: {
                unit_id: unit_id,
                val: '' + (mdi?.dining_count || 0) * ratio,
              },
              price: {
                unit_id: fee_unit_id,
                val: price,
              },
            },
            detail_random_id,
            type: 2,
          }
          ingredients.ingredients!.push({
            on_sale: true,
            on_shelf: false,
            order_unit_id: unit_id,
            ratio: `${ratio}`,
            sku_id: sku_id,
          })
          order_details.order_details.push(ig_detail)
        })
        const detail = {
          sku_id,
          fee_unit_id,
          unit_id,
          order_detail_id: '0',
          remark: '',
          sort_num: `${i + 1}`,
          sku_is_combine_sku: sku_type === Sku_SkuType.COMBINE,
          order_unit_value_v2: {
            quantity: {
              unit_id: unit_id,
              val: '' + mdi?.dining_count,
            },
            price: {
              unit_id: fee_unit_id,
              val: price,
            },
          },
          detail_random_id,
          ingredients,
        }
        order_raw_details.order_details.push({ ...detail, type: 1 })
      } else {
        const { unit_id, fee_unit_id, price, sku_id } = de
        const detail_random_id = _.uniqueId(`10${new Date().valueOf()}`)
        const detail = {
          sku_id,
          fee_unit_id,
          unit_id,
          order_detail_id: '0',
          remark: '',
          sort_num: `${i + 1}`,
          sku_is_combine_sku: false,
          order_unit_value_v2: {
            quantity: {
              unit_id: unit_id,
              val: '' + mdi?.dining_count,
            },
            price: {
              unit_id: fee_unit_id,
              val: price,
            },
          },
          detail_random_id,
        }
        order_raw_details.order_details.push({ ...detail, type: 1 })
        order_details.order_details.push({
          ...detail,
          type: 2,
          sort_num: `${order_details.order_details.length + 1}`,
        })
      }
    })

    const item = {
      order_id: '0',
      menu_time: moment(mdi.menu_time).valueOf(),
      menu_id: mdi.quotation_id,
      quotation_id: mdi.quotation_id,
      quotation_type: Quotation_Type.WITH_TIME,
      menu_detail_id: mdi.menu_detail_id,
      menu_period_group_id: mdi.menu_period_group_id,
      service_period: {
        service_period_id: mdi.service_period_id,
        menu_period_group_id: mdi.menu_period_group_id,
        name: mdi.name,
        type: mdi.type,
        order_create_min_time: mdi.order_create_min_time,
        order_create_max_time: mdi.order_create_max_time,
        order_receive_min_time: mdi.order_receive_min_time,
        order_receive_max_time: mdi.order_receive_max_time,
        order_receive_min_date: mdi.order_receive_min_date,
        order_receive_max_date: mdi.order_receive_max_date,
        default_receive_time: mdi.default_receive_time,
      },
      receive_customer_id: mdi.receive_customer_id,
      bill_customer_id: mdi.bill_customer_id,
      app_type: App_Type.TYPE_STATION,
      addresses: mdi.addresses,
      receive_time: mdi?.receive_time,
      dining_count: mdi?.dining_count,
      order_raw_details,
      order_details,
    }
    if (Number(item.dining_count || 0)) {
      res.push(item)
    }
  })

  return res
}

// 计算菜谱总览
export const getMenuOrderSummary = (orders: Order[]): Summary[] => {
  const summaryMenuTimeList = _.uniq(_.map(orders, (item) => item.menu_time))
  // 所有就餐日期
  const summaryList: Summary[] = []
  _.forEach(summaryMenuTimeList, (item) => {
    const result: Summary = {
      menu_time: item,
      total_price: 0,
      data: [],
    }
    _.forEach(orders, (order) => {
      // orders是待下单列表
      if (item === order.menu_time) {
        result.total_price += +order.total_price || 0
        if (
          // 如果data里没有这个餐次，加进去
          !_.find(
            _.map(result.data, (d) => d.name),
            (name) => name === order.name,
          )
        ) {
          result.data.push({
            name: order.name,
            count: +order.dining_count,
            price: +order.total_price || 0,
          })
        } else {
          _.forEach(result.data, (d, index) => {
            if (d.name === order.name) {
              result.data[index] = {
                name: order.name,
                count: d.count + +order.dining_count,
                price: d.price + (+order.total_price || 0),
              }
            }
          })
        }
      }
    })
    summaryList.push(result)
  })
  return summaryList
}
