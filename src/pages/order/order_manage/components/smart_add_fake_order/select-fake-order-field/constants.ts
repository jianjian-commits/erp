import type { SelectProps } from 'antd'
import { t } from 'gm-i18n'
type ValueOf<T> = T[keyof T]

/** 套账 - 加单数 - 字段 */
export const ADD_ORDER_VALUE_FIELD = {
  VALUE1: 'add_order_value1',
  VALUE2: 'add_order_value2',
  VALUE3: 'add_order_value3',
  VALUE4: 'add_order_value4',
} as const

export type AddOrderValueFieldType = ValueOf<typeof ADD_ORDER_VALUE_FIELD>

/** 套账 - 加单数 - 字段释义 */
export const ADD_ORDER_VALUE_FIELD_MEAN: Record<
  AddOrderValueFieldType,
  string
> = {
  [ADD_ORDER_VALUE_FIELD.VALUE1]: t('加单数1'),
  [ADD_ORDER_VALUE_FIELD.VALUE2]: t('加单数2'),
  [ADD_ORDER_VALUE_FIELD.VALUE3]: t('加单数3'),
  [ADD_ORDER_VALUE_FIELD.VALUE4]: t('加单数4'),
}

/** 套账 - 加单金额 - 字段释义 */
export const ADD_ORDER_AMOUNT_FIELD_MEAN: Record<
  AddOrderValueFieldType,
  string
> = {
  [ADD_ORDER_VALUE_FIELD.VALUE1]: t('加单金额1'),
  [ADD_ORDER_VALUE_FIELD.VALUE2]: t('加单金额2'),
  [ADD_ORDER_VALUE_FIELD.VALUE3]: t('加单金额3'),
  [ADD_ORDER_VALUE_FIELD.VALUE4]: t('加单金额4'),
}

/** 套账 - 加单数 - options */
export const options: NonNullable<SelectProps['options']> = [
  {
    value: ADD_ORDER_VALUE_FIELD.VALUE1,
    label: ADD_ORDER_VALUE_FIELD_MEAN[ADD_ORDER_VALUE_FIELD.VALUE1],
  },
  {
    value: ADD_ORDER_VALUE_FIELD.VALUE2,
    label: ADD_ORDER_VALUE_FIELD_MEAN[ADD_ORDER_VALUE_FIELD.VALUE2],
  },
  {
    value: ADD_ORDER_VALUE_FIELD.VALUE3,
    label: ADD_ORDER_VALUE_FIELD_MEAN[ADD_ORDER_VALUE_FIELD.VALUE3],
  },
  {
    value: ADD_ORDER_VALUE_FIELD.VALUE4,
    label: ADD_ORDER_VALUE_FIELD_MEAN[ADD_ORDER_VALUE_FIELD.VALUE4],
  },
]
