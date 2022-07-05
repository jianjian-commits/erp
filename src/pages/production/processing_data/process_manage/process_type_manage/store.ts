import { makeAutoObservable } from 'mobx'
import {
  ListProcessType,
  CreateProcessType,
  DeleteProcessType,
  Status_Code,
  ProcessType,
  ProcessType_Status,
} from 'gm_api/src/production'
import { Tip } from '@gm-pc/react'
import _ from 'lodash'

import { TableRequestParams } from '../interface'

interface Filter {
  search_text: string
}

class ProcessTypeStore {
  filter: Filter = {
    search_text: '',
  }

  processTypeList: ProcessType[] = []

  processTypeCount: number = 0

  doRequest = () => {}

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  setDoRequest(func: () => void) {
    this.doRequest = func
  }

  updateFilter<T extends keyof Filter>(key: T, value: Filter[T]) {
    this.filter[key] = value
  }

  getProcessTypeList(params: TableRequestParams) {
    const req = Object.assign(
      { paging: params.paging },
      { q: this.filter.search_text },
    )
    return ListProcessType(req).then((json) => {
      this.processTypeList = _.filter(
        json.response.process_types || [],
        (p) => !(+(p.status || 0) & ProcessType_Status.STATUS_DEFAULT),
      )
      this.processTypeCount = json.response.paging.count || 0
      return json.response
    })
  }

  createProcessType(name: string) {
    return CreateProcessType(
      {
        process_type: { name },
      },
      [Status_Code.DUPLICATE_NAME],
    ).then((json) => {
      if (json.code === Status_Code.DUPLICATE_NAME) {
        Tip.danger('该工序类型名称已存在!')
        return null
      }
      return json
    })
  }

  deleteProcessType(id: string) {
    return DeleteProcessType({ process_type_id: id }).then((json) => {
      return json
    })
  }
}

export default new ProcessTypeStore()
