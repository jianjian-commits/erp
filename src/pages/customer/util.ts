import {
  Customer,
  QuotationCustomerRelation,
  CustomerOrderLimit,
} from 'gm_api/src/enterprise'
import { Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { levelList } from './type'
import globalStore from '@/stores/global'
import { Quotation_Type } from 'gm_api/src/merchandise'

enum PAY_METHOD {
  '无' = 0,
  '日结' = 3,
  '周结',
  '月结',
  '自定义结算',
}

function typeToBoolean(value: number): boolean | null {
  switch (value) {
    case 1:
      return true
    case 2:
      return false
    default:
      return null
  }
}

function geoToArr(
  city_id: string | undefined,
  district_id: string | undefined,
) {
  if (city_id && district_id) {
    return [city_id, district_id]
  } else if (city_id) {
    return [city_id]
  } else {
    return []
  }
}

function customerDetailVerification(
  parentCustomer: Customer,
  childCustomer: Customer,
  quotation_ids: levelList[],
  service_period_ids: levelList[],
  accountInfo: { [key: string]: string },
  type: 'update' | 'create',
) {
  if (!globalStore.isLite) {
    if (!parentCustomer.name) {
      Tip.danger(t('请填写公司信息！'))
      return false
    }
    if (!parentCustomer.customized_code) {
      Tip.danger(t('请填写公司编码！'))
      return false
    }
    // account
    if (type === 'create') {
      if (!accountInfo.customer_account) {
        Tip.danger(t('请填写登录账号！'))
        return false
      }
      if (!accountInfo.customer_password) {
        Tip.danger(t('请填写密码！'))
        return false
      }
    }
    if (accountInfo.customer_password !== accountInfo.customer_password2) {
      Tip.danger(t('请填写相同密码！'))
      return false
    }

    // parentCustomer
    if (!parentCustomer.settlement?.china_vat_invoice?.financial_contact_name) {
      Tip.danger(t('请填写联系人！'))
      return false
    }
    if (!parentCustomer.settlement?.china_vat_invoice.financial_contact_phone) {
      Tip.danger(t('请填写联系人电话！'))
      return false
    }
  }

  // childCustomer
  if (!childCustomer.name) {
    Tip.danger(t('请填写客户名称！'))
    return false
  }
  if (!childCustomer.customized_code) {
    Tip.danger(t('请填写客户编码！'))
    return false
  }
  if (!globalStore.isLite) {
    if (!childCustomer.attrs?.addresses![0].receiver) {
      Tip.danger(t('请填写收货人！'))
      return false
    }
    if (!childCustomer.attrs?.addresses![0].phone) {
      Tip.danger(t('请填写收货人电话！'))
      return false
    }
    if (!childCustomer.attrs?.addresses![0].address) {
      Tip.danger(t('请填写收货地址！'))
      return false
    }
    if (
      !childCustomer.attrs?.addresses![0].geotag?.latitude ||
      !childCustomer.attrs?.addresses![0].geotag?.longitude
    ) {
      Tip.danger(t('请选择地理位置！'))
      return false
    }
    if (
      !childCustomer.attrs?.addresses![0].city_id ||
      !childCustomer.attrs?.addresses![0].district_id ||
      !childCustomer.attrs?.addresses![0].street_id
    ) {
      Tip.danger(t('请选择地理标签！'))
      return false
    }
  }

  // quotation_ids
  // if (!quotation_ids.length) {
  //   Tip.danger(t('请选择报价单！'))
  //   return false
  // }
  // quotation_ids
  if (!globalStore.isLite && !service_period_ids.length) {
    Tip.danger(t('请选择运营时间！'))
    return false
  }

  return true
}

/**
 *  德保订单限制-校验
 * @param customer_order_limit
 * @returns
 */
function customerOrderLimitVerification(
  customer_order_limit: CustomerOrderLimit,
) {
  const { total_price_rule, category_1_rule, on_off } = customer_order_limit
  if (
    on_off &&
    total_price_rule.on_off &&
    !_.get(total_price_rule, 'total_cost.val')
  ) {
    Tip.danger(t('订单金额限制：每月成本总额不为空！'))
    return false
  }
  if (on_off && !total_price_rule.on_off && !category_1_rule.on_off) {
    Tip.danger(t('提示：请开启订单金额限制或者商品分类限制'))
    return false
  }
  if (
    on_off &&
    category_1_rule.on_off &&
    !category_1_rule.category_1_rule_details?.length
  ) {
    Tip.danger(t('开启商品分类限制，至少填写一条！'))
    return false
  }
  if (
    on_off &&
    category_1_rule.on_off &&
    category_1_rule.category_1_rule_details?.length
  ) {
    if (
      _.some(category_1_rule.category_1_rule_details, ['category_1_ids', false])
    ) {
      Tip.danger(t('商品分类限制：商品分类不为空！'))
      return false
    }
    if (_.some(category_1_rule.category_1_rule_details, ['limit_price', 0])) {
      Tip.danger(t('商品分类限制：商品分类金额不为空！'))
      return false
    }
    if (_.some(category_1_rule.category_1_rule_details, ['ratio', 0])) {
      Tip.danger(t('商品分类限制：商品分类比例不为空！'))
      return false
    }
    if (_.some(category_1_rule.category_1_rule_details, ['isEditing', true])) {
      Tip.danger(t('商品分类限制：商品分类需要点击确定保存！'))
      return false
    }
  }
  return true
}

function invitationCodeVerification(service_period: string, quotation: string) {
  if (!service_period) {
    Tip.danger(t('请选择运营时间！'))
    return false
  }
  if (!quotation) {
    Tip.danger(t('请选择报价单！'))
    return false
  }
  return true
}

function getValueArr(list: levelList[]) {
  const res: string[] = []
  _.forEach(list, (item) => {
    if (item.value) {
      res.push(item.value)
    }
  })
  return res
}

function getRelationId(
  list: QuotationCustomerRelation[],
  customer_id: string,
  station_id: string,
  type: Quotation_Type | Quotation_Type[] = Quotation_Type.WITHOUT_TIME,
): string {
  const quotationType = _.isArray(type) ? type : [type]
  return (
    _.find(
      list,
      (item) =>
        item.customer_id === customer_id &&
        item.station_id === station_id &&
        quotationType.includes(item.quotation_type as Quotation_Type),
    )?.quotation_id || ''
  )
}

function strToArr<T>(str?: T): T[] {
  if (str) {
    return [str]
  }
  return []
}

function getServicePeriodList(
  service_period_id: Array<string>,
  listServicePeriod: any,
): Array<string> {
  return _.map(
    _.map(service_period_id, (v) => {
      return _.find(listServicePeriod, (i) => v === i.value)
    }),
    (v) => (v && v.text) || '',
  )
}
export {
  PAY_METHOD,
  typeToBoolean,
  geoToArr,
  customerDetailVerification,
  invitationCodeVerification,
  getValueArr,
  getRelationId,
  strToArr,
  getServicePeriodList,
  customerOrderLimitVerification,
}
