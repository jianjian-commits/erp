import { makeAutoObservable } from 'mobx'
import {
  BasicPrice,
  GetSkuReferencePrices,
  GetSkuReferencePricesResponse_ReferencePrices,
  ListBasicPriceV2,
  ListSkuV2,
  ListSkuV2Request,
  Quotation,
  Quotation_Type,
  Sku,
  Sku_SkuType,
} from 'gm_api/src/merchandise'

export enum SubView {
  /** 历史采购价 */
  Purchase = 'purchase',
  /** 历史入库价 */
  StockIn = 'stock in',
  /** 历史周期报价 */
  Period = 'period',
  /** 历史报价（周期报价单） */
  Reference = 'reference',
  /** 历史报价 (普通报价单) */
  Reference2 = 'reference2',
}

class CombineStore {
  /** 组合商品列表 */
  list: BasicPrice[] = []

  /** 为空视图不出现 */
  view?: SubView

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /** 获取组合商品列表 */
  getCombineList(quotation: Quotation) {
    if (!quotation?.quotation_id) return
    const req: ListSkuV2Request = {
      filter_params: {
        quotation_id: quotation.quotation_id,
        sku_type: Sku_SkuType.COMBINE,
      },
      paging: { limit: 999 },
    }
    return ListBasicPriceV2(req).then(async (json) => {
      this.list = json.response.basic_prices || []

      return json.response
    })
  }
}
export default new CombineStore()
