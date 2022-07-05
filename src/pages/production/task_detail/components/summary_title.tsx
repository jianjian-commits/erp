import { getUnitInfo, toFixed } from '@/pages/production/util'
import { Flex } from '@gm-pc/react'
import Big from 'big.js'
import { t } from 'gm-i18n'
import {
  list_TaskSource_SourceType,
  TaskSource_SourceType,
} from 'gm_api/src/production'
import _ from 'lodash'
import React, { FC, ReactElement, useMemo } from 'react'
import store from '../store'

interface ItemProps {
  text: string
  num: string
  unit_name: string
}

const NumItem: FC<ItemProps> = ({ text, num, unit_name }) => {
  return (
    <Flex className='b-title-info'>
      <div>{text}</div>
      <div>{toFixed(num) + unit_name}</div>
    </Flex>
  )
}

const SummaryTitle = () => {
  const {
    task: { sku_id, unit_id, demand_numbers },
    skus,
  } = store.taskDetails

  const { unitName } = getUnitInfo({
    sku_id: sku_id!,
    unit_id: unit_id!,
    skus,
    units: store.taskDetails.units!,
  })

  const data: ReactElement[] = []

  const totalNumber = useMemo(() => {
    // 合并单品BOM、组合BOM
    const cleanNumber =
      demand_numbers?.[TaskSource_SourceType.SOURCETYPE_PRODUCE_CLEANFOOD]
    const delicatessenNumber =
      demand_numbers?.[TaskSource_SourceType.SOURCETYPE_PRODUCE_DELICATESSEN]

    if (cleanNumber && delicatessenNumber) {
      demand_numbers![TaskSource_SourceType.SOURCETYPE_PRODUCE_CLEANFOOD] = Big(
        cleanNumber,
      )
        .add(delicatessenNumber)
        .toString()
      delete demand_numbers?.[
        TaskSource_SourceType.SOURCETYPE_PRODUCE_DELICATESSEN
      ]
    }

    return (
      '' +
      _.reduce(
        demand_numbers,
        (total, value, key) => {
          const text =
            +key === TaskSource_SourceType.SOURCETYPE_PRODUCE_CLEANFOOD ||
            +key === TaskSource_SourceType.SOURCETYPE_PRODUCE_DELICATESSEN
              ? '生产计划'
              : _.find(list_TaskSource_SourceType, { value: +key })?.text!
          data.push(
            <NumItem
              text={t(text + '需求数')}
              num={value}
              unit_name={unitName}
            />,
          )

          return Big(total).add(value)
        },
        Big(0),
      )
    )
  }, [demand_numbers])

  return (
    <Flex className='b-summary-title' alignCenter>
      <NumItem text={t('需求数')} num={totalNumber!} unit_name={unitName} />
      <div className='b-border' />
      {_.map(data, (v) => v)}
    </Flex>
  )
}

export default SummaryTitle
