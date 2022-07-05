import { makeAutoObservable } from 'mobx'
import { t } from 'gm-i18n'
import _ from 'lodash'

import {
  ListServicePeriod,
  ServicePeriod,
  CreateInvitationCode,
  ListInvitationCode,
  InvitationCode,
  InvitationCode_Type,
} from 'gm_api/src/enterprise'

import { ListQuotationV2, Quotation } from 'gm_api/src/merchandise'
import { levelList } from '../../type'
import { options } from '../../enum'
import { invitationCodeVerification } from '../../util'

class Store {
  filter: { [key: string]: any } = {
    quotation_id: undefined,
    service_period_id: '',
  }

  listServicePeriod: options[] = [{ text: t('全部'), value: '' }]

  quotationList: levelList[] = [
    {
      text: '喵喵总仓',
      value: '2',
      children: [{ text: '喵喵分仓一', value: '11' }],
    },
  ]

  codeList: InvitationCode[] = []

  // eslint-disable-next-line gm-react-app/no-observable-empty-object
  quotationObj: { [key: string]: string[] } = {}

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  updateFilter(value: any, key: string) {
    this.filter[key] = value
  }

  fetchServicePeriod() {
    const req = { paging: { limit: 999 } }
    ListServicePeriod(req).then((json) => {
      const service_period = _.map(
        json.response.service_periods,
        (item: ServicePeriod) => {
          return {
            value: item.service_period_id || '',
            text: item.name || '',
          }
        },
      )
      this.listServicePeriod = service_period
      this.listServicePeriod.unshift({ value: '', text: '未选择' })
      return json.response
    })
  }

  fetchQuotation() {
    const req = { paging: { limit: 999 } }
    ListQuotationV2(req).then((json) => {
      const quotation = _.map(json.response.quotations, (item: Quotation) => {
        return {
          value: item.quotation_id,
          text: item.inner_name || '',
        }
      })
      this.quotationList = quotation
      return json.response
    })
  }

  createInvitationCode() {
    const req = {
      quotation_id: this.filter.quotation_id?.value,
      service_period_id: this.filter.service_period_id,
      type: InvitationCode_Type.TEMPORARY, // 一期只有临时邀请码
    }
    if (invitationCodeVerification(req.service_period_id, req.quotation_id)) {
      CreateInvitationCode({ invitation_code: req }).then((json) => {
        return this.fetchInvitationCodeList()
      })
    }
  }

  fetchInvitationCodeList() {
    ListInvitationCode({
      paging: { limit: 999 },
      invitation_code_types: [InvitationCode_Type.TEMPORARY],
    }).then((json) => {
      this.quotationObj = {}
      this.codeList = json.response.invitation_codes as InvitationCode[]
      _.forEach(this.codeList, (v) => {
        const key = `${v.service_period_id},${v.quotation_id}`
        this.quotationObj[key]
          ? this.quotationObj[key].push(v.text || '')
          : (this.quotationObj[key] = [v.text || ''])
      })
      return null
    })
  }
}

export default new Store()
