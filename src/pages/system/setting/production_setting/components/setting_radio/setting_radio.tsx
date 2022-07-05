import { Radio } from 'antd'
import React, { FC } from 'react'

interface SettingRadioProps {
  value: any
  text: string
}

const SettingRadio: FC<SettingRadioProps> = ({ value, text }) => {
  return (
    <Radio
      value={value}
      // checked={
      //   store.productionSetting.task_output_source ===
      //   ProductionSettings_TaskOutputSource.TASKOUTPUT_SOURCE_LAST_PROCESS
      // }
      // onChange={(value) =>
      //   handleUpdateProductionSetting(
      //     'task_output_source',
      //     value
      //       ? ProductionSettings_TaskOutputSource.TASKOUTPUT_SOURCE_LAST_PROCESS
      //       : ProductionSettings_TaskOutputSource.TASKOUTPUT_SOURCE_TYPE_IN,
      //   )
      // }
    >
      {text}
    </Radio>
  )
}

export default SettingRadio
