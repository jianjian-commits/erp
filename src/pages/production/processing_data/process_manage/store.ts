import { t } from 'gm-i18n'
import {
  DeleteProcessTemplate, ListProcessTemplate, ListProcessType, ProcessTemplate, ProcessType, ProcessType_Status
} from 'gm_api/src/production'
import { makeAutoObservable } from 'mobx'
import { Filter, TableRequestParams } from './interface'


interface ProcessTypeOptions extends ProcessType {
  value: string
  text: string
}

class Store {
  filter: Filter = {
    process_type_id: '0',
    search_text: '',
  }

  processList: ProcessTemplate[] = []

  processesCount = 0

  processTypeList: ProcessTypeOptions[] = []

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

  getSearchData() {
    const { process_type_id, search_text } = this.filter

    return {
      filter_deleted: true,
      process_type_ids: process_type_id === '0' ? [] : [process_type_id],
      q: search_text,
    }
  }

  getProcessList(params: TableRequestParams) {
    const req = Object.assign(
      { filter_deleted: true, paging: params.paging },
      this.getSearchData(),
    )

    return ListProcessTemplate(req).then((json) => {
      this.processList = json.response.process_templates || []
      this.processesCount = json.response.paging.count || 0
      return json.response
    })
  }

  deleteProcess(id: string) {
    return DeleteProcessTemplate({ process_template_id: id }).then((json) => {
      this.doRequest()
      return json.response
    })
  }

  getProcessTypeList() {
    ListProcessType({ paging: { limit: 999 } }).then((json) => {
      // status 为 1<<8 表示为默认类型，展示为‘未分类’
      this.processTypeList = json.response.process_types!.map((v) => {
        const isDefault = +(v.status || 0) & ProcessType_Status.STATUS_DEFAULT
        return {
          ...v,
          process_type_id: v.process_type_id,
          name: v.name,
          value: v.process_type_id!,
          text: isDefault ? t('未分类') : v.name!,
        }
      })
      return json
    })
  }
}

export default new Store()
