import { t } from 'gm-i18n'
import React, { FC, useState, useEffect } from 'react'
import { LevelSelect, LevelSelectDataItem } from '@gm-pc/react'
import _ from 'lodash'
import { ListProcessor } from 'gm_api/src/production'
import { useAsync } from '@gm-common/hooks'
import { KCLevelSelect } from '@gm-pc/keyboard'

import store from '../store'

interface Props {
  selected: string[]
  onSelect: (selected: string[]) => void
  isView?: boolean
  processor_id?: string
  all?: boolean
  isKeyboard?: boolean
}

// 修改工厂模型可以绑定所有的工厂模型
const FactoryModalSelector: FC<Props> = ({
  selected,
  onSelect,
  isView = false,
  processor_id,
  all = false,
  isKeyboard = false,
}) => {
  const { factoryModalList } = store

  const handleRequest = () => {
    return ListProcessor({ paging: { limit: 999 } }).then((json) => {
      // 处理好数据
      const { processors } = json.response
      const group = _.groupBy(processors || [], 'parent_id')
      const parents = group['0']
      const new_list = (parents || []).map((v) => ({
        ...v,
        value: v.processor_id,
        text: v.name,
        children: _.map(group[v.processor_id], (g) => ({
          ...g,
          value: g.processor_id,
          text: g.name,
        })),
      }))
      setModals(new_list)
      return null
    })
  }

  const [modals, setModals] = useState<LevelSelectDataItem<string>[]>(
    factoryModalList.slice() || [],
  )

  const { run } = useAsync(handleRequest, {
    cacheKey: `processors`,
  })

  useEffect(() => {
    if (!factoryModalList.length) run()
  }, [])

  const getLevelModal = (
    processor_id: string,
  ): LevelSelectDataItem<string>[] => {
    const modal = _.find(
      _.flatten(_.map(factoryModalList.slice(), (m) => m.children?.slice())),
      (v) => v?.processor_id === processor_id,
    )
    const text: LevelSelectDataItem<string>[] = modal
      ? [{ value: processor_id, text: modal.text }]
      : []
    if (modal) {
      const parent_modal = _.find(
        factoryModalList.slice(),
        (m) => m.processor_id === modal.parent_id,
      )
      parent_modal &&
        text.unshift({
          value: parent_modal.processor_id,
          text: parent_modal.text,
        })
    }

    return text
  }

  if (isView) {
    const text = getLevelModal(processor_id || '')
    // 展示形式为： 车间 - 小组
    return (
      <div>{`${text[0] ? text[0].text : ''} - ${
        text[1] ? text[1].text : ''
      }`}</div>
    )
  }

  let _selected: string[] = selected
  if (selected.length === 1) {
    _selected = _.map(getLevelModal(selected[0]), (m) => m.value)
  }

  if (isKeyboard) {
    return (
      <KCLevelSelect
        data={all ? [{ value: '0', text: t('全部') }, ...modals] : modals}
        selected={_selected}
        onSelect={onSelect}
      />
    )
  }

  return (
    <LevelSelect
      data={all ? [{ value: '0', text: t('全部') }, ...modals] : modals}
      selected={_selected}
      onSelect={onSelect}
    />
  )
}

export default FactoryModalSelector
