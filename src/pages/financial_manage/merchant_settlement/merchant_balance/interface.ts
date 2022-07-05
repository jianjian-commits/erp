import { AccountBalance, TransactionFlow } from 'gm_api/src/finance'
export interface FilterOptions {
  begin_time?: Date
  end_time?: Date
  customers?: any
  target_id?: string
}

export interface ListOptions extends AccountBalance {
  company_name?: string
  company_code?: string
}

export interface ListTurnoverOptions extends TransactionFlow {
  operator?: string
}

export interface RechargeOptions {
  recharge_amount: string
  voucher_number: string
  mark: string
  deduction_amount: string
}
