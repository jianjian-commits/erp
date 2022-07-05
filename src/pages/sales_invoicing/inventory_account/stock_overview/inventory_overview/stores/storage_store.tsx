import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import { SelectDataItem } from '@gm-pc/react'
import {
  ListBatch,
  ListShelf,
  Additional,
  ExpireType,
} from 'gm_api/src/inventory'
import { Sku } from 'gm_api/src/merchandise/types'
import { PagingResult } from 'gm_api/src/common'
import { formatDataToTree } from '@/common/util'

import {
  TableRequestParams,
  SkuUnitMoreSelect,
  BatchExpand,
  SkuInfoExpand,
} from '@/pages/sales_invoicing/interface'
import {
  getSkuUnit,
  getBatchAdditional,
  combineCategoryAndSku,
} from '@/pages/sales_invoicing/util'
import { FilterType } from '../../interface'

interface FtType extends FilterType {
  sku_id: string
  sku_unit_id: string
  remaining: number // 批次
  shelf_ids: string[] // 货位id
  batch_level: number
  warehouse_id?: string
}

const initFilter: FtType = {
  begin_time: moment().startOf('day').add(-29, 'days').toDate(),
  end_time: moment().endOf('day').toDate(),
  q: '',
  sku_id: '',
  sku_unit_id: '0',
  shelf_ids: [],
  remaining: 0,
  with_additional: true,
  batch_level: 2,
  expire_type: ExpireType.EXPIRE_TYPE_UNSPECIFIED,
  // warehouse_id: '',
}
class Store {
  filter: FtType = { ...initFilter }

  list: BatchExpand[] = []

  additional: Additional = {}

  // eslint-disable-next-line gm-react-app/no-observable-empty-object
  sku_info: Partial<Sku> = {}

  shelfList: SelectDataItem[] = []

  unitList: SkuUnitMoreSelect[] = [] // 规格列表

  paging: PagingResult = { count: 0 }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  clean() {
    this.filter = { ...initFilter }
    this.list = []
    this.sku_info = {}
    this.unitList = []
  }

  getSearchData() {
    const { begin_time, end_time, shelf_ids, ...other } = this.filter
    return {
      begin_time: moment(begin_time).format('x'),
      end_time: moment(end_time).format('x'),
      shelf_ids: _.filter(
        shelf_ids,
        (v, index) => index === shelf_ids.length - 1,
      ),
      ...other,
    }
  }

  handleChangeFilter = <T extends keyof FtType>(key: T, value: FtType[T]) => {
    this.filter[key] = value
  }

  getListBatch = (req: TableRequestParams) => {
    const data = Object.assign(this.getSearchData(), { paging: req.paging })
    return ListBatch(data).then((json) => {
      const { batches, paging, additional = {} } = json.response
      this.list = getBatchAdditional(batches, additional!)
      this.additional = additional!
      this.paging = paging!
      return json.response
    })
  }

  getShelf() {
    return ListShelf({ all: true }).then((json) => {
      this.shelfList = formatDataToTree(
        json.response.shelves!,
        'shelf_id',
        'name',
      )
      return json
    })
  }

  // 获取additional中的商品信息
  getSkuList() {
    const { category_map, sku_map } = this.additional
    const skuinfos = combineCategoryAndSku(category_map, sku_map)

    const skuInfo = skuinfos[this.filter.sku_id] as SkuInfoExpand
    skuInfo.ssu_infos = skuInfo.ssu_map!
    this.unitList = getSkuUnit(skuInfo)!
    this.sku_info = skuInfo.sku!
  }
}

export default new Store()
export type { FtType }
