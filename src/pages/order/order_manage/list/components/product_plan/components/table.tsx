import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { Flex, Input, Select, DatePicker } from '@gm-pc/react'
import { Table } from '@gm-pc/table-x'
import { Observer } from 'mobx-react'
import { deliveryType } from '@/pages/order/enum'

import type { Plan } from '../store'

interface ListProps<T extends Plan> {
  data: T[]
  onChange: (index: number, key: keyof T, value: T[keyof T]) => void
  showClass?: boolean
}
const List: FC<ListProps<Plan>> = (props) => {
  return (
    <Table
      tiled
      data={props.data}
      columns={[
        {
          width: 120,
          Header: t('计划类型'),
          accessor: 'plan_type',
        },
        {
          width: 60,
          Header: '',
          show: props.showClass,
          accessor: 'plan_type_class',
        },
        {
          Header: t('计划交期设置'),
          accessor: 'delivery_time',
          Cell: ({ index, original }) => (
            <Observer>
              {() => {
                return (
                  <Flex>
                    <Select
                      value={original.flag}
                      data={deliveryType}
                      onChange={(v) => {
                        props.onChange(index, 'flag', v)
                      }}
                      style={{ minWidth: 150 }}
                    />
                    {original.flag !== 1 && (
                      <>
                        <div className='gm-padding-5' />
                        <DatePicker
                          disabledClose
                          placeholder={t('选择计划交期')}
                          date={original.delivery_time}
                          // disabledDate={(date) =>
                          //   moment(date) < moment().startOf('day')
                          // }
                          timeLimit={{
                            timeSpan: 30 * 60 * 1000,
                            // disabledSpan: (time?: Date) => {
                            //   return moment(time) < moment()
                            // },
                          }}
                          onChange={(v) => {
                            props.onChange(index, 'delivery_time', v)
                          }}
                          enabledTimeSelect
                        />
                      </>
                    )}
                  </Flex>
                )
              }}
            </Observer>
          ),
        },
        {
          width: 200,
          Header: t('波次'),
          accessor: 'remark',
          Cell: ({ index, original }) => (
            <Observer>
              {() => {
                return (
                  <Input
                    placeholder={t('输入波次信息')}
                    value={original.remark}
                    onChange={(e) => {
                      props.onChange(index, 'remark', e.target.value)
                    }}
                  />
                )
              }}
            </Observer>
          ),
        },
      ]}
    />
  )
}

export default List
