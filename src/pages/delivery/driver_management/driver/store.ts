import { t } from 'gm-i18n'
import { observable, action, makeAutoObservable } from 'mobx'
import {
  ListGroupUser,
  Role_Type,
  ListDistributionContractor,
  DistributionContractor,
  DeleteGroupUser,
} from 'gm_api/src/enterprise'
import type { PagingResult } from 'gm_api/src/common'
import type { GroupUser } from 'gm_api/src/enterprise'

import { DriverListRequestParams } from '../../interface'

class Store {
  search_text = ''
  count = 0
  list: GroupUser[] = []
  distributionContractorList: DistributionContractor[] = []

  handleSearchText = (value: string) => {
    this.search_text = value
  }

  fetchList = (params: DriverListRequestParams) => {
    const req = {
      ...params,
      q: this.search_text,
      role_types: [Role_Type.BUILT_IN_DRIVER],
      need_distribution_contractor: true,
    }
    return ListGroupUser(req).then((json) => {
      if (json.response.paging?.count) {
        this.count = (json.response.paging as PagingResult)?.count as number
      }
      this.list = json.response.group_users as GroupUser[]

      return json.response
    })
  }

  fetchDistributionContractorList = () => {
    const req = Object.assign({ paging: { limit: 999 } }, this.search_text)
    return ListDistributionContractor(req).then((json) => {
      this.distributionContractorList = json.response
        .distribution_contractors as DistributionContractor[]

      return null
    })
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  delDriver(id: string) {
    return DeleteGroupUser({ group_user_id: id })
  }
}

export default new Store()
