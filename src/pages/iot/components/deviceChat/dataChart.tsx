import { Line } from '@gm-pc/vision'

import React, { FC, useRef } from 'react'

import { ItemChartsType, DeviceDataType } from './interface'
import _ from 'lodash'
import { DeviceData_DataType } from 'gm_api/src/device'

const DataChart: FC<{
  deviceData: DeviceDataType
  deviceDatas: ItemChartsType
  dataType: DeviceData_DataType
}> = ({ dataType, deviceDatas, deviceData }) => {
  const unitName = useRef<string>('')
  const topNumber = useRef<number>(0)

  unitName.current = deviceDatas?.[dataType][0].unitName || ''

  topNumber.current =
    _.find(deviceData?.device_alarm_rule?.strategy_datas?.strategy_datas, {
      data_type: dataType,
    })?.upper_limit_value || 0

  return (
    <div key={dataType}>
      <Line
        data={deviceDatas?.[dataType]}
        options={{
          width: 400,
          height: 300,
          position: 'time*value',
          legend: false,
          color: 'type',
          scale: {
            value: {
              formatter: (value: number) => value.toFixed(2) + unitName.current,
            },
          },
          annotation: {
            value: () => topNumber.current,
          },
        }}
      />
    </div>
  )
}

export default DataChart
