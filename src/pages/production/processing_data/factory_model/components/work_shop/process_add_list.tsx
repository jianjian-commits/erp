import { t } from 'gm-i18n'
import React, { useEffect, useState, useRef } from 'react'
import { Button, Flex } from '@gm-pc/react'
import { Table } from '@gm-pc/table-x'
import { observer } from 'mobx-react'
import { ProcessTemplate } from 'gm_api/src/production'
import _ from 'lodash'
import { pinYinFilter } from '@gm-common/tool'

import Filter from './filter'
import store from '../../store'

const ProcessAddList = observer(() => {
  const { processes_list, processes_add_detail, current_modal } = store
  const { current_process_type, current_processes } = processes_add_detail
  const { processes } = current_modal

  const [list, setList] = useState<ProcessTemplate[]>(
    processes_list[current_process_type] || [],
  )
  const ref = useRef<any>(null)
  let selected: string[] = []

  useEffect(() => {
    // 当前并未点击任何工序分类，但是有勾选，展示所选择的工序
    if (current_process_type === '0' && !_.isEmpty(current_processes)) {
      let list: ProcessTemplate[] = []
      for (const key in current_processes) {
        list = list.concat((processes_list[key] || []).slice())
      }
      setList(list)
      return
    }

    // 有选择分类，仅展示当前选择分类的工序即可
    setList(processes_list[current_process_type] || [])
  }, [current_process_type, processes_list, current_processes])

  const getAllSelectedProcesses = () => {
    let result: string[] = []
    for (const key in current_processes) {
      result = result.concat(current_processes[key].slice())
    }

    return result.slice()
  }

  const handleAddProcess = () => {
    const all = getAllSelectedProcesses()
    // 拼接左侧已勾选类型下的工序，将所选择工序添加到当前小组下, 并且需要加上之前已选择的传给后台
    const olds = _.map(
      processes.slice(),
      (p: ProcessTemplate) => p.process_template_id,
    )
    store.updateProcessesOfProcessor(all.concat(olds))
  }

  const handleSearchProcesses = (search_text: string) => {
    const new_list = pinYinFilter(
      list,
      search_text,
      (e) => e.customized_code + e.name,
    )
    setList(new_list)
  }

  const handleSelectedProcess = (selected: string[]) => {
    if (current_process_type === '0' && !_.isEmpty(current_processes)) {
      // 只需要修改list, selected状态即可
      const new_list: ProcessTemplate[] = _.filter(
        list,
        (item) =>
          _.findIndex(selected, (s) => s === item.process_template_id) !== -1,
      )
      const new_processes: { [key: string]: string[] } = {}
      _.forEach(_.groupBy(new_list, 'process_type_id'), (value, key) => {
        new_processes[key] = _.map(value, (v) => v.process_template_id)
      })
      // setList(new_list)
      store.updateProcessAddDetail('current_processes', new_processes)
      return
    }

    const current: { [key: string]: string[] } = { ...current_processes }
    current[current_process_type] = [...selected]
    store.updateProcessAddDetail('current_processes', current)
  }

  const handleCancelAddProcess = () => {
    store.setAddProcess(false)
  }

  if (current_process_type === '0' && !_.isEmpty(current_processes)) {
    for (const key in current_processes) {
      const _p = _.map(current_processes[key] || [], (p) => p)
      selected = selected.concat(_p)
    }
  } else {
    selected = current_processes[current_process_type] || []
  }

  // 若是有选择的工序类型，展示选择的工序类型下的工序
  return (
    <Flex flex column>
      <div className='gm-text-16 gm-margin-bottom-10'>
        <span>{t('已选工序')}: </span>
        <span className='gm-text-primary'>
          {getAllSelectedProcesses().length}
        </span>
        <Filter onSearch={handleSearchProcesses} />
      </div>
      <Table
        isSelect
        isVirtualized
        id='process_template_of_processor'
        keyField='process_template_id'
        refVirtualized={ref}
        data={list.slice()}
        selected={selected.slice()}
        onSelect={handleSelectedProcess}
        style={{ width: '100%' }}
        limit={50}
        columns={[
          {
            Header: t('工序编号'),
            accessor: 'customized_code',
          },
          {
            Header: t('工序名称'),
            accessor: 'name',
          },
        ]}
      />
      <Flex justifyEnd className='gm-margin-top-10'>
        <Button className='gm-margin-right-10' onClick={handleCancelAddProcess}>
          {t('取消')}
        </Button>
        <Button type='primary' htmlType='submit' onClick={handleAddProcess}>
          {t('添加')}
        </Button>
      </Flex>
    </Flex>
  )
})

export default ProcessAddList
