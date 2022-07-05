interface OptionType<T> {
  create: T
  edit: T
}

interface DetailProps {
  isEdit?: boolean
  supplier_id?: string
  model_id?: string
  strategy_id?: string
  alarm_rule_id?: string
  deviceId?: string
}

export type { OptionType, DetailProps }
