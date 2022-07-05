import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import {
  GetFinanceCategoryTree,
  GetSkuV2,
  ListSkuV2,
  ListBasicPriceV2,
  ListSkuRequest_RequestData,
  map_Sku_NotPackageSubSkuType,
  map_Sku_PackageCalculateType,
  map_Sku_SupplierCooperateModelType,
  Sku_DispatchType,
  Sku_PackageCalculateType,
  Sku_SkuType,
  Quotation_Type,
  Unit,
  Sku_RelatedCombineSkuIdsMap,
} from 'gm_api/src/merchandise'
import { fetchTreeData } from '@/common/service'
import { formatDataToTree } from '@/common/util'
import { SkuForm } from '@/pages/merchandise/manage/merchandise_list/create/type'
import globalStore from '@/stores/global'
import {
  formatCustomUnits,
  getCascaderValue,
  getCategoryValue,
} from '@/pages/merchandise/manage/merchandise_list/create/util'
import { GetSkuUnitStock, ListShelf } from 'gm_api/src/inventory'
import { ListGroupUser, ListSupplier } from 'gm_api/src/enterprise'
import { ListBom } from 'gm_api/src/production'

const initSkuForm = {
  sku_id: '',
  name: '',
  customize_code: '',
  categories: [],
  category_id: '',
  spu_id: '',
  base_unit_id: '',
  production_num: '1',
  sku_type: Sku_SkuType.NOT_PACKAGE,
  second_base_unit_id: '',
  production_unit_id: '',
  dispatch_type: Sku_DispatchType.ORDER,
  loss_ratio: '0',
  package_calculate_type: Sku_PackageCalculateType.FIXED,
  finance_category: [],
}

class ListStore {
  skuId = ''
  sku: SkuForm = initSkuForm
  /** 标准售价 */
  basic_price = ''
  /** 组合商品id */
  combineIdList: string[] = []
  /** 报价单条数 */
  quotationCount = 0
  /** bom条数 */
  bomCount = 0

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  setBomCount(count: number) {
    this.bomCount = count
  }

  getCombineIdList(map: Sku_RelatedCombineSkuIdsMap) {
    let idList: string[] = []
    _.forEach(map.related_combine_sku_ids_map, (unitItem) => {
      idList = [...idList, ...(unitItem.num || [])]
    })
    this.combineIdList = idList
  }

  getQuotationCount() {
    ListBasicPriceV2({
      filter_params: { sku_id: this.skuId, periodic_time: `${Date.now()}` },
      paging: {
        limit: 1,
        offset: 0,
        need_count: true,
      },
    }).then((res) => {
      this.quotationCount = Number(res.response.paging.count) || 0
    })
  }

  getBomCount() {
    ListBom({
      sku_ids: [this.skuId],
      paging: {
        limit: 1,
        offset: 0,
        need_count: true,
      },
    }).then((res) => {
      this.bomCount = Number(res.response.paging.count) || 0
    })
  }

  /** 获取商品分类 */
  async getCategoryMap() {
    const { categoryMap } = await fetchTreeData()
    return categoryMap
  }

  async getFinanceRate(id: string) {
    // 商品税收
    let financeRate = ''
    await GetFinanceCategoryTree().then(async (json) => {
      const { categories } = json.response
      if (categories) {
        const list = await formatDataToTree(
          categories!,
          'finance_category_id',
          'name',
        )
        const { texts } = getCascaderValue({ texts: [], values: [] }, id, list)
        financeRate = texts.join('/')
      }
    })
    return financeRate
  }

  /** 获取默认供应商 */
  async getSupplier(id: string) {
    let supplierName = ''
    await ListSupplier({ paging: { limit: 999 } }).then((json) => {
      const { suppliers } = json.response
      if (suppliers && suppliers.length) {
        const supplier = _.find(suppliers, (supplierItem) => {
          return supplierItem.supplier_id === id
        })
        if (supplier) {
          supplierName = supplier.name
        }
      }
      return ''
    })
    return supplierName
  }

  /** 获取默认采购员 */
  async getPurchaser(id: string) {
    let purchaserName = ''
    await ListGroupUser({ role_types: [3], paging: { limit: 999 } }).then(
      (json) => {
        const { group_users } = json.response
        if (group_users && group_users.length) {
          const purchaser = _.find(group_users, (userItem) => {
            return userItem.group_user_id === id
          })
          if (purchaser) {
            purchaserName = purchaser.name || ''
          }
        }
      },
    )
    return purchaserName
  }

  /** 获取包材 */
  async getPackage(id: string) {
    let packageName = ''
    await ListSkuV2({
      filter_params: { sku_type: Sku_SkuType.PACKAGE },
      paging: { limit: 999 },
    }).then((json) => {
      const { skus } = json.response
      if (skus && skus.length) {
        const sku = _.find(skus, (skuItem) => {
          return skuItem.sku_id === id
        })
        if (sku) {
          packageName = sku.name
        }
      }
    })
    return packageName
  }

  /** 获取默认货位 */
  async getShelf(id: string) {
    let shelfName = ''
    const req = globalStore.isOpenMultWarehouse
      ? {
          with_warehouse_tree: true,
        }
      : {}
    await ListShelf(req).then(async (json) => {
      const { shelves } = json.response
      if (shelves && shelves.length) {
        const list = await formatDataToTree(shelves, 'shelf_id', 'name')
        const { texts } = getCascaderValue({ texts: [], values: [] }, id, list)
        shelfName = texts ? texts.join('/') : ''
      }
    })
    return shelfName
  }

  // 获取销售库存
  async getStock(sku_id: string, unit_id: string) {
    return GetSkuUnitStock({ sku_id, unit_id }).then((json) => {
      return json.response.sku_unit_stock
    })
  }

  /** 获取商品信息 */
  async getMerchandiseInfo(sku_id: string) {
    this.skuId = sku_id
    this.getQuotationCount()
    this.getBomCount()
    const categoryMap = await this.getCategoryMap()
    if (globalStore.isLite) await this.getBasicPrice(sku_id)
    GetSkuV2({ sku_id }).then(async (json) => {
      const data = json.response.sku
      if (!data) return
      const {
        repeated_field,
        is_weight,
        base_unit_id,
        second_base_unit_id,
        second_base_unit_ratio,
        not_package_sub_sku_type,
        supplier_cooperate_model_type,
        units,
        finance_category_id,
        category_id,
        purchase_unit_id,
        production_unit_id,
        production_unit,
        supplier_id,
        purchaser_id,
        shelf_id,
        package_sku_id,
        package_calculate_type,
        manual_purchase,
        expiry_date,
        package_num,
        tax,
        input_tax,
        loss_ratio,
        cost,
        related_combine_sku_ids_map,
      } = data

      let info: any = {
        ...data,
      }

      if (repeated_field) {
        const { alias, images } = repeated_field

        // 图片
        let image: { src: string }[] = []
        if (images && images.length) {
          image = _.map(images, (imageItem) => {
            return {
              src: `https://qncdn.guanmai.cn/${imageItem.path}?imageView2/3/w/150`,
            }
          })
        }

        // 商品别名
        if (alias) {
          info = {
            ...info,
            alias: alias.join('，'),
            image,
          }
        }
      }

      if (related_combine_sku_ids_map) {
        this.getCombineIdList(related_combine_sku_ids_map)
      }

      // 商品分类
      const { texts } = getCategoryValue([], [category_id || ''], categoryMap)
      const categories =
        texts.length > 1 ? texts.join('/') : texts.length ? texts[0] : ''

      // 基本单位
      const basicUnit = globalStore.getUnit(base_unit_id)
      // 库存单位
      let inventory_unit = basicUnit.name
      // 辅助单位
      const auxiliaryUnit = globalStore.getUnit(second_base_unit_id || '')
      if (auxiliaryUnit) {
        inventory_unit = `${basicUnit.name}、${auxiliaryUnit.name}`
        info = {
          ...info,
          second_base_unit: `${auxiliaryUnit.name}（${second_base_unit_ratio}${basicUnit.name}）`,
        }
      }
      let customUnitList: Unit[] = []
      // 自定义单位
      if (units?.units?.length) {
        const { newCustomFormValue } = formatCustomUnits(units.units)
        customUnitList = units.units
        info = {
          ...info,
          ...newCustomFormValue,
        }
      }

      // 采购单位
      let purchase_unit = ''

      // 获取采购单位
      if (purchase_unit_id !== '0') {
        if (purchase_unit_id === base_unit_id) {
          purchase_unit = basicUnit.text
        } else if (purchase_unit_id === second_base_unit_id) {
          purchase_unit = auxiliaryUnit.text
        } else {
          const purchaseUnit = _.find(customUnitList, (unitItem) => {
            return unitItem.unit_id === purchase_unit_id
          })
          if (purchaseUnit) {
            const { name, parent_id, rate } = purchaseUnit
            const parentUnit = globalStore.getUnit(parent_id)
            purchase_unit = `${name}（${rate}${parentUnit.name}）`
          }
        }
      }

      // 生产单位
      let product_unit = `1${basicUnit.text} = 1${basicUnit.text}`
      if (production_unit_id && production_unit_id !== '0' && production_unit) {
        product_unit = `${production_unit.rate}${production_unit.name} = 1${basicUnit.text}`
      }

      // // 销售库存
      // const { config, virtual_stock } = await this.getStock(
      //   sku_id,
      //   base_unit_id,
      // )
      // const sale_stocks = `${
      //   map_SkuUnitStock_Config[config!]
      // }\u00A0\u00A0\u00A0\u00A0 ${
      //   config === 3
      //     ? `${virtual_stock?.base_unit?.quantity}${basicUnit.name}`
      //     : ''
      // }`

      // 供应商
      let supplier = ''
      if (supplier_id && supplier_id !== '0') {
        supplier = await this.getSupplier(supplier_id)
      }

      // 采购员
      let purchaser = ''
      if (purchaser_id && purchaser_id !== '0') {
        purchaser = await this.getPurchaser(purchaser_id)
      }

      // 默认货位
      let shelf = '未分配'
      if (shelf_id && shelf_id !== '0') {
        shelf = await this.getShelf(shelf_id)
      }

      // 包装材料
      let packageName = ''
      if (package_sku_id && package_sku_id !== '0') {
        packageName = await this.getPackage(package_sku_id)
      }

      // 商品税收分类
      let finance_category = ''
      if (finance_category_id && finance_category_id !== '0') {
        finance_category = await this.getFinanceRate(finance_category_id)
      }

      info = {
        ...info,
        categories,
        not_package_sub_sku_type:
          map_Sku_NotPackageSubSkuType[not_package_sub_sku_type || 0],
        sorting_type: is_weight ? '计重分拣' : '不计重分拣',
        supplier_cooperate_model_type: supplier_cooperate_model_type
          ? map_Sku_SupplierCooperateModelType[supplier_cooperate_model_type]
          : '',
        package_calculate_type: package_calculate_type
          ? map_Sku_PackageCalculateType[package_calculate_type]
          : '',
        package_num:
          package_calculate_type === Sku_PackageCalculateType.BY_ORDER_NUM
            ? 0
            : package_num,
        merchandise_inventory_procurement: manual_purchase ? '开启' : '关闭',
        expiry_date: expiry_date ? `${expiry_date}天` : expiry_date,
        // sale_stocks,
        base_unit: basicUnit.name,
        supplier_id: supplier,
        purchaser_id: purchaser,
        shelf_id: shelf,
        package_sku_id: packageName,
        inventory_unit,
        purchase_unit,
        product_unit,
        finance_category,
        tax: `${tax}%`,
        input_tax: `${input_tax}%`,
        loss_ratio: `${loss_ratio}%`,
        cost: cost && `${cost}元`,
      }
      if (globalStore.isLite)
        info.basic_price = this.basic_price && `${this.basic_price}元`
      this.sku = info
    })
  }

  /** 获取标准售价 */
  getBasicPrice(sku_id: string) {
    const params = {
      paging: { limit: 999 },
      request_data: ListSkuRequest_RequestData.CATEGORY,
      filter_params: {
        sku_id,
        quotation_type: Quotation_Type.WITHOUT_TIME,
      },
    }
    return ListBasicPriceV2(params).then((res) => {
      const { basic_prices = [] } = res.response
      const basic_price =
        basic_prices[0]?.items?.basic_price_items![0]?.fee_unit_price?.val
      this.basic_price = basic_price || ''
      return res
    })
  }

  clearData() {
    this.sku = initSkuForm
    this.skuId = ''
    this.basic_price = ''
    this.combineIdList = []
    this.quotationCount = 0
    this.bomCount = 0
  }
}

export default new ListStore()
