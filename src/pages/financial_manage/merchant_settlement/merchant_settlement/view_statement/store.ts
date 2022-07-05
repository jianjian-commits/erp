import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import {
  FilterOptions,
  ListOptions,
  levelList,
  SettlementStatusKey,
} from './interface'
import { t } from 'gm-i18n'
import { getTimestamp } from '@/common/util'
import { Role_Type, ListGroupUser, CreditType } from 'gm_api/src/enterprise'
import {
  ListSettleSheet,
  ExportSettleSheet,
  AccountType,
  TimeType,
  SettleSheet_SheetStatus,
  BatchSubmitSettleSheet,
  ExportMerchantSettlement,
} from 'gm_api/src/finance'
import { PagingResult } from 'gm_api/src/common'
import _store from '../detail/store'
import globalStore from '@/stores/global'

class Store {
  filter: FilterOptions = {
    begin_time: moment().startOf('day').toDate(),
    end_time: moment().endOf('day').toDate(),
    time_type: 1,
    search_text: '',
    credit_type: CreditType.CREDIT_TYPE_UNSPECIFIED,
    status: SettleSheet_SheetStatus.SHEET_STATUS_UNSPECIFIED,
    target_id: '',
    customers: {},
  }

  list: ListOptions[] = []

  paging: PagingResult = { count: 0 }

  activeType: SettlementStatusKey = 'ALL'

  cityList = [{ text: t('深圳'), value: '1' }] // 城市
  driverList: levelList[] = [] // 司机

  // 到账凭证号
  voucherNumberList = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  doRequest = () => {}

  setDoRequest(func: () => void) {
    this.doRequest = func
  }

  changeActiveType(type: SettlementStatusKey) {
    this.activeType = type
  }

  updateFilter<T extends keyof FilterOptions>(key: T, value: FilterOptions[T]) {
    this.filter[key] = value
  }

  getSearchData() {
    const { credit_type, begin_time, end_time, status, customers } = this.filter
    return {
      time_type: TimeType.TIME_TYPE_CREATE_TIME,
      begin_time: getTimestamp(begin_time)!,
      end_time: getTimestamp(end_time)!,
      sheet_status: status === 0 ? [] : [status!],
      account_type: AccountType.ACCOUNT_TYPE_CUSTOMER,
      credit_type: credit_type || undefined,
      target_id: customers ? customers?.value! : undefined,
    }
  }

  // 对账单列表
  fetchList(params?: any) {
    const req = {
      paging: params.paging,
      ...this.getSearchData(),
    }
    return ListSettleSheet(req).then((json) => {
      const { relation_customer_info } = json.response
      this.list = _.map(json.response.settle_sheets, (item) => {
        return {
          ...item,
          company: relation_customer_info![item.target_id!]?.name!,
          company_type: relation_customer_info![item.target_id!]?.type!,
        }
      })
      this.paging = json.response.paging
      // 更新使用
      // if (json.response.settle_sheets.length) {
      //   _store.updateSettleSheet(json.response.settle_sheets[1])
      // }
      return json.response
    })
  }

  batchSubmit(selected: string[], isSelectedAll: boolean) {
    const req = isSelectedAll
      ? { ...this.getSearchData() }
      : {
          settle_sheet_ids: selected,
          account_type: AccountType.ACCOUNT_TYPE_CUSTOMER,
        }
    return BatchSubmitSettleSheet(req)
  }

  export() {
    return ExportSettleSheet(
      Object.assign({
        ...this.getSearchData(),
        paging: { limit: 0 },
      }),
    )
  }

  fetchDriverList() {
    const req = {
      paging: { limit: 99 },
      role_types: [Role_Type.BUILT_IN_DRIVER], // 这里的请求参数待确认
      need_distribution_contractor: true,
    }
    ListGroupUser(req).then((json) => {
      const driver = _.map(json.response.group_users, (item) => {
        return {
          text: item.name,
          value: item.group_user_id,
        }
      })
      this.driverList = driver
      return json.response
    })
  }

  exportList = (settle_sheet_id: string) => {
    ExportMerchantSettlement({ settle_sheet_id }).then(() =>
      globalStore.showTaskPanel(),
    )
  }
}

export default new Store()
