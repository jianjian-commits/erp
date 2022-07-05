import {
  BoxForm,
  Button,
  ControlledFormItem,
  DateRangePicker,
  FormBlock,
  FormButton,
  InputClose,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { Device_DeviceType } from 'gm_api/src/device'
import { Select_DeviceModel } from 'gm_api/src/device/pc'
import { observer } from 'mobx-react'
import moment from 'moment'
import React, { FC, useState } from 'react'
import store from '../store'

/**
 * 报警数据筛选器的属性
 */
interface SearchFilterProps {
  /** 设备类型 */
  type: Device_DeviceType
  /** 搜索触发事件 */
  onSearch: Function
  /** 设备型号 */
  model?: string
  /** 设备名 */
  name?: string
}

/**
 * 报警记录筛选器的组件函数
 */
const SearchFilter: FC<SearchFilterProps> = observer(
  ({ type, onSearch, model, name }) => {
    const colWidth = 300

    const [selectedDeviceModel, setSelectedDeviceModel] = useState<string>(
      model || '',
    )
    const [deviceName, setDeviceName] = useState<string>(name || '')
    const [startTime, setStartTime] = useState<Date | null>(
      moment().startOf('hour').toDate(),
    )
    const [endTime, setEndTime] = useState<Date | null>(
      moment()
        .startOf('hour')
        .hours(moment().get('hour') + 1)
        .toDate(),
    )

    /**
     * 处理设备型号更改事件，更改设备型号时触发
     * 更新筛选器的设备型号
     * @param {string} selected 选择的设备型号
     */
    const handleDeviceModelChange = (selected: string) => {
      store.updateFilter('device_model_id', selected === '0' ? '' : selected)
      setSelectedDeviceModel(selected)
    }

    /**
     * 处理设备名更改事件，更改设备名时触发
     * 更新筛选器的设备名
     * @param {string} name 新的设备名
     */
    const handleDeviceNameChange = (name: string) => {
      store.updateFilter('device_name', name)
      setDeviceName(name)
    }

    /**
     * 处理日期更改事件，更改日期时触发
     * 更新筛选器的日期
     * @param {Date | null} start 开始时间
     * @param {Date | null} end   结束时间
     */
    const handleDateChange = (start: Date | null, end: Date | null) => {
      // 筛选器的日期格式都是unix timestamp，精确到毫秒
      store.updateFilter('begin_time', start ? moment(start).format('x') : '')
      store.updateFilter('end_time', end ? moment(end).format('x') : '')
      setStartTime(start)
      setEndTime(end)
    }

    /**
     * 处理搜索按钮点击事件，点击搜索按钮时触发
     * 搜索数据
     */
    const handleSearchButtonClick = (): void => {
      onSearch()
    }

    /**
     * 渲染组件
     */
    return (
      <BoxForm>
        <FormBlock>
          <ControlledFormItem label={t('设备型号')} colWidth={`${colWidth}px`}>
            <Select_DeviceModel
              getName={({ device_model_name }) => device_model_name}
              getResponseData={({ device_models }) =>
                // 只展示当前设备类型的设备型号
                device_models.filter((model) => model.device_type === type)
              }
              placeholder={t('选择设备型号')}
              value={selectedDeviceModel}
              onChange={handleDeviceModelChange}
              all
            />
          </ControlledFormItem>
          <ControlledFormItem label={t('设备')} colWidth={`${colWidth}px`}>
            <InputClose
              placeholder={t('输入设备名')}
              value={deviceName}
              onChange={handleDeviceNameChange}
            />
          </ControlledFormItem>
          <ControlledFormItem
            label={t('时间')}
            colWidth={`${1.5 * colWidth}px`}
          >
            <DateRangePicker
              begin={startTime}
              end={endTime}
              max={new Date()}
              beginTimeSelect={{
                defaultTime: moment().startOf('day').toDate(),
              }}
              endTimeSelect={{
                defaultTime: moment().endOf('day').toDate(),
              }}
              timeSpan={30 * 60 * 1000}
              onChange={(start, end) => handleDateChange(start, end)}
              enabledTimeSelect
            />
          </ControlledFormItem>
        </FormBlock>
        <FormButton>
          <Button type='primary' onClick={handleSearchButtonClick}>
            {t('搜索')}
          </Button>
        </FormButton>
      </BoxForm>
    )
  },
)

export default SearchFilter
