import {
  OrderImportTemplete,
  OrderImportTemplete_TitleCol_TitleCols,
  OrderImportTemplete_Type,
  UploadOrderTempleteResponse_Customer,
  UploadOrderTempleteResponse_ExcelCustomerList,
  UploadOrderTempleteResponse_ExcelOrder,
} from 'gm_api/src/orderlogic'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { DetailListItem } from '../interface'
import { BatchOrder } from './store'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import { isZero } from '@/pages/order/number_utils'

export const isSsuInvalid = (ssu: DetailListItem) => {
  if (ssu.isNewItem) return false
  return (
    !ssu.sku_id || ssu.sku_id === '0' || !ssu.unit_id || ssu.unit_id === '0'
  )
}

export const isSsuListValid = (list: DetailListItem[]) => {
  if (!list.length) return false
  let isValid = true
  for (let i = 0; i < list.length; i++) {
    const ssu = list[i]
    if (isSsuInvalid(ssu)) {
      isValid = false
      break
    }
  }
  return isValid
}

export const getSsuListLength = (list: DetailListItem[]) => {
  const map: { [key: string]: true } = {}
  list
    .filter((v) => v.sku_id && v.sku_id !== '0' && !v.parentId)
    .forEach((v) => {
      map[v.sku_id! + v.unit_id!] = true
    })
  return _.keys(map).length
}

export const checkValidOrder = (order: BatchOrder) => {
  if (!order.info.customer) {
    throw new Error(`无法解析到商户`)
  }
  if (!order.info.service_period) {
    throw new Error('无法匹配到运营时间')
  }

  if (!order.list.length) {
    throw new Error('没有商品数据')
  }
}

export const checkValidSsu = (ssuList: DetailListItem[]) => {
  const list = ssuList.filter(
    (v) => !v.isNewItem || (v.sku_id && v.sku_id !== '0'),
  )
  if (!list.length) {
    throw new Error('没有商品数据')
  }
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    if (
      !item.sku_id ||
      item.sku_id === '0' ||
      !item.unit_id ||
      item.unit_id === '0'
    ) {
      throw new Error('商品解析异常')
    }
    // if (!item.quantity || item.quantity! < (item.minimum_order_number || 0)) {
    if (isZero(item.quantity)) {
      // 是否有套账权限
      const hasFakeOrderPermission =
        !globalStore.isLite &&
        globalStore.hasPermission(
          Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
        )
      if (hasFakeOrderPermission) {
        // 加单数
        const addOrderValue = [
          _.trim(item.add_order_value1?.quantity?.val || '0'),
          _.trim(item.add_order_value2?.quantity?.val || '0'),
          _.trim(item.add_order_value3?.quantity?.val || '0'),
          _.trim(item.add_order_value4?.quantity?.val || '0'),
        ]
        // 判断是否填写加单数量
        const hasAddOrderPrice = addOrderValue.some((item) => {
          const maybeNumber = Number(item)
          return !Number.isNaN(maybeNumber) && maybeNumber > 0
        })
        if (!hasAddOrderPrice) {
          throw new Error(
            `${item.name} 下单数、加单数至少必选任意一项，且不能为 0`,
          )
        }
      } else if (item.quantity! < (item.minimum_order_number || 0)) {
        throw new Error(
          `${item.name} 数量必须大于0，且不小于最小下单数${
            item.minimum_order_number || 0
          }`,
        )
      }
    }
    if (_.isNil(list[i].price)) {
      throw new Error(`${list[i].name} 单价不能为空`)
    }
  }
  return true
}

export const formatExcelCustomers = (
  excelCustomer: UploadOrderTempleteResponse_ExcelCustomerList[],
) => {
  const orders: {
    customer: UploadOrderTempleteResponse_Customer
    excelOrder: UploadOrderTempleteResponse_ExcelOrder
  }[] = []
  excelCustomer.forEach((v) => {
    const list = v.excel_orders || []
    list.forEach((k) => {
      orders.push({
        customer: v.customer!,
        excelOrder: k,
      })
    })
  })
  return orders
}

const getRepeatedCols = (
  titleCols: OrderImportTemplete_TitleCol_TitleCols[],
  startCol: number,
  cycleCol: number,
): [any[], number] => {
  const cols: any[] = []
  const result: any[] = []
  const times = _.times(cycleCol)
  let max = 0
  titleCols.forEach((v) => {
    cols[+v.index!] = v.col_name!
    max = Math.max(+v.index!, max)
  })
  const cycleCols: string[] = []
  for (let i = startCol; i <= max; i++) {
    if (cols[i]) {
      cycleCols.push(cols[i])
    }
  }
  times.forEach((j) => {
    cycleCols.forEach((v, i) => {
      result.push({
        index: startCol + (i + j * cycleCols.length),
        col_name: v,
      })
    })
  })
  return [result, cycleCols.length]
}

export const getExcelData = (template: OrderImportTemplete) => {
  const {
    type,
    start_cycle_col,
    cycle_gap_col,
    customer_row,
    title_col,
    title_row,
  } = template
  const titleTag = 1
  const customerTag = 2
  const titleCols = title_col.title_cols!
  let repeatedCols: any[] = []
  let exportData: string[][] = []
  let dis = 0
  const times = _.times(+cycle_gap_col!)
  const rows = new Array(
    Math.max(Number(title_row), Number(customer_row || 0)),
  ).fill(0)

  rows[Number(title_row) - 1] = titleTag
  if (type === OrderImportTemplete_Type.TYPE_CUSTOMIZE) {
    rows[+customer_row! - 1] = customerTag
    const repeated = getRepeatedCols(
      titleCols,
      +start_cycle_col!,
      +cycle_gap_col!,
    )
    repeatedCols = repeated[0]
    dis = repeated[1]
  }
  exportData = _.map(rows, (v) => {
    const result: string[] = []
    if (v === titleTag) {
      titleCols.forEach((v) => {
        result[+v.index!] = v.col_name!
      })
      if (repeatedCols.length) {
        repeatedCols.forEach((v) => {
          result[+v.index!] = v.col_name!
        })
      }
    }
    if (v === customerTag) {
      times.forEach((i) => {
        const index = i * dis + +start_cycle_col!
        result[index] = t('自定义商户名')
      })
    }
    return result
  })
  return exportData
}
