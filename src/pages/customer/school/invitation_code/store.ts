import { observable, action, makeAutoObservable } from 'mobx'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { levelList } from '../../type'
import {
  ListCustomer,
  CreateInvitationCode,
  ListInvitationCode,
  InvitationCode,
  InvitationCode_Type,
  Customer_Type,
} from 'gm_api/src/enterprise'
import { Tip } from '@gm-pc/react'

class Store {
  filter: { [key: string]: any } = {
    school_id: undefined,
  }

  school_id: string = ''

  // 学校列表
  schoolList: levelList[] = []

  // 邀请码列表
  codeList: InvitationCode[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  // 获取学校列表
  fetchSchoolList() {
    return ListCustomer({
      level: 1,
      paging: { limit: 999 },
      type: Customer_Type.TYPE_SCHOOL,
    }).then((json) => {
      const { customers } = json.response
      this.schoolList = _.map(customers, (item) => ({
        ...item,
        value: item.customer_id,
        text: item.name,
      }))
      return json.response
    })
  }

  // 生成邀请码
  createInvitationCode() {
    const { school_id } = this.filter
    // customer_id不能为空
    if (!school_id) {
      Tip.danger(t('请选择学校！'))
      return
    }

    // 一个学校一个邀请码
    if (
      _.find(this.codeList, (item) => item.root_customer_id === school_id.value)
    ) {
      Tip.danger(t('该学校已存在邀请码！'))
      return
    }

    const req = {
      type: InvitationCode_Type.EDUCATION_FIXED,
      root_customer_id: school_id.value,
    }
    CreateInvitationCode({ invitation_code: req }).then((json) => {
      if (json.response.invitation_code) {
        this.fetchInvitationCodeList()
      }
      return json.response
    })
  }

  // 选择修改学校filter
  updateFilter(value: any, key: string) {
    this.filter[key] = value
  }

  // 获取邀请码列表
  fetchInvitationCodeList() {
    ListInvitationCode({
      paging: { limit: 99 },
      invitation_code_types: [InvitationCode_Type.EDUCATION_FIXED],
    }).then((json) => {
      this.codeList = json.response.invitation_codes as InvitationCode[]
      return json.response
    })
  }
}
export default new Store()
