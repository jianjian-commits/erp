import { makeAutoObservable, toJS } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { Tip, Modal } from '@gm-pc/react'
import {
  ListTransactionFlow,
  ListAccountBalance,
  ExportAccountBalance,
  UpdateAccountBalance,
  ExportFlow,
  TimeType,
  TransactionFlow_ChangeType,
} from 'gm_api/src/finance'
import {
  FilterOptions,
  ListOptions,
  ListTurnoverOptions,
  RechargeOptions,
} from './interface'

class Store {
  filter: FilterOptions = {
    begin_time: moment().startOf('day').add(-29, 'days').toDate(), // 搜索30天内有无已存在的结款单据
    end_time: moment().endOf('day').toDate(),
    customers: {},
    target_id: '',
  }

  // 充值和扣款
  recharge_data: RechargeOptions = {
    recharge_amount: '', // 充值金额
    voucher_number: '', // 到账凭证号
    deduction_amount: '', // 扣款金额
    mark: '', // 备注
  }

  clear() {
    this.recharge_data.deduction_amount = ''
    this.recharge_data.mark = ''
    this.recharge_data.recharge_amount = ''
    this.recharge_data.voucher_number = ''
  }

  // 不显示余额为0的公司开关
  is_check_zero = false

  // 客户余额列表
  list: ListOptions[] = []

  // 余额流水
  turnover_ist: ListTurnoverOptions[] = []

  // 余额
  account_balance = 0

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  doRequest = () => {}

  setDoRequest(func: () => void) {
    this.doRequest = func
  }

  setChecked() {
    this.is_check_zero = !this.is_check_zero
  }

  updateFilter<T extends keyof FilterOptions>(key: T, value: FilterOptions[T]) {
    this.filter[key] = value
  }

  setChangeTime(begin: Date, end: Date) {
    this.updateFilter('begin_time', begin)
    this.updateFilter('end_time', end)
  }

  updateRechargeData<T extends keyof RechargeOptions>(
    key: T,
    value: RechargeOptions[T],
  ) {
    this.recharge_data[key] = value
  }

  // 客户余额列表
  fetchBalanceList(params?: any) {
    const { customers } = this.filter
    const req = {
      paging: params.paging,
      target_id: customers ? customers?.value! : undefined,
      balance_zero: this.is_check_zero,
    }
    return ListAccountBalance(req).then((json) => {
      const { account_balances, relation_customer_info } = json.response
      this.list = _.map(account_balances, (item) => {
        return {
          ...item,
          company_name: relation_customer_info![item.target_id!]?.name!,
          company_code:
            relation_customer_info![item.target_id!]?.customized_code!,
        }
      })
      return json.response
    })
  }

  // 获取余额
  // fetchListAccountBalance(target_id: string[]) {
  //   return ListAccountBalance({
  //     target_id,
  //     paging: { limit: 999 },
  //   }).then((json) => {
  //     const { account_balances } = json.response
  //     if (account_balances.length) {
  //       this.account_balance = Number(account_balances!.reverse()[0].balance!)
  //     }
  //     return json.response
  //   })
  // }

  // 充值  RECHARGE | 扣款 DEDUCTION
  updateAccountBalance(index: number, type: 'RECHARGE' | 'DEDUCTION') {
    const { recharge_amount, voucher_number, mark, deduction_amount } =
      this.recharge_data
    // 校验
    if (!recharge_amount && type === 'RECHARGE') {
      Tip.danger(t('请填写充值金额'))
      return
    }

    if (!voucher_number && type === 'RECHARGE') {
      Tip.danger(t('请填写到账凭证号'))
      return
    }

    if (!deduction_amount && type === 'DEDUCTION') {
      Tip.danger(t('请填写扣款金额'))
      return
    }

    const req_RECHARGE = {
      change_amount: recharge_amount!,
      remark: mark!,
      arrival_serial_no: voucher_number!,
      change_type: TransactionFlow_ChangeType.CHANGE_TYPE_RECHARGE, // 充值
      account_balance: this.list[index],
    }

    const req_DEDUCTION = {
      change_amount: deduction_amount!,
      remark: mark,
      change_type: TransactionFlow_ChangeType.CHANGE_TYPE_DEDUCTION,
      account_balance: this.list[index],
    }
    return UpdateAccountBalance(
      type === 'RECHARGE' ? req_RECHARGE : req_DEDUCTION,
    ).then((json) => {
      const { account_balance } = json.response
      Modal.hide()
      this.doRequest()
      if (account_balance && type === 'RECHARGE') {
        Tip.success(t('充值成功'))
      } else {
        Tip.success(t('扣款成功'))
      }
      return json.response
    })
  }

  // 余额流水
  fetchBalanceTurnoverList(params?: any) {
    const { begin_time, end_time, target_id } = this.filter
    const req = {
      begin_time: `${+begin_time!}`!,
      end_time: `${+end_time!}`,
      time_type: TimeType.TIME_TYPE_CREATE_TIME,
      target_id: params?.company_id! ? params?.company_id! : target_id,
      paging: params.paging,
    }
    return ListTransactionFlow(req).then((json) => {
      const { transaction_flows, relation_groupuser_info } = json.response

      this.turnover_ist = _.map(transaction_flows, (item) => {
        return {
          ...item,
          operator: relation_groupuser_info![item.creator_id!]?.name!,
        }
      })
      return json.response
    })
  }

  // 余额导出
  exportAccountBalance() {
    const { customers } = this.filter
    return ExportAccountBalance({
      target_id: customers ? customers?.value! : undefined,
    })
  }

  // 流水导出
  exportFlow() {
    const { target_id, begin_time, end_time } = this.filter
    console.warn('target_id', target_id, toJS(this.filter))
    return ExportFlow({
      time_type: TimeType.TIME_TYPE_CREATE_TIME,
      begin_time: `${+begin_time!}`!,
      end_time: `${+end_time!}`,
      target_id: target_id || undefined,
    })
  }
}

export default new Store()
