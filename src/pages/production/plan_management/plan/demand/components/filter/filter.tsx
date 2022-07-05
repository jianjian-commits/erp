import { Flex } from '@gm-pc/react'
import { Button, Modal, Select } from 'antd'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import React, { FC, useRef, useState } from 'react'
import MoreFilter from './more_filter'
import store from '@/pages/production/plan_management/plan/demand/store'
import {
  ExportTask,
  list_ListTaskRequest_ViewType,
} from 'gm_api/src/production'
import globalStore from '@/stores/global'
import planStore from '@/pages/production/plan_management/plan/store'
import { Task_Produce_Type_Enum } from '@/pages/production/plan_management/plan/demand/enum'
import { Filter as FilterType } from '../../interface'
import {
  ProductionDropFilter,
  Select_BOM_Type,
} from '@/pages/production/plan_management/plan/components/production_select_name'
import _ from 'lodash'

const { Option } = Select

interface Props {
  run: () => void
  refresh: () => void
}

const Filter: FC<Props> = ({ run, refresh }) => {
  const [visible, setVisible] = useState(false)
  const { isProduce } = planStore.producePlanCondition
  const { task_type, view_type, serial_no, skuSelect } = store.filter
  const timeRef = useRef(_.debounce(run, 500))

  const handleRefresh = () => {
    refresh()
  }

  const handleChangeVisible = () => {
    setVisible((v) => !v)
  }

  const handleSearch = () => {
    run()
    handleChangeVisible()
  }

  const handleInit = () => {
    store.init(true)
    run()
  }

  const handleExport = () => {
    const req = store.getSearchData()
    ExportTask({
      filter: {
        ...req,
        paging: { limit: 999 },
      },
    }).then(() => {
      globalStore.showTaskPanel()
      return null
    })
  }

  const handleUpdateFilter = async <T extends keyof FilterType>(
    key: T,
    value: FilterType[T],
  ) => {
    store.updateFilter(key, value)
    if (key === 'serial_no') {
      timeRef.current()
      return
    }
    run()
  }
  return (
    <>
      <Flex justifyBetween className='b-options-filter '>
        <Flex alignCenter className='gm-text-desc'>
          <div style={{ width: '360px' }}>
            <ProductionDropFilter
              value={{
                serial_no: serial_no || '',
                skuSelect: skuSelect!,
              }}
              bomType={
                isProduce ? Select_BOM_Type.product : Select_BOM_Type.pack
              }
              onChange={(key, value) => handleUpdateFilter(key, value)}
            />
          </div>
          {isProduce && (
            <Select
              style={{ width: 150 }}
              className='gm-margin-left-15'
              value={task_type}
              onChange={(value) => handleUpdateFilter('task_type', value)}
              options={Task_Produce_Type_Enum}
            />
          )}
          <div onClick={handleChangeVisible} className='gm-margin-lr-10 '>
            {t('更多筛选')}
          </div>
          <div onClick={handleInit}>{t('清空')}</div>
        </Flex>
        <Flex alignCenter>
          <Select
            value={view_type}
            style={{ width: 160 }}
            className='gm-margin-right-15'
            onChange={(value) => handleUpdateFilter('view_type', value)}
          >
            {list_ListTaskRequest_ViewType.map((item, index) => {
              return (
                <Option key={index} value={item.value}>
                  <Flex alignCenter>
                    <span>{item.label}</span>
                  </Flex>
                </Option>
              )
            })}
          </Select>
          <Button className='gm-margin-right-15' onClick={handleExport}>
            {t('导出')}
          </Button>
          <Button onClick={handleRefresh}>{t('刷新')}</Button>
        </Flex>
      </Flex>
      <Modal
        title={t('更多筛选')}
        visible={visible}
        width='900px'
        destroyOnClose
        onCancel={handleChangeVisible}
        onOk={handleSearch}
      >
        <MoreFilter />
      </Modal>
    </>
  )
}

export default observer(Filter)
