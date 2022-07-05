import { observable, action, makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import Big from 'big.js'
import { MoreSelectDataItem, Price } from '@gm-pc/react'
import { ListInquiryPrice } from 'gm_api/src/purchase'
import globalStore from '@/stores/global'
import { toFixed, parseSsu } from '@/common/util'
import { BasicPrice_Source, ListBasicPrice } from 'gm_api/src/merchandise'

interface F {
  begin: Date
  end: Date
  q: string
  suppliers?: MoreSelectDataItem[]
  source_type: number
  category_ids?: any
}

const initFilter: F = {
  begin: moment().startOf('day').toDate(),
  end: moment().endOf('day').toDate(),
  q: '',
  suppliers: [],
  category_ids: [],
  source_type: 0, // 询价来源
}

class Store {
  filter: F = { ...initFilter }

  list: any[] = []

  summary = {
    count: 0,
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  initFilter() {
    this.filter = { ...initFilter }
  }

  updateFilter<T extends keyof F>(key: T, value: F[T]) {
    this.filter[key] = value
  }

  fetchBasicPrices(params: any) {
    const { q, category_ids, suppliers, begin, end, source_type } = this.filter
    return ListBasicPrice({
      ...params,
      sku_q: q,
      basic_price_end_time: `${+end}`,
      basic_price_start_time: `${+begin}`,
      supplier_ids: suppliers?.map((v) => v.value),
      category_ids: _.concat(
        _.map(category_ids?.category1_ids || [], (v) => v.value),
        _.map(category_ids?.category2_ids || [], (v) => v.value),
      ),
      spu_ids: _.map(category_ids?.pinlei_ids || [], (v) => v.value),
      source: +source_type,
      price_type: 3,
      need_delete_ssu: true,
    }).then((json) => {
      const ssu_info_relation = json.response.ssu_info_relation || {}
      const supplier_relation = json.response.supplier_relation || {}
      const group_user_relation = json.response.group_user_relation || {}
      const quotation_relation = json.response.quotation_relation || {}
      if (params?.paging?.offset === 0) {
        this.summary.count = +(json.response.paging.count || '0')
      }
      this.list = (json.response.basic_prices || []).map((bp) => {
        const { ssu, sku, category_infos } =
          ssu_info_relation[`${bp.sku_id}:${bp.unit_id}`]
        const unit = ssu?.unit
        const rate = unit?.rate || 1
        const quotation = quotation_relation[bp.quotation_id as string]
        const supplier = supplier_relation[quotation.supplier_id as string]
        return {
          ...bp,
          ssu: ssu,
          sku: sku,
          category_name:
            category_infos?.map((cate) => cate.category_name)?.join('/') ||
            '未知',
          spec: unit
            ? rate +
              globalStore.getUnitName(unit?.parent_id as string) +
              '/' +
              unit?.name
            : '-',
          supplier: supplier || null,
          creator: group_user_relation[bp.creator_id as string] || null,
          unit_price: bp.price && unit ? Big(bp.price).toFixed(4) : '-',
          pack_price:
            bp.price && unit ? Big(bp.price).times(unit.rate).toFixed(4) : '-',
        }
      })
      return json.response
    })
  }
}

export default new Store()

export type { F }
