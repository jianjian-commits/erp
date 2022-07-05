import { t } from 'gm-i18n'
import { observable, action, makeAutoObservable } from 'mobx'
import { Tip } from '@gm-pc/react'
import {
  ListDistributionContractor,
  CreateDistributionContractor,
  DeleteDistributionContractor,
  UpdateDistributionContractor,
} from 'gm_api/src/enterprise'
import _ from 'lodash'
import type { PagingResult } from 'gm_api/src/common'

import {
  DriverListRequestParams,
  DistributionContractorInfo,
} from '../../interface'

class Store {
  search_text = ''
  count = 0
  list: DistributionContractorInfo[] = []

  distributionContractorName = ''

  handleSearchText = (value: string) => {
    this.search_text = value
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  handleDistributionContractorName(value: string) {
    this.distributionContractorName = value
  }

  handleChangeDistributionContractor<
    T extends keyof DistributionContractorInfo
  >(index: number, key: T, value: DistributionContractorInfo[T]) {
    this.list[index][key] = value
  }

  fetchList = (params: DriverListRequestParams) => {
    const req = Object.assign(
      { paging: params.paging },
      { q: this.search_text },
    )
    return ListDistributionContractor(req).then((json) => {
      if (json.response.paging?.count) {
        this.count = (json.response.paging as PagingResult)?.count as number
      }
      this.list = _.map(json.response.distribution_contractors, (item) => {
        return {
          ...item,
          isEditing: false,
        }
      })
      return json.response
    })
  }

  createDistributionContractor() {
    return CreateDistributionContractor({
      distribution_contractor: { name: this.distributionContractorName },
    }).then(() => {
      this.distributionContractorName = ''
      return null
    })
  }

  delDistributionContractor(id: string) {
    return DeleteDistributionContractor({
      distribution_contractor_id: id,
    })
  }

  updateDistributionContractor(index: number) {
    return UpdateDistributionContractor({
      distribution_contractor: this.list[index],
    })
  }
}

export default new Store()
