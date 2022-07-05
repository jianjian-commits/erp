import {
  BoxForm,
  Button,
  ControlledFormItem,
  DateRangePicker,
  FormBlock,
  FormButton,
  Input,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { Model_Type } from 'gm_api/src/common'
import { Select_Model_Type } from 'gm_api/src/common/pc'
import { Select_APIRequestRecord_SyncStatus } from 'gm_api/src/sap/pc'
import moment from 'moment'
import React, { FC, useEffect, useState } from 'react'
import store from '../store'

/**
 * 同步的搜索筛选器属性
 */
interface SyncSearchFilterProps {
  onSearch: Function
}

/**
 * 同步的搜索筛选器组件函数
 */
const SyncSearchFilter: FC<SyncSearchFilterProps> = ({ onSearch }) => {
  /** 每个搜索项的基本宽度 */
  const colWidth = 150

  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [selectedModule, setSelectedModule] = useState<number>()
  const [selectedStatus, setSelecetedStatus] = useState<number>()
  const [dataSn, setDataSn] = useState<string>()

  /**
   * 处理日期改变事件，选择的日期改变时触发
   * 更新筛选器中的开始和结束时间
   * @param {Date | null} start 开始时间
   * @param {Date | null} end   结束时间
   */
  const handleDateChange = (start: Date | null, end: Date | null) => {
    store.isAll = false
    store.updateFilter('from_time', moment(start).format('x'))
    store.updateFilter('to_time', moment(end).format('x'))
    setStartTime(start)
    setEndTime(end)
  }

  /**
   * 处理模块改变事件，选择的模块改变时触发
   * 更新筛选器中的模块
   * @param {number} module 模块
   */
  const handleModuleChange = (module: number) => {
    const modules = module
      ? [module]
      : [Model_Type.TYPE_INVENTORY_STOCKSHEET, Model_Type.TYPE_ORDER_ORDER]
    store.updateFilter('model_types', modules)
    setSelectedModule(module)
  }

  /**
   * 处理状态改变事件，选择的状态改变时触发
   * 更新筛选器中的状态
   */
  const handleStatusChange = (status: number) => {
    store.updateFilter('sync_status', status)
    setSelecetedStatus(status)
  }

  /**
   * 处理单据编号改变事件，输入的单据编号更改时触发
   * 更新筛选器中的单据编号
   */
  const handleSnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sn = e.target.value
    store.updateFilter('data_sn', sn ? [sn] : [])
    setDataSn(sn)
  }

  /**
   * 处理搜索按钮点击事件，搜索按钮点击时触发
   * 根据筛选器搜索同步记录
   */
  const handleSearchButtonClick = () => {
    onSearch()
  }

  useEffect(() => {
    store.initFilter()
  }, [])

  /**
   * 渲染组件
   */
  return (
    <BoxForm>
      <FormBlock>
        <ControlledFormItem colWidth={`${colWidth * 2}px`}>
          <DateRangePicker
            begin={startTime}
            end={endTime}
            min={moment().subtract(1, 'y').toDate()}
            max={new Date()}
            timeSpan={30 * 60 * 1000}
            onChange={(start, end) => handleDateChange(start, end)}
            enabledTimeSelect
          />
        </ControlledFormItem>
        <ControlledFormItem colWidth={`${colWidth}px`}>
          <Select_Model_Type
            enumFilter={(modules) =>
              modules.filter(
                (module) => module.value === 9 || module.value === 21, // 目前只拉取库存单据和订单作为筛选
              )
            }
            placeholder={t('选择模块')}
            value={selectedModule}
            onChange={handleModuleChange}
            all
          />
        </ControlledFormItem>
        <ControlledFormItem colWidth={`${colWidth}px`}>
          <Select_APIRequestRecord_SyncStatus
            value={selectedStatus}
            placeholder={t('选择状态')}
            onChange={handleStatusChange}
            all
          />
        </ControlledFormItem>
        <ControlledFormItem colWidth={`${colWidth}px`}>
          <Input
            value={dataSn}
            placeholder={t('单据编号')}
            onChange={handleSnChange}
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
}

export default SyncSearchFilter
