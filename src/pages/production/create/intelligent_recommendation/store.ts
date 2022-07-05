import { observable, action, makeAutoObservable } from 'mobx'
import _ from 'lodash'
import moment from 'moment'

import { AlgorithmFilter, RecommendSku, RecommendSkuFilter } from './interface'

const initAlgorithmFilterData = {
  production_object: '', // 生产对象
  query_order_type: 1, // 日均下单数设置
  query_order_days: 0, // 手动填写的最近下单数，query_order_type === 1时使用
  adjust_ratio: 0, // 调整比例
  stock_up_type: 1, // 备货天数类型，1为按手动填写，2为按保质期
  stock_up_days: 0, // 手动填写的备货天数，stock_up_type === 1 时使用
  is_deduct_stock: false, // 是否扣减库存
  product_show_type: 1, // 商品展示设置，1仅展示建议计划生产数大于0的智能推荐商品 2全部
}

const initRecommendSku = {
  form_id: '11111',
  form_name: '土豆',
  category_name_1: '净菜',
  category_name_2: '外卖',
  sku_name: '盒饭',
  form: '23',
  form_unit: '斤',
  finished_goods_inventory: 67,
  suggest_plan_product_inventory_box: 10,
  suggest_plan_product_inventory_base: 290,
}

const initRecommendSkuFilter = {
  plan_finish_time: moment().startOf('day').toDate(),
  plan_wave: '',
  product_object: '',
}

class Store {
  // 算法设置
  algorithmFilter: AlgorithmFilter = {
    ...initAlgorithmFilterData,
  }

  // 运算进度
  loadingProgress = 0

  // 运算loading
  recommendLoading = false

  // 添加商品
  recommendSkuFilter: RecommendSkuFilter = { ...initRecommendSkuFilter }

  recommendSkuList: RecommendSku[] = [{ ...initRecommendSku }]

  selectedRecommendSkus: string[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  changeAlgorithmSetting<T extends keyof AlgorithmFilter>(
    key: T,
    value: AlgorithmFilter[T],
  ) {
    this.algorithmFilter[key] = value
  }

  setLoadingProgress(processSchedule: number) {
    this.loadingProgress = processSchedule
  }

  setRecommendLoading(isStart: boolean) {
    this.recommendLoading = isStart
    // 重置进度
    if (!isStart) {
      this.loadingProgress = 0
    }
  }

  postStartCompute() {
    const reqData = {
      ...this.algorithmFilter,
      is_deduct_stock: _.toNumber(this.algorithmFilter.is_deduct_stock),
    }
    console.log(111, reqData)
  }

  updateRecommendSkuFilter<T extends keyof RecommendSkuFilter>(
    key: T,
    value: RecommendSkuFilter[T],
  ) {
    this.recommendSkuFilter[key] = value
  }

  updateSelectedRecommendSkus(selected: string[]) {
    this.selectedRecommendSkus = selected
  }

  updateRecommendSkuList<T extends keyof RecommendSku>(
    index: number,
    key: T,
    value: RecommendSku[T],
  ) {
    this.recommendSkuList[index][key] = value
  }
}

export default new Store()
