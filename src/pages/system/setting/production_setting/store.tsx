import globalStore from '@/stores/global'
import {
  ProductionSettings,
  ProductionSettings_CookYieldSetting,
  UpdateProductionSettings,
} from 'gm_api/src/preference'
import { makeAutoObservable } from 'mobx'
import { ProcessData } from './interface'

// 默认日均下单数设置 5天，调整比例 80%，备货天数 5天
const initProcessData = {
  production_setting: 1, // 计划生产数默认设置
  pack_setting: 1, // 计划包装数默认设置
  is_algorithm_open: 1, // 是否启用算法， 0为不启用
  avg_order_amount_setting: 1, // 日均下单数设置
  avg_order_days: 5, // 日均下单数手工填写的天数，用来计算商品
  adjust_ratio: 80, // 调整比例
  stock_up_type: 1, // 备货天数类型，1为按手动填写，2为按保质期
  stock_up_days: 5, // 手动填写的备
  is_deduct_stock: false, // 是否扣减库存
  is_default_output_open: false,
  input_material_type: false,
  cook_yield_setting:
    ProductionSettings_CookYieldSetting.COOKYIELDSETTING_CLEANFOOD_COOKED_BOM_OFF,
  is_default_material_replace_open: false, // 默认关闭开启
  material_regular: 0, // 默认关闭
}

class Store {
  productionConfig: ProcessData = {
    ...initProcessData,
  }

  productionSetting: ProductionSettings = {
    ...globalStore.productionSetting,
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  init(setting: ProductionSettings) {
    this.productionSetting = setting
  }

  updateProcessData<T extends keyof ProcessData>(
    key: T,
    value: ProcessData[T],
  ) {
    this.productionConfig[key] = value
  }

  updateProductionSetting<T extends keyof ProductionSettings>(
    key: T,
    value: ProductionSettings[T],
  ) {
    this.productionSetting[key] = value
  }

  updateSetting() {
    return UpdateProductionSettings({
      production_settings: { ...this.productionSetting },
    }).then((json) => {
      localStorage.setItem(
        'gmProductionSetting',
        JSON.stringify(json.response.production_settings),
      )
      return json
    })
  }
}

export default new Store()
