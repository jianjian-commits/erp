import { handleFetchSkuResponse } from '@/pages/order/order_manage/components/detail/util'
import { devWarn } from '@gm-common/tool'
import { Filters_Bool } from 'gm_api/src/common'
import {
  ListBasicPriceByCustomerID,
  Quotation_Status,
  Sku_SkuType,
} from 'gm_api/src/merchandise'
import _ from 'lodash'
import { DetailListItem } from '@/pages/order/order_manage/components/interface'

interface SearchParams {
  keyword: string
  /** 报价单 id */
  quotationId: string
  /** 客户 id */
  customerId: string
}

async function searchSku(params: SearchParams): Promise<DetailListItem[]> {
  const { keyword, quotationId, customerId } = params
  try {
    const json = await ListBasicPriceByCustomerID({
      filter_params: {
        q: keyword,
        on_sale: Filters_Bool.TRUE,
        on_shelf: Filters_Bool.TRUE,
        sku_type: Sku_SkuType.NOT_PACKAGE,
        quotation_status: Quotation_Status.STATUS_VALID,
        quotation_id: quotationId,
        customer_id: customerId,
      },
      paging: { limit: 999 },
    })
    if (_.isEmpty(json?.response?.basic_prices)) {
      return []
    }
    // 如果 quotation_id 是父报价单，那么需要查找出进行中的子报价单
    const id = _.findKey(json?.response?.quotation_map, (val) => {
      return val.quotation_id === quotationId || val.parent_id === quotationId
    })
    if (_.isNil(id)) {
      devWarn(() => {
        console.error(
          `报价单 id 所对应报价单不存在。若为周期报价单或许没有进行中的子报价单。`,
        )
      })
      return []
    }
    const skuWithQuotationsList = await handleFetchSkuResponse(_.noop, id, json)
    return skuWithQuotationsList
  } catch (e) {
    return Promise.reject(e)
  }
}

export default searchSku
