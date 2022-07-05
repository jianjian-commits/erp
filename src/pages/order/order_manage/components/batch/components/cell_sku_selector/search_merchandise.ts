import _ from 'lodash'
import { handleFetchSkuResponse } from '@/pages/order/order_manage/components/detail/util'
import globalStore from '@/stores/global'
import {
  ListBasicPriceByCustomerID,
  Quotation_Status,
  Sku_SkuType,
} from 'gm_api/src/merchandise'

import { DetailListItem } from '@/pages/order/order_manage/components/interface'
import { devWarn } from '@gm-common/tool'

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

type SkuWithSelectValue = DetailListItem & {
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
 * 根据关键字搜索报价单中的商品
 */
async function search(params: SearchMerchandiseByCustomerID) {
  const { keyword, quotation_id, customer_id } = params

  try {
    // 轻巧版要过滤掉组合商品
    const skuList = await ListBasicPriceByCustomerID({
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
      paging: { limit: 999 },
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
      !globalStore.isLite ? id! : quotation_id,
      skuList,
    )
    return skuWithQuotationsList
  } catch (error) {
    return Promise.reject(error)
  }
}

export default search
