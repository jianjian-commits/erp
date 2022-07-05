import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { ProductDetail } from '../sales_invoicing_type'
import { Price } from '@gm-pc/react'
import _ from 'lodash'
import Big from 'big.js'
import {
  getEndlessPrice,
  getFormatTimeForTable,
  toFixedByType,
  toFixedSalesInvoicing,
} from '@/common/util'
import store from '../purchase/stock_out/stores/receipt_store'

interface Data extends ProductDetail {
  [key: string]: any
}

interface Props {
  data: Data
  field: string
  isNotFixedShow?: boolean // 数字不按位数展示
  index?: number
  /** 轻巧版下非编辑状态的入(出)库数、入(出)库价要选择stock.base_unit中的quantity和price */
  isLite?: boolean
}

const TextAreaCell: FC<Props> = observer((props) => {
  const { data, field, isNotFixedShow, isLite } = props
  const {
    // ssu_base_unit_name = '-',
    sku_base_unit_name = '-',
    ssu_unit_name = '-',
    category_name_1 = '-',
    category_name_2 = undefined,
    category_name_3 = undefined,
    // spu_name = ''
    remark = '-',
    target_route_name = '-',
    target_customer_name = '-',
    tax_rate = '-',
    production_time = undefined,
    currStockQuantity = '0',
    categoryName,
    stock,
    category_name,
  } = data

  let showText: string | undefined | null
  const current = {
    [field]:
      !isNotFixedShow &&
      data[field as keyof ProductDetail] &&
      !isNaN(data[field])
        ? toFixedSalesInvoicing(Big(data[field]))
        : data[field],
  }
  switch (field) {
    case 'input_quantity':
      showText = toFixedSalesInvoicing(input?.quantity) + sku_base_unit_name
      break
    case 'category':
      showText =
        categoryName ||
        [category_name_1, category_name_2, category_name_3]
          .filter(Boolean)
          .join('/') ||
        '-'

      break
    case 'categoryV2':
      showText = category_name
      break
    case 'base_quantity':
      // 轻巧版要求展示这个字段
      if (isLite) {
        current.base_quantity = toFixedSalesInvoicing(
          Big(stock.base_unit.quantity),
        )
      }
      showText = _.isNil(current.base_quantity)
        ? '_'
        : current.base_quantity + sku_base_unit_name
      break
    case 'base_price': {
      // 轻巧版要求展示这个字段
      const price = isLite ? stock.base_unit.price : data.tax_input_price
      if (!price) return <span>-</span>
      showText = _.isNil(+price!)
        ? '_'
        : getEndlessPrice(Big(+price!), true) + Price.getUnit()
      break
    }
    case 'ssu_base_price_compatible': {
      const price = data.tax_input_price
      if (!price && !data.no_tax_base_price) return <span>-</span>
      const showPrice = isLite ? stock?.base_unit.price : data.no_tax_base_price
      showText = !_.isNil(showPrice)
        ? getEndlessPrice(Big(+showPrice!), true) + Price.getUnit()
        : '-'
      break
    }
    case 'ssu_base_price_origin': {
      const price = data.input_stock.input?.price
      if (!price) return <span>-</span>
      showText = _.isNil(+price!)
        ? '_'
        : getEndlessPrice(Big(+price!), true) + Price.getUnit()
      break
    }
    case 'different_price':
      showText = _.isNil(current.different_price)
        ? '_'
        : toFixedByType(current.different_price, 'dpInventoryAmount') +
          Price.getUnit() // 补差单独处理
      break
    case 'amount':
      if (!data.tax_amount) return <span>-</span>
      showText = !_.isNil(data.tax_amount)
        ? toFixedByType(+data.tax_amount, 'dpInventoryAmount') + Price.getUnit() // 金额单独处理
        : '-'
      break
    case 'amount_compatible':
      if (!data.tax_amount && !data.no_tax_amount) return <span>-</span>
      showText = !_.isNil(data.no_tax_amount)
        ? toFixedByType(
            +data?.tax_amount! || +data.no_tax_amount,
            'dpInventoryAmount',
          ) + Price.getUnit() // 金额单独处理
        : '-'
      break
    case 'amount_edit': {
      const amount = +data?.no_tax_amount!
      if (!amount) return <span>-</span>
      const tax_amount = _.isNil(amount)
        ? '-'
        : toFixedByType(amount * (tax_rate / 100 + 1), 'dpInventoryAmount') +
          Price.getUnit() // 金额单独处理
      const { index } = props
      if (!_.isNil(amount)) {
        store.changeProductDetailsItem(index as number, {
          amount: _.isNil(amount) ? 0 : amount * (tax_rate / 100 + 1),
        })
      }
      showText = tax_amount
      break
    }
    case 'ssu_quantity':
      showText = _.isNil(current.ssu_quantity)
        ? '_'
        : current.ssu_quantity + ssu_unit_name
      break
    case 'production_time':
      showText = getFormatTimeForTable('YYYY-MM-DD', production_time)
      break
    case 'remark':
      showText = remark
      break
    case 'target_customer_name':
      showText = target_customer_name || target_route_name
      break
    case 'tax_rate':
      if (!data.input_tax || !data.tax_amount) return <span>-</span>
      showText = data.input_tax + '%'
      break
    case 'no_tax_base_price':
      {
        const price = input?.price
        if (!price) return <span>-</span>
        const no_tax_base_price = _.isNil(price)
          ? '_'
          : getEndlessPrice(Big(+price), true) + Price.getUnit()
        showText = no_tax_base_price
      }
      break
    case 'no_tax_base_price_edit': {
      const no_tax_base_price = data.no_tax_base_price
      if (!+no_tax_base_price!) {
        return <span>-</span>
      }
      showText = `${
        getEndlessPrice(Big(+no_tax_base_price!)) + Price.getUnit()
      }`
      break
    }
    case 'ssu_base_price_edit':
      {
        if (!data.no_tax_base_price) {
          return <span>-</span>
        }
        const ssu_base_price = _.isNil(data.no_tax_base_price)
          ? '_'
          : getEndlessPrice(
              Big(+data.no_tax_base_price * (+data.tax_rate / 100 + 1)),
            ) + Price.getUnit()
        const { index } = props
        if (!_.isNil(data.tax_rate)) {
          store.changeProductDetailsItem(index as number, {
            ssu_base_price: +data?.no_tax_base_price! * (+tax_rate / 100 + 1),
          })
        }
        showText = ssu_base_price
      }
      break
    case 'no_tax_amount_copy':
      if (!data.amount) return <span>-</span>
      showText = !_.isNil(data.amount)
        ? toFixedByType(+data.amount, 'dpInventoryAmount') + Price.getUnit() // 金额单独处理
        : '-'
      break
    case 'no_tax_amount': {
      // 后期去掉
      if (!data.no_tax_amount) return <span>-</span>
      showText = !_.isNil(data.no_tax_amount)
        ? toFixedByType(+data.no_tax_amount, 'dpInventoryAmount') +
          Price.getUnit() // 金额单独处理
        : '-'
      break
    }
    case 'no_tax_amount_edit': {
      if (!+data.no_tax_amount!) {
        showText = '-'
        return <span>-</span>
      }
      showText = !_.isNil(data.no_tax_amount)
        ? toFixedByType(+data.no_tax_amount, 'dpInventoryAmount') +
          Price.getUnit()
        : '-'
      break
    }
    case 'tax_money_copy': {
      const tax_money = +Big(+data?.tax_amount || 0)
        .minus(+data?.amount)
        .toFixed(2)
      if (!tax_money || !data.tax_amount) return <span>-</span>
      showText = `${tax_money}`
      break
    }
    case 'tax_money': {
      // if (!data.tax_amount ) return <span>-</span>
      const tax_money = +data?.tax_money!
      if (!tax_money || !data.tax_amount) return <span>-</span>
      showText = `${tax_money}`
      break
    }
    case 'tax_money_edit': {
      const { index } = props
      const amount = +data?.no_tax_amount!
      const tax_money = _.isNil(amount)
        ? 0
        : amount * (tax_rate / 100 + 1) - amount
      // if (!tax_money) return <span>-</span>
      if (!_.isNil(amount)) {
        store.changeProductDetailsItem(index as number, {
          tax_money: _.isNil(amount)
            ? 0
            : +Big(amount * (tax_rate / 100 + 1)).toFixed(2),
        })
      }
      showText = `${Big(tax_money).toFixed(2) + Price.getUnit()}`
      break
    }
    case 'tax_amount': {
      if (!data?.tax_amount) return <span>-</span>
      showText = _.isNil(+data?.tax_amount!)
        ? '-'
        : toFixedByType(+data?.tax_amount!, 'dpInventoryAmount') +
          Price.getUnit()
      break
    }
    case 'ssu_unit_name': {
      if (!ssu_unit_name) return <span>-</span>
      showText = ssu_unit_name
      break
    }
    case 'currStockQuantity': {
      if (!currStockQuantity) return <span>-</span>
      showText = Number(currStockQuantity).toFixed(4) + sku_base_unit_name
      break
    }
    case 'base_price_compatible': {
      const price = data.tax_input_price
      if (!price && !data.no_tax_base_price) return <span>-</span>
      const showPrice = isLite ? stock?.base_unit.price : data.no_tax_base_price
      showText = !_.isNil(showPrice)
        ? getEndlessPrice(Big(+showPrice!), true) +
          Price.getUnit() +
          '/' +
          sku_base_unit_name
        : '-'
      break
    }
    default:
      showText = current[field]?.toString()
      break
  }

  return <span>{showText || '-'}</span>
})

export default TextAreaCell
