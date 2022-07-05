import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import {
  ListDriverDeliveryTask,
  ListDriverDeliveryTaskResponse_DriverDeliveryTask,
} from 'gm_api/src/delivery'
import { PagingParams } from 'gm_api/src/common'
import { DistributionContractor } from 'gm_api/src/enterprise'

interface FilterType {
  begin_time: Date
  end_time: Date
  time_type: number
  search_text: string
}

class Store {
  filter: FilterType = {
    begin_time: moment().startOf('day').toDate(),
    end_time: moment().endOf('day').toDate(),
    time_type: 1,
    search_text: '',
  }

  driver_delivery_tasks: ListDriverDeliveryTaskResponse_DriverDeliveryTask[] =
    []

  // eslint-disable-next-line gm-react-app/no-observable-empty-object
  distribution_contractors: {
    [key: string]: DistributionContractor
  } = {}

  changeFilter = <T extends keyof FilterType>(key: T, value: FilterType[T]) => {
    this.filter[key] = value
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  getParams() {
    const { begin_time, end_time, time_type } = this.filter
    const params =
      time_type === 1
        ? {
            order_time_from_time: `${+begin_time}`,
            order_time_to_time: `${+end_time}`,
          }
        : {
            order_receive_from_time: `${+begin_time}`,
            order_receive_to_time: `${+end_time}`,
          }
    return params
  }

  fetchList = (params: PagingParams) => {
    const req = {
      ...params,
      need_distribution_contractor: true,
      q: this.filter.search_text,
      common_list_order: this.getParams(),
    }
    return ListDriverDeliveryTask(req).then((json) => {
      this.driver_delivery_tasks = json.response.driver_delivery_tasks
      this.distribution_contractors = json.response.distribution_contractors!
      return json.response
    })
  }
}

export default new Store()
export type { FilterType }
