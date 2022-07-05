import {
  GetSkuV2,
  ListBasicPriceV2,
  Quotation_Type,
  Sku,
  Sku_DispatchType,
  Sku_SkuType,
} from 'gm_api/src/merchandise'
import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import { catchUnitsFromBasicPriceV2 } from '@/common/util'

const initSku: Sku = {
  sku_id: '',
  sku_type: Sku_SkuType.COMBINE,
  dispatch_type: Sku_DispatchType.ORDER,
  name: '',
  customize_code: '',
  category_id: '',
  base_unit_id: '',
  loss_ratio: '',
}
class Store {
  skuId = ''
  /** 组合商品详情 */
  sku: Sku = initSku
  /** 组合商品列表 */
  image: { src: string }[] = []
  /** 组成商品map */
  ingredientMap: { [key: string]: Sku } = {}
  /** 基本信息loading */
  introLoading = false
  /** 报价单数量 */
  quotationCount = 0

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /** 更新skuId */

  setSkuId(id: string) {
    this.skuId = id
    this.getQuotationCount()
  }

  /** 获取报价单数量 */
  getQuotationCount() {
    ListBasicPriceV2({
      filter_params: {
        sku_id: this.skuId,
        periodic_time: `${Date.now()}`,
        quotation_types: [Quotation_Type.WITHOUT_TIME, Quotation_Type.PERIODIC],
      },
      paging: {
        limit: 1,
        offset: 0,
        need_count: true,
      },
    }).then((res) => {
      this.quotationCount = Number(res.response.paging.count) || 0
    })
  }

  /** 获取组合商品详情 */
  async getSku(id: string) {
    this.introLoading = true
    this.image = []
    return await GetSkuV2({ sku_id: id })
      .then((json) => {
        const { sku, ingredient_map } = json.response
        this.sku = sku || _.cloneDeep(initSku)
        this.ingredientMap = ingredient_map || {}

        if (sku?.repeated_field?.images?.length) {
          _.forEach(sku.repeated_field.images, (imageItem) => {
            this.image.push({
              src: `https://qncdn.guanmai.cn/${imageItem.path}?imageView2/3/w/150`,
            })
          })
        }
      })
      .finally(() => {
        this.introLoading = false
      })
  }

  clearStore() {
    this.skuId = ''
    this.sku = _.cloneDeep(initSku)
    this.image = []
    this.ingredientMap = {}
    this.introLoading = false
  }
}
export default new Store()
