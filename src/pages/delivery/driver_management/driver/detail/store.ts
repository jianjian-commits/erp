import { t } from 'gm-i18n'
import { makeAutoObservable } from 'mobx'
import {
  GetGroupUser,
  ListDistributionContractor,
  UpdateGroupUser,
  CreateGroupUser,
  GroupUser_Type,
  GroupUser,
  Status_Code,
  CreateDistributionContractor,
} from 'gm_api/src/enterprise'
import _ from 'lodash'
import { Tip } from '@gm-pc/react'
import { driverValidate } from '@/pages/delivery/util'
import sha256 from 'crypto-js/sha256'

const INITDRIVER = {
  name: '',
  phone: '',
  is_valid: true,
  attrs: { car_license_plate_number: '' },
  distribution_contractor_id: '',
  username: '',
  type: GroupUser_Type.NORMAL,
  status: '0',
}

const INITACCOUNT = {
  account_username: '',
  password: '',
  password_confirm: '',
  account_phone: '',
}

class Store {
  driverDetail: Omit<GroupUser, 'group_user_id'> = {
    ...INITDRIVER,
  }

  accountDetail: { [key: string]: string } = {
    ...INITACCOUNT,
  }

  distributionContractorList: { value: string; text: string }[] = []

  newDistributionContractor: string = ''

  init() {
    this.driverDetail = { ...INITDRIVER }
    this.accountDetail = { ...INITACCOUNT }
  }

  handleChangeDistributionContractor(value: string) {
    this.newDistributionContractor = value
  }

  handleDetail = <T extends keyof GroupUser>(key: T, value: GroupUser[T]) => {
    if (key === 'attrs') {
      this.driverDetail[key].car_license_plate_number = value
    } else {
      this.driverDetail[key] = value
    }
  }

  handleAccountDetail = (key: string, value: string) => {
    this.accountDetail[key] = value
  }

  fetchDetail = (id: string) => {
    const req = { group_user_id: id, need_distribution_contractor: true }
    return GetGroupUser(req).then((json) => {
      const driver = json.response.group_user as GroupUser
      this.driverDetail = driver
      this.accountDetail = {
        account_name: driver.username as string,
        account_phone: driver.phone as string,
        account_username: driver.username as string,
      }
      return json.response
    })
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  getParams() {
    const { account_username, password } = this.accountDetail
    const account = password?.length && {
      password: sha256(password).toString(),
    }

    return { group_user: this.driverDetail, account }
  }

  UpdateDriver() {
    const req = this.getParams()
    return UpdateGroupUser(req)
  }

  CreateDriver() {
    const req = {
      group_user: { ...this.driverDetail },
      account: {
        username: this.accountDetail.account_username,
        password: sha256(this.accountDetail.password).toString(),
        phone: this.accountDetail.account_phone,
      },
      bind_to_driver_role: true,
    }
    return CreateGroupUser(req, [
      Status_Code.DUPLICATE_USER_PHONE,
      Status_Code.DUPLICATE_USER_USERNAME,
      Status_Code.DUPLICATE_USER_NAME,
    ]).then((json) => {
      if (json.code === Status_Code.DUPLICATE_USER_PHONE) {
        Tip.danger(t('手机号码已存在！'))
        return null
      } else if (json.code === Status_Code.DUPLICATE_USER_USERNAME) {
        Tip.danger(t('司机账号已存在'))
        return null
      } else if (json.code === Status_Code.DUPLICATE_USER_NAME) {
        Tip.danger(t('司机名已存在'))
        return null
      } else {
        Tip.success(t('保存成功'))
      }

      return json
    })
  }

  fetchDistributionContractorList = () => {
    const req = Object.assign({ paging: { limit: 999 } })
    return ListDistributionContractor(req).then((json) => {
      this.distributionContractorList = _.map(
        json.response.distribution_contractors,
        (item) => {
          return {
            text: item.name,
            value: item.distribution_contractor_id,
          }
        },
      )
      this.distributionContractorList.push({
        text: `+${t('添加承运商')}`,
        value: '0',
      })
      return null
    })
  }

  createDistributionContractor() {
    return CreateDistributionContractor({
      distribution_contractor: { name: this.newDistributionContractor },
    }).then((json) => {
      this.driverDetail.distribution_contractor_id =
        json.response.distribution_contractor.distribution_contractor_id
      this.newDistributionContractor = ''
      return null
    })
  }

  validate() {
    return driverValidate(this.driverDetail, this.accountDetail)
  }
}

export default new Store()
