import _ from 'lodash'
import { handleFetchSkuResponse } from '@/pages/order/order_manage/components/detail/util'
import globalStore from '@/stores/global'
import {
  ListBasicPriceByCustomerID,
  ListBasicPriceV2,
  ListSkuV2,
  Quotation_Status,
  Quotation_Type,
  Sku_SkuType,
} from 'gm_api/src/merchandise'
import { getCategoryValue } from '@/pages/merchandise/manage/merchandise_list/create/util'

import store from '../../../store'
import createUnitList, { UnitShape } from './create_unit_list'
import {
  DetailListItem,
  Sku,
} from '@/pages/order/order_manage/components/interface'
import { devWarn } from '@gm-common/tool'
import { Order_Status } from 'gm_api/src/order'

interface SearchMerchandiseByCustomerID {
  /**
   * 搜索关键字
   */
  keyword: string
  /**
   * 报价单 id
   */
  quotation_id: string
  /**
   * 客户 id
   */
  customer_id: string
}

type SkuWithSelectValue = Omit<DetailListItem, 'units'> & {
  /**
   * 单位
   */
  units: UnitShape[]
  /**
   * 实际上是 sku_id。
   * 给 Select 组件使用
   */
  value: string
  /**
   * 实际上是 sku.name
   * 给 Select 组件使用
   */
  text: string
}

export type SkuShape = SkuWithSelectValue & {
  /**
   * 分类名称
   */
  category_name: string
  /**
   * 是否不属于报价单商品
   */
  withoutInQuotations?: boolean
}

/**
 * 搜索客户报价单中的商品
 */
async function searchMerchandiseByCustomerID(
  params: SearchMerchandiseByCustomerID,
) {
  const { customer, quotation_type, menu_time, menu_period_group_id } =
    store.order
  const { keyword, quotation_id, customer_id } = params
  const isMenuOrder = quotation_type === Quotation_Type.WITH_TIME
  try {
    // 轻巧版要过滤掉组合商品
    const skuList =
      isMenuOrder && !globalStore.isLite
        ? await ListBasicPriceV2({
            filter_params: {
              q: keyword,
              menu_time,
              menu_period_group_id,
              quotation_id: quotation_id,
            },
            paging: { limit: 100 },
          })
        : await ListBasicPriceByCustomerID({
            filter_params: {
              q: keyword,
              on_sale: 1,
              on_shelf: 1,
              ...(globalStore.isLite
                ? { sku_type: Sku_SkuType.NOT_PACKAGE }
                : {
                    quotation_status: Quotation_Status.STATUS_VALID,
                    quotation_id,
                  }),
              // quotation_type: Quotation_Type.WITHOUT_TIME,
              customer_id,
            },
            // request_data: ListBasicPriceV2Request_RequestData.QUOTATION,
            paging: { limit: 100 },
          })
    if (_.isEmpty(skuList.response.basic_prices)) {
      return []
    }
    // 如果 quotation_id 是父报价单，那么需要查找出进行中的子报价单
    const id = _.findKey(skuList?.response?.quotation_map, (val) => {
      return val.quotation_id === quotation_id || val.parent_id === quotation_id
    })
    if (!globalStore.isLite && _.isNil(id)) {
      devWarn(() => {
        console.error(
          `报价单 id 所对应报价单不存在。若为周期报价单或许没有进行中的子报价单。`,
        )
      })
      return []
    }
    const skuWithQuotationsList = await handleFetchSkuResponse(
      _.noop,
      !globalStore.isLite ? id! : customer?.quotation?.quotation_id!,
      skuList,
      isMenuOrder,
    )
    return skuWithQuotationsList
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * 搜索商品库商品
 * （只搜索普通商品，不处理组合商品）
 */
async function searchMerchandise(keyword: string) {
  const json = await ListSkuV2({
    filter_params: {
      q: keyword,
      sku_type: Sku_SkuType.NOT_PACKAGE, // 普通商品
      on_sale: 1,
      on_shelf: 1,
    },
    paging: { limit: 100 },
  })
  return json.response.skus
}

/**
 * 搜索商品库中的商品
 */
async function fetchSkuByLibrary(keyword: string, skip = false) {
  try {
    // 避免 skip 是非 boolean 的情况
    if (skip === true) {
      return Promise.resolve([] as SkuShape[])
    }
    const rawSkuList = await searchMerchandise(keyword)
    return Promise.resolve(rawSkuList || [])
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * 根据关键字搜索报价单和商品库中的商品
 * @param keyword 搜索关键字
 * @param skipQueryMerchandiseLibrary 是否跳过商品库搜索
 *
 * 编辑订单时，需要跳过商品库搜索。因为订单中的商品已经在报价单中，所以无需去商品库搜索，那样没有意义。
 */
const search = async (
  keyword: string,
  skipQueryMerchandiseLibrary = false,
  isMenuOrder = false,
) => {
  const { customer } = store.order
  try {
    // 在客户报价单中的商品
    const skuWithQuotationsList = await searchMerchandiseByCustomerID({
      keyword,
      customer_id: customer?.customer_id!,
      quotation_id: customer?.quotation?.quotation_id!,
    })
    // 商品库中搜索到的商品（数据会和 quotedSkuList 中重复）
    const rawSkuList = isMenuOrder
      ? []
      : await fetchSkuByLibrary(keyword, skipQueryMerchandiseLibrary)
    // 过滤重复的商品
    const skuWithoutQuotationsList = _.differenceBy(
      (rawSkuList as DetailListItem[]) || [],
      skuWithQuotationsList as SkuWithSelectValue[],
      'sku_id',
    ).map((item): SkuShape => {
      const category_name = getCategoryValue(
        [],
        [item.category_id as string],
        store.categoryMap,
      ).texts.join('/')

      return {
        ...item,
        withoutInQuotations: true,
        remark: '',
        prices: [],
        price: '',
        unit_id: '',
        fee_unit_id: '',
        category_name,
        units: createUnitList(item),
        value: item.sku_id || '',
        text: item.name || '',
      }
    })
    return Promise.resolve({ skuWithoutQuotationsList, skuWithQuotationsList })
  } catch (error) {
    return Promise.reject(error)
  }
}

export default search
