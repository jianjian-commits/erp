import { t } from 'gm-i18n'
import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { Tree, Flex } from '@gm-pc/react'
import _ from 'lodash'

import ProcessAdd from './work_shop/process_add_list'
import store from '../store'

const WorkShopAddProcess = observer(() => {
  const { process_type_list, processes_add_detail, processes_list } = store
  const { current_process_type, current_processes } = processes_add_detail

  const [indeterminateValues, setIndeterminateValues] = useState<string[]>([])

  useEffect(() => {
    store.getProcessTypes()
    // 获取所有工序
    store.getProcesses()
    // 默认设置选择第一个分类
    store.updateProcessAddDetail('current_process_type', '0')
  }, [])

  useEffect(() => {
    const result: string[] = []
    // 当前勾选类型的工序数量 !== 该类型下未选择的工序数量
    _.forEach(processes_list, (value, key) => {
      const len = (current_processes[key] || []).length || 0

      if (len !== 0 && len < (processes_list[key] || []).length) {
        result.push(value[0].process_type_id || '')
      }
    })
    setIndeterminateValues(result)
  }, [current_processes, processes_list])

  const handleClickItem = (selected: string) => {
    store.updateProcessAddDetail('current_process_type', selected)
  }

  const handleSelectedTypes = (selected: string[]) => {
    const _processes: { [key: string]: string[] } = {}
    _.forEach(selected, (s) => {
      _processes[s] = _.map(processes_list[s], (v) => v.process_template_id)
    })

    _.forEach(indeterminateValues, (v) => {
      _processes[v] = current_processes[v]
    })

    store.updateProcessAddDetail('current_processes', _processes)
  }

  const selected: string[] = _.map(current_processes, (value, key) => {
    // 去掉半勾选
    if (
      value.length !== 0 &&
      _.findIndex(indeterminateValues, (v) => v === key) === -1
    )
      return key
    return ''
  })

  /** 左侧展示工序分类列表，右侧展示工序类型下的所有工序 */
  return (
    <Flex className='b-work-shop-add-process' style={{ height: '100%' }}>
      <Tree
        key={indeterminateValues.length}
        className='b-work-shop-add-process-tree'
        list={process_type_list.slice()}
        selectedValues={selected}
        onSelectValues={handleSelectedTypes}
        placeholder={t('输入工序分类')}
        showAllCheck={false}
        activeValue={current_process_type}
        renderLeafItem={(item) => (
          <Flex
            alignCenter
            style={{ height: '100%' }}
            onClick={() => handleClickItem(item.value)}
          >
            {item.text}
          </Flex>
        )}
        // 判断当前类型选中数目 === 类型所有工序数
        indeterminateValues={indeterminateValues}
      />
      <ProcessAdd />
    </Flex>
  )
})

export default WorkShopAddProcess
