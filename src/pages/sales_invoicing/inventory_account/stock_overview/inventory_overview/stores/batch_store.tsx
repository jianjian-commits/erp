import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import { ListBatchLog } from 'gm_api/src/inventory'
import { BatchLog } from 'gm_api/src/inventory/types'
import { GetManySkuResponse_SkuInfo } from 'gm_api/src/merchandise/types'

import { TableRequestParams } from '@/pages/sales_invoicing/interface'
import {
  getBatchLogAdditional,
  combineCategoryAndSku,
} from '@/pages/sales_invoicing/util'
import { FilterType } from '../../interface'

interface FtType extends Omit<FilterType, 'sku_id' | 'sku_unit_id' | 'q'> {
  batch_id: string
}

class Store {
  filter: FtType = {
    begin_time: moment().startOf('day').add(-29, 'days').toDate(),
    end_time: moment().endOf('day').toDate(),
    batch_id: '',
    with_additional: true,
  }

  list: BatchLog[] = []

  headDetail = {
    sku_name: '',
    batch_serial_no: '',
  }

  // eslint-disable-next-line gm-react-app/no-observable-empty-object
  sku_infos: Partial<GetManySkuResponse_SkuInfo> = {}

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  clean() {
    this.list = []
    this.headDetail = {
      sku_name: '',
      batch_serial_no: '',
    }
  }

  handleChangeFilter = <T extends keyof FtType>(key: T, value: FtType[T]) => {
    this.filter[key] = value
  }

  getSearchData() {
    const { begin_time, end_time, ...other } = this.filter
    return {
      begin_time: moment(begin_time).format('x'),
      end_time: moment(end_time).format('x'),
      ...other,
    }
  }

  fetchBatchLog(req: TableRequestParams) {
    const data = Object.assign(this.getSearchData(), { paging: req.paging })
    return ListBatchLog(data).then((json) => {
      const { batch_logs, additional } = json.response
      const { category_map, sku_map, batches } = additional!
      const skuinfos = combineCategoryAndSku(category_map, sku_map)
      this.list = getBatchLogAdditional(batch_logs, additional!)
      this.headDetail = {
        sku_name: skuinfos![_.keys(skuinfos)[0]]?.sku?.name!,
        batch_serial_no: batches![_.keys(batches)[0]]?.batch_serial_no!,
      }
      return json.response
    })
  }
}

export default new Store()
export type { FtType }
