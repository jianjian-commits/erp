import { SettleSheet, TransactionFlow } from 'gm_api/src/finance'
import { Order } from 'gm_api/src/order'

// 交易流水
export interface TransactionFlowOptions extends TransactionFlow {
  creator_name: string // 操作人
}

export interface SettlementOptions {
  remark: string // 备注
  settle_amount: string // 本次结款金额
  arrival_serial_no: string // 到账凭证号
  recharge_amount: string // 充值金额
  is_recharge_amount: string // 校验使用
}

export interface DetailOptions extends SettleSheet {
  company: string
}

export interface DetailListOptions extends Order {
  customer?: string
}
