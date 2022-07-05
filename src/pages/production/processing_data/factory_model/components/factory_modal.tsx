import { t } from 'gm-i18n'
import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { Input, Button, Tip } from '@gm-pc/react'
import { toJS } from 'mobx'
import _ from 'lodash'

import ModalList from './factory_modal_list'
import store, { initFactoryModal } from '../store'
import { recursiveCloseItem } from '../util'
import { ProcessorItem } from '../interface'

const FactoryModalList: FC = observer(() => {
  const [searchText, setSearchText] = useState<string>('')
  const { factory_modal_list } = store
  let searchedItem: ProcessorItem = { ...initFactoryModal }

  const _recursiveFindCargoLocation = (
    word: string,
    list: ProcessorItem[],
  ): boolean => {
    let flag = false
    if (_.some(list, (item) => item.name === word)) {
      const selected = _.find(list, (item) => item.name === word)
      if (searchedItem.processor_id === '') {
        searchedItem = selected || { ...initFactoryModal }
      }
      flag = true
      return flag
    } else {
      _.forEach(list, (item) => {
        if (item.children && item.children.length) {
          item.expand = _recursiveFindCargoLocation(word, item.children)
          flag = flag || item.expand
        }
      })
    }
    return flag
  }

  const handleToModalLocation = () => {
    if (!searchText) {
      Tip.danger(t('请输入模型名称'))
      return
    }

    searchedItem = { ...initFactoryModal }

    // 关闭所有展开列表
    const list = toJS(factory_modal_list)
    recursiveCloseItem(list)

    // 找到输入的模型，展开并修正当前选中值
    const result = _recursiveFindCargoLocation(searchText, list)
    if (!result) {
      Tip.danger(t('没有找到该模型'))
      return
    }

    if (searchedItem.processor_id !== '') {
      searchedItem.expand = true
      store.updateFactoryModalList(list)
      store.setCurrentSelectedModal(searchedItem)
    }
  }

  return (
    <>
      <div>
        <Input
          className='gm-margin-right-10 b-factory-modal-input'
          value={searchText}
          placeholder={t('请输入模型名称')}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button
          type='primary'
          htmlType='submit'
          onClick={handleToModalLocation}
        >
          {t('定位')}
        </Button>
      </div>
      <ModalList />
    </>
  )
})

export default FactoryModalList
