import React, { FC } from 'react'
import { InputNumber, Flex } from '@gm-pc/react'
import { observer } from 'mobx-react'
import storeInfo from '../store/storeInfo'
import { CellProps } from '../interface'
import {
  DeviceAlarmRule_StrategyType,
  DeviceAlarmRule_StrategyData,
  DeviceAlarmRule_ContinuousTime,
  TimeType,
} from 'gm_api/src/device'
import {
  Select_DeviceAlarmRule_StrategyType,
  Select_TimeType,
} from 'gm_api/src/device/pc'
import { t } from 'gm-i18n'
import PaddingDiv from '@/pages/iot/device_management/components/paddingDiv'
import '../../style.less'

const CellStrateGay: FC<CellProps> = ({ data, index }) => {
  const { strategy_type, continuous_time, continuous_number } = data
  const isTime =
    strategy_type === DeviceAlarmRule_StrategyType.STRATEGYTYPE_CONTINUOUS_TIME

  const handleChange = <
    T extends keyof DeviceAlarmRule_StrategyData,
    B extends keyof DeviceAlarmRule_ContinuousTime
  >(
    name: T,
    value: DeviceAlarmRule_StrategyData[T],
    objValue?: DeviceAlarmRule_ContinuousTime[B],
    objKey?: B,
  ) => {
    let val = value
    switch (name) {
      case 'continuous_time':
        val = {
          ...continuous_time,
          [objKey ?? 'time_type']: objValue,
        } as DeviceAlarmRule_StrategyData[T]
        if (!objKey) val!.time = 1
        break
      case 'continuous_number':
        val = {
          ...continuous_number,
          number: objValue,
        } as DeviceAlarmRule_StrategyData[T]
        break
    }
    storeInfo.changeStrategyData(name, val, index)
  }

  return (
    <Flex>
      <Select_DeviceAlarmRule_StrategyType
        className='select_length'
        value={strategy_type!}
        onChange={(value) => handleChange('strategy_type', value!)}
      />

      <InputNumber
        className='gm-margin-left-10'
        style={{ width: '80px' }}
        value={isTime ? continuous_time?.time : continuous_number?.number}
        max={
          isTime && continuous_time?.time_type === TimeType.TIMETYPE_SECOND
            ? 3600
            : 60
        }
        onChange={(value) =>
          handleChange(
            isTime ? 'continuous_time' : 'continuous_number',
            undefined,
            value!,
            'time',
          )
        }
      />
      {isTime ? (
        <Select_TimeType
          enumFilter={(res) => {
            res.splice(2, 1)
            return res
          }}
          style={{ width: '50px' }}
          value={continuous_time?.time_type!}
          onChange={(value) =>
            handleChange('continuous_time', undefined, value)
          }
        />
      ) : (
        <PaddingDiv>{t('次')}</PaddingDiv>
      )}
    </Flex>
  )
}

export default observer(CellStrateGay)
