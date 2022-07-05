import { getCustomizedCode } from '@/common/util'
import globalStore from '@/stores/global'
import {
  CreateSkuV2,
  CreateSkuV2Request,
  Sku_DispatchType,
  Sku_PackageCalculateType,
  Sku_SkuType,
} from 'gm_api/src/merchandise'
import _ from 'lodash'

export interface CreateSkuParams {
  /**
   * 商品名称
   */
  name: string
  /**
   * 分类
   */
  categories: string
  /**
   * 基本单位
   */
  unitId: string
}

/**
 * 创建商品编码
 */
function createCustomizeCode(skuName: string) {
  return `${getCustomizedCode(skuName)}${Math.floor(Math.random() * 10000)}`
}

function getUnitInfo(unitId: string) {
  let result = {
    inventory_unit: '',
    production_unit_id: '',
    product_basic_unit: '',
    purchase_unit_id: '',
    second_base_unit: '',
    custom_unit_1: '',
    custom_unit_2: '',
    custom_unit_3: '',
  }
  const basicUnitItem = globalStore.getUnit(unitId)
  if (basicUnitItem) {
    result = {
      inventory_unit: basicUnitItem.text,
      production_unit_id: basicUnitItem.value,
      product_basic_unit: `1${basicUnitItem.text}`,
      purchase_unit_id: basicUnitItem.value,
      second_base_unit: '',
      custom_unit_1: '',
      custom_unit_2: '',
      custom_unit_3: '',
    }
  }
  return result
}

export default function createSku(params: CreateSkuParams) {
  const { unitId, categories } = params
  const name = params.name.trim()
  const customizeCode = createCustomizeCode(name)
  const unitInfo = getUnitInfo(unitId)
  const postData: CreateSkuV2Request = {
    sku: {
      sku_id: '0',
      name,
      dispatch_type: Sku_DispatchType.ORDER,
      sku_type: Sku_SkuType.NOT_PACKAGE,
      category_id: _.nth(categories, -1),
      customize_code: customizeCode,
      loss_ratio: '0',
      // 销售状态
      on_sale: true,
      // 商品类型：原料
      not_package_sub_sku_type: 1,
      // 分拣类型：计重分拣
      is_weight: true,
      base_unit_id: unitId,
      ...unitInfo,
      // 包材信息
      package_calculate_type: Sku_PackageCalculateType.FIXED,
      package_num: 1,

      production_unit: {
        unit_id: unitId,
        rate: '1',
        parent_id: unitId,
        name: unitInfo.inventory_unit || '',
      },
    },
  }

  if (globalStore.isLite) {
    postData.basic_prices = [
      {
        basic_price_id: '',
        items: {
          basic_price_items: [
            {
              on_shelf: true,
              order_unit_id: unitId,
              fee_unit_price: {
                unit_id: unitId,
              },
            },
          ],
        },
        sku_id: '0',
      },
    ]
  }

  return CreateSkuV2(postData)
}
