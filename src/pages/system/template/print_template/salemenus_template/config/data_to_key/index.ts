import _ from 'lodash'

import moment from 'moment'
import {
  getUnitName,
  getSkuSalePrice,
  parseQuotationPeriod,
  getReferencePrices,
  excludeSkuWithoutBaseUnit,
} from './util'
import { Quotation_Type, Sku_SkuType } from 'gm_api/src/merchandise'
import globalStore from '@/stores/global'
import { Price } from '@gm-pc/react'

const MULTI_SUFFIX = '_MULTI_SUFFIX'
/**
 * 生成多栏数据
 * @param skuList 商品列表
 * @param n 一行多少栏
 * @returns {[]}
 */
function generateMultiData(skuList: any, n: any) {
  const multiList = []
  const len = skuList.length

  let index = 0

  while (index < len) {
    let row = {}
    for (let i = 1; i <= n; i++) {
      const skuIndex = i + index - 1
      if (i === 1) {
        row = { ...row, ...skuList[skuIndex] }
      } else if (i === 2) {
        _.each(skuList[skuIndex], (val, key) => {
          row[key + MULTI_SUFFIX] = val
        })
      } else {
        _.each(skuList[skuIndex], (val, key) => {
          row[key + MULTI_SUFFIX + i] = val
        })
      }
    }
    multiList.push(row)

    index += n
  }

  return multiList
}
/**
 * 多栏数据纵向排列
 * @param {[]} skuList  一节分类的数据
 * @param {n} n 一行多少栏
 * @returns {[]}
 */
function generateMultiDataVer(skuList: any, n: any) {
  const multiList = []
  const len = skuList.length
  let index = 0
  // 总行数 向上取整
  const rowLen = Math.ceil(len / n)

  while (index < rowLen) {
    let row = {}
    for (let i = 0; i < n; i++) {
      const skuIndex = index + rowLen * i
      if (i === 0) {
        row = { ...row, ...skuList[skuIndex] }
      } else if (i === 1) {
        _.each(skuList[skuIndex], (val, key) => {
          row[key + MULTI_SUFFIX] = val
        })
      } else {
        _.each(skuList[skuIndex], (val, key) => {
          row[key + MULTI_SUFFIX + (i + 1)] = val
        })
      }
    }
    multiList.push(row)
    index++
  }

  return multiList
}

// 非表格数据
function generateCommon(data: any) {
  const { sku_map, customer_id_map, quotation_map, shareUrl } = data
  const { start_time, end_time, type } =
    quotation_map[Object.keys(quotation_map)[0]] || {}
  return {
    当前时间: moment().format('YYYY-MM-DD HH:mm:ss'),
    当前时间_日期: moment().format('YYYY-MM-DD'),
    当前时间_时间: moment().format('HH:mm:ss'),
    商品数: Object.keys(sku_map).length,
    定价周期:
      type === Quotation_Type.PERIODIC
        ? parseQuotationPeriod(Number(start_time), Number(end_time))
        : '-',
    订货电话: data.phone,
    商户数: customer_id_map[Object.keys(customer_id_map)?.[0]]?.num.length || 0,
    qrcode: shareUrl,
  }
}

const generateMultiTable = (tableData: any, colNumber: number) => {
  return tableData.reduce(
    (res, skuList) => [
      ...res,
      { _special: { text: skuList[0]['商品分类'] || '未找到分类' } },
      ...generateMultiData(skuList, colNumber),
    ],
    [],
  )
}

const generateMultiTableVer = (
  tableData: any,
  colNumber: number,
  sortType = 'lateral',
) => {
  return tableData.reduce(
    (res, skuList) => [
      ...res,
      { _special: { text: skuList[0]['商品分类'] || '未找到分类' } },
      ...generateMultiDataVer(skuList, colNumber, sortType),
    ],
    [],
  )
}

const tableDataToKey = (data: any) => {
  const { category_map, basic_prices, sku_map, reference_price_map } = data

  return _.map(
    _.groupBy(
      _.filter(sku_map, (s) => s.sku_type !== Sku_SkuType.COMBINE),
      (sku) => sku.category_id,
    ),
    (list) => {
      return list.map((sku, index) => {
        const basic_price = _.find(
          basic_prices,
          (bp) => bp.sku_id === sku.sku_id,
        )
        return {
          序号: ++index,
          商品名称: sku.name,
          商品分类:
            _.find(category_map, (c) => c.category_id === sku.category_id)
              ?.name || '',
          商品单价: getSkuSalePrice(sku.sku_id, basic_price, sku.units.units),
          定价单位: getUnitName('feeUnit', basic_price, sku.units.units),
          描述: sku.desc || '-',
          下单单位: getUnitName('orderUnit', basic_price, sku.units.units),
          最近报价: getReferencePrices(
            sku.sku_id,
            basic_price,
            sku.units.units,
            reference_price_map,
          ),
        }
      })
    },
  )
}

const tableDataToKey_Ig = (data: any, type: 'withIg' | 'withoutIg') => {
  const { category_map, basic_prices, sku_map, ingredient_basic_price } = data
  const ingredientsDetail = {}
  const combineDetail = _.map(
    _.filter(sku_map, (s) => s.sku_type === Sku_SkuType.COMBINE),
    (sku, index) => {
      const basic_price =
        _.find(basic_prices, (bp) => bp.sku_id === sku.sku_id) || []
      ingredientsDetail[sku.sku_id] = _.map(
        _.filter(sku.ingredients.ingredients, (ig) =>
          Object.keys(sku_map).includes(ig.sku_id),
        ),
        (i) => {
          const sku_i = _.find(sku_map, (sku_t) => sku_t.sku_id === i.sku_id)
          const basic_price_i =
            _.find(
              ingredient_basic_price,
              (bp) => bp.sku_id === sku_i.sku_id,
            ) || []

          const basicPriceItem = basic_price_i.items.basic_price_items.find(
            (b) => b.order_unit_id === i.order_unit_id,
          )
          return {
            // 序号: ++index,
            商品名称: sku_i.name,
            商品分类:
              _.find(category_map, (c) => c.category_id === sku_i.category_id)
                ?.name || '',
            // 商品单价: getSkuSalePrice(
            //   sku_i.sku_id,
            //   basic_price_i,
            //   sku_i.units.units,
            // ),
            商品单价:
              basicPriceItem.fee_unit_price.val +
                Price.getUnit() +
                '/' +
                globalStore.getUnitName(
                  basicPriceItem.fee_unit_price.unit_id,
                ) ||
              _.find(
                sku_i.units.units,
                (unit) =>
                  unit.unit_id === basicPriceItem.fee_unit_price.unit_id,
              )?.name ||
              '',
            // 定价单位: getUnitName('feeUnit', basic_price_i, sku_i.units.units),
            定价单位:
              globalStore.getUnitName(basicPriceItem.fee_unit_price.unit_id) ||
              _.find(
                sku_i.units.units,
                (unit) =>
                  unit.unit_id === basicPriceItem.fee_unit_price.unit_id,
              )?.name ||
              '',
            描述: sku_i.desc || '-',
            // 下单单位: getUnitName(
            //   'orderUnit',
            //   basic_price_i,
            //   sku_i.units.units,
            // ),
            下单单位:
              globalStore.getUnitName(i.order_unit_id) ||
              _.find(
                sku_i.units.units,
                (unit) => unit.unit_id === i.order_unit_id,
              )?.name ||
              '',
            下单数量:
              i.ratio + globalStore.getUnitName(i.order_unit_id) ||
              _.find(
                sku_i.units.units,
                (unit) => unit.unit_id === i.order_unit_id,
              )?.name ||
              '',
          }
        },
      )

      return {
        序号: ++index,
        商品名称: sku.name,
        商品分类:
          _.find(category_map, (c) => c.category_id === sku.category_id)
            ?.name || '',
        商品单价: getSkuSalePrice(sku.sku_id, basic_price, sku.units.units),
        定价单位: getUnitName('feeUnit', basic_price, sku.units.units),
        描述: sku.desc || '-',
        下单单位: getUnitName('orderUnit', basic_price, sku.units.units),
        下单数量: '-',
        sku_id_temp: sku.sku_id,
      }
    },
  )

  if (type === 'withIg') {
    _.forEach(ingredientsDetail, (i, combineId) => {
      combineDetail.splice(
        _.findIndex(combineDetail, (c) => c.sku_id_temp === combineId) + 1,
        0,
        ...i,
      )
    })
  }

  return combineDetail
}

const formatData = (data: any, config: any, isEditTemplate = false) => {
  if (!isEditTemplate && config.printBaseUnitSkuOnly) {
    data.sku_map = excludeSkuWithoutBaseUnit(
      data.sku_map,
      data.basic_prices,
      data.ingredient_basic_price,
    )
    data.basic_prices = data.basic_prices.map((bp) => {
      const items = {
        basic_price_items: bp.items.basic_price_items.filter(
          (i) =>
            i.fee_unit_price.unit_id === data?.sku_map[bp.sku_id]?.base_unit_id,
        ),
      }
      return { ...bp, items }
    })
  }
  const tableData = tableDataToKey(data)
  const combineTableData_withIg = tableDataToKey_Ig(data, 'withIg')
  const combineTableData_withoutIg = tableDataToKey_Ig(data, 'withoutIg')

  const result = {
    common: {
      ...generateCommon(data),
    },
    _table: {
      orders: generateMultiTable(tableData, 1),
      orders_multi: generateMultiTable(tableData, 2),
      orders_multi3: generateMultiTable(tableData, 3),
      orders_multi4: generateMultiTable(tableData, 4),
      orders_multi5: generateMultiTable(tableData, 5),
      orders_multi_vertical: generateMultiTableVer(tableData, 2),
      orders_multi3_vertical: generateMultiTableVer(tableData, 3),
      orders_multi4_vertical: generateMultiTableVer(tableData, 4),
      orders_multi5_vertical: generateMultiTableVer(tableData, 5),
      combine_withIg: combineTableData_withIg,
      combine_withoutIg: combineTableData_withoutIg,
    },
    _origin: data,
  }
  return result
}

export default formatData
