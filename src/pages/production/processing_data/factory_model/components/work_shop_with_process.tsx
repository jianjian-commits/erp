import globalStore from '@/stores/global'
import { pinYinFilter } from '@gm-common/tool'
import { Button, Flex, Input } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { Permission } from 'gm_api/src/enterprise'
import { ProcessTemplate } from 'gm_api/src/production'
import { observer } from 'mobx-react'
import React, { FC, useEffect, useState } from 'react'
import store from '../store'
import ProcessList from './work_shop/process_list'

const WorkShopWithProcess: FC = observer(() => {
  const { current_modal } = store
  const { current_selected_modal, processes } = current_modal
  const parent_id = current_selected_modal?.parent_id
  const { processor_id } = current_selected_modal

  const [search_text, setSearchText] = useState<string>('')
  const [list, setList] = useState<ProcessTemplate[]>(processes.slice())

  useEffect(() => {
    setList(processes.slice())
  }, [processes])

  useEffect(() => {
    if (!processor_id) return
    store.getProcessesOfCurrentModal(processor_id)
  }, [])

  const handleSearchProcess = () => {
    const new_list = pinYinFilter(
      processes,
      search_text,
      (e) => e.customized_code + e.name,
    )
    setList(new_list)
  }

  const handleAddProcesses = () => {
    store.setAddProcess(true)
  }

  return (
    <Flex column style={{ height: '100%' }}>
      <div className='gm-text-16 gm-margin-bottom-10'>
        <span>{t('工序数')}: </span>
        <span className='gm-text-primary'>{list.length}</span>
      </div>
      <Flex className='gm-margin-bottom-10'>
        <Input
          className='gm-margin-right-10'
          style={{ width: '250px' }}
          value={search_text}
          placeholder={t('请输入工序编号或名称')}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button type='primary' htmlType='submit' onClick={handleSearchProcess}>
          {t('定位')}
        </Button>
        {/** 当前选中为小组才展示添加按钮 */}
        {globalStore.hasPermission(
          Permission.PERMISSION_PRODUCTION_UPDATE_PROCESSOR,
        ) &&
          parent_id !== '0' &&
          parent_id !== '' && (
            <Flex flex justifyEnd>
              <Button
                type='primary'
                htmlType='submit'
                onClick={handleAddProcesses}
              >
                {t('添加')}
              </Button>
            </Flex>
          )}
      </Flex>
      <ProcessList data={list} />
    </Flex>
  )
})

export default WorkShopWithProcess
