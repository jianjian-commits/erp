import { makeAutoObservable } from 'mobx'
import type { ServicePeriod } from 'gm_api/src/enterprise'
import {
  ListServicePeriod,
  CreateServicePeriod,
  UpdateServicePeriod,
  GetServicePeriod,
  DeleteServicePeriod,
} from 'gm_api/src/enterprise'
import { Tip } from '@gm-pc/react'

import { dayMM, isDiffLessOneDayMM, isEqualOneDayMM_1 } from '@/common/util'
import { t } from 'gm-i18n'

const init = {
  name: '运营时间',
  description: '',
  order_create_min_time: '0',
  order_create_max_time: '43200000',
  order_receive_min_time: '43200000',
  order_receive_max_time: '86400000',
  order_receive_min_date: '0',
  order_receive_max_date: '12',
}

class Store {
  list: ServicePeriod[] = []

  servicePeriod: Partial<ServicePeriod> = {
    ...init,
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  get receiveTime() {
    const { order_receive_max_date, order_receive_min_date } =
      this.servicePeriod
    return [{ order_receive_max_date, order_receive_min_date }]
  }

  updatePeriod<T extends keyof ServicePeriod>(key: T, value: ServicePeriod[T]) {
    this.servicePeriod[key] = value
  }

  updateList(list: ServicePeriod[]) {
    this.list = list
  }

  initServicePeriod() {
    this.servicePeriod = { ...init }
  }

  getServicePeriods() {
    return ListServicePeriod({ paging: { limit: 999 } }).then((json) => {
      this.list = json.response.service_periods
      return json.response
    })
  }

  submitServicePeriod() {
    let {
      order_receive_max_time,
      order_receive_min_time,
      order_create_max_time,
      order_create_min_time,
    } = this.servicePeriod
    if (!isDiffLessOneDayMM(order_receive_max_time!, order_receive_min_time!)) {
      order_receive_max_time = `${+order_receive_max_time! - 1}`
    }
    if (!isDiffLessOneDayMM(order_create_max_time!, order_create_min_time!)) {
      order_create_max_time = `${+order_create_max_time! - 1}`
    }
    return {
      ...this.servicePeriod,
      order_receive_max_time,
      order_create_max_time,
    }
  }

  createServicePeriod() {
    const { order_receive_max_time, order_receive_min_time } =
      this.servicePeriod
    if (
      order_receive_max_time === order_receive_min_time ||
      +order_receive_min_time! === +order_receive_max_time! - dayMM
    ) {
      Tip.danger(t('开始和结束时间不能相同'))
      return
    }
    const service_period = this.submitServicePeriod()
    return CreateServicePeriod({
      service_period,
    })
  }

  updateServicePeriod() {
    const {
      order_receive_max_time,
      order_receive_min_time,
      order_create_min_time,
      order_create_max_time,
    } = this.servicePeriod
    if (order_receive_max_time === order_receive_min_time) {
      Tip.danger(t('最早收货时间和最晚收货时间不能相同'))
      return
    }
    if (order_create_max_time === order_create_min_time) {
      Tip.danger(t('下单开始时间和下单结束时间不能相同'))
      return
    }
    const service_period = this.submitServicePeriod()
    return UpdateServicePeriod({
      service_period,
    })
  }

  getServicePeriod(id: string) {
    return GetServicePeriod({ service_period_id: id }).then(
      ({ response: { service_period } }) => {
        let {
          order_create_max_time,
          order_create_min_time,
          order_receive_max_time,
          order_receive_min_time,
        } = service_period
        if (
          isEqualOneDayMM_1(+order_create_max_time - +order_create_min_time)
        ) {
          order_create_max_time = `${+order_create_max_time + 1}`
        }
        if (
          isEqualOneDayMM_1(+order_receive_max_time - +order_receive_min_time)
        ) {
          order_receive_max_time = `${+order_receive_max_time + 1}`
        }
        this.servicePeriod = {
          ...service_period,
          order_create_max_time,
          order_receive_max_time,
        }
        return null
      },
    )
  }

  deleteServicePeriod(id: string) {
    return DeleteServicePeriod({ service_period_id: id }).then(() => {
      this.getServicePeriods()
      return null
    })
  }
}

export default new Store()
