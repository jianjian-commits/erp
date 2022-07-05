import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import {
  ListLog,
  ListLogRequest,
  Log,
  LogModelType,
} from 'gm_api/src/logsystem'
import moment from 'moment'
import { MerchandiseLogConfig } from './config'

interface Filter {
  log_model_type?: LogModelType
  log_model_types?: LogModelType[]
  model_id?: string
  model_id_or_relation_ids?: string[]
  operation_type?: string
  begin_time?: string
  end_time?: string
}

/** 初始化分页数据 */
const initPaging = {
  offset: 0,
  limit: 10,
  need_count: true,
}

/** 初始化筛选数据 */
const initFilter: Filter = {
  operation_type: '',
  begin_time: moment().startOf('day').add(-29, 'days').valueOf().toString(),
  end_time: moment().endOf('day').valueOf().toString(),
}

class LogStore {
  /** 日志类型 */
  type = ''
  /** sku_id 或 quotation_id */
  modelId: string | string[] = ''
  /** 筛选数据 */
  filter: Filter = _.cloneDeep(initFilter)
  /** 日志列表 */
  list: Log[] = []
  /** 分页数据 */
  paging = _.cloneDeep(initPaging)

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /** 更新日志类型和id */
  setPageInfo(type: string, id: string | string[]) {
    this.type = type
    this.modelId = id
  }

  /** 更新筛选数据 */
  setFilter(value?: any) {
    this.filter = value || _.cloneDeep(initFilter)
  }

  /** 获取日志列表 */
  getLogList(params?: any) {
    if (params?.paging) {
      this.paging = params.paging
    }

    const filter = _.cloneDeep(this.filter)

    const { log_model_type, log_model_types } = MerchandiseLogConfig[this.type]
    if (log_model_type) {
      filter.log_model_type = log_model_type
      filter.model_id = this.modelId as string
    } else {
      filter.log_model_types = log_model_types
      filter.model_id_or_relation_ids = this.modelId as string[]
    }

    const req: ListLogRequest = {
      ...filter,
      paging: this.paging,
      sortby: [
        {
          // 时间逆序
          field: 3,
          desc: true,
        },
      ],
    }

    return ListLog(req).then((json) => {
      this.list = json.response.logs
      return json.response
    })
  }

  /** 清空数据 */
  clearStore() {
    this.filter = _.cloneDeep(initFilter)
    this.list = []
    this.paging = _.cloneDeep(initPaging)
    this.modelId = ''
    this.type = ''
  }
}
export default new LogStore()
