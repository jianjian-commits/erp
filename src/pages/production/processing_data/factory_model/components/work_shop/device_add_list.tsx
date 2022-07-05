import { t } from 'gm-i18n'
import React, { useEffect, useState } from 'react'
import { Button, Flex, Input } from '@gm-pc/react'
import { Table } from '@gm-pc/table-x'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { pinYinFilter } from '@gm-common/tool'
import { Device } from 'gm_api/src/device'
import store from '../../store'

const DeviceAddList = observer(() => {
  const {
    device_list,
    device_add_detail: { current_device_type, current_device },
  } = store

  const [search_text, setSearchText] = useState<string>('')
  const [list, setList] = useState<Device[]>(
    device_list[current_device_type] || [],
  )
  let selected: string[] = []

  const getAllList = () => {
    // 当前并未点击任何设备分类，但是有勾选，展示所选择的设备
    if (current_device_type === '0' && !_.isEmpty(current_device)) {
      return _.reduce(
        current_device,
        (all, _, key) => {
          return all.concat(device_list[key] ?? [])
        },
        [] as Device[],
      )
    }
    // 有选择分类，仅展示当前选择分类的设备即可
    return device_list[current_device_type] ?? []
  }

  useEffect(() => {
    // 当前并未点击任何设备分类，但是有勾选，展示所选择的设备
    setList(getAllList())
  }, [device_list, current_device_type, current_device])

  const getAllSelectedDevice = () => {
    const result = _.reduce(
      current_device,
      (all, value) => {
        return all.concat(value)
      },
      [] as string[],
    )
    return result.slice()
  }

  const handleAddDevice = () => {
    const all = getAllSelectedDevice()
    store.addDevice(all)
  }

  const handleSearchDevice = () => {
    const new_list = pinYinFilter(
      list,
      search_text,
      (e: Device) => e.device_id + e.device_name,
    )
    setList(search_text ? new_list : getAllList())
  }

  const handleSelectedDevice = (selected: string[]) => {
    if (current_device_type === '0' && !_.isEmpty(current_device)) {
      // 只需要修改list, selected状态即可
      const new_list: Device[] = _.filter(
        list,
        (item) => _.findIndex(selected, (s) => s === item.device_id) !== -1,
      )
      const new_device: { [key: string]: string[] } = {}
      _.forEach(_.groupBy(new_list, 'device_type'), (value, key) => {
        new_device[key] = _.map(value, (v) => v.device_id)
      })
      store.updateDeviceAddDetail('current_device', new_device)
      return
    }

    const current: { [key: string]: string[] } = { ...current_device }
    current[current_device_type] = [...selected]

    store.updateDeviceAddDetail('current_device', current)
  }

  const handleCancelAddDevice = () => {
    store.setAddDevice(false)
  }

  if (current_device_type === '0' && !_.isEmpty(current_device)) {
    selected = getAllSelectedDevice()
  } else {
    selected = current_device[current_device_type] ?? []
  }

  // 若是有选择的设备类型，展示选择的设备类型下的设备
  return (
    <Flex flex column>
      <div className='gm-text-16 gm-margin-bottom-10'>
        <span>{t('设备数')}: </span>
        <span className='gm-text-primary'>{getAllSelectedDevice().length}</span>
        <Input
          className='gm-margin-left-20 gm-margin-right-10'
          style={{ width: '250px' }}
          value={search_text}
          placeholder={t('请输入设备编号或名称')}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button type='primary' htmlType='submit' onClick={handleSearchDevice}>
          {t('定位')}
        </Button>
      </div>
      <Table
        isSelect
        isVirtualized
        id='process_template_of_device'
        keyField='device_id'
        data={list.slice()}
        selected={selected}
        onSelect={handleSelectedDevice}
        style={{ width: '100%' }}
        columns={[
          {
            Header: t('设备编号'),
            accessor: 'device_id',
          },
          {
            Header: t('设备名称'),
            accessor: 'device_name',
          },
        ]}
      />
      <Flex justifyEnd className='gm-margin-top-10'>
        <Button className='gm-margin-right-10' onClick={handleCancelAddDevice}>
          {t('取消')}
        </Button>
        <Button type='primary' htmlType='submit' onClick={handleAddDevice}>
          {t('添加')}
        </Button>
      </Flex>
    </Flex>
  )
})

export default DeviceAddList
