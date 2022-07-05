import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import {
  ListLog,
  ListLogRequest,
  Log,
  LogModelType,
} from 'gm_api/src/logsystem'
import moment from 'moment'

interface Filter {
  log_model_type?: string
  begin_time?: string
  end_time?: string
  log_model_types?: number[]
}

// 需要传log_model_types的日志类型映射
const LogModelTypesMap: { [key: string]: LogModelType[] } = {
  [LogModelType.LOGMODELTYPE_QUOTATION]: [
    LogModelType.LOGMODELTYPE_QUOTATION,
    LogModelType.LOGMODELTYPE_BASICPRICE,
  ],
  [LogModelType.LOGMODELTYPE_ORDER]: [
    LogModelType.LOGMODELTYPE_ORDER,
    LogModelType.LOGMODELTYPE_ORDERDETAIL,
  ],
}

/** 初始化分页数据 */
const initPaging = {
  offset: 0,
  limit: 10,
  need_count: true,
}

/** 初始化筛选数据 */
const initFilter: Filter = {
  log_model_type: '',
  begin_time: moment().startOf('day').add(-29, 'days').valueOf().toString(),
  end_time: moment().endOf('day').valueOf().toString(),
}

class LogStore {
  /** 筛选数据 */
  filter: Filter = _.cloneDeep(initFilter)
  /** 日志列表 */
  list: Log[] = []
  /** 分页数据 */
  paging = _.cloneDeep(initPaging)

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
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
    const filter: Filter = _.cloneDeep(this.filter)
    if (!filter.log_model_type) {
      // 全部类型
      delete filter.log_model_type
    } else if (
      _.keys(LogModelTypesMap).includes(filter.log_model_type.toString())
    ) {
      // 需要传多个log_model_type的日志类型
      filter.log_model_types = LogModelTypesMap[filter.log_model_type]
      delete filter.log_model_type
    }

    const req = {
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
    return ListLog(req as ListLogRequest).then((json) => {
      this.list = json.response.logs
      return json.response
    })
  }

  /** 清空数据 */
  clearStore() {
    this.filter = _.cloneDeep(initFilter)
    this.list = []
    this.paging = _.cloneDeep(initPaging)
  }
}
export default new LogStore()
