import _ from 'lodash'
import { Tip, TransferListItem } from '@gm-pc/react'
import { t } from 'gm-i18n'
import {
  Customer,
  DistributionContractor,
  GroupUser,
  District,
} from 'gm_api/src/enterprise'

function handleRouteObj(list: string[]): { customer_id: string }[] {
  const routeObjList = _.map(list, (item) => {
    return {
      customer_id: item,
    }
  })
  return routeObjList
}
function handleCustomerTreeData(
  customerList: Customer[],
  districtList: District[],
): TransferListItem[] {
  const customer_config_data: TransferListItem[] = []
  const sort_by_district_id_object = _.groupBy(customerList, (item) => {
    return item.attrs?.addresses?.length
      ? item.attrs?.addresses[0].district_id
      : '0'
  })
  _.forEach(sort_by_district_id_object, (list, key) => {
    const district_id_object = {
      value: key,
      children: _.map(list, (item) => {
        return { value: item.customer_id, text: item.name }
      }),
      text:
        _.find(districtList, (item) => item.district_id === key)?.local_name ||
        '其他地区',
    }
    customer_config_data.push(district_id_object)
  })
  return customer_config_data
}

function handleDriverSelect(
  distribution_contractors: DistributionContractor[],
  drivers: { [key: string]: GroupUser },
) {
  const driver_select_list = _.map(distribution_contractors, (item) => {
    const children_drivers: { text: string; value: string }[] = []
    _.forEach(drivers, (driver) => {
      if (
        driver.distribution_contractor_id === item.distribution_contractor_id &&
        driver.is_valid
      ) {
        children_drivers.push({
          text: driver.name,
          value: driver.group_user_id,
        })
      }
    })
    return {
      text: item.name,
      value: item.distribution_contractor_id,
      children: children_drivers,
    }
  })
  return driver_select_list
}

function driverValidate(
  detail: Omit<GroupUser, 'group_user_id'>,
  account: { [key: string]: string },
) {
  if (!account.account_username) {
    Tip.danger(t('请填写司机账号！'))
    return false
  }

  if (account.password !== account.password_confirm) {
    Tip.danger(t('请填写相同密码！'))
    return false
  }
  if (!detail.name) {
    Tip.danger(t('请填写司机名！'))
    return false
  }

  if (!account.account_phone) {
    Tip.danger(t('请填写手机号码！'))
    return false
  }

  if (!detail.distribution_contractor_id) {
    Tip.danger(t('请选择承运商！'))
    return false
  }

  return true
}

const orderState = [
  {
    text: t('待分拣'),
    value: 1,
  },
  {
    text: t('分拣中'),
    value: 2,
  },
  {
    text: t('配送中'),
    value: 3,
  },
  {
    text: t('已签收'),
    value: 4,
  },
]

export {
  handleRouteObj,
  handleCustomerTreeData,
  handleDriverSelect,
  driverValidate,
  orderState,
}
