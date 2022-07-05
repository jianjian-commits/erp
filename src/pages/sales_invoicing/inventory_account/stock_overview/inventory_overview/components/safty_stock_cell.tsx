import React, { FC } from 'react'
import Big from 'big.js'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Flex, InputNumber, Select } from '@gm-pc/react'
import { toFixedSalesInvoicing } from '@/common/util'

interface SaftyStockCellProps {
  row: any
  data: any
  set: Function
}

const SaftyStockCell: FC<SaftyStockCellProps> = observer(
  ({ row, data, set }) => {
    const { stock_remain_warning, base_unit_name, stock, sku_id } = data
    const { max_warning, min_warning, max_quantity, min_quantity } =
      stock_remain_warning
    const quantity = toFixedSalesInvoicing(
      Big(stock?.base_unit?.quantity ?? '0'),
    )

    const isOutMax = +quantity > +(max_quantity ?? 0)
    const isOutMin = +quantity < +(min_quantity ?? 0)
    if (!row?.isEditing) {
      return (
        <div>
          <div
            style={{
              backgroundColor: min_warning && isOutMin ? 'red' : '',
              marginBottom: '5px',
            }}
          >
            {min_warning
              ? `下限：${min_quantity}${base_unit_name}`
              : t('下限：未设置')}
          </div>
          <div
            style={{
              marginBottom: '1px',
              backgroundColor: max_warning && isOutMax ? 'red' : '',
            }}
          >
            {max_warning
              ? `上限：${max_quantity}${base_unit_name}`
              : t('上限：未设置')}
          </div>
        </div>
      )
    }
    return (
      <div>
        <Flex
          alignCenter
          style={{
            marginBottom: '5px',
          }}
        >
          <div
            style={{
              marginRight: '3px',
            }}
          >
            <span
              style={{
                paddingRight: '2px',
              }}
            >
              {t('下限: ')}
            </span>
            <Select
              value={row?.min_warning ? 1 : 0}
              data={[
                {
                  value: 0,
                  text: '不设置',
                },
                {
                  value: 1,
                  text: '设置',
                },
              ]}
              onChange={(v) => {
                set(sku_id, {
                  min_warning: !!v,
                })
              }}
            />
          </div>
          {row?.min_warning && (
            <div>
              <InputNumber
                style={{
                  width: 50,
                }}
                defaultValue={0.01}
                min={0}
                precision={2}
                value={row?.min_quantity ?? 0.01}
                onChange={(value) => {
                  set(sku_id, {
                    min_quantity:
                      value === null ? ('' as unknown as null) : value,
                  })
                }}
              />
              <span
                style={{
                  paddingLeft: '5px',
                }}
              >
                {base_unit_name}
              </span>
            </div>
          )}
        </Flex>
        <Flex alignCenter>
          <div
            style={{
              marginRight: '3px',
            }}
          >
            <span
              style={{
                paddingRight: '2px',
              }}
            >
              {t('上限: ')}
            </span>
            <Select
              value={row?.max_warning ? 1 : 0}
              data={[
                {
                  value: 0,
                  text: '不设置',
                },
                {
                  value: 1,
                  text: '设置',
                },
              ]}
              onChange={(v) => {
                set(sku_id, {
                  max_warning: !!v,
                })
              }}
            />
          </div>
          {row?.max_warning && (
            <div>
              <InputNumber
                style={{
                  width: 50,
                }}
                min={0}
                precision={2}
                defaultValue={0.01}
                value={row?.max_quantity ?? 0.01}
                onChange={(value) => {
                  set(sku_id, {
                    max_quantity:
                      value === null ? ('' as unknown as null) : value,
                  })
                }}
              />
              <span
                style={{
                  paddingLeft: '5px',
                }}
              >
                {base_unit_name}
              </span>
            </div>
          )}
        </Flex>
      </div>
    )
  },
)

export default SaftyStockCell
